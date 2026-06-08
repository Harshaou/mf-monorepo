import { useState } from 'react';
import { useWorkspaceStore } from '@ginja/store';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from '@ginja/design-system';
import { AlertCircle, Loader2, LogIn } from 'lucide-react';
import { DEMO_TENANTS } from '../data/tenants';
import { login } from '../services/auth';

/**
 * Single-login against the mock auth service (`../services/auth`). Credentials are
 * validated against the demo accounts; a successful login yields the tenant's
 * entitlements, which decide the entire composed workspace. The demo-account buttons
 * below fill in those mock credentials.
 */
export function Login() {
  const setSession = useWorkspaceStore((s) => s.setSession);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setPending(true);
    try {
      const session = await login(email, password);
      setSession(session);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed.');
    } finally {
      setPending(false);
    }
  }

  function fill(demoEmail: string, demoPassword: string) {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  }

  return (
    <div className="bg-muted/40 flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="bg-primary text-primary-foreground mx-auto mb-4 flex size-12 items-center justify-center rounded-xl text-xl font-bold">
            G
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Insurer Workspace</h1>
          <p className="text-muted-foreground mt-1 text-sm">Sign in to your workspace</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>Use your work email and password.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="username"
                  placeholder="you@company.example"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="bg-destructive/10 text-destructive flex items-center gap-2 rounded-md px-3 py-2 text-sm">
                  <AlertCircle className="size-4 shrink-0" />
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={pending}>
                {pending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <>
                    <LogIn className="size-4" /> Sign in
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6">
          <p className="text-muted-foreground mb-2 text-center text-xs">
            Demo accounts — click to fill (password shown for the demo)
          </p>
          <div className="space-y-1.5">
            {DEMO_TENANTS.map(({ tenant, credentials }) => (
              <button
                key={tenant.id}
                type="button"
                onClick={() => fill(credentials.email, credentials.password)}
                className="hover:bg-accent flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-xs transition-colors"
              >
                <span>
                  <span className="font-medium">{credentials.email}</span>
                  <span className="text-muted-foreground"> · {tenant.name}</span>
                </span>
                <span className="text-muted-foreground font-mono">{credentials.password}</span>
              </button>
            ))}
          </div>
          <p className="text-muted-foreground mt-3 text-center text-xs">
            Acme sees both modules · Beacon sees Product Config only · Summit sees Underwriting
            + a not-yet-built module.
          </p>
        </div>
      </div>
    </div>
  );
}
