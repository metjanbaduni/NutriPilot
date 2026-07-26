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
    expect(response).toEqual({ statusCode: 200, body: 'get' });
  });

  test('routes POST requests to the updateProfile handler', async () => {
    // Arrange
    const event = { httpMethod: 'POST' };

    // Act
    const response = await handler(event);

    // Assert
    expect(updateProfile).toHaveBeenCalledWith(event);
    expect(getProfile).not.toHaveBeenCalled();
    expect(response).toEqual({ statusCode: 200, body: 'post' });
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
});
