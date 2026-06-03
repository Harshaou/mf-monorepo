Micro-Frontend Architecture with Module Federation

### **Vision & Goal**

We are building a **unified Insurance Workspace** — similar to the AWS Management Console experience.

**Key Characteristics:**

- One single login (Shell)
- One consistent Header + Sidebar
- All modules (Claims, Underwriting, Finance, Product Configuration, Reinsurance, etc.) load **inside** the Shell
- Users get a seamless, non-fragmented experience
- Different teams can work independently on their modules

This is achieved using **Module Federation + Monorepo architecture**.

pnpm — for workspace management and package management
Nx — only as task runner, caching, and enforcing module boundaries
Rsbuild — as your bundler
@module-federation/rsbuild-plugin — for Module Federation (runtime)

> A **multi-tenant insurance workspace** built as **one host shell that composes many
> independently-deployed React micro-frontends at runtime**, where _which_ modules a tenant sees is
> decided by their entitlements at login — not baked into the shell's build.

What that buys users and teams:

- **One login, one shell** — a single entry point with consistent chrome (header and sidebar).
- **All modules live inside the workspace** — it feels like one product, not a set of linked apps.
- **Independent teams** — each module is owned, built, and deployed by its own team, on its own
  cadence, without coordinating a shell release.

The high-level shape has three kinds of pieces:

- **The Shell (Host)** — the main container, and the only piece that is a full, standalone
  application.
- **Remotes** — the independent business modules. These are _not_ full apps; they are bundles of UI
  the Shell loads on demand.
- **Shared packages** — reusable building blocks (a design system, shared types) used by the Shell
  and every Remote.

---

## Why micro-frontends — and not just a single React app?

This is the first question worth answering honestly, because micro-frontends **add real
complexity**. We took it on deliberately — only because the drivers below are real for us. For a
small, single-team product, a single React app would be the right call.

### The alternative: one big React app

We _could_ build everything as one React application: all pages and features in one codebase,
shipped as one bundle. That gives a non-fragmented experience — one URL, one shell, consistent
chrome — which is genuinely valuable, and which we **keep** in our approach anyway.

But a single app means **everything ships together.** As the product and the organisation grow,
that couples things that should be independent. What we'd lose:

| What a monolith costs us    | Why it hurts                                                                                                                                                                        |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Team autonomy**           | Many teams own different domains. In one app they constantly step on each other — shared build, shared release, merge contention.                                                   |
| **Independent development** | A change in Claims forces a full-app rebuild and retest, even for the Underwriting team. Every change's blast radius is the whole app.                                              |
| **Independent deployment**  | You can't ship Underwriting without redeploying Claims, Finance, and everything else. One team's bug blocks everyone's release.                                                     |
| **Scalability**             | One bundle, one build, one pipeline grows with every feature — build times, bundle size, and coordination cost all climb with team count.                                           |
| **Per-tenant composition**  | A monolith ships _all_ modules to _all_ tenants. There's no clean way to load only what a tenant is entitled to without redeploying the app — and that's a core requirement for us. |

### The micro-frontend answer

Split the product into independently-built **remotes**, each owned and deployed by one team, and
compose them at runtime with a thin **Shell** that owns the shared chrome. Each team develops,
builds, and ships on its own cadence; the Shell stitches the result into one seamless workspace.

The canonical picture — one screen, multiple teams, each shipping independently:

```
┌──────────────────────────────────────────────────────────────────┐
│  [ Shell ]  Header · global search · nav · session                 │  ← Host team
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│   ┌──────────────────────────┐    ┌──────────────────────────┐    │
│   │  Underwriting module      │    │  Product Config module    │    │
│   │  owned + deployed by       │    │  owned + deployed by       │   │
│   │  Team Underwriting        │    │  Team Product             │    │
│   └──────────────────────────┘    └──────────────────────────┘    │
│                                                                    │
│   Each module ships on its OWN cadence. The Shell composes them.   │
└──────────────────────────────────────────────────────────────────┘
```

There are two flavours of micro-frontend, and it's worth being precise about which one we use:

- **Region / component-level** — several teams render different _regions of one page_ (the classic
  e-commerce demo: one team owns the product panel, another the "Add to cart" button, another the
  "Related products" strip).
- **Route-level** — each remote owns an entire **module**. The Shell hands a whole route to a
  remote, and that remote owns everything beneath it. There's no in-page composition where multiple
  remotes share one screen.

**We chose route-level.** Our verticals are naturally whole-screen domains — an underwriting queue,
a product catalog — with clean boundaries. That makes for simpler isolation, simpler ownership, and
a perfect fit for loading modules based on entitlements.

And that last point is the requirement a monolith simply cannot satisfy: **load modules based on a
tenant's entitlements, at runtime.** It's the heart of the design.

---

## The core idea: runtime composition

The single most important property of this architecture is that **the Shell does not know its
remotes at build time.** It's built with an empty remote list; the set of modules is decided later
— per tenant, at login.

A short scenario makes it concrete:

> Tenant A logs in and sees Underwriting and Product Config. Tenant B logs into the _same_
> workspace and sees only Product Config — same Shell, no separate build, no redeploy. Meanwhile,
> Team Underwriting ships a fix in the afternoon; nobody else rebuilds, and no other team even needs
> to know.

That one behaviour is what the whole architecture is organised around. It delivers two things:

1. **Per-tenant module sets** — enabling a module for a tenant is an _entitlements change_, not a
   shell deploy.
2. **Independent remote releases** — a team ships a new version of its module and the Shell picks it
   up on the next load. No shell rebuild, no coordination.

Everything else in the design exists to make that idea _safe_: type-safe across the boundary,
isolated on failure, and impossible to violate by accident.

---

## The system at a glance

```
                   ┌─────────────────────────────────────────────┐
                   │              INSURER WORKSPACE (SHELL)        │
                   │                                               │
   Tenant          │   Chrome: Layout · Header · Sidebar           │
   entitlements ──▶│   Routing · Session · Failure boundaries      │
   (who gets what) │   Runtime remote registry                    │
                   └───────────────┬───────────────┬───────────────┘
                                   │               │
                      loads at runtime,    only if the tenant
                      from a resolved URL   is entitled
                                   │               │
                   ┌───────────────▼─────┐ ┌───────▼─────────────┐
                   │  Product Config      │ │  Underwriting       │
                   │  REMOTE (own team)   │ │  REMOTE (own team)  │
                   └───────────┬──────────┘ └───────┬─────────────┘
                               │                    │
                               └────────┬───────────┘
                                        │  may depend ONLY on
                                        ▼
                   ┌─────────────────────────────────────────────┐
                   │              SHARED PACKAGES                  │
                   │   Design system   ·   Shared types/contracts  │
                   └─────────────────────────────────────────────┘

   Modules known but not yet built (e.g. Sales, Reinsurance) → "Not entitled" path
```

| Piece                 | Role                                                                                                                          |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **Insurer Workspace** | The **Host**. Owns the chrome (layout, header, sidebar), routing, session, and error boundaries; composes remotes at runtime. |
| **Product Config**    | A **Remote** — an independently-built, independently-deployed business module.                                                |
| **Underwriting**      | A **Remote** — same, owned by its own team.                                                                                   |
| **Design system**     | Shared UI building blocks and styling, loaded once for the whole workspace.                                                   |
| **Contracts**         | Shared, dependency-free types — the common vocabulary across the boundary.                                                    |

---

## The tools — and what each one does

Four tools, four non-overlapping jobs. This separation is the architecture's foundation.

| Tool                  | Its job                                                                                    |
| --------------------- | ------------------------------------------------------------------------------------------ |
| **pnpm Workspaces**   | Shares our internal packages across the Shell and all Remotes — no publishing to npm.      |
| **Rsbuild (Rspack)**  | Builds and serves each app. The actual bundler.                                            |
| **Module Federation** | Composes Shell + Remotes _at runtime_ and shares common dependencies.                      |
| **Nx**                | Orchestrates tasks (order, caching, "only what changed") and _enforces module boundaries_. |

**[pnpm Workspaces](https://pnpm.io/workspaces)** lets us share our own packages — the design
system, shared types, future utilities — across the Shell and every Remote without publishing to
npm. Update a shared component and the change is immediately available everywhere in development,
with no build, publish, or version bump.

**[Nx](https://nx.dev/)** is the task runner, build orchestrator, and monorepo manager that sits
_on top of_ the bundler. It understands the dependency graph between projects, runs tasks in the
right order and in parallel, caches results to skip unchanged work, and runs only what a change
actually affects — which keeps CI fast. It's also where module boundaries are enforced (more on
that below).

**[Rsbuild](https://rsbuild.rs/)** (built on Rspack) is our bundler, chosen for its first-class
Module Federation support and performance. We chose it over Vite, whose Module Federation story was
the weak link around shared dependencies and hot reloading. Rsbuild is what actually builds the
code and wires up federation for both the Shell and the Remotes.

**[Module Federation](https://module-federation.io/)** is what delivers the unified,
AWS-Console-style workspace from independently-built modules. The Shell (Host) owns the common
layout; business modules are built as Remotes the Shell loads on demand. The payoff is a seamless
unified experience _and_ teams that build and deploy independently. Only the Shell is a full
application; the Remotes are bundles the Shell loads when needed — per tenant, at runtime.

**[Zustand](https://github.com/pmndrs/zustand)** _(planned)_ is our chosen approach for lightweight
global state shared across the Shell and loaded remotes — tenant entitlements, user info, theme,
and global UI state. It's lightweight, low-boilerplate, and works cleanly with Module Federation
and React Router. Like React itself, the store will be a shared singleton so the whole workspace
reads and writes one instance.

> **How they fit together:** _pnpm_ shares the code, _Rsbuild_ builds it, _Module Federation_
> composes it at runtime, and _Nx_ orchestrates everything and guards the boundaries. Nx never
> builds the code — Rsbuild does; Nx decides _what_ runs, _in what order_, and _what's allowed to
> depend on what_.

---

## How a module loads

At login, the Shell runs a short pipeline to decide and load exactly the modules a tenant is
entitled to:

```
  Tenant entitlements
          │
          ▼
  ┌─────────────────┐   filter    ┌────────────────────┐
  │  Catalog of ALL  │ ─────────▶ │  Entitled modules   │
  │  known modules   │            └─────────┬──────────┘
  └─────────────────┘                       │
                              resolve each module's URL at runtime
                                            │
                              register + lazy-load on navigation
                                            │
                              render inside a failure boundary
```

1. **Catalog** — the Shell holds metadata for every module it knows about (nav label, route, icon,
   which remote). The catalog can include modules that aren't built yet, so navigation and
   entitlements can reference them.
2. **Entitlements** — which modules _this tenant_ gets, fetched at login.
3. **URL resolution** — each entitled module's location is resolved _at runtime_ (from per-tenant
   config, with sensible local defaults). This is the seam that lets a team ship a new version
   without a shell rebuild.
4. **Register and load** — the Shell registers only the entitled remotes and lazy-loads each one
   when its route is first visited. Entitled, and the module renders; not entitled, and the user
   sees a clear "Not entitled" page.

The practical upshot: **adding a module** is a catalog entry plus a remote that exposes its routes.
**Enabling it for a tenant** is an entitlements change only — no shell code change at all.

---

## Keeping the boundary safe

The Shell never directly imports a remote — it loads it at runtime. So how do we keep that boundary
type-safe across independent teams? Two things, working together:

- A **shared contract** describes the agreed shape every remote must expose. It's the common
  vocabulary both sides build against.
- **Generated types** from each remote flow back into the Shell automatically, so the Shell always
  sees an accurate, up-to-date type for what each remote actually exposes.

The convention is simple: every remote exposes its routes as a single entry, and the Shell mounts
that whole module under one route. If a remote fails to expose what the contract promises, loading
fails loudly with a clear error rather than rendering something broken.

---

## Failure isolation

Every remote is mounted inside a **failure boundary.** If a remote can't load — network down, a bad
deploy, a broken export — the user sees a self-contained message ("Couldn't load Underwriting;
other modules are unaffected") and the rest of the workspace keeps working. A single module can
never take down the Shell or its siblings. This is a hard product invariant: no silent failures.

---

## Boundaries enforced by tooling, not convention

With independent teams, the biggest long-term risk is modules quietly entangling each other. We
don't leave that to discipline — the architecture's "law" is enforced automatically. Each project
is tagged, and the rules are checked on every build:

| A…                          | may depend on                                            |
| --------------------------- | -------------------------------------------------------- |
| **Shared package**          | other shared packages only                               |
| **Shell (host)**            | shared packages only — never statically imports a remote |
| **Remote**                  | shared packages only — never another remote or the Shell |
| **Insurer-audience module** | insurer-audience modules and shared packages only        |

So the only sanctioned ways to share between remotes are **shared packages**, the **API**, and
**events** — never a direct import. A deliberate cross-remote import fails the build. This is the
main reason we reached for Nx: it turns an architectural rule into something a machine enforces,
not something humans have to remember.

---

## Shared dependencies and version governance

React, the router, and the design system are declared **singletons**: they load once, from the
Shell, and every remote reuses that single copy instead of bundling its own. One React instance,
one router, one design system across the whole workspace.

The trade-off is **version governance.** Because everyone shares one copy, versions must stay
compatible across all projects — when we bump React or the router, we bump it everywhere. Module
Federation negotiates compatible versions at runtime and surfaces a genuine mismatch rather than
silently loading two copies.

---

## One host shell per audience — not one mega-shell

Ginja serves several audiences, and each gets its **own** host shell. They are _not_ federated into
one giant shell:

| Audience             | Host shell        | Status                  |
| -------------------- | ----------------- | ----------------------- |
| Insurer staff        | Insurer Workspace | In scope now            |
| Service Providers    | SP Portal         | Later — a separate host |
| Members / dependants | Member App        | Later — a separate host |

The reasons: different identity models, different security and entitlement surfaces (a smaller
blast radius), a different UX shape (the Member App is mobile-first; the Insurer Workspace is a
dense desktop console), and independent release cadences. Future hosts **reuse the shared packages**
and the API/event layer — never cross-host federation.

---

## Deployment and delivery

Delivery follows the architecture: the **Shell and each Remote ship independently.**

| Artifact                      | Deploy target         | Driven by                               |
| ----------------------------- | --------------------- | --------------------------------------- |
| **Shell**                     | Vercel                | Vercel's Git integration (auto on push) |
| **Remotes + shared packages** | CDN (S3 + CloudFront) | GitHub Actions                          |

The flow: a developer pushes, CI triggers, Nx's affected graph detects which projects actually
changed, only those are built, the built remotes are published to the CDN, and the Shell only
redeploys when the Shell itself changed.

Because the Shell resolves remote locations at runtime, a remote can publish a new version to the
same location and go live without a Shell redeploy. In production, the set of remote origins
allowed to load is restricted, for security.

---

## Where we are, and what's next

This began as an architecture spike and has since been ratified as our frontend architecture. The
core is proven: runtime tenant-aware composition, the type-safe boundary, failure isolation,
tooling-enforced module boundaries, and "build only what changed."

What's ahead: real authentication and a live entitlements API (these are currently mocked),
per-tenant runtime configuration served from the edge, adopting Zustand for shared global state,
and the full CI/CD and production-deployment pipeline.

The honest trade-offs are worth stating plainly. Runtime composition adds a network hop and a
moving part — resolving where each module lives — compared with a single bundle; we mitigate that
with strict failure isolation. Shared singletons mean coordinated version bumps. And the
"no cross-remote imports" rule pushes inter-module communication onto packages, APIs, and events,
which is more upfront design.

But that's the deal we wanted. In exchange for that discipline, independent teams ship independent
modules, tenants get exactly the modules they're entitled to, and the whole thing still feels like
one product — an AWS console for insurance.
