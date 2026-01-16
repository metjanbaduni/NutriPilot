const dashboard = {
  success: true,
  date: '2025-10-16',
  profile: {
    email: 'user@example.com',
    bodyWeight: 78,
    height: 183,
    age: 34,
    gender: 'Male',
    activityLevel: 'moderate',
    goal: 'bulk',
  },
  targets: {
    protein: 180,
    carbs: 360,
    fats: 79,
    calories: 2875,
  },
  totals: {
    protein: 133,
    carbs: 150,
    fats: 50,
    calories: 1472,
  },
  progress: {
    protein: 73.9,
    carbs: 41.7,
    fats: 63.3,
    calories: 51.2,
  },
  meals: [],
  mealCount: 3,
  targetsMet: {
    protein: false,
    calories: false,
  },
};

module.exports = { dashboard };
