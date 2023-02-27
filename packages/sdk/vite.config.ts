import { resolve } from "path";
import { defineConfig } from "vite";
import packageJson from "./package.json";
import stdLibBrowser from "node-stdlib-browser";

const getPackageName = () => {
  return packageJson.name;
};

const getPackageNameCamelCase = () => {
  try {
    return getPackageName().replace(/-./g, (char) => char[1].toUpperCase());
  } catch (err) {
    throw new Error("Name property in package.json is missing.");
  }
};

const fileName = {
  es: `${getPackageName()}.mjs`,
  cjs: `${getPackageName()}.cjs`,
};

const formats = Object.keys(fileName) as Array<keyof typeof fileName>;

module.exports = defineConfig(() => {
  return {
    base: "./",
    build: {
      outDir: 'lib',
      target: 'esnext',
      lib: {
        formats,
        entry: resolve(__dirname, "src/index.ts"),
        name: getPackageNameCamelCase(),
        fileName: (format) => fileName[format],
      },
    },
    optimizeDeps: {
      include: ["buffer", "process"],
    },
    resolve: {
      alias: {
        "@": resolve(__dirname, "./src"),
        ...stdLibBrowser,
        fs: require.resolve('browserify-fs'),
      }
    }
  }
});
