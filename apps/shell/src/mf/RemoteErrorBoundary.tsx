import { useNavigate, useRouteError } from 'react-router-dom';
import type { ModuleCatalogEntry } from '@ginja/contracts';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ginja/design-system';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { clearRemoteModuleCache } from './RemoteModuleHost';

/**
 * Failure isolation — a hard product invariant. If a remote can't load (network down,
 * bad deploy, broken export) the user sees THIS self-contained message and the rest of
 * the workspace keeps working. A single module can never take down the Shell or siblings.
 */
export function RemoteErrorBoundary({ entry }: { entry: ModuleCatalogEntry }) {
  const error = useRouteError();
  const navigate = useNavigate();
  const detail = error instanceof Error ? error.message : String(error);

  function retry() {
    clearRemoteModuleCache(entry);
    navigate(0); // re-run the route; cache was cleared so it re-fetches
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <Card className="max-w-lg">
        <CardHeader>
          <div className="bg-destructive/10 text-destructive mb-2 flex size-12 items-center justify-center rounded-full">
            <AlertTriangle className="size-6" />
          </div>
          <CardTitle>Couldn't load {entry.label}</CardTitle>
          <CardDescription>
            This module failed to load. Other modules are unaffected — the rest of your
            workspace keeps working.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <pre className="bg-muted text-muted-foreground overflow-auto rounded-md p-3 text-xs">
            {detail}
          </pre>
          <Button onClick={retry}>
            <RefreshCw className="size-4" />
            Try again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
