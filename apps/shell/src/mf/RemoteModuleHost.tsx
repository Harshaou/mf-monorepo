import { Suspense } from 'react';
import { useRoutes } from 'react-router-dom';
import type { ModuleCatalogEntry, RemoteModule } from '@ginja/contracts';
import { Skeleton } from '@ginja/design-system';
import { loadRemoteModule } from './runtime';

/**
 * A tiny Suspense-compatible cache for loaded remote modules. We load each remote once,
 * then mount its routes. A thrown promise drives Suspense (loading); a thrown error
 * bubbles to the route's failure boundary (isolation).
 */
type CacheState =
  | { status: 'pending'; promise: Promise<void> }
  | { status: 'ready'; module: RemoteModule }
  | { status: 'error'; error: Error };

const cache = new Map<string, CacheState>();

const cacheKey = (entry: ModuleCatalogEntry) => `${entry.remoteName}/${entry.exposedModule}`;

/** Drop a cached module so the next mount re-fetches it (used by "Try again"). */
export function clearRemoteModuleCache(entry: ModuleCatalogEntry): void {
  cache.delete(cacheKey(entry));
}

/** Drop everything (used on tenant switch). */
export function clearAllRemoteModules(): void {
  cache.clear();
}

function useRemoteModule(entry: ModuleCatalogEntry): RemoteModule {
  const key = cacheKey(entry);
  let state = cache.get(key);

  if (!state) {
    if (!entry.remoteName) {
      throw new Error(`Catalog entry "${entry.id}" has no remote to load.`);
    }
    const promise = loadRemoteModule(entry.remoteName, entry.exposedModule)
      .then((module) => {
        cache.set(key, { status: 'ready', module });
      })
      .catch((err: unknown) => {
        cache.set(key, {
          status: 'error',
          error: err instanceof Error ? err : new Error(String(err)),
        });
      });
    state = { status: 'pending', promise };
    cache.set(key, state);
  }

  if (state.status === 'pending') throw state.promise;
  if (state.status === 'error') throw state.error;
  return state.module;
}

function RemoteRoutes({ entry }: { entry: ModuleCatalogEntry }) {
  const mod = useRemoteModule(entry);
  // The remote's routes are RELATIVE; React Router mounts them under the parent
  // route's path (e.g. "/underwriting/*"), so the remote owns everything beneath it.
  return useRoutes(mod.routes);
}

function ModuleLoading() {
  return (
    <div className="space-y-4 p-6">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96" />
      <div className="grid gap-4 pt-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

/**
 * Mounts a runtime-loaded remote. The Shell hands it a whole route and owns nothing
 * beneath it. Wrapped in Suspense (loading) and, by its route, a failure boundary.
 */
export function RemoteModuleHost({ entry }: { entry: ModuleCatalogEntry }) {
  return (
    <Suspense fallback={<ModuleLoading />}>
      <RemoteRoutes entry={entry} />
    </Suspense>
  );
}
