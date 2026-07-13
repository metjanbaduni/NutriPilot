const PROTEIN_MULTIPLIERS = {
  bulk: 2.2,
  maintain: 2.0,
  cut: 2.4,
};

const PROTEIN_ACTIVITY_BONUS = {
  sedentary: 0,
  light: 0.1,
  moderate: 0.2,
  active: 0.3,
  athlete: 0.4,
};

const CARB_MULTIPLIERS = {
  sedentary: 2.0,
  light: 3.0,
  moderate: 4.0,
  active: 6.0,
  athlete: 8.0,
};

const CARB_GOAL_MODIFIERS = {
  bulk: 1.2,
  maintain: 1.0,
  cut: 0.8,
};

const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  athlete: 1.9,
};

const GOAL_CALORIE_MODIFIERS = {
  bulk: 1.15,
  maintain: 1,
  cut: 0.85,
};

const GENDER_BMR_OFFSETS = {
  male: 5,
  female: -161,
  nonbinary: -78,
  prefer_not_to_say: -78,
};

const VALIDATION_RANGES = {
  bodyWeightKg: { min: 40, max: 200 },
  heightCm: { min: 140, max: 220 },
  ageYears: { min: 18, max: 80 },
  dailyProtein: { min: 80, max: 400 },
  dailyCarbs: { min: 80, max: 800 },
  dailyFats: { min: 30, max: 200 },
  dailyCalories: { min: 1200, max: 6000 },
};

const MIN_FAT_MULTIPLIER = 0.8;

function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

function validateRange(value, fieldName, min, max) {
  if (!isFiniteNumber(value)) {
    throw new Error(`${fieldName} must be a finite number`);
  }

  if (value < min || value > max) {
    throw new Error(`${fieldName} must be between ${min} and ${max}`);
  }
}

function validateEnum(value, fieldName, values) {
  if (typeof value !== 'string' || !values.includes(value)) {
    throw new Error(`${fieldName} must be one of: ${values.join(', ')}`);
  }
}

function validateProfileInput(profileInput) {
  if (!profileInput || typeof profileInput !== 'object' || Array.isArray(profileInput)) {
    throw new Error('Profile input must be an object');
  }

  const { bodyWeightKg, heightCm, ageYears, gender, activityLevel, goal } = profileInput;
  const ranges = VALIDATION_RANGES;

  validateRange(bodyWeightKg, 'bodyWeightKg', ranges.bodyWeightKg.min, ranges.bodyWeightKg.max);
  validateRange(heightCm, 'heightCm', ranges.heightCm.min, ranges.heightCm.max);
  validateRange(ageYears, 'ageYears', ranges.ageYears.min, ranges.ageYears.max);
  if (!Number.isInteger(ageYears)) {
    throw new Error('ageYears must be an integer');
  }

  validateEnum(gender, 'gender', Object.keys(GENDER_BMR_OFFSETS));
  validateEnum(activityLevel, 'activityLevel', Object.keys(ACTIVITY_MULTIPLIERS));
  validateEnum(goal, 'goal', Object.keys(PROTEIN_MULTIPLIERS));
}

function calculateBmr({ bodyWeightKg, heightCm, ageYears, gender }) {
  return 10 * bodyWeightKg + 6.25 * heightCm - 5 * ageYears + GENDER_BMR_OFFSETS[gender];
}

function validateCalculatedRanges({ proteinGrams, carbGrams, fatGrams, calories }) {
  const ranges = VALIDATION_RANGES;
  validateRange(proteinGrams, 'proteinGrams', ranges.dailyProtein.min, ranges.dailyProtein.max);
  validateRange(carbGrams, 'carbGrams', ranges.dailyCarbs.min, ranges.dailyCarbs.max);
  validateRange(fatGrams, 'fatGrams', ranges.dailyFats.min, ranges.dailyFats.max);
  validateRange(calories, 'calories', ranges.dailyCalories.min, ranges.dailyCalories.max);
}

/**
 * Calculates TDEE and daily macro targets from profile inputs.
 * @param {object} profileInput - Profile fields used for macro calculation.
 * @param {number} profileInput.bodyWeightKg - Body weight in kilograms.
 * @param {number} profileInput.heightCm - Height in centimeters.
 * @param {number} profileInput.ageYears - Age in whole years.
 * @param {string} profileInput.gender - One of male, female, nonbinary, prefer_not_to_say.
 * @param {string} profileInput.activityLevel - One of sedentary, light, moderate, active, athlete.
 * @param {string} profileInput.goal - One of bulk, maintain, cut.
 * @returns {{proteinGrams:number, carbGrams:number, fatGrams:number, calories:number, tdee:number}}
 * Macro targets and TDEE rounded to whole numbers.
 * @throws {Error} If input is invalid or calculated targets are outside allowed ranges.
 */
export function calculateMacros(profileInput) {
  validateProfileInput(profileInput);

  const { bodyWeightKg, activityLevel, goal } = profileInput;
  const bmr = calculateBmr(profileInput);
  const tdee = Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel]);
  const goalCalories = Math.round(tdee * GOAL_CALORIE_MODIFIERS[goal]);

  const proteinGrams = Math.round(
    bodyWeightKg * (PROTEIN_MULTIPLIERS[goal] + PROTEIN_ACTIVITY_BONUS[activityLevel])
  );
  const carbGrams = Math.round(
    bodyWeightKg * CARB_MULTIPLIERS[activityLevel] * CARB_GOAL_MODIFIERS[goal]
  );

  const minFatGrams = bodyWeightKg * MIN_FAT_MULTIPLIER;
  const computedFatGrams = (goalCalories - proteinGrams * 4 - carbGrams * 4) / 9;
  const fatGrams = Math.round(Math.max(minFatGrams, computedFatGrams));
  const calories = proteinGrams * 4 + carbGrams * 4 + fatGrams * 9;

  const result = { proteinGrams, carbGrams, fatGrams, calories, tdee };
  validateCalculatedRanges(result);

  return result;
}
