var __require = /* @__PURE__ */ ((x) =>
  typeof require !== "undefined"
    ? require
    : typeof Proxy !== "undefined"
    ? new Proxy(x, {
        get: (a, b) => (typeof require !== "undefined" ? require : a)[b],
      })
    : x)(function (x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw new Error('Dynamic require of "' + x + '" is not supported');
});

// vite.config.ts
import { resolve } from "path";
import { defineConfig } from "vite";
import Pages from "vite-plugin-pages";
import react from "@vitejs/plugin-react";
import reactRefresh from "@vitejs/plugin-react-refresh";
import globals from "rollup-plugin-node-globals";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    reactRefresh(),
    Pages({
      pagesDir: "src/pages",
    }),
  ],
  define: {
    global: "window",
    "process.env": {},
  },
  build: {
    target: ["esnext"],
    lib: globals(),
  },
  resolve: {
    alias: {
      util: "util",
      process: "process/browser",
      "@": resolve(
        "/Users/mateussantana/Projects/hideyourcash/packages/front",
        "./src"
      ),
      fs: __require.resolve("rollup-plugin-node-builtins"),
      constants: "rollup-plugin-node-polyfills/polyfills/constants",
    },
  },
});
export { vite_config_default as default };
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImltcG9ydCB7IHJlc29sdmUgfSBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCBQYWdlcyBmcm9tIFwidml0ZS1wbHVnaW4tcGFnZXNcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3RcIjtcbmltcG9ydCByZWFjdFJlZnJlc2ggZnJvbSBcIkB2aXRlanMvcGx1Z2luLXJlYWN0LXJlZnJlc2hcIjtcbmltcG9ydCBOb2RlR2xvYmFsc1BvbHlmaWxsUGx1Z2luIGZyb20gXCJAZXNidWlsZC1wbHVnaW5zL25vZGUtZ2xvYmFscy1wb2x5ZmlsbFwiO1xuXG5pbXBvcnQgcG9seWZpbGwgZnJvbSBcInJvbGx1cC1wbHVnaW4tbm9kZS1wb2x5ZmlsbHNcIjtcbmltcG9ydCBidWlsdGlucyBmcm9tICdyb2xsdXAtcGx1Z2luLW5vZGUtYnVpbHRpbnMnO1xuaW1wb3J0IGdsb2JhbHMgZnJvbSAncm9sbHVwLXBsdWdpbi1ub2RlLWdsb2JhbHMnO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbXG4gICAgcmVhY3QoKSxcbiAgICByZWFjdFJlZnJlc2goKSxcbiAgICBQYWdlcyh7XG4gICAgICBwYWdlc0RpcjogXCJzcmMvcGFnZXNcIixcbiAgICB9KSxcbiAgXSxcbiAgZGVmaW5lOiB7XG4gICAgZ2xvYmFsOiBcIndpbmRvd1wiLFxuICAgIFwicHJvY2Vzcy5lbnZcIjoge30sXG4gIH0sXG4gIGJ1aWxkOiB7XG4gICAgdGFyZ2V0OiBbXG4gICAgICAnZXNuZXh0J1xuICAgIF0sXG4gICAgbGliOiBnbG9iYWxzKCksXG4gIH0sXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgdXRpbDogXCJ1dGlsXCIsXG4gICAgICBwcm9jZXNzOiBcInByb2Nlc3MvYnJvd3NlclwiLFxuICAgICAgXCJAXCI6IHJlc29sdmUoXCIvVXNlcnMvbWF0ZXVzc2FudGFuYS9Qcm9qZWN0cy9oaWRleW91cmNhc2gvcGFja2FnZXMvZnJvbnRcIiwgXCIuL3NyY1wiKSxcbiAgICAgIGZzOiByZXF1aXJlLnJlc29sdmUoJ3JvbGx1cC1wbHVnaW4tbm9kZS1idWlsdGlucycpLFxuICAgICAgY29uc3RhbnRzOiAncm9sbHVwLXBsdWdpbi1ub2RlLXBvbHlmaWxscy9wb2x5ZmlsbHMvY29uc3RhbnRzJyxcbiAgICB9LFxuICB9LFxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBS0E7QUFFQSxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixhQUFhO0FBQUEsSUFDYixNQUFNO0FBQUEsTUFDSixVQUFVO0FBQUEsSUFDWixDQUFDO0FBQUEsRUFDSDtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04sUUFBUTtBQUFBLElBQ1IsZUFBZSxDQUFDO0FBQUEsRUFDbEI7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLFFBQVE7QUFBQSxNQUNOO0FBQUEsSUFDRjtBQUFBLElBQ0EsS0FBSyxRQUFRO0FBQUEsRUFDZjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsTUFBTTtBQUFBLE1BQ04sU0FBUztBQUFBLE1BQ1QsS0FBSyxRQUFRLDZEQUE2RCxPQUFPO0FBQUEsTUFDakYsSUFBSSxVQUFRLFFBQVEsNkJBQTZCO0FBQUEsTUFDakQsV0FBVztBQUFBLElBQ2I7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
