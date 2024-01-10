import { resolve } from "path";
import { defineConfig } from "vite";
import Pages from "vite-plugin-pages";
import react from "@vitejs/plugin-react";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const inject = require("@rollup/plugin-inject");
import worker, { pluginHelper } from 'vite-plugin-worker'

export default defineConfig(async () => {
  const { default: stdLibBrowser } = await import("node-stdlib-browser");

  return {
    plugins: [
      react(),
      pluginHelper(),
      worker({}),
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
          format: "es",
          // dir: 'dist', // Diretório de saída
          // entryFileNames: '[name].js', // Nome do arquivo de saída
          // chunkFileNames: '[name].js', // Nome do arquivo de chunk
        },
        // input: {
        //   main: './src/main.tsx', // Caminho para o arquivo principal do seu aplicativo
        //   worker: './src/sw/worker.ts' // Caminho para o arquivo do worker
        // },
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
