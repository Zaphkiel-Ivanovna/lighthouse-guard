/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  setupFiles: ['./jest.setup.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/ios/', '/android/', '/.maestro/'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/app/**', '!**/index.ts'],
};
