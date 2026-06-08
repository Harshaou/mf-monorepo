import { Link } from 'react-router-dom';
import { useWorkspaceStore, selectEntitlements, selectTenant } from '@ginja/store';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@ginja/design-system';
import { ArrowRight } from 'lucide-react';
import { MODULE_CATALOG } from '../data/catalog';
import { ModuleIcon } from '../components/module-icon';

/** The Shell-owned home page. Lists the modules this tenant is entitled to. */
export function Overview() {
  const tenant = useWorkspaceStore(selectTenant);
  const entitlements = useWorkspaceStore(selectEntitlements);
  const entitled = MODULE_CATALOG.filter((m) => entitlements.includes(m.id));

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Welcome, {tenant?.name} buhaa</h1>
        <p className="text-muted-foreground mt-1">
          Your workspace is composed at runtime from the modules you're entitled to.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {entitled.map((m) => (
          <Card key={m.id} className="flex flex-col">
            <CardHeader>
              <div className="bg-primary/10 text-primary mb-2 flex size-10 items-center justify-center rounded-lg">
                <ModuleIcon name={m.icon} className="size-5" />
              </div>
              <CardTitle className="flex items-center gap-2">
                {m.label}
                {!m.remoteName && <Badge variant="outline">Coming soon</Badge>}
              </CardTitle>
              <CardDescription>{m.description}</CardDescription>
            </CardHeader>
            <CardContent className="mt-auto">
              <Button
                asChild
                variant={m.remoteName ? 'default' : 'secondary'}
                disabled={!m.remoteName}
              >
                <Link to={m.route}>
                  Open <ArrowRight className="size-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
