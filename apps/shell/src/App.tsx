import { useEffect, useMemo, useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import type { UserSession } from '@ginja/contracts';
import { useWorkspaceStore, selectSession } from '@ginja/store';
import { Button } from '@ginja/design-system';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Login } from './pages/Login';
import { createAppRouter } from './router';
import { resolveRuntimeConfig } from './services/runtime-config';
import { registerEntitledRemotes } from './mf/runtime';

export function App() {
  const session = useWorkspaceStore(selectSession);
  const theme = useWorkspaceStore((s) => s.theme);

  // One theme for the whole workspace (the design system is a shared singleton).
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  if (!session) return <Login />;

  // Remount on tenant switch → clean re-registration of remotes + fresh router.
  return <AuthedWorkspace key={session.tenant.id} session={session} />;
}

/**
 * The login → entitlements → URL-resolution → register pipeline. We resolve where the
 * entitled remotes live and register them BEFORE building the router, so navigation to a
 * module can lazy-load it. Non-entitled / unbuilt modules need no registration.
 */
function AuthedWorkspace({ session }: { session: UserSession }) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    resolveRuntimeConfig(session.entitlements)
      .then((config) => {
        if (cancelled) return;
        registerEntitledRemotes(config.remotes);
        setStatus('ready');
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : String(e));
        setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [session.entitlements]);

  const router = useMemo(() => createAppRouter(session), [session]);

  if (status === 'error') return <FullscreenMessage title="Couldn't start the workspace" body={error} retry />;
  if (status === 'loading') return <Splash tenantName={session.tenant.name} />;
  return <RouterProvider router={router} />;
}

function Splash({ tenantName }: { tenantName: string }) {
  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col items-center justify-center gap-3">
      <Loader2 className="text-primary size-8 animate-spin" />
      <p className="text-muted-foreground text-sm">Composing workspace for {tenantName}…</p>
    </div>
  );
}

function FullscreenMessage({
  title,
  body,
  retry,
}: {
  title: string;
  body: string;
  retry?: boolean;
}) {
  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="bg-destructive/10 text-destructive flex size-12 items-center justify-center rounded-full">
        <AlertTriangle className="size-6" />
      </div>
      <div>
        <h1 className="text-xl font-semibold">{title}</h1>
        <p className="text-muted-foreground mt-1 max-w-md text-sm">{body}</p>
      </div>
      {retry && <Button onClick={() => window.location.reload()}>Reload</Button>}
    </div>
  );
}
