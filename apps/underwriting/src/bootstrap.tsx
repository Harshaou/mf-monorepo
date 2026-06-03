import './index.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';
import { useWorkspaceStore } from '@ginja/store';
import { Badge } from '@ginja/design-system';
import underwritingModule from './module';

// Seed a session so store-driven UI renders sensibly when running in isolation.
useWorkspaceStore.getState().setSession({
  user: { id: 'dev', name: 'Dev User', email: 'dev@ginja.example', role: 'Underwriter' },
  tenant: { id: 'dev', name: 'Dev Tenant', code: 'DEV' },
  entitlements: ['underwriting'],
  issuedAt: new Date().toISOString(),
});

/** A minimal dev-only frame; in production the Shell provides the real chrome. */
function DevLayout() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <div className="bg-muted text-muted-foreground flex items-center gap-2 border-b px-4 py-2 text-xs">
        <Badge variant="outline">standalone dev</Badge>
        Underwriting remote · running on :3001 · mounted by the Shell in production
      </div>
      <Outlet />
    </div>
  );
}

const router = createBrowserRouter([
  { path: '/', element: <DevLayout />, children: underwritingModule.routes },
]);

const container = document.getElementById('root');
if (!container) throw new Error('Root element #root not found');
createRoot(container).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
