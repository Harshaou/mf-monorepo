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

// Remote manifest URLs, resolved at BUILD time (in Node, where process.env is available)
// with a localhost fallback for `pnpm dev`. Defining them here guarantees the references
// in runtime-config.ts are always replaced with a string literal — so `process` never
// leaks into the browser bundle, whether or not the env vars are set.
const remoteUrls = {
  'process.env.PUBLIC_UNDERWRITING_URL': JSON.stringify(
    process.env.PUBLIC_UNDERWRITING_URL ?? 'http://localhost:3001/mf-manifest.json'
  ),
  'process.env.PUBLIC_PRODUCT_CONFIG_URL': JSON.stringify(
    process.env.PUBLIC_PRODUCT_CONFIG_URL ?? 'http://localhost:3002/mf-manifest.json'
  ),
};

export default defineConfig({
  server: { port: 3000 },
  source: { define: remoteUrls },
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
