import type { RuntimeConfig, RuntimeRemoteEntry } from '@ginja/contracts';
import { getCatalogEntry } from '../data/catalog';

/** Simulated network latency. */
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Dev defaults for where each remote lives. In production this map is served from
 * per-tenant config at the edge, and remote origins are restricted for security.
 * This is the SEAM that lets a team ship a new remote version without a Shell rebuild:
 * publish to the same URL and the Shell picks it up on the next load.
 */
const DEV_REMOTE_URLS: Record<string, string> = {
  underwriting: 'http://localhost:3001/mf-manifest.json',
  product_config: 'http://localhost:3002/mf-manifest.json',
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
    const manifestUrl = DEV_REMOTE_URLS[entry.remoteName];
    if (!manifestUrl) continue;
    remotes.push({ name: entry.remoteName, manifestUrl });
  }
  return { remotes };
}
