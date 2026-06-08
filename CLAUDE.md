# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A multi-tenant **insurance workspace** built as **one host Shell that composes
independently-deployed React micro-frontends at runtime** via Module Federation 2. Which
modules a tenant sees is decided by **entitlements at login**, not baked into the Shell's
build. Think "AWS Console for insurance". Full rationale is in `ARCHITECTURE.md`; this file
is the operational summary.

Stack: React 19 · React Router 7 (SPA) · Zustand 5 · Tailwind v4 · TypeScript 5. Built with
Rsbuild (Rspack), orchestrated by Nx, packaged with pnpm workspaces.

## Commands

```bash
pnpm install
pnpm dev          # all 3 apps: shell:3000, underwriting:3001, product-config:3002
pnpm build        # nx run-many -t build
pnpm lint         # all projects incl. module-boundary rules
pnpm typecheck    # tsc --noEmit per project
pnpm graph        # visualise the Nx project graph
pnpm format       # prettier --write

# Single project / affected
nx dev underwriting              # run one remote standalone (→ :3001, framed by a dev shell)
nx build shell                   # build one project
nx lint product-config           # lint one project
nx typecheck shell               # typecheck one project
pnpm exec nx affected -t build   # build only what changed vs main
```

There is **no test runner configured** in this repo — `typecheck` and `lint` are the
verification gates. Don't invent a `test` target.

Nx runs tasks but **never builds the code** — Rsbuild does. Nx decides what runs, in what
order, what's cached, and what's allowed to depend on what.

## Layout

| Project | Tags | Role | Port |
| --- | --- | --- | --- |
| `apps/shell` | `type:host scope:insurer` | Chrome, routing, session, runtime composition, failure boundaries | 3000 |
| `apps/underwriting` | `type:remote scope:insurer` | Submission queue + decision screens | 3001 |
| `apps/product-config` | `type:remote scope:insurer` | Product catalog + config forms | 3002 |
| `packages/contracts` | `type:shared scope:shared` | Dependency-free types — the boundary vocabulary | — |
| `packages/design-system` | `type:shared scope:shared` | Tailwind v4 + shadcn primitives (MF singleton) | — |
| `packages/store` | `type:shared scope:shared` | Zustand singleton — session, entitlements, theme, UI | — |

Workspace import aliases: `@ginja/contracts`, `@ginja/design-system`, `@ginja/store`
(mapped to each package's `src/index.ts` in every `rsbuild.config.ts` and `tsconfig.base.json`).

## How runtime composition works (the core mechanic)

The Shell is built with **`remotes: {}`** (`apps/shell/rsbuild.config.ts`) — it knows no
remotes at build time. The load pipeline:

1. **Login** (`apps/shell/src/services/auth.ts`, mocked) yields a `UserSession` with `entitlements`.
2. **Catalog** (`apps/shell/src/data/catalog.ts`) lists *every* module the Shell knows about,
   including not-yet-built ones (`remoteName: null` → "Coming soon").
3. **Resolve URLs** (`apps/shell/src/services/runtime-config.ts`) maps entitled+built modules
   to manifest URLs. `DEV_REMOTE_URLS` holds localhost defaults; in prod this comes from
   per-tenant edge config. **This is the seam that lets a remote ship without a Shell redeploy.**
4. **Register + load** (`apps/shell/src/mf/runtime.ts`) calls `registerRemotes(..., {force:true})`
   then `loadRemote()` on navigation, asserting the result satisfies the `RemoteModule` contract.
5. **Mount in a failure boundary** (`apps/shell/src/mf/RemoteModuleHost.tsx`) — Suspense cache +
   per-route error boundary. A broken remote shows a contained message; it never takes down the
   Shell or siblings. Tenant switch calls `clearAllRemoteModules()` and re-registers.

**The contract:** every remote exposes a single `./module` entry (`apps/*/src/module.tsx`)
whose default export is a `RemoteModule` — `{ meta, routes }` with **relative** routes. The
Shell mounts that whole module under one base path (e.g. `/underwriting/*`). Failing the
contract makes loading throw loudly rather than render broken.

## Rules that will bite you

- **Module boundaries are enforced by ESLint** (`@nx/enforce-module-boundaries` in
  `eslint.config.mjs`), not convention. A host or remote may depend on `type:shared` **only** —
  never another remote, never the host. A deliberate cross-remote import **fails `nx lint`**.
  Share via packages/contracts, the API, or events — never a direct import.
- **Shared singletons must match across every app.** `react`, `react-dom`, `react-router-dom`,
  `zustand`, `@ginja/design-system`, `@ginja/store` are declared singletons in *every*
  `rsbuild.config.ts`. They load once and are reused. Bumping a version means bumping it in all
  three apps' `shared` blocks together, or MF surfaces a runtime mismatch.
- **Remotes need CORS + absolute `assetPrefix`** (see `apps/underwriting/rsbuild.config.ts`) so
  the Shell at :3000 can load assets from :3001/:3002.
- **`@mf-types` auto-gen is disabled** (`dts: false`). Type safety across the boundary comes
  from the shared `RemoteModule` contract in `packages/contracts`, not generated declarations.

## Adding things

- **A new module:** add a `ModuleCatalogEntry` to `apps/shell/src/data/catalog.ts`, build a
  remote app exposing `./module` as a `RemoteModule`, register its dev URL in
  `DEV_REMOTE_URLS`, tag the project `type:remote`, and add it to `pnpm-workspace.yaml`.
- **Enabling a module for a tenant** is purely an entitlements change — no Shell code change.

## Mocked pieces (intentional)

Real auth + live entitlements API (`auth.ts`) and per-tenant runtime config from the edge
(`runtime-config.ts`, uses localhost defaults / build-time `PUBLIC_*_URL`). Deploy wiring
is real: the Shell deploys via Cloudflare Pages' Git integration, the remotes via
`.github/workflows/deploy-remotes.yml`. Demo tenants are in `apps/shell/src/data/tenants.ts`.
