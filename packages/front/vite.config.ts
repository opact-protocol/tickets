import { resolve } from "path";
import { defineConfig } from "vite";
import Pages from "vite-plugin-pages";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

import inject from "@rollup/plugin-inject";

export default defineConfig(async () => {
  const { default: stdLibBrowser } = await import("node-stdlib-browser");

  return {
    plugins: [
      react(),
      Pages({
        pagesDir: "src/pages",
      }),
      {
        ...inject({
          global: [
            require.resolve("node-stdlib-browser/helpers/esbuild/shim"),
            "global",
          ],
          process: [
            require.resolve("node-stdlib-browser/helpers/esbuild/shim"),
            "process",
          ],
          Buffer: [
            require.resolve("node-stdlib-browser/helpers/esbuild/shim"),
            "Buffer",
          ],
        }),
        enforce: "post",
      },
    ],
    envPrefix: "VITE_",
    build: {
      target: ["esNext"],
      rollupOptions: {
        output: {
          format: "es",
        },
      },
    },
    optimizeDeps: {
      include: ["buffer", "process"],
    },
    resolve: {
      alias: {
        "@": resolve(__dirname, "./src"),
        ...stdLibBrowser,
      },
    },
  };
});
