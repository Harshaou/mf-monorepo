# Deployment Guide

How this micro-frontend platform is deployed, and the day-to-day flow for shipping
changes. Read [ARCHITECTURE.md](./ARCHITECTURE.md) first if you want the "why" behind
the runtime composition model; this doc is the "how to ship it".

---

## 1. The model in one paragraph

The **Shell** (host) and each **Remote** are **two independent deploy pipelines**. The
Shell is built knowing *zero* remotes — it resolves each remote's URL at runtime, after
login, per the tenant's entitlements. That means a remote can be redeployed to the same
URL and go live on the next page load **without redeploying the Shell**. The price of
this freedom is coordinated version governance for the shared singletons (see §7).

---

## 2. Infrastructure map

| Piece | Project / app | Hosted on | Production URL |
| --- | --- | --- | --- |
| Shell (host) | `apps/shell` | **Vercel** (Git integration) | `https://mf-monorepo.vercel.app` |
| Underwriting remote | `apps/underwriting` | **Cloudflare Pages** | `https://ginja-underwriting.pages.dev` |
| Product Config remote | `apps/product-config` | **Cloudflare Pages** | `https://ginja-product-config.pages.dev` |
| Shared libs | `packages/*` | not deployed standalone | bundled into consumers |

How each deploys:

| You change… | What redeploys | Trigger |
| --- | --- | --- |
| `apps/shell/**` | Shell only (Vercel) | push to `main` |
| `apps/underwriting/**` | Underwriting remote (Cloudflare) | push to `main` |
| `apps/product-config/**` | Product Config remote (Cloudflare) | push to `main` |
| `packages/**` | **Both** remotes **and** the Shell | push to `main` (both pipelines fire) |

- **Remotes:** deployed by GitHub Actions → `wrangler` → Cloudflare Pages. See
  `.github/workflows/deploy-remotes.yml`.
- **Shell:** deployed by Vercel's Git integration (no workflow file). Vercel watches
  `main` and also posts **preview deploys** on every PR.
- **CI:** `.github/workflows/ci.yml` runs `nx affected` lint/typecheck/build on every
  push and PR.

---

## 3. The everyday workflow

Merging to `main` **is** the deploy. You do not run deploy commands by hand.

```bash
git checkout -b my-change          # 1. branch off main
# …make your change…
pnpm dev                           # 2. verify locally (shell :3000, remotes :3001/:3002)
git push -u origin my-change       # 3. push the branch
# 4. open a PR on GitHub:
#      → CI runs (lint / typecheck / build, nx-affected)
#      → Vercel posts a PREVIEW deploy of the shell on the PR
# 5. review the preview, get checks green
# 6. merge to main  → production deploys fire automatically
# 7. verify production (§8)
```

---

## 4. Scenario A — Remote-only change (most common)

Example: tweak the underwriting table UI. Touches only `apps/underwriting/**`.

1. Branch → edit → `pnpm dev` to check locally.
2. PR → merge to `main`.
3. `deploy-remotes.yml` rebuilds **underwriting** (with its `PUBLIC_ASSET_PREFIX`) and
   uploads to `ginja-underwriting.pages.dev`.
4. **Live on the next page load.** The Shell is *not* redeployed — it re-reads the
   remote's `mf-manifest.json` (served `no-cache`) and picks up the new version.
5. Verify: hard-refresh the live app, open the module, confirm the change.

> This is the core promise of the architecture: ship a remote without touching the Shell.

## 5. Scenario B — Shell-only change

Example: change the layout, login page, or sidebar. Touches only `apps/shell/**`.

1. Branch → edit → `pnpm dev`.
2. PR → Vercel gives a preview URL → merge to `main`.
3. Vercel rebuilds and deploys the Shell. Remotes untouched.
4. Verify on `https://mf-monorepo.vercel.app`.

## 6. Scenario C — Shared-package change (the careful one)

Example: edit a component in `packages/design-system`, the store in `packages/store`, or
a type in `packages/contracts`.

Because both the Shell and the remotes **bundle** these (and `react`, `react-dom`,
`react-router-dom`, `zustand`, `@ginja/design-system`, `@ginja/store` are declared as
**singletons**), a single push to `main` redeploys **both pipelines in parallel**. That
is automatic — but there is a brief window where the Shell and a remote may be on
slightly different versions. So:

- **Backward-compatible change** (add an optional field, add a component, fix a style):
  safe. Order doesn't matter.
- **Breaking change** (rename/remove a `RemoteModule` field, change a prop's shape, bump
  a singleton **major** like React 19→20): use **expand → migrate → contract**:
  1. Ship the change **additively** (e.g. add the new contract field as *optional*, keep
     the old one). Deploy.
  2. Update remotes (and Shell) to use the new thing. Deploy.
  3. Remove the old thing once nothing uses it. Deploy.

  This avoids a "Shell expects X, remote still sends Y" mismatch, which the runtime
  contract check in `apps/shell/src/mf/runtime.ts` would throw on.

### The ordering rule, in one line

> If a change requires the other side to understand something new, ship the side that
> **provides** it first, in a backward-compatible way. If the change is self-contained,
> order doesn't matter.

For ordinary feature work (Scenario A or B) there is no ordering concern at all.

---

## 7. Singleton version governance

The shared singletons are declared identically in every app's `rsbuild.config.ts`:

```ts
react:            { singleton: true, requiredVersion: '^19.0.0' }
'react-dom':      { singleton: true, requiredVersion: '^19.0.0' }
'react-router-dom': { singleton: true, requiredVersion: '^7.0.0' }
zustand:          { singleton: true, requiredVersion: '^5.0.0' }
'@ginja/design-system': { singleton: true }
'@ginja/store':         { singleton: true }
```

They load **once**, from whichever app loads first, and everyone reuses that copy. When
you bump one of these, bump it **everywhere in the same change** and treat a **major**
bump as a breaking change (§6). Minor/patch bumps within the declared range are safe.

---

## 8. Verifying a deploy

- **Remote (CDN) is live & correct:**
  ```bash
  curl -sI https://ginja-underwriting.pages.dev/mf-manifest.json
  # expect: HTTP/2 200, access-control-allow-origin: *, cache-control: no-cache
  ```
- **End-to-end:** open `https://mf-monorepo.vercel.app`, log in (demo: `dana@acme.example`
  / `acme123` — Acme sees both modules), open a module, and check the browser
  **Network** tab shows requests to `*.pages.dev/mf-manifest.json` and chunk loads
  returning `200`.

---

## 9. Rolling back

- **Remote:** Cloudflare dashboard → the Pages project → **Deployments** → **Rollback**
  to a previous deployment.
- **Shell:** Vercel dashboard → the project → **Deployments** → **Instant Rollback**.

Both are instant and require no rebuild.

---

## 10. Adding a brand-new remote

The one flow with manual setup steps:

1. Scaffold `apps/<new-remote>/` — an `rsbuild.config.ts` with `exposes: { './module': … }`,
   the shared singletons, and an env-driven `assetPrefix`:
   ```ts
   const ASSET_PREFIX = process.env.PUBLIC_ASSET_PREFIX || DEV_ORIGIN;
   // …
   output: { assetPrefix: ASSET_PREFIX }
   ```
   Add `apps/<new-remote>/public/_headers` (copy an existing remote's).
2. Create the Cloudflare Pages project:
   ```bash
   npx wrangler pages project create ginja-<new-remote> --production-branch=main
   ```
3. Add it to the matrix in `.github/workflows/deploy-remotes.yml`:
   ```yaml
   - app: <new-remote>
     project: ginja-<new-remote>
     origin: https://ginja-<new-remote>.pages.dev
   ```
4. Register it in the Shell's catalog (`apps/shell/src/data/catalog.ts`) with its
   `remoteName`, and add a `PUBLIC_<NEW>_URL` entry in `runtime-config.ts` + the matching
   env var in Vercel.
5. Push → both deploy.

---

## 11. Environment variables reference

### Shell (set in Vercel → Project → Settings → Environment Variables)

| Name | Value | Purpose |
| --- | --- | --- |
| `PUBLIC_UNDERWRITING_URL` | `https://ginja-underwriting.pages.dev/mf-manifest.json` | Where the Shell finds the underwriting remote |
| `PUBLIC_PRODUCT_CONFIG_URL` | `https://ginja-product-config.pages.dev/mf-manifest.json` | Where the Shell finds the product-config remote |

Read in `apps/shell/src/services/runtime-config.ts`; both fall back to `localhost` for
`pnpm dev`. **These are baked in at build time** — changing them in Vercel requires a
redeploy of the Shell to take effect.

### Remotes (set per-build by `deploy-remotes.yml`)

| Name | Value | Purpose |
| --- | --- | --- |
| `PUBLIC_ASSET_PREFIX` | the remote's own Pages origin | Stamped into the manifest/chunks so the Shell loads them from the CDN |

You don't set this manually — the workflow's matrix provides it per remote.

### GitHub Actions secrets (Repo → Settings → Secrets and variables → Actions)

| Name | Purpose |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | Auth for `wrangler` (scope: Account › Cloudflare Pages › Edit) |
| `CLOUDFLARE_ACCOUNT_ID` | Target Cloudflare account |

---

## 12. Local development

```bash
pnpm install
pnpm dev          # nx run-many dev: shell :3000, underwriting :3001, product-config :3002
```

With no env vars set, the Shell uses the `localhost` fallbacks and loads the remotes from
their dev servers. CORS and absolute asset prefixes are already configured for the dev
ports in each remote's `rsbuild.config.ts`.

---

## 13. Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Module shows "Coming soon" in prod | Shell built without the `PUBLIC_*_URL` env var (using localhost fallback) | Set the env var in Vercel, **redeploy the Shell** |
| Remote chunks 404 in prod | Built without `PUBLIC_ASSET_PREFIX` (chunks point at localhost) | Ensure the deploy workflow's matrix sets the right origin; redeploy |
| CORS error loading a remote | `_headers` missing/not deployed | Confirm `apps/<remote>/public/_headers` exists; it's copied to `dist/` on build |
| New remote version not picked up | `mf-manifest.json` cached | It's served `no-cache`; hard-refresh. Chunks are content-hashed + immutable |
| Contract error on module load | Shell/remote on incompatible contract versions | Apply expand→migrate→contract (§6) |
| GitHub Action red at deploy step | Bad/missing Cloudflare secret or wrong token scope | Verify the two secrets; token needs *Pages › Edit* |

---

## TL;DR

> **Branch → PR → preview → merge to `main` → it deploys itself.**
> Remote change = only that remote redeploys, Shell untouched.
> Shell change = only the Shell.
> Shared package = both — keep breaking changes backward-compatible and ship in steps.
