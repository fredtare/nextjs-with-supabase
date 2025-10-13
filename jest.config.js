// jest.config.js
const nextJest = require('./jest');

const createJestConfig = nextJest({
  dir: './', // Path to your Next.js app
});

const customJestConfig = {
  testEnvironment: 'node', // Use node for API route tests
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1', // Map `@/` to root (e.g., `@/lib/supabase`)
  },
  transform: {
    '^.+\\.tsx?$': 'ts-jest', // Transform TypeScript files
  },
};

module.exports = createJestConfig(customJestConfig);