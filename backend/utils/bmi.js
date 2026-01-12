
function calculateBMI(weight, height) {
  if (!weight || !height) return null;

  // height in meters
  const heightM = height / 100;
  const bmi = weight / (heightM * heightM);
  return Number(bmi.toFixed(1));
}

/**
 * Get BMI category
 * @param {Number} bmi
 * @returns {String} BMI Category
 */
function getBMICategory(bmi) {
  if (bmi < 18.5) return "Underweight";
  if (bmi >= 18.5 && bmi < 25) return "Normal weight";
  if (bmi >= 25 && bmi < 30) return "Overweight";
  if (bmi >= 30) return "Obese";
  return "Unknown";
}

module.exports = { calculateBMI, getBMICategory };
