import type { UserSession } from '@ginja/contracts';
export type Theme = 'light' | 'dark';
export interface WorkspaceState {
    /** The active mock session (tenant + user + entitlements), or null when logged out. */
    session: UserSession | null;
    theme: Theme;
    ui: {
        sidebarCollapsed: boolean;
    };
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
export declare const useWorkspaceStore: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<WorkspaceState>, "setState" | "persist"> & {
    setState(partial: WorkspaceState | Partial<WorkspaceState> | ((state: WorkspaceState) => WorkspaceState | Partial<WorkspaceState>), replace?: false | undefined): unknown;
    setState(state: WorkspaceState | ((state: WorkspaceState) => WorkspaceState), replace: true): unknown;
    persist: {
        setOptions: (options: Partial<import("zustand/middleware").PersistOptions<WorkspaceState, unknown, unknown>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: WorkspaceState) => void) => () => void;
        onFinishHydration: (fn: (state: WorkspaceState) => void) => () => void;
        getOptions: () => Partial<import("zustand/middleware").PersistOptions<WorkspaceState, unknown, unknown>>;
    };
}>;
export declare const selectSession: (s: WorkspaceState) => UserSession | null;
export declare const selectTenant: (s: WorkspaceState) => import("@ginja/contracts").Tenant | null;
export declare const selectUser: (s: WorkspaceState) => import("@ginja/contracts").User | null;
export declare const selectEntitlements: (s: WorkspaceState) => string[];
export declare const selectIsAuthenticated: (s: WorkspaceState) => boolean;
