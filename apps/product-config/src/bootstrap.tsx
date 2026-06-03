import './index.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';
import { useWorkspaceStore } from '@ginja/store';
import { Badge } from '@ginja/design-system';
import productConfigModule from './module';

useWorkspaceStore.getState().setSession({
  user: { id: 'dev', name: 'Dev User', email: 'dev@ginja.example', role: 'Product Manager' },
  tenant: { id: 'dev', name: 'Dev Tenant', code: 'DEV' },
  entitlements: ['product-config'],
  issuedAt: new Date().toISOString(),
});

function DevLayout() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <div className="bg-muted text-muted-foreground flex items-center gap-2 border-b px-4 py-2 text-xs">
        <Badge variant="outline">standalone dev</Badge>
        Product Config remote · running on :3002 · mounted by the Shell in production
      </div>
      <Outlet />
    </div>
  );
}

const router = createBrowserRouter([
  { path: '/', element: <DevLayout />, children: productConfigModule.routes },
]);

const container = document.getElementById('root');
if (!container) throw new Error('Root element #root not found');
createRoot(container).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
