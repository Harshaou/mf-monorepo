import type { UserSession } from '@ginja/contracts';

/**
 * Auth & entitlements client. Talks to the standalone backend (FastAPI + Postgres on
 * Railway) that replaced the in-repo mock. A successful login yields a JWT — stored
 * client-side and replayed as a `Bearer` token — plus the `UserSession` whose
 * entitlements decide the entire composed workspace. The base URL is injected at
 * build time (see `apps/shell/rsbuild.config.ts`).
 */
const API_BASE_URL = process.env.PUBLIC_API_BASE_URL ?? 'http://localhost:8000';
const TOKEN_KEY = 'ginja.auth.token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

/** Clear the bearer token. Call alongside the store's `logout()`. */
export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

interface AuthResult {
  token: string;
  session: UserSession;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });

  if (!res.ok) {
    // FastAPI surfaces a `{ detail }` string for handled errors (bad creds, 403…).
    const detail = await res
      .json()
      .then((b) => (typeof b?.detail === 'string' ? b.detail : null))
      .catch(() => null);
    throw new Error(detail ?? `Request failed (${res.status}).`);
  }

  return res.json() as Promise<T>;
}

/**
 * Log in with credentials. Persists the returned token and resolves the session,
 * whose entitlements drive runtime composition. Throws on bad credentials.
 */
export async function login(email: string, password: string): Promise<UserSession> {
  const { token, session } = await request<AuthResult>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setToken(token);
  return session;
}

