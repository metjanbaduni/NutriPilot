jest.mock('../../src/api/client', () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

const { get, post } = require('../../src/api/client');
const { fetchProfile, saveProfile } = require('../../src/api/profile');

describe('profile api wrapper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('fetchProfile returns profile data on success', async () => {
    // Arrange
    const expectedResponse = {
      success: true,
      profile: {
        bodyWeightKg: 78,
        heightCm: 183,
        ageYears: 34,
      },
      targets: {
        proteinGrams: 180,
        carbGrams: 360,
        fatGrams: 79,
        calories: 2875,
      },
    };
    get.mockResolvedValue(expectedResponse);

    // Act
    const result = await fetchProfile();

    // Assert
    expect(get).toHaveBeenCalledWith('/profile');
    expect(result).toEqual(expectedResponse);
  });

  test('fetchProfile propagates normalized error from client', async () => {
    // Arrange
    const normalizedError = Object.assign(new Error('Unable to load profile'), {
      name: 'ApiClientError',
      statusCode: 500,
      details: { message: 'Unable to load profile' },
    });
    get.mockRejectedValue(normalizedError);

    // Act
    const action = fetchProfile();

    // Assert
    await expect(action).rejects.toBe(normalizedError);
    expect(get).toHaveBeenCalledWith('/profile');
  });

  test('fetchProfile returns defaults when response is empty', async () => {
    // Arrange
    get.mockResolvedValue({});

    // Act
    const result = await fetchProfile();

    // Assert
    expect(get).toHaveBeenCalledWith('/profile');
    expect(result).toEqual({ success: true, profile: null, targets: null });
  });

  test('fetchProfile wraps non-ApiClientError with fallback message', async () => {
    // Arrange
    get.mockRejectedValue(new Error('network down'));

    // Act
    const action = fetchProfile();

    // Assert
    await expect(action).rejects.toThrow('Unable to load profile');
  });

  test('saveProfile returns saved profile payload on success', async () => {
    // Arrange
    const payload = {
      bodyWeightKg: 78,
      heightCm: 183,
      ageYears: 34,
      gender: 'male',
      activityLevel: 'moderate',
      goal: 'bulk',
    };
    const expectedResponse = {
      success: true,
      profile: payload,
      targets: {
        proteinGrams: 180,
        carbGrams: 360,
        fatGrams: 79,
        calories: 2875,
      },
    };
    post.mockResolvedValue(expectedResponse);

    // Act
    const result = await saveProfile(payload);

    // Assert
    expect(post).toHaveBeenCalledWith('/profile', { body: payload });
    expect(result).toEqual(expectedResponse);
  });

  test('saveProfile propagates normalized error from client', async () => {
    // Arrange
    const payload = {
      bodyWeightKg: 78,
      heightCm: 183,
      ageYears: 34,
      gender: 'male',
      activityLevel: 'moderate',
      goal: 'bulk',
    };
    const normalizedError = Object.assign(new Error('Unable to save profile'), {
      name: 'ApiClientError',
      statusCode: 400,
      details: { message: 'Unable to save profile' },
    });
    post.mockRejectedValue(normalizedError);

    // Act
    const action = saveProfile(payload);

    // Assert
    await expect(action).rejects.toBe(normalizedError);
    expect(post).toHaveBeenCalledWith('/profile', { body: payload });
  });

  test('saveProfile wraps non-ApiClientError with fallback message', async () => {
    // Arrange
    const payload = {
      bodyWeightKg: 78,
      heightCm: 183,
      ageYears: 34,
      gender: 'male',
      activityLevel: 'moderate',
      goal: 'bulk',
    };
    post.mockRejectedValue(new Error('network down'));

    // Act
    const action = saveProfile(payload);

    // Assert
    await expect(action).rejects.toThrow('Unable to save profile');
  });
});
