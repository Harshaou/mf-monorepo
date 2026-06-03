import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import path from 'node:path';

const PORT = 3002;
const ORIGIN = `http://localhost:${PORT}`;

const shared = {
  react: { singleton: true, requiredVersion: '^19.0.0' },
  'react-dom': { singleton: true, requiredVersion: '^19.0.0' },
  'react-router-dom': { singleton: true, requiredVersion: '^7.0.0' },
  zustand: { singleton: true, requiredVersion: '^5.0.0' },
  '@ginja/design-system': { singleton: true },
  '@ginja/store': { singleton: true },
};

export default defineConfig({
  server: {
    port: PORT,
    headers: { 'Access-Control-Allow-Origin': '*' },
  },
  dev: { assetPrefix: ORIGIN },
  output: { assetPrefix: ORIGIN },
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
