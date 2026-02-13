/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest/presets/default-esm', // Use ts-jest preset for TypeScript and ESM support
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
  transform: {}, // Disable default transformers (use ts-jest)
  moduleNameMapper: {
    '^(\.{1,2}/.*)\.js$': '$1',
  },
};