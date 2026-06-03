import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import path from 'node:path';

/**
 * Shared singletons. React, the router, the design system, the store and Zustand load
 * ONCE — from whichever app loads first — and every remote reuses that single copy.
 * The trade-off is version governance: when we bump these, we bump everywhere.
 */
const shared = {
  react: { singleton: true, requiredVersion: '^19.0.0' },
  'react-dom': { singleton: true, requiredVersion: '^19.0.0' },
  'react-router-dom': { singleton: true, requiredVersion: '^7.0.0' },
  zustand: { singleton: true, requiredVersion: '^5.0.0' },
  '@ginja/design-system': { singleton: true },
  '@ginja/store': { singleton: true },
};

export default defineConfig({
  server: { port: 3000 },
  resolve: {
    alias: {
      '@ginja/contracts': path.resolve(__dirname, '../../packages/contracts/src/index.ts'),
      '@ginja/design-system': path.resolve(__dirname, '../../packages/design-system/src/index.ts'),
      '@ginja/store': path.resolve(__dirname, '../../packages/store/src/index.ts'),
    },
  },
  plugins: [
    pluginReact(),
    pluginModuleFederation({
      name: 'shell',
      // The host knows NO remotes at build time. They are registered at runtime,
      // per-tenant, from URLs resolved after login. This is the heart of the design.
      remotes: {},
      shared,
    }),
  ],
});
