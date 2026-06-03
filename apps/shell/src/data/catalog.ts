import type { ModuleCatalogEntry } from '@ginja/contracts';

/**
 * The catalog of EVERY module the Shell knows about — including modules that are not
 * built yet (remoteName: null). Navigation and entitlements can reference any entry;
 * a known-but-unbuilt module resolves to a clear "Coming soon" path, and an entry the
 * tenant lacks resolves to "Not entitled". Adding a module = one entry here + a remote.
 */
export const MODULE_CATALOG: ModuleCatalogEntry[] = [
  {
    id: 'underwriting',
    label: 'Underwriting',
    icon: 'ShieldCheck',
    route: '/underwriting',
    audience: 'insurer',
    remoteName: 'underwriting',
    exposedModule: './module',
    description: 'Triage submissions, assess risk, and record underwriting decisions.',
  },
  {
    id: 'product-config',
    label: 'Product Config',
    icon: 'SlidersHorizontal',
    route: '/product-config',
    audience: 'insurer',
    remoteName: 'product_config',
    exposedModule: './module',
    description: 'Define insurance products, coverages, pricing factors, and versions.',
  },
  // --- Known but not yet built — demonstrates the "Coming soon" path ---
  {
    id: 'reinsurance',
    label: 'Reinsurance',
    icon: 'Layers',
    route: '/reinsurance',
    audience: 'insurer',
    remoteName: null,
    exposedModule: './module',
    description: 'Treaty and facultative reinsurance management.',
  },
  {
    id: 'claims',
    label: 'Claims',
    icon: 'FileText',
    route: '/claims',
    audience: 'insurer',
    remoteName: null,
    exposedModule: './module',
    description: 'First notice of loss, adjudication, and settlement.',
  },
];

export function getCatalogEntry(id: string): ModuleCatalogEntry | undefined {
  return MODULE_CATALOG.find((m) => m.id === id);
}

export function getCatalogEntryByRoute(route: string): ModuleCatalogEntry | undefined {
  return MODULE_CATALOG.find((m) => m.route === route);
}
