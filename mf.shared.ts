/**
 * Single source of truth for Module Federation shared dependencies.
 *
 * Every app's `rsbuild.config.ts` imports this SAME object so the host and every
 * remote declare an IDENTICAL `shared` block. MF requires these to match across
 * apps — a drifted version or a singleton declared in one app but not another
 * surfaces as a runtime mismatch. Keeping one definition removes the "remember to
 * edit all three configs" footgun.
 *
 * Bumping a shared version means bumping it HERE (and in each app's package.json),
 * which then applies everywhere at once.
 *
 *  - react / react-dom / react-router-dom / zustand / @ginja/store are stateful
 *    singletons: exactly one instance must exist process-wide, or hooks, the router,
 *    and the store split into incompatible copies.
 *  - @ginja/design-system is a singleton so theme/context and CSS load once.
 *  - lucide-react is stateless (just icon components), so it's shared for dedup but
 *    NOT a singleton — multiple compatible versions may coexist without harm, and
 *    not forcing singleton avoids a needless version-mismatch warning.
 */
export const sharedDeps = {
  react: { singleton: true, requiredVersion: '^19.0.0' },
  'react-dom': { singleton: true, requiredVersion: '^19.0.0' },
  'react-router-dom': { singleton: true, requiredVersion: '^7.0.0' },
  zustand: { singleton: true, requiredVersion: '^5.0.0' },
  'lucide-react': { singleton: false, requiredVersion: '^1.17.0' },
  '@ginja/design-system': { singleton: true },
  '@ginja/store': { singleton: true },
};
