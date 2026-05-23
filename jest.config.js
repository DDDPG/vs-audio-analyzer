module.exports = {
  automock: false,
  rootDir: "src",
  testEnvironment: "jsdom",
  setupFiles: ["jest-canvas-mock"],
  moduleNameMapper: {
    "\\.css$": "<rootDir>/__mocks__/styleMock.js",
    "^loudness-worklet$": "<rootDir>/__mocks__/loudness-worklet.ts",
    "^ebur128-wasm$": "<rootDir>/__mocks__/ebur128-wasm.ts",
  },
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
};
