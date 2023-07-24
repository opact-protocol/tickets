import { resolve } from "path";
import { defineConfig } from "vite";
import Pages from "vite-plugin-pages";
import worker from "vite-plugin-worker";
import react from "@vitejs/plugin-react";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const inject = require("@rollup/plugin-inject");

export default defineConfig(async () => {
  const { default: stdLibBrowser } = await import("node-stdlib-browser");

  return {
    plugins: [
      react(),
      worker({
        inline_worklet_paint: false,
        inline_worklet_audio: false,
        inline_worklet_layout: false,
        inline_worklet_animation: false,
        service_worker_file: 'sw.js'
      }),
      Pages({
        pagesDir: "src/pages"
      }),
      {
        ...inject({
          global: [
            require.resolve("node-stdlib-browser/helpers/esbuild/shim"),
            "global"
          ],
          process: [
            require.resolve("node-stdlib-browser/helpers/esbuild/shim"),
            "process"
          ],
          Buffer: [
            require.resolve("node-stdlib-browser/helpers/esbuild/shim"),
            "Buffer"
          ]
        }),
        enforce: "post"
      }
    ],
    envPrefix: "VITE_",
    build: {
      target: ["esNext"],
      rollupOptions: {
        output: {
          format: "es"
        }
      }
    },
    optimizeDeps: {
      include: ["buffer", "process"]
    },
    server: {
      port: 3000,
      proxy: {
        "/api": {
          target: "http://localhost:8081",
          changeOrigin: true,
          rewrite: path => path.replace(/^\/api/, "")
        }
      }
    },
    resolve: {
      alias: {
        "@": resolve(__dirname, "./src"),
        ...stdLibBrowser
      }
    }
  };
});
