const { calculateCalories, summarizeMeals } = require('../src/utils/macros');
const { breakfast, lunch, dinner } = require('./fixtures/meals');

describe('macros utils', () => {
  describe('calculateCalories', () => {
    test('calculates calories using 4/4/9 rule', () => {
      const result = calculateCalories({ protein: 30, carbs: 40, fats: 20 });
      expect(result.calories).toBe(460);
    });

    test('throws when macros are negative', () => {
      expect(() => calculateCalories({ protein: -1, carbs: 10, fats: 5 })).toThrow(
        'protein cannot be negative'
      );
    });

    test('throws when macros are missing', () => {
      expect(() => calculateCalories()).toThrow('Macros input must be an object');
    });
  });

  describe('summarizeMeals', () => {
    test('aggregates macros across meals and recalculates calories', () => {
      const totals = summarizeMeals([breakfast, lunch, dinner]);
      expect(totals).toEqual({
        protein: 133,
        carbs: 150,
        fats: 50,
        calories: 1582,
      });
    });

    test('throws when meals array is invalid', () => {
      expect(() => summarizeMeals(null)).toThrow('Meals must be an array');
    });

    test('throws when a meal is missing macros', () => {
      expect(() => summarizeMeals([{}])).toThrow('Meal is missing macros');
    });
  });
});
