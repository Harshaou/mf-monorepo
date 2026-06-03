import type { UserSession } from '@ginja/contracts';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Theme = 'light' | 'dark';

export interface WorkspaceState {
  /** The active mock session (tenant + user + entitlements), or null when logged out. */
  session: UserSession | null;
  theme: Theme;
  ui: {
    sidebarCollapsed: boolean;
  };

  // --- actions ---
  /** Establish a session (mock login or tenant switch). */
  setSession: (session: UserSession) => void;
  logout: () => void;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  toggleSidebar: () => void;
}

/**
 * The single source of global workspace state. Declared as a Module Federation
 * SINGLETON, so the Shell and every loaded remote read and write THIS instance —
 * change the tenant from inside a remote and the Shell's chrome reacts immediately.
 */
export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      session: null,
      theme: 'light',
      ui: { sidebarCollapsed: false },

      setSession: (session) => set({ session }),
      logout: () => set({ session: null }),
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set({ theme: get().theme === 'light' ? 'dark' : 'light' }),
      toggleSidebar: () =>
        set((s) => ({ ui: { ...s.ui, sidebarCollapsed: !s.ui.sidebarCollapsed } })),
    }),
    {
      name: 'ginja.workspace',
      storage: createJSONStorage(() => localStorage),
      // Persist session + theme + ui; everything is serialisable.
      partialize: (s) => ({ session: s.session, theme: s.theme, ui: s.ui }),
    }
  )
);

// --- convenience selectors (stable references, safe to use directly) ---
export const selectSession = (s: WorkspaceState) => s.session;
export const selectTenant = (s: WorkspaceState) => s.session?.tenant ?? null;
export const selectUser = (s: WorkspaceState) => s.session?.user ?? null;
export const selectEntitlements = (s: WorkspaceState) => s.session?.entitlements ?? [];
export const selectIsAuthenticated = (s: WorkspaceState) => s.session !== null;
