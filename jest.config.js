module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setupTests.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest'
  },
  coveragePathIgnorePatterns: ['<rootDir>/src/api/'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/amplify/', '<rootDir>/amplify/#current-cloud-backend/'],
  passWithNoTests: true,
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  collectCoverageFrom: [
    'src/**/*.js',
    'src/**/*.jsx',
    '!src/**/*.test.js',
    '!src/aws-exports.js',
    '!src/index.js'
  ]
};
