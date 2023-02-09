import { defineConfig } from "vite";
import vpc from "vite-plugin-cloudflare";

export default defineConfig({
  plugins: [
    vpc({
      scriptPath: "./worker/index.ts",
    }),
  ],
  esbuild: {
    define: {
      DEBUG: `${process.env.NODE_ENV === "development"}`,
    },
  },
});
