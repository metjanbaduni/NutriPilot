require('@testing-library/jest-dom');

// Provide a default fetch mock for HTTP-based integrations
if (!global.fetch) {
  global.fetch = jest.fn();
}

// Mock Amplify Auth/Hub/API to avoid live AWS calls in tests
jest.mock('aws-amplify', () => {
  const actual = jest.requireActual('aws-amplify');
  return {
    ...actual,
    Auth: {
      signIn: jest.fn(),
      signOut: jest.fn(),
      currentAuthenticatedUser: jest.fn(),
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

// Mock OpenAI client to keep tests offline
jest.mock('openai', () => {
  const chatCreate = jest.fn();
  return {
    __esModule: true,
    OpenAI: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: chatCreate,
        },
      },
    })),
  };
});
