import type { Audience } from './tenant';
/**
 * Static metadata for a module the Shell *knows about* — including modules that
 * aren't built yet. Navigation and entitlements can reference a catalog entry
 * before any remote exists for it; visiting it yields a clear "Not entitled" or
 * "Coming soon" path rather than a broken route.
 */
export interface ModuleCatalogEntry {
    /** Stable id, referenced by entitlements. */
    id: string;
    /** Sidebar label. */
    label: string;
    /** Lucide icon name (resolved in the Shell to avoid coupling the catalog to a UI lib). */
    icon: string;
    /** Absolute base path the Shell mounts this module under, e.g. "/underwriting". */
    route: string;
    /** Which audience this module belongs to. */
    audience: Audience;
    /**
     * The Module Federation remote name (as declared in the remote's MF config) and
     * the exposed entry. `null` remoteName = a known-but-not-yet-built module.
     */
    remoteName: string | null;
    /** The exposed key, by convention "./module". */
    exposedModule: string;
    /** Short description for the "Not entitled"/overview surfaces. */
    description: string;
}
