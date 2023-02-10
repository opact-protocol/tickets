import path from "path";
import { build } from "esbuild";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  await build({
    bundle: true,
    format: "esm",
    external: ["__STATIC_CONTENT_MANIFEST"],
    conditions: ["worker"],
    entryPoints: [path.join(__dirname, "src", "index.ts")],
    outdir: path.join(__dirname, "dist"),
    outExtension: { ".js": ".mjs" },
  });
} catch (e) {
  console.warn(e);

  process.exitCode = 1;
}
