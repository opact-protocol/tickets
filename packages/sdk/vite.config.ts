
import { resolve } from "path";
import { defineConfig } from "vite";
import stdLibBrowser from 'node-stdlib-browser';

export default defineConfig({
  base: "./",
  build: {
    target: 'esnext',
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      fileName: 'hideyour-cash-sdk',
      formats: ['es'],
    },
  },
  optimizeDeps: {
    include: ["buffer", "process"]
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      ...stdLibBrowser
    }
  }
});
