/**
 * @ginja/contracts — the dependency-free vocabulary of the micro-frontend boundary.
 *
 * Both the Shell and every Remote build against these types. They are the *only*
 * sanctioned shared shape across the seam: a remote that fails to expose what the
 * contract promises fails to load, loudly, rather than rendering something broken.
 */
export * from './remote-module';
export * from './tenant';
export * from './catalog';
export * from './runtime-config';
