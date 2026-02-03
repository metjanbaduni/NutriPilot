/**
 * Jest setup for NutriPilot tests.
 *
 * Registers RTL matchers and provides Amplify mocks to keep tests offline.
 * This file should only contain shared, test-wide setup required by tasks.md.
 */
import '@testing-library/jest-dom';

// Mock Amplify Auth/Hub/API to avoid live AWS calls in tests.
jest.mock('aws-amplify', () => {
  const actual = jest.requireActual('aws-amplify');
  const createUnauthenticatedError = () => {
    const error = new Error('The user is not authenticated');
    error.name = 'NotAuthenticatedException';
    return error;
  };
  return {
    ...actual,
    Amplify: {
      configure: jest.fn(),
    },
    Auth: {
      signIn: jest.fn(),
      signOut: jest.fn(),
      // Default to unauthenticated to keep session tests deterministic.
      currentAuthenticatedUser: jest.fn(() => Promise.reject(createUnauthenticatedError())),
      currentSession: jest.fn(),
      signUp: jest.fn(),
    },
    Hub: {
      listen: jest.fn(),
      remove: jest.fn(),
    },
    API: {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      del: jest.fn(),
    },
  };
});
