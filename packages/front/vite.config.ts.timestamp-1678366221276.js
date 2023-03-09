var __require = /* @__PURE__ */ (x =>
  typeof require !== "undefined"
    ? require
    : typeof Proxy !== "undefined"
    ? new Proxy(x, {
        get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
      })
    : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw new Error('Dynamic require of "' + x + '" is not supported');
});

// vite.config.ts
import { resolve } from "path";
import { defineConfig } from "vite";
import Pages from "vite-plugin-pages";
import react from "@vitejs/plugin-react";
import reactRefresh from "@vitejs/plugin-react-refresh";
var inject = __require("@rollup/plugin-inject");
var vite_config_default = defineConfig(async () => {
  const { default: stdLibBrowser } = await import("node-stdlib-browser");
  return {
    plugins: [
      react(),
      reactRefresh(),
      Pages({
        pagesDir: "src/pages"
      }),
      {
        ...inject({
          global: [
            __require.resolve("node-stdlib-browser/helpers/esbuild/shim"),
            "global"
          ],
          process: [
            __require.resolve("node-stdlib-browser/helpers/esbuild/shim"),
            "process"
          ],
          Buffer: [
            __require.resolve("node-stdlib-browser/helpers/esbuild/shim"),
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
      port: 3e3,
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
        "@": resolve("/home/alexandre/hideyour-cash/packages/front", "./src"),
        ...stdLibBrowser
      }
    }
  };
});
export { vite_config_default as default };
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImltcG9ydCB7IHJlc29sdmUgfSBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCBQYWdlcyBmcm9tIFwidml0ZS1wbHVnaW4tcGFnZXNcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3RcIjtcbmltcG9ydCByZWFjdFJlZnJlc2ggZnJvbSBcIkB2aXRlanMvcGx1Z2luLXJlYWN0LXJlZnJlc2hcIjtcblxuY29uc3QgaW5qZWN0ID0gcmVxdWlyZShcIkByb2xsdXAvcGx1Z2luLWluamVjdFwiKTtcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKGFzeW5jICgpID0+IHtcbiAgY29uc3QgeyBkZWZhdWx0OiBzdGRMaWJCcm93c2VyIH0gPSBhd2FpdCBpbXBvcnQoXCJub2RlLXN0ZGxpYi1icm93c2VyXCIpO1xuXG4gIHJldHVybiB7XG4gICAgcGx1Z2luczogW1xuICAgICAgcmVhY3QoKSxcbiAgICAgIHJlYWN0UmVmcmVzaCgpLFxuICAgICAgUGFnZXMoe1xuICAgICAgICBwYWdlc0RpcjogXCJzcmMvcGFnZXNcIlxuICAgICAgfSksXG4gICAgICB7XG4gICAgICAgIC4uLmluamVjdCh7XG4gICAgICAgICAgZ2xvYmFsOiBbXG4gICAgICAgICAgICByZXF1aXJlLnJlc29sdmUoXCJub2RlLXN0ZGxpYi1icm93c2VyL2hlbHBlcnMvZXNidWlsZC9zaGltXCIpLFxuICAgICAgICAgICAgXCJnbG9iYWxcIlxuICAgICAgICAgIF0sXG4gICAgICAgICAgcHJvY2VzczogW1xuICAgICAgICAgICAgcmVxdWlyZS5yZXNvbHZlKFwibm9kZS1zdGRsaWItYnJvd3Nlci9oZWxwZXJzL2VzYnVpbGQvc2hpbVwiKSxcbiAgICAgICAgICAgIFwicHJvY2Vzc1wiXG4gICAgICAgICAgXSxcbiAgICAgICAgICBCdWZmZXI6IFtcbiAgICAgICAgICAgIHJlcXVpcmUucmVzb2x2ZShcIm5vZGUtc3RkbGliLWJyb3dzZXIvaGVscGVycy9lc2J1aWxkL3NoaW1cIiksXG4gICAgICAgICAgICBcIkJ1ZmZlclwiXG4gICAgICAgICAgXVxuICAgICAgICB9KSxcbiAgICAgICAgZW5mb3JjZTogXCJwb3N0XCJcbiAgICAgIH1cbiAgICBdLFxuICAgIGVudlByZWZpeDogXCJWSVRFX1wiLFxuICAgIGJ1aWxkOiB7XG4gICAgICB0YXJnZXQ6IFtcImVzTmV4dFwiXSxcbiAgICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgICAgb3V0cHV0OiB7XG4gICAgICAgICAgZm9ybWF0OiBcImVzXCJcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgb3B0aW1pemVEZXBzOiB7XG4gICAgICBpbmNsdWRlOiBbXCJidWZmZXJcIiwgXCJwcm9jZXNzXCJdXG4gICAgfSxcbiAgICBzZXJ2ZXI6IHtcbiAgICAgIHBvcnQ6IDMwMDAsXG4gICAgICBwcm94eToge1xuICAgICAgICBcIi9hcGlcIjoge1xuICAgICAgICAgIHRhcmdldDogXCJodHRwOi8vbG9jYWxob3N0OjgwODFcIixcbiAgICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICAgICAgcmV3cml0ZTogcGF0aCA9PiBwYXRoLnJlcGxhY2UoL15cXC9hcGkvLCBcIlwiKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICByZXNvbHZlOiB7XG4gICAgICBhbGlhczoge1xuICAgICAgICBcIkBcIjogcmVzb2x2ZShcIi9ob21lL2FsZXhhbmRyZS9oaWRleW91ci1jYXNoL3BhY2thZ2VzL2Zyb250XCIsIFwiLi9zcmNcIiksXG4gICAgICAgIC4uLnN0ZExpYkJyb3dzZXJcbiAgICAgIH1cbiAgICB9XG4gIH07XG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7OztBQUFBLFNBQVMsZUFBZTtBQUN4QixTQUFTLG9CQUFvQjtBQUM3QixPQUFPLFdBQVc7QUFDbEIsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sa0JBQWtCO0FBRXpCLElBQU0sU0FBUyxVQUFRO0FBRXZCLElBQU8sc0JBQVEsYUFBYSxZQUFZO0FBQ3RDLFFBQU0sRUFBRSxTQUFTLGNBQWMsSUFBSSxNQUFNLE9BQU87QUFFaEQsU0FBTztBQUFBLElBQ0wsU0FBUztBQUFBLE1BQ1AsTUFBTTtBQUFBLE1BQ04sYUFBYTtBQUFBLE1BQ2IsTUFBTTtBQUFBLFFBQ0osVUFBVTtBQUFBLE1BQ1osQ0FBQztBQUFBLE1BQ0Q7QUFBQSxRQUNFLEdBQUcsT0FBTztBQUFBLFVBQ1IsUUFBUTtBQUFBLFlBQ04sVUFBUSxRQUFRLDBDQUEwQztBQUFBLFlBQzFEO0FBQUEsVUFDRjtBQUFBLFVBQ0EsU0FBUztBQUFBLFlBQ1AsVUFBUSxRQUFRLDBDQUEwQztBQUFBLFlBQzFEO0FBQUEsVUFDRjtBQUFBLFVBQ0EsUUFBUTtBQUFBLFlBQ04sVUFBUSxRQUFRLDBDQUEwQztBQUFBLFlBQzFEO0FBQUEsVUFDRjtBQUFBLFFBQ0YsQ0FBQztBQUFBLFFBQ0QsU0FBUztBQUFBLE1BQ1g7QUFBQSxJQUNGO0FBQUEsSUFDQSxXQUFXO0FBQUEsSUFDWCxPQUFPO0FBQUEsTUFDTCxRQUFRLENBQUMsUUFBUTtBQUFBLE1BQ2pCLGVBQWU7QUFBQSxRQUNiLFFBQVE7QUFBQSxVQUNOLFFBQVE7QUFBQSxRQUNWO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBLGNBQWM7QUFBQSxNQUNaLFNBQVMsQ0FBQyxVQUFVLFNBQVM7QUFBQSxJQUMvQjtBQUFBLElBQ0EsUUFBUTtBQUFBLE1BQ04sTUFBTTtBQUFBLE1BQ04sT0FBTztBQUFBLFFBQ0wsUUFBUTtBQUFBLFVBQ04sUUFBUTtBQUFBLFVBQ1IsY0FBYztBQUFBLFVBQ2QsU0FBUyxVQUFRLEtBQUssUUFBUSxVQUFVLEVBQUU7QUFBQSxRQUM1QztBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUCxPQUFPO0FBQUEsUUFDTCxLQUFLLFFBQVEsZ0RBQWdELE9BQU87QUFBQSxRQUNwRSxHQUFHO0FBQUEsTUFDTDtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
