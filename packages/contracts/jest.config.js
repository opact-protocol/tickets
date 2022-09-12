/* eslint-disable */
const { defaults: tsjPreset } = require("ts-jest/presets");

module.exports = {
  ...tsjPreset,
  verbose: true,
  automock: false,
  collectCoverage: true,
  testTimeout: 50000,
  transform: {
    ...tsjPreset.transform,
  },
  testPathIgnorePatterns: ["<rootDir>/contract/", "<rootDir>/node_modules/"],
  modulePathIgnorePatterns: ["<rootDir>/dist/"],
  testMatch: ["**/*.spec.(ts|tsx)"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
  collectCoverageFrom: ["src/**/*.{ts|tsx}", "src/**/{!(index),}.ts"],
  moduleDirectories: ["node_modules", "<rootDir>"],
};
