/**
 * Fallback declaration for runtime-loaded remotes.
 *
 * The Shell never statically imports a remote, so there is no compile-time module to
 * resolve. The type-safe seam is the shared `RemoteModule` contract: every remote's
 * `./module` is declared to be a `RemoteModule`, and `loadRemoteModule()` asserts it at
 * runtime. (If remotes later ship pre-built type declarations, MF's generated `@mf-types`
 * can supersede this.)
 */
declare module '*/module' {
  import type { RemoteModule } from '@ginja/contracts';
  const mod: RemoteModule;
  export default mod;
}
