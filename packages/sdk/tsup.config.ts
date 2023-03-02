import { defineConfig } from 'tsup';
import { commonjs } from "@hyrious/esbuild-plugin-commonjs";

export default defineConfig({
  dts: true,
  clean: true,
  // shims: true,
  esbuildPlugins: [
    commonjs() as any,
  ],
  format: ['cjs', 'esm'],
  entry: ['src/index.ts'],
})
