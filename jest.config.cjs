/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  transform: {
    '^.+\\.(ts)$': ['babel-jest', { rootMode: 'upward'}],
  },
  moduleDirectories: [
    "node_modules",
  ],
  "testMatch": ["<rootDir>/tests/dist/**/*.test.js"],
  coverageDirectory: "<rootDir>/coverage/",
  collectCoverageFrom: [
    "dist/**/*.js",
    "!dist/**/*.d.ts",
  ],
  cache: true,
  testEnvironment: "node",
  coverageReporters: ["json", "html"],
  reporters: [
    ["jest-junit", {
      outputDirectory: "<rootDir>/reports",
    }],
    "default",
    ["jest-html-reporters", {
      pageTitle: "Test Report",
      publicPath: "<rootDir>/reports/html",
      filename: "index.html",
      inlineSource: true,
    }],
  ],
  collectCoverage: true,
  coverageThreshold: {
    global: {},
  },
};
