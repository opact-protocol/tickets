// import path from 'path';
import { defineConfig } from "tsup";
import { commonjs } from "@hyrious/esbuild-plugin-commonjs";

export default defineConfig({
  dts: true,
  clean: true,
  esbuildPlugins: [commonjs()],
  format: ["cjs", "esm"],
  entry: ["src/index.ts"],
});
