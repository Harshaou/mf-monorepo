import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import path from 'node:path';
// Shared MF deps live in ONE place so the host and every remote stay byte-identical.
import { sharedDeps as shared } from '../../mf.shared';

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
  // Base URL of the standalone auth & entitlements backend (FastAPI on Railway).
  // Defaults to the deployed service, so `pnpm dev` works with no local backend;
  // override with PUBLIC_API_BASE_URL=http://localhost:8000 to hit a local one.
  'process.env.PUBLIC_API_BASE_URL': JSON.stringify(
    process.env.PUBLIC_API_BASE_URL ?? 'https://ginja-api-production.up.railway.app'
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
