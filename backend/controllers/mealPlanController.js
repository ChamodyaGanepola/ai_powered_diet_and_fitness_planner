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
    const userProfile = await UserProfile.findOne({ user_id, status: "active" });
    if (!userProfile) {
      return res.status(404).json({
        success: false,
        message: "Active User profile not found",
      });
    }

    // Prepare profile data for macros calculation
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
      userProfile_id: userProfile._id,
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

// Update MealPlan Status

export const updateMealPlanStatus = async (req, res) => {
  try {
    const { mealPlanId } = req.params;
    const { status } = req.body;

    if (!["completed", "account-updated", "not-suitable"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Allowed: completed, account-updated, not-suitable",
      });
    }

    const mealPlan = await MealPlan.findById(mealPlanId);
    if (!mealPlan) {
      return res.status(404).json({ success: false, message: "Meal plan not found" });
    }

    mealPlan.status = status;
    await mealPlan.save();

    res.json({
      success: true,
      message: `Meal plan status updated to ${status}`,
      mealPlan: {
        id: mealPlan._id,
        status: mealPlan.status,
      },
    });
  } catch (err) {
    console.error("Update MealPlan Status Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update meal plan status",
      error: err.message,
    });
  }
};

// Delete all MealPlans for user & profile

export const deleteMealPlansByUserProfile = async (req, res) => {
  try {
    const { user_id, userProfile_id } = req.query;

    if (!user_id || !userProfile_id) {
      return res.status(400).json({
        success: false,
        message: "user_id and userProfile_id are required",
      });
    }

    const result = await MealPlan.deleteMany({
      user_id,
      userProfile_id,
    });

    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} meal plan(s) for this user & profile`,
    });
  } catch (err) {
    console.error("Delete MealPlans Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to delete meal plans",
      error: err.message,
    });
  }
};


/* ---------------------------
   GET LATEST ACTIVE MEAL PLAN
---------------------------- */
export const getLatestMealPlan = async (req, res) => {
  try {
    const { user_id } = req.query;
    if (!user_id)
      return res.status(400).json({ message: "user_id is required" });

    // Fetch latest active meal plan
    const mealPlan = await MealPlan.findOne({
      user_id,
      status: "active",
    }).sort({ createdAt: -1 });

    if (!mealPlan)
      return res.json({ success: false, message: "No active meal plan found" });

    // Fetch meals and their food items
    const meals = await Meal.find({ mealplan_id: mealPlan._id });
    const mealWithItems = [];
    for (const m of meals) {
      const foods = await FoodItem.find({ meal_id: m._id });
      mealWithItems.push({ ...m.toObject(), foods });
    }

    res.json({ success: true, mealPlan: { ...mealPlan.toObject(), meals: mealWithItems } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch meal plan", error: err.message });
  }
};

/* ---------------------------
   GET ALL NOT-SUITABLE MEAL PLANS
---------------------------- */
export const getNotSuitableMealPlans = async (req, res) => {
  try {
    const { user_id } = req.query;
    if (!user_id)
      return res.status(400).json({ message: "user_id is required" });

    const mealPlans = await MealPlan.find({
      user_id,
      status: "not-suitable",
    }).sort({ createdAt: -1 });

    const results = [];
    for (const plan of mealPlans) {
      const meals = await Meal.find({ mealplan_id: plan._id });
      const mealWithItems = [];
      for (const m of meals) {
        const foods = await FoodItem.find({ meal_id: m._id });
        mealWithItems.push({ ...m.toObject(), foods });
      }
      results.push({ ...plan.toObject(), meals: mealWithItems });
    }

    res.json({ success: true, mealPlans: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch not-suitable meal plans", error: err.message });
  }
};

/* ---------------------------
   GET ALL COMPLETED MEAL PLANS
---------------------------- */
export const getCompletedMealPlans = async (req, res) => {
  try {
    const { user_id } = req.query;
    if (!user_id)
      return res.status(400).json({ message: "user_id is required" });

    const mealPlans = await MealPlan.find({
      user_id,
      status: "completed",
    }).sort({ createdAt: -1 });

    const results = [];
    for (const plan of mealPlans) {
      const meals = await Meal.find({ mealplan_id: plan._id });
      const mealWithItems = [];
      for (const m of meals) {
        const foods = await FoodItem.find({ meal_id: m._id });
        mealWithItems.push({ ...m.toObject(), foods });
      }
      results.push({ ...plan.toObject(), meals: mealWithItems });
    }

    res.json({ success: true, mealPlans: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch completed meal plans", error: err.message });
  }
};



export const updateMealPlanStartDate = async (req, res) => {
  try {
    const { mealPlanId } = req.params;
    const { startDate } = req.body;

    if (!startDate) {
      return res.status(400).json({
        success: false,
        message: "startDate is required",
      });
    }

    const mealPlan = await MealPlan.findById(mealPlanId);

    if (!mealPlan) {
      return res.status(404).json({
        success: false,
        message: "Meal plan not found",
      });
    }

    // ---- CALCULATE GAP ----
    const oldStart = new Date(mealPlan.startDate);
    const oldEnd = new Date(mealPlan.endDate);

    const durationMs = oldEnd.getTime() - oldStart.getTime();
    if (durationMs <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid existing plan duration",
      });
    }

    // ---- SET NEW DATES ----
    const newStart = new Date(startDate);
    newStart.setHours(0, 0, 0, 0);

    const newEnd = new Date(newStart.getTime() + durationMs);

    mealPlan.startDate = newStart;
    mealPlan.endDate = newEnd;

    await mealPlan.save();

    res.json({
      success: true,
      message: "Meal plan dates updated successfully",
      mealPlan: {
        id: mealPlan._id,
        startDate: mealPlan.startDate,
        endDate: mealPlan.endDate,
      },
    });
  } catch (err) {
    console.error("Update MealPlan Date Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update meal plan dates",
      error: err.message,
    });
  }
};
