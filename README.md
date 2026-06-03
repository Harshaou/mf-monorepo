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

Open **http://localhost:3000** and sign in as one of the demo tenants:

| Tenant | Entitlements | What you see |
| --- | --- | --- |
| **Acme Insurance** | Underwriting + Product Config | both modules in the sidebar |
| **Beacon Mutual** | Product Config only | Underwriting hidden → "Not entitled" if visited |
| **Summit Re** | Underwriting + Reinsurance (unbuilt) | Underwriting + a "Coming soon" entry |

Switch tenants from the header to watch the workspace re-compose **with no rebuild**.

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

Per `ARCHITECTURE.md`, these are intentionally mocked here: real auth + live entitlements
API (`apps/shell/src/services/auth.ts`), per-tenant runtime config from the edge
(`runtime-config.ts`, localhost defaults), and live Vercel/CDN wiring.
