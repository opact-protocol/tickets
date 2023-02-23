
import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      fileName: 'hideyour-cash-sdk',
      formats: ['cjs', 'es'],
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    }
  }
});
