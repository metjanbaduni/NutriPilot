const { calculateMacros } = require('../../src/utils/calculateMacros');

describe('calculateMacros', () => {
  test('calculates targets for a valid male bulk profile', () => {
    // Arrange
    const profileInput = {
      bodyWeightKg: 75,
      heightCm: 180,
      ageYears: 30,
      gender: 'male',
      activityLevel: 'moderate',
      goal: 'bulk',
    };

    // Act
    const result = calculateMacros(profileInput);

    // Assert
    expect(result).toEqual({
      proteinGrams: 180,
      carbGrams: 360,
      fatGrams: 103,
      calories: 3087,
      tdee: 2682,
    });
  });

  test('calculates targets at lower validation boundaries', () => {
    // Arrange
    const profileInput = {
      bodyWeightKg: 40,
      heightCm: 140,
      ageYears: 18,
      gender: 'female',
      activityLevel: 'sedentary',
      goal: 'maintain',
    };

    // Act
    const result = calculateMacros(profileInput);

    // Assert
    expect(result).toEqual({
      proteinGrams: 80,
      carbGrams: 80,
      fatGrams: 65,
      calories: 1225,
      tdee: 1229,
    });
  });

  test('throws when profile input is missing', () => {
    // Arrange
    const action = () => calculateMacros();

    // Act + Assert
    expect(action).toThrow('Profile input must be an object');
  });

  test('throws when bodyWeightKg is below minimum', () => {
    // Arrange
    const profileInput = {
      bodyWeightKg: 39,
      heightCm: 170,
      ageYears: 30,
      gender: 'male',
      activityLevel: 'moderate',
      goal: 'maintain',
    };

    // Act
    const action = () => calculateMacros(profileInput);

    // Assert
    expect(action).toThrow('bodyWeightKg must be between 40 and 200');
  });

  test('throws when ageYears is not an integer', () => {
    // Arrange
    const profileInput = {
      bodyWeightKg: 78,
      heightCm: 183,
      ageYears: 34.5,
      gender: 'male',
      activityLevel: 'moderate',
      goal: 'bulk',
    };

    // Act
    const action = () => calculateMacros(profileInput);

    // Assert
    expect(action).toThrow('ageYears must be an integer');
  });

  test('throws when gender is invalid', () => {
    // Arrange
    const profileInput = {
      bodyWeightKg: 78,
      heightCm: 183,
      ageYears: 34,
      gender: 'unknown',
      activityLevel: 'moderate',
      goal: 'bulk',
    };

    // Act
    const action = () => calculateMacros(profileInput);

    // Assert
    expect(action).toThrow('gender must be one of: male, female, nonbinary, prefer_not_to_say');
  });

  test('throws when activityLevel is invalid', () => {
    // Arrange
    const profileInput = {
      bodyWeightKg: 78,
      heightCm: 183,
      ageYears: 34,
      gender: 'male',
      activityLevel: 'extreme',
      goal: 'bulk',
    };

    // Act
    const action = () => calculateMacros(profileInput);

    // Assert
    expect(action).toThrow(
      'activityLevel must be one of: sedentary, light, moderate, active, athlete'
    );
  });

  test('throws when goal is invalid', () => {
    // Arrange
    const profileInput = {
      bodyWeightKg: 78,
      heightCm: 183,
      ageYears: 34,
      gender: 'male',
      activityLevel: 'moderate',
      goal: 'recomp',
    };

    // Act
    const action = () => calculateMacros(profileInput);

    // Assert
    expect(action).toThrow('goal must be one of: bulk, maintain, cut');
  });

  test('throws when calculated protein is outside allowed range', () => {
    // Arrange
    const profileInput = {
      bodyWeightKg: 200,
      heightCm: 220,
      ageYears: 80,
      gender: 'male',
      activityLevel: 'athlete',
      goal: 'bulk',
    };

    // Act
    const action = () => calculateMacros(profileInput);

    // Assert
    expect(action).toThrow('proteinGrams must be between 80 and 400');
  });
});
