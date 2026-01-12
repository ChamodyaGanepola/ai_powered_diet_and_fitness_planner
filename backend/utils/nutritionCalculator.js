export function calculateBMR({ gender, weight, height, age }) {
  console.log("Calculating BMR for:", { gender, weight, height, age });

  let bmr;
  if (gender === "male") {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  console.log("BMR calculated:", bmr);
  return bmr;
}

export function getActivityMultiplier(level) {
  const map = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };
  const multiplier = map[level] || 1.2;
  console.log("Activity level:", level, "Multiplier:", multiplier);
  return multiplier;
}

export function calculateTDEE(user) {
  const bmr = calculateBMR(user);
  const multiplier = getActivityMultiplier(user.activityLevel);
  const tdee = bmr * multiplier;
  console.log("TDEE calculated:", tdee);
  return tdee;
}

export function adjustCalories(tdee, goal) {
  let adjusted;
  if (goal === "fat_loss") adjusted = Math.round(tdee - 500);
  else if (goal === "muscle_gain") adjusted = Math.round(tdee + 300);
  else adjusted = Math.round(tdee);

  console.log("Adjusted calories for goal", goal, ":", adjusted);
  return adjusted;
}

export function calculateProtein(weight, goal) {
  let protein;
  if (goal === "muscle_gain") protein = Math.round(weight * 2.0);
  else if (goal === "fat_loss") protein = Math.round(weight * 1.6);
  else protein = Math.round(weight * 1.2);

  console.log("Protein calculated for goal", goal, ":", protein);
  return protein;
}

export function calculateFat(totalCalories) {
  const fat = Math.round((totalCalories * 0.25) / 9);
  console.log("Fat calculated from calories", totalCalories, ":", fat);
  return fat;
}

export function calculateCarbs(totalCalories, protein, fat) {
  const usedCalories = protein * 4 + fat * 9;
  const carbs = Math.round((totalCalories - usedCalories) / 4);
  console.log("Carbs calculated: Total calories", totalCalories, 
              "Used calories", usedCalories, "Carbs:", carbs);
  return carbs;
}

export function calculateMacros(user) {
  const weight = Number(user.weight) || 0;
  const height = Number(user.height) || 0;
  const age = Number(user.age) || 0;
  const activityLevel = user.activityLevel || "sedentary";
  const fitnessGoal = user.fitnessGoal || "maintain";

  console.log("Calculating macros for user:", user);

  const tdee = calculateTDEE({ gender: user.gender, weight, height, age, activityLevel });
  let calories = adjustCalories(tdee, fitnessGoal);

  // Teen safety: don't go below 90% of TDEE
  if (age < 18 && fitnessGoal === "fat_loss") {
    const teenSafe = Math.round(tdee * 0.9);
    console.log("Teen safety adjustment, 90% of TDEE:", teenSafe);
    calories = Math.max(calories, teenSafe);
  }

  // Don't clamp to 0 if you want negative numbers
  // calories = Math.max(calories, 0);

  let protein = calculateProtein(weight, fitnessGoal);
  // protein = Math.max(protein, 0);

  let fat = calculateFat(calories);
  // fat = Math.max(fat, 0);

  let carbs = calculateCarbs(calories, protein, fat);
  // carbs = Math.max(carbs, 0);

  console.log("Final macros:", { calories, protein, fat, carbs });

  return { calories, protein, fat, carbs };
}
