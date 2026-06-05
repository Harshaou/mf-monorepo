import { useWorkspaceStore, selectTenant } from '@ginja/store';
import { Button, Input, Separator } from '@ginja/design-system';
import { Building2, Moon, PanelLeft, Search, Sun } from 'lucide-react';
import { UserMenu } from './UserMenu';

export function Header() {
  const toggleSidebar = useWorkspaceStore((s) => s.toggleSidebar);
  const theme = useWorkspaceStore((s) => s.theme);
  const toggleTheme = useWorkspaceStore((s) => s.toggleTheme);
  const tenant = useWorkspaceStore(selectTenant);

  return (
    <header className="bg-background flex h-14 shrink-0 items-center gap-3 border-b px-4">
      <Button variant="ghost" size="icon" onClick={toggleSidebar} aria-label="Toggle sidebar">
        <PanelLeft className="size-4" />
      </Button>

      <div className="flex items-center gap-2 font-semibold">
        <div className="bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-md text-sm">
          G
        </div>
        <span className="hidden sm:inline">Insurer Workspace</span>
      </div>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {tenant && (
        <div className="flex items-center gap-2 text-sm font-medium">
          <Building2 className="text-muted-foreground size-4" />
          <span className="max-w-40 truncate">{tenant.name}</span>
        </div>
      )}

      <div className="relative ml-auto hidden max-w-sm flex-1 md:block">
        <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
        <Input placeholder="Search the workspace…" className="pl-8" />
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        aria-label="Toggle theme"
        className="ml-auto md:ml-0"
      >
        {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
      </Button>

      <UserMenu />
    </header>
  );
}
