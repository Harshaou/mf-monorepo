import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import path from 'node:path';
// Must match the Shell's shared block exactly — so both import the same definition.
import { sharedDeps as shared } from '../../mf.shared';

const PORT = 3002;
const DEV_ORIGIN = `http://localhost:${PORT}`;

// In production, CI/Cloudflare builds with PUBLIC_ASSET_PREFIX set to this remote's own
// CDN origin (e.g. https://product-config.<project>.pages.dev) so the Shell — served from
// a different origin — loads this remote's lazy chunks from the CDN, not from the Shell.
const ASSET_PREFIX = process.env.PUBLIC_ASSET_PREFIX || DEV_ORIGIN;

export default defineConfig({
  server: {
    port: PORT,
    headers: { 'Access-Control-Allow-Origin': '*' },
  },
  dev: { assetPrefix: DEV_ORIGIN },
  output: { assetPrefix: ASSET_PREFIX },
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
      name: 'product_config',
      exposes: {
        './module': './src/module.tsx',
      },
      shared,
      // Type-safe boundary via the shared @ginja/contracts `RemoteModule`. See the
      // underwriting remote's config for why MF @mf-types auto-gen is disabled here.
      dts: false,
    }),
  ],
});
