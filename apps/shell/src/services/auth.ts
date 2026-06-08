import type { UserSession } from '@ginja/contracts';
import { getDemoTenant, getDemoTenantByEmail, type DemoTenant } from '../data/tenants';

/**
 * Mock auth & entitlements client. There is no backend — credentials are validated
 * against the demo accounts in `../data/tenants.ts`. A successful login yields the
 * `UserSession` whose entitlements decide the entire composed workspace. In production
 * this would be a real auth exchange returning a token whose claims carry the tenant
 * and its entitlements; here we stand that in with the demo data.
 *
 * See the README for the demo login credentials.
 */

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
 * Log in with credentials. Validates against the demo accounts and resolves the session,
 * whose entitlements drive runtime composition. Throws on bad credentials.
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
 * Switch the active tenant for an already-authenticated user. Re-resolves entitlements
 * (and therefore the whole composed workspace) without re-entering a password.
 */
export async function switchTenant(tenantId: string): Promise<UserSession> {
  await delay(400);
  const demo = getDemoTenant(tenantId);
  if (!demo) throw new Error(`Unknown tenant: ${tenantId}`);
  return sessionFrom(demo);
}
