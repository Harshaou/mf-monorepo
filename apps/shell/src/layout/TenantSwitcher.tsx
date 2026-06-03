import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkspaceStore, selectTenant } from '@ginja/store';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Avatar,
  AvatarFallback,
} from '@ginja/design-system';
import { Building2, Check, ChevronsUpDown } from 'lucide-react';
import { DEMO_TENANTS } from '../data/tenants';
import { switchTenant } from '../services/auth';

/**
 * Switching tenant re-runs the (mock) login, which yields a different entitlement set.
 * The sidebar, routes, and loaded remotes all change accordingly — the clearest
 * demonstration of runtime, per-tenant composition.
 */
export function TenantSwitcher() {
  const currentTenant = useWorkspaceStore(selectTenant);
  const setSession = useWorkspaceStore((s) => s.setSession);
  const [switching, setSwitching] = useState<string | null>(null);
  const navigate = useNavigate();

  async function switchTo(tenantId: string) {
    if (tenantId === currentTenant?.id) return;
    setSwitching(tenantId);
    try {
      const session = await switchTenant(tenantId);
      setSession(session);
      navigate('/'); // land on Overview; entitled routes are rebuilt for the new tenant
    } finally {
      setSwitching(null);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Building2 className="size-4" />
          <span className="max-w-40 truncate">{currentTenant?.name ?? 'Select tenant'}</span>
          <ChevronsUpDown className="text-muted-foreground size-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Switch tenant</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {DEMO_TENANTS.map(({ tenant, entitlements }) => (
          <DropdownMenuItem
            key={tenant.id}
            onSelect={(e) => {
              e.preventDefault();
              void switchTo(tenant.id);
            }}
            disabled={switching !== null}
            className="gap-2"
          >
            <Avatar className="size-7">
              <AvatarFallback>{tenant.code.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-1 flex-col">
              <span className="text-sm font-medium">{tenant.name}</span>
              <span className="text-muted-foreground text-xs">
                {entitlements.length} module{entitlements.length === 1 ? '' : 's'}
              </span>
            </div>
            {tenant.id === currentTenant?.id && <Check className="size-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
