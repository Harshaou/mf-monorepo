import { createBrowserRouter, Navigate, type RouteObject } from 'react-router-dom';
import type { UserSession } from '@ginja/contracts';
import { AppLayout } from './layout/AppLayout';
import { Overview } from './pages/Overview';
import { ComingSoon, NotEntitled, NotFound } from './pages/StatusPages';
import { MODULE_CATALOG } from './data/catalog';
import { RemoteModuleHost } from './mf/RemoteModuleHost';
import { RemoteErrorBoundary } from './mf/RemoteErrorBoundary';

/**
 * Build the Shell's routes from the catalog + this tenant's entitlements. Each module
 * is mounted under one path with `/*` so the remote owns everything beneath it. The set
 * of routes is therefore decided at runtime, per tenant — never baked into the build.
 */
export function createAppRouter(session: UserSession) {
  const entitled = new Set(session.entitlements);

  const moduleRoutes: RouteObject[] = MODULE_CATALOG.map((entry) => {
    const childPath = `${entry.route.replace(/^\//, '')}/*`;

    // Not entitled → a clear "Not entitled" page (still routable, so deep links explain).
    if (!entitled.has(entry.id)) {
      return { path: childPath, element: <NotEntitled moduleLabel={entry.label} /> };
    }
    // Entitled but not yet built → "Coming soon".
    if (!entry.remoteName) {
      return { path: childPath, element: <ComingSoon moduleLabel={entry.label} /> };
    }
    // Entitled + built → mount the runtime-loaded remote inside a failure boundary.
    return {
      path: childPath,
      element: <RemoteModuleHost entry={entry} />,
      errorElement: <RemoteErrorBoundary entry={entry} />,
    };
  });

  const routes: RouteObject[] = [
    {
      path: '/',
      element: <AppLayout />,
      children: [
        { index: true, element: <Overview /> },
        ...moduleRoutes,
        { path: 'login', element: <Navigate to="/" replace /> },
        { path: '*', element: <NotFound /> },
      ],
    },
  ];

  return createBrowserRouter(routes);
}
