import { resolve } from "path";
import { defineConfig } from "vite";
import Pages from "vite-plugin-pages";
import react from "@vitejs/plugin-react";
import reactRefresh from "@vitejs/plugin-react-refresh";
import NodeGlobalsPolyfillPlugin from "@esbuild-plugins/node-globals-polyfill";

export default defineConfig({
  plugins: [
    react(),
    reactRefresh(),
    NodeGlobalsPolyfillPlugin({
      buffer: true,
      process: true,
    }),
    Pages({
      pagesDir: "src/pages",
    }),
  ],
  esbuild: {},
  define: {
    global: "window",
    "process.env": {},
  },
  resolve: {
    alias: {
      util: "util",
      process: "process/browser",
      "@": resolve(__dirname, "./src"),
    },
  },
});
