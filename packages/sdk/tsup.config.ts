// import path from 'path';
import { defineConfig } from "tsup";
import { commonjs } from "@hyrious/esbuild-plugin-commonjs";
import { NodeModulesPolyfillPlugin } from "@esbuild-plugins/node-modules-polyfill";

export default defineConfig({
  dts: true,
  clean: true,
  esbuildPlugins: [commonjs(), NodeModulesPolyfillPlugin()],
  format: ["cjs", "esm"],
  entry: ["src/index.ts"],
});
