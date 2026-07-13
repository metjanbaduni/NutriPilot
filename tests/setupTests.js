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

// Mock Amplify core config to avoid real initialization in tests.
jest.mock('aws-amplify', () => ({
  Amplify: {
    configure: jest.fn(),
  },
}));

// Mock Amplify REST API module used by the shared client.
jest.mock('aws-amplify/api', () => ({
  get: jest.fn(),
  post: jest.fn(),
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
