module.exports = {
  preset: 'jest-expo',
  setupFiles: ['./jest.setup.ts'],
  moduleNameMapper: {
    '^@/assets/(.*)$': '<rootDir>/assets/$1',
  },
  testPathIgnorePatterns: ['/node_modules/', '/ios/', '/android/', '/.maestro/'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/app/**', '!**/index.ts'],
};
