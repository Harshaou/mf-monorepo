import type { Tenant, User } from '@ginja/contracts';

export interface DemoTenant {
  tenant: Tenant;
  user: User;
  /** Mock credential (stand-in for a real auth exchange). */
  credentials: { email: string; password: string };
  /** Module ids this tenant is entitled to (mock stand-in for an entitlements API). */
  entitlements: string[];
}

/**
 * Mock accounts. Each user belongs to a tenant with a DIFFERENT entitlement set, so the
 * whole runtime-composition story is visible just by signing in as a different account.
 */
export const DEMO_TENANTS: DemoTenant[] = [
  {
    tenant: { id: 'acme', name: 'Acme Insurance', code: 'ACME' },
    user: { id: 'u-acme-1', name: 'Dana Reyes', email: 'dana@acme.example', role: 'Underwriting Lead' },
    credentials: { email: 'dana@acme.example', password: 'acme123' },
    // Entitled to both built modules.
    entitlements: ['underwriting', 'product-config'],
  },
  {
    tenant: { id: 'beacon', name: 'Beacon Mutual', code: 'BCN' },
    user: { id: 'u-beacon-1', name: 'Sam Okafor', email: 'sam@beacon.example', role: 'Product Manager' },
    credentials: { email: 'sam@beacon.example', password: 'beacon123' },
    // Entitled to Product Config only — Underwriting will be hidden + "Not entitled".
    entitlements: ['product-config'],
  },
  {
    tenant: { id: 'summit', name: 'Summit Re', code: 'SMT' },
    user: { id: 'u-summit-1', name: 'Priya Nair', email: 'priya@summit.example', role: 'Risk Analyst' },
    credentials: { email: 'priya@summit.example', password: 'summit123' },
    // Entitled to Underwriting + a not-yet-built module (Reinsurance → "Coming soon").
    entitlements: ['underwriting', 'reinsurance'],
  },
];

export function getDemoTenant(tenantId: string): DemoTenant | undefined {
  return DEMO_TENANTS.find((t) => t.tenant.id === tenantId);
}

export function getDemoTenantByEmail(email: string): DemoTenant | undefined {
  const normalized = email.trim().toLowerCase();
  return DEMO_TENANTS.find((t) => t.credentials.email.toLowerCase() === normalized);
}
