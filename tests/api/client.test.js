const { API } = require('aws-amplify');
const { fetchAuthSession } = require('aws-amplify/auth');
const { get, post } = require('../../src/api/client');

describe('api client', () => {
  const API_NAME = 'nutripilotapi';
  const AUTH_HEADER_NAME = 'Authorization';
  const DEFAULT_ERROR_MESSAGE = 'Request failed';
  const SESSION_TOKEN = 'fake-jwt-token';
  const sessionStub = {
    tokens: {
      idToken: {
        toString: () => SESSION_TOKEN,
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    fetchAuthSession.mockResolvedValue(sessionStub);
  });

  test('get throws normalized error when path is empty', async () => {
    // Arrange
    const action = get('');

    // Act + Assert
    await expect(action).rejects.toMatchObject({
      message: 'API path must be a non-empty string',
      statusCode: 0,
      name: 'ApiClientError',
    });
  });

  test('get throws normalized error when headers are invalid', async () => {
    // Arrange
    const action = get('/profile', { headers: [] });

    // Act + Assert
    await expect(action).rejects.toMatchObject({
      message: 'Headers must be an object',
      statusCode: 0,
      name: 'ApiClientError',
    });
  });

  test('get throws normalized error when token is missing', async () => {
    // Arrange
    fetchAuthSession.mockResolvedValue({
      tokens: {
        idToken: {
          toString: () => null,
        },
      },
    });

    // Act
    const action = get('/profile');

    // Assert
    await expect(action).rejects.toMatchObject({
      message: 'Authentication token missing',
      statusCode: 0,
      name: 'ApiClientError',
    });
  });

  test('get returns response data with signed headers', async () => {
    // Arrange
    const traceId = 'trace-123';
    API.get.mockResolvedValue({ ok: true });

    // Act
    const result = await get('/profile', {
      headers: { 'X-Trace-Id': traceId },
      queryStringParameters: { include: 'targets' },
    });

    // Assert
    expect(fetchAuthSession).toHaveBeenCalled();
    expect(API.get).toHaveBeenCalledWith(API_NAME, '/profile', {
      headers: { [AUTH_HEADER_NAME]: SESSION_TOKEN, 'X-Trace-Id': traceId },
      queryStringParameters: { include: 'targets' },
    });
    expect(result).toEqual({ ok: true });
  });

  test('get throws normalized error with status and message', async () => {
    // Arrange
    API.get.mockRejectedValue({
      response: { status: 400, data: { message: 'boom' } },
    });

    // Act
    const action = get('/profile');

    // Assert
    await expect(action).rejects.toMatchObject({
      message: 'boom',
      statusCode: 400,
      name: 'ApiClientError',
    });
  });

  test('get throws default error when message is missing', async () => {
    // Arrange
    API.get.mockRejectedValue({});

    // Act
    const action = get('/profile');

    // Assert
    await expect(action).rejects.toMatchObject({
      message: DEFAULT_ERROR_MESSAGE,
      statusCode: 0,
      name: 'ApiClientError',
    });
  });

  test('post returns response data', async () => {
    // Arrange
    API.post.mockResolvedValue({ saved: true });

    // Act
    const result = await post('/profile', { body: { name: 'Alex' } });

    // Assert
    expect(API.post).toHaveBeenCalledWith(API_NAME, '/profile', {
      body: { name: 'Alex' },
      headers: { [AUTH_HEADER_NAME]: SESSION_TOKEN },
    });
    expect(result).toEqual({ saved: true });
  });

  test('post throws normalized error when auth fails', async () => {
    // Arrange
    fetchAuthSession.mockRejectedValue(new Error('nope'));

    // Act
    const action = post('/profile', { body: { name: 'Alex' } });

    // Assert
    await expect(action).rejects.toMatchObject({
      message: 'nope',
      statusCode: 0,
      name: 'ApiClientError',
    });
  });
});
