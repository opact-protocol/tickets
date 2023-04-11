export default {
  preset: "ts-jest/presets/default-esm",
  globals: {
    "ts-jest": {
      tsconfig: "test/tsconfig.json",
      useESM: true,
    },
  },
  forceExit: true,
  transform: {},
  verbose: true,
  detectOpenHandles: true,
  clearMocks: true,
};
