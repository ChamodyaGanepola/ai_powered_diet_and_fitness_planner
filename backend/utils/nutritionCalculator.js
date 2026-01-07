export function calculateBMR({ gender, weight, height, age }) {
  if (gender === "male") {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  }
  return 10 * weight + 6.25 * height - 5 * age - 161;
}

export function getActivityMultiplier(level) {
  const map = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9
  };
  return map[level] || 1.2;
}

export function calculateTDEE(user) {
  const bmr = calculateBMR(user);
  return bmr * getActivityMultiplier(user.activityLevel);
}

export function adjustCalories(tdee, goal) {
  if (goal === "fat_loss") return Math.round(tdee - 500);
  if (goal === "muscle_gain") return Math.round(tdee + 300);
  return Math.round(tdee);
}

export function calculateProtein(weight, goal) {
  if (goal === "muscle_gain") return Math.round(weight * 2.0);
  if (goal === "fat_loss") return Math.round(weight * 1.6);
  return Math.round(weight * 1.2);
}

export function calculateFat(totalCalories) {
  return Math.round((totalCalories * 0.25) / 9);
}

export function calculateCarbs(totalCalories, protein, fat) {
  const usedCalories = protein * 4 + fat * 9;
  return Math.round((totalCalories - usedCalories) / 4);
}

export function calculateMacros(user) {
  const tdee = calculateTDEE(user);
  let calories = adjustCalories(tdee, user.fitnessGoal);

  // Teen safety
  if (user.age < 18 && user.fitnessGoal === "fat_loss") {
    calories = Math.max(calories, Math.round(tdee * 0.9));
  }

  const protein = calculateProtein(user.weight, user.fitnessGoal);
  const fat = calculateFat(calories);
  const carbs = calculateCarbs(calories, protein, fat);

  return { calories, protein, carbs, fat };
}
