import MealPlan from "../models/MealPlan.js";
import Meal from "../models/Meal.js";
import FoodItem from "../models/FoodItem.js";
import UserProfile from "../models/UserProfile.js"; // Import your profile model
import { calculateMacros } from "../utils/nutritionCalculator.js";
import { generateMealPlan } from "../services/openRouterService.js";

// Helper: clean AI JSON (replace NaN or invalid numbers with 0)
const cleanAIResponse = (str) => str.replace(/\bNaN\b/g, "0");

export const createMealPlan = async (req, res) => {
  try {
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "user_id is required",
      });
    }

    // ✅ Fetch user profile from DB
    const userProfile = await UserProfile.findOne({ user_id });
    if (!userProfile) {
      return res.status(404).json({
        success: false,
        message: "User profile not found",
      });
    }

    // ✅ Prepare profile data for macros calculation
    const profileData = {
      user_id,
      age: Number(userProfile.age),
      gender: userProfile.gender,
      weight: Number(userProfile.weight),
      height: Number(userProfile.height),
      activityLevel: userProfile.activityLevel || "sedentary",
      fitnessGoal: userProfile.fitnessGoal || "maintain",
      dietaryRestrictions: userProfile.dietaryRestrictions || [],
      preferences: userProfile.preferences || [],
    };

    console.log("Calculating macros for user profile:", profileData);

    // ✅ Calculate macros
    const macros = calculateMacros(profileData);

    // ✅ AI Prompt
    const prompt = `
Create a 1-day meal plan.
Return ONLY valid JSON.

Targets:
Calories: ${macros.calories}
Protein: ${macros.protein}g
Carbs: ${macros.carbs}g
Fat: ${macros.fat}g

Dietary Restrictions: ${profileData.dietaryRestrictions.join(", ")}
Preferences: ${profileData.preferences.join(", ")}

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

    // ✅ Call AI
    const aiResponseRaw = await generateMealPlan(prompt);
    console.log("AI response from OpenRouter:", aiResponseRaw);

    // ✅ Parse AI response safely
    let mealPlanData;
    try {
      mealPlanData = JSON.parse(cleanAIResponse(aiResponseRaw));
    } catch (err) {
      console.error("AI returned invalid JSON:", aiResponseRaw);
      return res.status(500).json({
        success: false,
        message: "Meal plan generation failed due to invalid AI response",
        aiResponse: aiResponseRaw,
      });
    }

    // ✅ Ensure totalCalories is a number
    if (!mealPlanData.totalCalories || isNaN(mealPlanData.totalCalories)) {
      mealPlanData.totalCalories = macros.calories;
    }

    // ✅ Save MealPlan document
    const newMealPlan = await MealPlan.create({
      user_id,
      startDate: new Date(),
      endDate: new Date(),
      totalCalories: mealPlanData.totalCalories,
      totalProtein: macros.protein,
      totalCarbs: macros.carbs,
      totalFat: macros.fat,
      status: "active",
    });

    // ✅ Save Meals and FoodItems
    for (const meal of mealPlanData.meals || []) {
      const newMeal = await Meal.create({
        mealplan_id: newMealPlan._id,
        mealType: meal.mealType,
      });

      for (const food of meal.foods || []) {
        await FoodItem.create({
          meal_id: newMeal._id,
          name: food.name || "Unknown Food",
          calories: food.calories || 0,
          protein: food.protein || 0,
          fat: food.fat || 0,
          category: food.category || "",
          unit: food.unit || "serving",
        });
      }
    }

    res.json({
      success: true,
      message: "Meal plan generated and saved successfully",
      macros,
      mealPlan: mealPlanData,
    });
  } catch (err) {
    console.error("Meal Plan Error:", err);
    res.status(500).json({
      success: false,
      message: "Meal plan generation failed",
      error: err.message,
    });
  }
};


// Fetch latest AI meal plan for a user
export const getLatestMealPlan = async (req, res) => {
  try {
    const { user_id } = req.query;
    if (!user_id) return res.status(400).json({ message: "user_id is required" });

    const mealPlan = await MealPlan.findOne({ user_id }).sort({ createdAt: -1 });
    if (!mealPlan) return res.json({ success: false, message: "No meal plan found", meals: [] });

    const meals = await Meal.find({ mealplan_id: mealPlan._id });
    const mealWithItems = [];
    for (const m of meals) {
      const foods = await FoodItem.find({ meal_id: m._id });
      mealWithItems.push({ ...m.toObject(), foods });
    }

    res.json({ success: true, mealPlan: mealWithItems });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch meal plan", error: err.message });
  }
};
