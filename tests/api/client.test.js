const { API } = require('aws-amplify');
const { get, post } = require('../../src/api/client');

describe('api client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('get returns response data', async () => {
    API.get.mockResolvedValue({ ok: true });

    const result = await get('/profile');

    expect(API.get).toHaveBeenCalledWith('nutripilotapi', '/profile', undefined);
    expect(result).toEqual({ ok: true });
  });

  test('get throws normalized error message', async () => {
    API.get.mockRejectedValue(new Error('boom'));

    await expect(get('/profile')).rejects.toThrow('boom');
  });

  test('get throws default error when message is missing', async () => {
    API.get.mockRejectedValue({});

    await expect(get('/profile')).rejects.toThrow('Request failed');
  });

  test('post returns response data', async () => {
    API.post.mockResolvedValue({ saved: true });

    const result = await post('/profile', { body: { name: 'Alex' } });

    expect(API.post).toHaveBeenCalledWith('nutripilotapi', '/profile', { body: { name: 'Alex' } });
    expect(result).toEqual({ saved: true });
  });

  test('post throws normalized error message', async () => {
    API.post.mockRejectedValue(new Error('nope'));

    await expect(post('/profile', { body: { name: 'Alex' } })).rejects.toThrow('nope');
  });
});
