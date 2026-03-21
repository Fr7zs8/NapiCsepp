const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  coverageProvider: "v8",
  coveragePathIgnorePatterns: ["/node_modules/", "src/middleware/error.ts"],
  transform: {
    ...tsJestTransformCfg,
  },
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.spec.json",
    },
  },
};
