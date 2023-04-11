export default {
  preset: "ts-jest/presets/default-esm",
  globals: {
    "ts-jest": {
      tsconfig: "test/tsconfig.json",
      useESM: true,
    },
  },
  testEnvironment: "miniflare",
  forceExit: true,
  transform: {},
  verbose: true,
  detectOpenHandles: true,
  clearMocks: true,
  testEnvironmentOptions: {
    // Miniflare doesn't yet support the `main` field in `wrangler.toml` so we
    // need to explicitly tell it where our built worker is. We also need to
    // explicitly mark it as an ES module.
    scriptPath: "dist/index.mjs",
    modules: true,
  },
};
