const breakfast = {
  PK: 'USER#123',
  SK: 'MEAL#1697452800000',
  mealId: 'meal-1',
  description: '2 eggs scrambled, feta, bread',
  date: '2025-10-16',
  mealType: 'Breakfast',
  macros: {
    protein: 30,
    carbs: 40,
    fats: 20,
    calories: 450,
  },
  aiAnalyzed: true,
  timestamp: 1697452800000,
  createdAt: 1697452800000,
};

const lunch = {
  PK: 'USER#123',
  SK: 'MEAL#1697460000000',
  mealId: 'meal-2',
  description: 'grilled chicken 200g, rice 150g, broccoli',
  date: '2025-10-16',
  mealType: 'Lunch',
  macros: {
    protein: 55,
    carbs: 65,
    fats: 12,
    calories: 548,
  },
  aiAnalyzed: true,
  timestamp: 1697460000000,
  createdAt: 1697460000000,
};

const dinner = {
  PK: 'USER#123',
  SK: 'MEAL#1697470800000',
  mealId: 'meal-3',
  description: 'salmon 180g, quinoa 120g, asparagus',
  date: '2025-10-16',
  mealType: 'Dinner',
  macros: {
    protein: 48,
    carbs: 45,
    fats: 18,
    calories: 474,
  },
  aiAnalyzed: true,
  timestamp: 1697470800000,
  createdAt: 1697470800000,
};

module.exports = { breakfast, lunch, dinner };
