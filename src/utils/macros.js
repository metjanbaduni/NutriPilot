/**
 * Calculate calories from macro grams using 4/4/9 rule.
 * @param {{protein:number, carbs:number, fats:number}} macros - Macro grams for protein,
 * carbs, fats.
 * @returns {{calories:number}} Total calories.
 * @throws {Error} If any macro is missing, not a number, or negative.
 */
function calculateCalories(macros) {
  if (!macros || typeof macros !== 'object') {
    throw new Error('Macros input must be an object');
  }

  const { protein, carbs, fats } = macros;
  const fields = { protein, carbs, fats };
  Object.entries(fields).forEach(([key, value]) => {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      throw new Error(`${key} must be a number`);
    }
    if (value < 0) {
      throw new Error(`${key} cannot be negative`);
    }
  });

  const calories = protein * 4 + carbs * 4 + fats * 9;
  return { calories };
}

/**
 * Aggregate total macros across meals.
 * @param {{macros:{protein:number, carbs:number, fats:number, calories?:number}}[]} meals -
 * List of meals with macros.
 * @returns {{protein:number, carbs:number, fats:number, calories:number}} Summed macros.
 * @throws {Error} If meals is not an array or contains invalid macros.
 */
function summarizeMeals(meals) {
  if (!Array.isArray(meals)) {
    throw new Error('Meals must be an array');
  }

  return meals.reduce(
    (totals, meal) => {
      if (!meal || typeof meal !== 'object' || !meal.macros) {
        throw new Error('Meal is missing macros');
      }
      const { protein, carbs, fats } = meal.macros;
      const { calories } = calculateCalories({ protein, carbs, fats });

      return {
        protein: totals.protein + protein,
        carbs: totals.carbs + carbs,
        fats: totals.fats + fats,
        calories: totals.calories + calories,
      };
    },
    { protein: 0, carbs: 0, fats: 0, calories: 0 }
  );
}

module.exports = { calculateCalories, summarizeMeals };
