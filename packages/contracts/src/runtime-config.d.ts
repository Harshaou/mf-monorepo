/**
 * Resolved, per-tenant location of each remote — the seam that lets a team ship a
 * new version of a module without a Shell rebuild. In dev these point at localhost;
 * in prod they're CDN origins served from per-tenant config at the edge.
 */
export interface RuntimeRemoteEntry {
    /** MF remote name — must match the remote's MF `name`. */
    name: string;
    /** Fully-resolved MF2 manifest URL, e.g. "http://localhost:3001/mf-manifest.json". */
    manifestUrl: string;
}
export interface RuntimeConfig {
    /** Resolved remote locations for the modules this tenant is entitled to. */
    remotes: RuntimeRemoteEntry[];
}
