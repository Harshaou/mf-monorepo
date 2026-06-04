import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import path from 'node:path';

const PORT = 3001;
const DEV_ORIGIN = `http://localhost:${PORT}`;

// In production, CI/Cloudflare builds with PUBLIC_ASSET_PREFIX set to this remote's own
// CDN origin (e.g. https://underwriting.<project>.pages.dev) so the Shell — served from a
// different origin — loads this remote's lazy chunks from the CDN, not from the Shell.
const ASSET_PREFIX = process.env.PUBLIC_ASSET_PREFIX || DEV_ORIGIN;

// Must match the shared singletons declared by the Shell. Coordinated version governance.
const shared = {
  react: { singleton: true, requiredVersion: '^19.0.0' },
  'react-dom': { singleton: true, requiredVersion: '^19.0.0' },
  'react-router-dom': { singleton: true, requiredVersion: '^7.0.0' },
  zustand: { singleton: true, requiredVersion: '^5.0.0' },
  '@ginja/design-system': { singleton: true },
  '@ginja/store': { singleton: true },
};

export default defineConfig({
  // CORS + absolute asset prefix so the Shell (:3000) can load this remote (:3001).
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
      name: 'underwriting',
      // The single entry the Shell mounts. This export IS the contract (RemoteModule).
      exposes: {
        './module': './src/module.tsx',
      },
      shared,
      // The boundary is made type-safe by the SHARED CONTRACT: both sides import
      // `RemoteModule` from @ginja/contracts, and the Shell types loadRemote() against
      // it. (MF's @mf-types auto-gen is disabled here because it can't emit declarations
      // for TS-source workspace packages consumed via path aliases; enabling it requires
      // the shared packages to ship pre-built .d.ts — a deployment-time follow-up.)
      dts: false,
    }),
  ],
});
