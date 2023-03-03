// import path from 'path';
import { defineConfig } from 'tsup';
import { commonjs } from "@hyrious/esbuild-plugin-commonjs";

// const replaceNodeBuiltIns = () => {
//   const replace = {
//     // ...stdLibBrowser,
//     'path': path.resolve('path-browserify'),
//     'fs': path.resolve('fs-browserify'),
//   }
//   const filter = RegExp(`^(${Object.keys(replace).join("|")})$`);
//   return {
//     name: "replaceNodeBuiltIns",
//     setup(build) {
//       build.onResolve({ filter }, arg => ({
//         path: replace[arg.path],
//       }));
//     },
//   };
// }

export default defineConfig({
  dts: true,
  clean: true,
  esbuildPlugins: [
    commonjs(),
  ],
  format: ['cjs', 'esm'],
  entry: ['src/index.ts'],
})
