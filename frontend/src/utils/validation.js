export const validateEmail = (email) => {
  const re = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

  return passwordRegex.test(password);
};

export const validateUsername = (username) => {
  const re = /^[a-zA-Z0-9]{3,}$/;
  return re.test(username);
};
export const validateAge = (age) => age >= 13 && age <= 120;
export const validateWeight = (weight) => weight > 0;
export const validateHeight = (height) => height > 0;
export const validateGender = (gender) =>
  ["Male", "Female", "Other"].includes(gender);
export const validateFitnessGoal = (goal) => goal.length > 0;
export const validateActivityLevel = (level) => level.length > 0;
export const validateWorkoutPreference = (pref) =>
  ["Yoga", "Gym", "Home Workouts", "Walking", "Running", "Cycling", "Swimming"].includes(pref);
export const validateDays = (days) => [0, 7, 30, 60].includes(Number(days));

export const onlyPositiveNumbers = (value) =>
  value.replace(/[^0-9]/g, "").replace(/^0+/, "");

export const onlyLettersAllowEmpty = (value) =>
  value.replace(/[^a-zA-Z\s]/g, "");


