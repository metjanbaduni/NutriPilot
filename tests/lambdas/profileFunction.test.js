jest.mock('../../amplify/backend/function/profileFunction/src/getProfile', () => ({
  handler: jest.fn(async () => ({ statusCode: 200, body: 'get' })),
}));
jest.mock('../../amplify/backend/function/profileFunction/src/updateProfile', () => ({
  handler: jest.fn(async () => ({ statusCode: 200, body: 'post' })),
}));

const PROFILE_FUNCTION_SRC = '../../amplify/backend/function/profileFunction/src';
const { handler } = require(`${PROFILE_FUNCTION_SRC}/index`);
const { handler: getProfile } = require(`${PROFILE_FUNCTION_SRC}/getProfile`);
const { handler: updateProfile } = require(`${PROFILE_FUNCTION_SRC}/updateProfile`);

const CORS_ORIGIN_HEADER = 'Access-Control-Allow-Origin';

describe('profileFunction dispatcher', () => {
  beforeEach(() => {
    getProfile.mockClear();
    updateProfile.mockClear();
  });

  test('routes GET requests to the getProfile handler', async () => {
    // Arrange
    const event = { httpMethod: 'GET' };

    // Act
    const response = await handler(event);

    // Assert
    expect(getProfile).toHaveBeenCalledWith(event);
    expect(updateProfile).not.toHaveBeenCalled();
    expect(response).toEqual({
      statusCode: 200,
      body: 'get',
      headers: { [CORS_ORIGIN_HEADER]: '*' },
    });
  });

  test('routes POST requests to the updateProfile handler', async () => {
    // Arrange
    const event = { httpMethod: 'POST' };

    // Act
    const response = await handler(event);

    // Assert
    expect(updateProfile).toHaveBeenCalledWith(event);
    expect(getProfile).not.toHaveBeenCalled();
    expect(response).toEqual({
      statusCode: 200,
      body: 'post',
      headers: { [CORS_ORIGIN_HEADER]: '*' },
    });
  });

  test('returns 405 for unsupported methods', async () => {
    // Arrange
    const event = { httpMethod: 'DELETE' };

    // Act
    const response = await handler(event);
    const parsedBody = JSON.parse(response.body);

    // Assert
    expect(response.statusCode).toBe(405);
    expect(parsedBody).toEqual({ success: false, message: 'Method not allowed' });
    expect(getProfile).not.toHaveBeenCalled();
    expect(updateProfile).not.toHaveBeenCalled();
  });

  // The /profile integration is aws_proxy, so API Gateway returns this Lambda's
  // response verbatim. A missing Allow-Origin header is invisible server-side —
  // the request succeeds with 200 and the browser withholds it from JS — so every
  // dispatch path is asserted explicitly.
  test.each([['GET'], ['POST'], ['DELETE']])(
    'returns the CORS allow-origin header for %s',
    async (httpMethod) => {
      // Arrange
      const event = { httpMethod };

      // Act
      const response = await handler(event);

      // Assert
      expect(response.headers[CORS_ORIGIN_HEADER]).toBe('*');
    }
  );

  test('preserves handler-supplied headers alongside the CORS header', async () => {
    // Arrange
    const event = { httpMethod: 'GET' };
    getProfile.mockResolvedValueOnce({
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    });

    // Act
    const response = await handler(event);

    // Assert
    expect(response.headers).toEqual({
      'Content-Type': 'application/json',
      [CORS_ORIGIN_HEADER]: '*',
    });
  });
});
