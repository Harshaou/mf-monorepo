import nx from '@nx/eslint-plugin';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  {
    ignores: ['**/dist', '**/node_modules', '**/@mf-types', '**/*.config.*'],
  },
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      // The architecture's "law", enforced by tooling — not convention.
      // A deliberate cross-remote or remote->host import fails the build.
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?js$'],
          depConstraints: [
            // Shared packages may only depend on other shared packages.
            { sourceTag: 'type:shared', onlyDependOnLibsWithTags: ['type:shared'] },
            // The host (Shell) depends on shared packages only — never statically imports a remote.
            { sourceTag: 'type:host', onlyDependOnLibsWithTags: ['type:shared'] },
            // A remote depends on shared packages only — never another remote or the host.
            { sourceTag: 'type:remote', onlyDependOnLibsWithTags: ['type:shared'] },
            // Insurer-audience projects may only touch insurer-audience + shared.
            {
              sourceTag: 'scope:insurer',
              onlyDependOnLibsWithTags: ['scope:insurer', 'scope:shared'],
            },
            { sourceTag: 'scope:shared', onlyDependOnLibsWithTags: ['scope:shared'] },
          ],
        },
      ],
    },
  },
  prettier
);
