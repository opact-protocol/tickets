import path from "path";
import { build } from "esbuild";
import { fileURLToPath } from "url";
import plugin from 'node-stdlib-browser/helpers/esbuild/plugin';
import stdLibBrowser from "node-stdlib-browser";

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
    plugins: [
        plugin({
            fs: stdLibBrowser.fs,
            buffer: stdLibBrowser.buffer,
            crypto: stdLibBrowser.crypto,
            constants: stdLibBrowser.constants,
            stream: stdLibBrowser.stream,
            path: stdLibBrowser.path,
            readline: stdLibBrowser.readline,
            os: stdLibBrowser.os,
        }),
    ]
  });
} catch (e) {
  console.warn(e);

  process.exitCode = 1;
}
