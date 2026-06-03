import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

/**
 * The consistent chrome — one header, one sidebar — that every module renders inside,
 * giving the unified, AWS-Console-style experience. The <Outlet/> is where the entitled
 * module (a runtime-loaded remote) mounts.
 */
export function AppLayout() {
  return (
    <div className="bg-background text-foreground flex h-screen flex-col overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
