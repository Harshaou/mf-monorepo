import type { RouteObject } from 'react-router-dom';
/**
 * The contract every Remote MUST expose as `./module`.
 *
 * We chose **route-level** micro-frontends: each remote owns an entire module and
 * exposes its whole routing subtree as a single entry. The Shell mounts that subtree
 * under one path (e.g. `/underwriting/*`) and owns nothing beneath it.
 *
 * Convention: a remote exposes `./module` whose default export is a `RemoteModule`.
 */
export interface RemoteModule {
    /**
     * The remote's routes, expressed as react-router `RouteObject`s with paths
     * *relative* to the mount point the Shell assigns. The Shell wraps these in a
     * layout + failure boundary; the remote never assumes its absolute base path.
     */
    routes: RouteObject[];
    /** Human metadata used for breadcrumbs / page title. */
    meta: {
        /** Stable module id — must match the catalog entry id. */
        id: string;
        title: string;
    };
}
/** A remote's exposed module is the default export of its `./module` entry. */
export type RemoteModuleFactory = () => Promise<{
    default: RemoteModule;
}>;
