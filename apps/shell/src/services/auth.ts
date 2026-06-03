import type { UserSession } from '@ginja/contracts';
import { getDemoTenant, getDemoTenantByEmail, type DemoTenant } from '../data/tenants';

/** Simulated network latency so the loading states are real, not theatre. */
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

function sessionFrom(demo: DemoTenant): UserSession {
  return {
    user: demo.user,
    tenant: demo.tenant,
    entitlements: demo.entitlements,
    issuedAt: new Date().toISOString(),
  };
}

/**
 * Mock login with credentials. In production this is a real auth exchange that yields a
 * token whose claims include the tenant and its entitlements. Here we validate against
 * the demo accounts and throw on bad credentials.
 */
export async function login(email: string, password: string): Promise<UserSession> {
  await delay(500);
  const demo = getDemoTenantByEmail(email);
  if (!demo || demo.credentials.password !== password) {
    throw new Error('Invalid email or password.');
  }
  return sessionFrom(demo);
}

/**
 * Switch the active tenant for an already-authenticated user. This re-resolves
 * entitlements (and therefore the whole composed workspace) without re-entering a
 * password — the header tenant switcher uses this.
 */
export async function switchTenant(tenantId: string): Promise<UserSession> {
  await delay(400);
  const demo = getDemoTenant(tenantId);
  if (!demo) throw new Error(`Unknown tenant: ${tenantId}`);
  return sessionFrom(demo);
}
