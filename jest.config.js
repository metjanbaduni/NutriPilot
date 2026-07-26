module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setupTests.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^nutripilot-lambda-lib/(.*)$':
      '<rootDir>/amplify/backend/function/nutripilotnutripilotLambdaLib/lib/nutripilot-lambda-lib-src/$1',
    // Pin the AWS SDK to the root install. `amplify push` runs `npm install` inside each
    // function's src/, leaving a gitignored node_modules/ there; without this, a handler's
    // require() resolves to that copy, which ships untransformed ESM (Jest cannot parse it)
    // and would hand tests a different module instance than the one aws-sdk-client-mock
    // mocks. Root carries every @aws-sdk package the handlers need.
    '^@aws-sdk/(.*)$': '<rootDir>/node_modules/@aws-sdk/$1'
  },
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest'
  },
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/amplify/', '<rootDir>/amplify/#current-cloud-backend/'],
  modulePathIgnorePatterns: ['<rootDir>/amplify/#current-cloud-backend/'],
  passWithNoTests: false,
  coverageThreshold: {
    // Thresholds align with constitution.md 80% coverage minimums.
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
    '!src/index.js',
    '!src/index.jsx'
  ]
};
