import type { RuntimeConfig, RuntimeRemoteEntry } from '@ginja/contracts';
import { getCatalogEntry } from '../data/catalog';

/** Simulated network latency. */
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Where each remote's manifest lives. Resolved from build-time env vars (injected per
 * environment by the host platform / CI), falling back to localhost for `pnpm dev`.
 * In production these point at each remote's CDN origin (e.g. Cloudflare Pages).
 *
 * This is the SEAM that lets a team ship a new remote version without a Shell rebuild:
 * publish to the same URL and the Shell picks it up on the next load. (The fuller form
 * of this design serves the map from a per-tenant config API at the edge, so URLs are
 * runtime rather than build-time and origins can be restricted for security.)
 */
const REMOTE_URLS: Record<string, string> = {
  underwriting: process.env.PUBLIC_UNDERWRITING_URL ?? 'http://localhost:3001/mf-manifest.json',
  product_config:
    process.env.PUBLIC_PRODUCT_CONFIG_URL ?? 'http://localhost:3002/mf-manifest.json',
};

/**
 * Resolve, at runtime, the manifest URLs for exactly the modules this tenant is
 * entitled to AND that are actually built (have a remoteName).
 */
export async function resolveRuntimeConfig(entitlements: string[]): Promise<RuntimeConfig> {
  await delay(250);
  const remotes: RuntimeRemoteEntry[] = [];
  for (const moduleId of entitlements) {
    const entry = getCatalogEntry(moduleId);
    if (!entry?.remoteName) continue; // unknown or not-yet-built → skip (Coming soon)
    const manifestUrl = REMOTE_URLS[entry.remoteName];
    if (!manifestUrl) continue;
    remotes.push({ name: entry.remoteName, manifestUrl });
  }
  return { remotes };
}
