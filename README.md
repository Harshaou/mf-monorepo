# Insurer Workspace — Micro-Frontend Platform

A multi-tenant **insurance workspace** built as **one host Shell that composes
independently-deployed React micro-frontends at runtime** (Module Federation 2). Which
modules a tenant sees is decided by their **entitlements at login** — not baked into the
Shell's build. Think "AWS Console for insurance".

> Full design rationale lives in [`ARCHITECTURE.md`](./ARCHITECTURE.md).

## What's in here

| Project | Type | Role | Port |
| --- | --- | --- | --- |
| `apps/shell` | Host | Chrome (header/sidebar), routing, session, runtime composition, failure boundaries | 3000 |
| `apps/underwriting` | Remote | Submission queue + risk/decision screens | 3001 |
| `apps/product-config` | Remote | Product catalog + configuration forms | 3002 |
| `packages/contracts` | Shared | Dependency-free types — the type-safe boundary (`RemoteModule`, `Tenant`, …) | — |
| `packages/design-system` | Shared | Tailwind v4 + shadcn primitives (loaded once as an MF singleton) | — |
| `packages/store` | Shared | Zustand singleton — session, entitlements, theme, UI | — |

## Tooling (and each tool's one job)

- **pnpm workspaces** — shares internal packages, no publishing.
- **Rsbuild (Rspack)** — builds & serves each app. The actual bundler.
- **Module Federation 2** (`@module-federation/rsbuild-plugin` + `enhanced` runtime) —
  composes Shell + Remotes **at runtime** and shares singletons.
- **Nx** — task runner, caching, "build only what changed", and **enforces module
  boundaries**. Nx never builds the code — Rsbuild does.

Stack: React 19 · React Router 7 (SPA mode) · Zustand 5 · Tailwind v4 · TypeScript 5.

## Getting started

```bash
pnpm install
pnpm dev          # starts shell:3000, underwriting:3001, product-config:3002
```

Open **http://localhost:3000** and sign in as one of the demo accounts below. There is
**no backend** — auth and entitlements are mocked entirely from
[`apps/shell/src/data/tenants.ts`](./apps/shell/src/data/tenants.ts). On the login screen
you can click any account to auto-fill its credentials.

| Tenant | Email | Password | Entitlements | What you see |
| --- | --- | --- | --- | --- |
| **Acme Insurance** | `dana@acme.example` | `acme123` | Underwriting + Product Config | both modules in the sidebar |
| **Beacon Mutual** | `sam@beacon.example` | `beacon123` | Product Config only | Underwriting hidden → "Not entitled" if visited |
| **Summit Re** | `priya@summit.example` | `summit123` | Underwriting + Reinsurance (unbuilt) | Underwriting + a "Coming soon" entry |

Each account belongs to a tenant with a **different entitlement set**, so the whole
runtime-composition story is visible just by signing in as a different account.

Each remote also runs standalone for isolated development (e.g. `nx dev underwriting`
→ http://localhost:3001), framed by a minimal dev shell.

## How a module loads (the core idea)

```
login → entitlements → filter the module catalog → resolve each remote's URL at runtime
      → registerRemotes() → lazy-load on navigation → render inside a failure boundary
```

- The Shell is built with an **empty remote list** (`remotes: {}` in `apps/shell/rsbuild.config.ts`).
- Remotes are registered at runtime from URLs resolved per-tenant
  (`apps/shell/src/services/runtime-config.ts`, `apps/shell/src/mf/runtime.ts`).
- Every remote exposes a single `./module` entry satisfying the `RemoteModule` contract
  (`packages/contracts`); the Shell mounts its routes under one path.
- Each remote mounts inside a **failure boundary** — a broken remote shows a contained
  message and never takes down the Shell or its siblings.

## Module boundaries (enforced by tooling)

`eslint.config.mjs` encodes the architecture's law via `@nx/enforce-module-boundaries`:

| A… | may depend on |
| --- | --- |
| Shared package | other shared packages only |
| Shell (host) | shared packages only — never a remote |
| Remote | shared packages only — never another remote or the Shell |

A deliberate cross-remote import fails `nx lint`.

## Useful commands

```bash
pnpm dev                         # run everything
pnpm build                       # build all projects
pnpm lint                        # lint all (incl. boundary rules)
pnpm typecheck                   # type-check all
pnpm graph                       # visualise the project graph
pnpm exec nx affected -t build   # build only what changed
```

## Shared dependencies & version governance

`react`, `react-dom`, `react-router-dom`, `zustand`, and `@ginja/design-system` /
`@ginja/store` are declared **singletons**: they load once and every remote reuses that
copy. The trade-off is coordinated version bumps — change them in one project, change
them everywhere.

## Deployment

Delivery follows the architecture (configs under `.github/workflows` are **templates**):
the **Shell** deploys to Vercel; **remotes + shared packages** publish to a CDN (S3 +
CloudFront) via `nx affected`. Because the Shell resolves remote URLs at runtime, a remote
can publish a new version to the same location and go live **without a Shell redeploy**.
In production, the set of allowed remote origins is restricted for security.

## Status / mocked pieces

This repo runs entirely on **mock data — there are no backend APIs to stand up**. The
intentionally-mocked seams are:

- **Auth + entitlements** (`apps/shell/src/services/auth.ts`) — `login()` validates
  credentials against the demo accounts in `apps/shell/src/data/tenants.ts` and returns a
  `UserSession`. In production this is a real auth exchange whose token claims carry the
  tenant and its entitlements.
- **Per-tenant runtime config** (`apps/shell/src/services/runtime-config.ts`) — resolves
  each entitled remote's manifest URL from the module catalog, using localhost defaults
  (overridable via `PUBLIC_*_URL` build-time env vars). In production this comes from a
  per-tenant edge config so a remote can ship without a Shell redeploy.
- **Deploy wiring** — Vercel/CDN config under `.github/workflows` are templates.

Demo accounts and their entitlements are listed under [Getting started](#getting-started).
