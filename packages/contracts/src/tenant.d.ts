/** The audiences Ginja serves — each gets its OWN host shell, never cross-federated. */
export type Audience = 'insurer' | 'service-provider' | 'member';
export interface Tenant {
    id: string;
    name: string;
    /** Short display code, e.g. "ACME". */
    code: string;
}
export interface User {
    id: string;
    name: string;
    email: string;
    /** Coarse role within the tenant — drives nothing structural here, shown in chrome. */
    role: string;
}
/**
 * The result of a (currently mocked) login. The Shell is organised entirely around
 * what a session yields: a tenant, a user, and that tenant's entitlements.
 */
export interface UserSession {
    user: User;
    tenant: Tenant;
    /** Module ids this tenant is entitled to. Decided at login, not at build. */
    entitlements: string[];
    /** ISO timestamp of issue — mock stand-in for a real token's claims. */
    issuedAt: string;
}
