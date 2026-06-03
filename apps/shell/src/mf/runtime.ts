import { registerRemotes, loadRemote } from '@module-federation/enhanced/runtime';
import type { RemoteModule, RuntimeRemoteEntry } from '@ginja/contracts';

/**
 * Register, at runtime, exactly the remotes this tenant is entitled to. The Shell was
 * built with an empty remote list; this is where remotes actually enter the picture —
 * from URLs resolved per-tenant after login. `force` lets us re-register on tenant switch.
 */
export function registerEntitledRemotes(remotes: RuntimeRemoteEntry[]): void {
  if (remotes.length === 0) return;
  registerRemotes(
    remotes.map((r) => ({ name: r.name, entry: r.manifestUrl })),
    { force: true }
  );
}

/**
 * Load a remote's exposed module and assert it satisfies the shared contract. If a
 * remote fails to expose what the contract promises, this throws loudly — never renders
 * something broken — which the route's failure boundary turns into a clean message.
 */
export async function loadRemoteModule(
  remoteName: string,
  exposed: string
): Promise<RemoteModule> {
  const key = exposed.replace(/^\.\//, '');
  const loaded = await loadRemote<{ default: RemoteModule } | RemoteModule>(
    `${remoteName}/${key}`
  );
  if (!loaded) {
    throw new Error(`Remote "${remoteName}" returned nothing for "${exposed}".`);
  }
  const mod = 'default' in loaded ? loaded.default : loaded;
  if (!mod || !Array.isArray(mod.routes)) {
    throw new Error(
      `Remote "${remoteName}" does not satisfy the RemoteModule contract (missing routes).`
    );
  }
  return mod;
}
