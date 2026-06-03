import { NavLink } from 'react-router-dom';
import { useWorkspaceStore, selectEntitlements } from '@ginja/store';
import { Badge, cn } from '@ginja/design-system';
import { LayoutDashboard } from 'lucide-react';
import { MODULE_CATALOG } from '../data/catalog';
import { ModuleIcon } from '../components/module-icon';

/**
 * The sidebar is driven entirely by ENTITLEMENTS: it renders only the modules this
 * tenant is entitled to. Switch tenant and the nav changes — no rebuild.
 */
export function Sidebar() {
  const entitlements = useWorkspaceStore(selectEntitlements);
  const collapsed = useWorkspaceStore((s) => s.ui.sidebarCollapsed);

  const entitledModules = MODULE_CATALOG.filter((m) => entitlements.includes(m.id));

  return (
    <aside
      className={cn(
        'bg-sidebar text-sidebar-foreground border-sidebar-border flex shrink-0 flex-col border-r transition-[width] duration-200',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <nav className="flex flex-1 flex-col gap-1 p-3">
        <SidebarLink to="/" icon={<LayoutDashboard className="size-4" />} label="Overview" collapsed={collapsed} end />

        {!collapsed && (
          <p className="text-muted-foreground mt-4 mb-1 px-3 text-xs font-medium tracking-wide uppercase">
            Modules
          </p>
        )}

        {entitledModules.map((m) => (
          <SidebarLink
            key={m.id}
            to={m.route}
            icon={<ModuleIcon name={m.icon} className="size-4" />}
            label={m.label}
            collapsed={collapsed}
            badge={m.remoteName ? undefined : 'Soon'}
          />
        ))}
      </nav>

      <div className="text-muted-foreground border-sidebar-border border-t p-3 text-xs">
        {!collapsed && <span>Insurer Workspace</span>}
      </div>
    </aside>
  );
}

function SidebarLink({
  to,
  icon,
  label,
  collapsed,
  badge,
  end,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
  badge?: string;
  end?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
          'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
          isActive
            ? 'bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground'
            : 'text-sidebar-foreground'
        )
      }
    >
      <span className="shrink-0">{icon}</span>
      {!collapsed && <span className="flex-1 truncate">{label}</span>}
      {!collapsed && badge && (
        <Badge variant="secondary" className="text-[10px]">
          {badge}
        </Badge>
      )}
    </NavLink>
  );
}
