import { calculateMacros } from "../utils/nutritionCalculator.js";
import { generateMealPlan } from "../services/openRouterService.js";

export const createMealPlan = async (req, res) => {
  try {
    const userProfile = req.body;

    // ✅ STEP 1: Calculate macros (BACKEND LOGIC)
    const macros = calculateMacros(userProfile);

    // ✅ STEP 2: Send ONLY targets to OpenRouter
    const prompt = `
Create a 1-day meal plan.
Return ONLY valid JSON.

Targets:
Calories: ${macros.calories}
Protein: ${macros.protein}g
Carbs: ${macros.carbs}g
Fat: ${macros.fat}g

Dietary Restrictions: ${userProfile.dietaryRestrictions.join(", ")}
Preferences: ${userProfile.preferences.join(", ")}

Format:
{
  "totalCalories": number,
  "meals": [
    {
      "mealType": "Breakfast | Lunch | Dinner | Snack",
      "foods": [
        {
          "name": "",
          "calories": number,
          "protein": number,
          "fat": number,
          "unit": ""
        }
      ]
    }
  ]
}
`;

    const aiResponse = await generateMealPlan(prompt);
console.log("AI response from OpenRouter:", aiResponse);

    res.json({
      success: true,
      macros,
      mealPlan: JSON.parse(aiResponse)
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Meal plan generation failed" });
  }
};
