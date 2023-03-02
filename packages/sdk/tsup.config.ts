import { defineConfig } from 'tsup';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { commonjs } from "@hyrious/esbuild-plugin-commonjs";


export default defineConfig({
  dts: true,
  clean: true,
  // shims: true,
  esbuildPlugins: [
    NodeModulesPolyfillPlugin() as any,
    NodeGlobalsPolyfillPlugin() as any,
    commonjs() as any,
  ],
  format: ['cjs', 'esm'],
  entry: ['src/index.ts'],
})
