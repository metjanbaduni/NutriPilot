/**
 * Jest setup for NutriPilot tests.
 *
 * Registers RTL matchers and provides Amplify mocks to keep tests offline.
 * This file should only contain shared, test-wide setup required by tasks.md.
 */
import '@testing-library/jest-dom';

const createUnauthenticatedError = () => {
  const error = new Error('The user is not authenticated');
  error.name = 'NotAuthenticatedException';
  return error;
};

// Mock Amplify API to avoid live AWS calls in tests.
jest.mock('aws-amplify', () => ({
  Amplify: {
    configure: jest.fn(),
  },
  API: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    del: jest.fn(),
  },
}));

// Mock Amplify Auth module for authentication flows.
jest.mock('aws-amplify/auth', () => ({
  signIn: jest.fn(),
  signOut: jest.fn(),
  signUp: jest.fn(),
  confirmSignUp: jest.fn(),
  getCurrentUser: jest.fn(() => Promise.reject(createUnauthenticatedError())),
  fetchAuthSession: jest.fn(),
}));

// Mock Amplify Hub utilities for auth events.
jest.mock('aws-amplify/utils', () => ({
  Hub: {
    listen: jest.fn(() => jest.fn()),
  },
}));
