import WorkoutPlan from "../models/WorkoutPlan.js";
import Exercise from "../models/Exercise.js";
import UserProfile from "../models/UserProfile.js";
import { generateWorkoutPlan } from "../services/openRouterWorkoutService.js";

/**
 * Clean AI JSON response:
 * - Wrap reps ranges (e.g., 8-12) in quotes
 * - Replace NaN with 0
 */
const cleanAIResponse = (str) => {
  if (!str) return "{}";
  str = str.replace(/(\breps\b\s*:\s*)(\d+\s*-\s*\d+)/g, '$1"$2"'); // wrap reps
  str = str.replace(/\bNaN\b/g, "0"); // replace NaN with 0
  return str;
};

// Map user activity level to workout difficulty
const mapActivityLevelToDifficulty = (activityLevel) => {
  switch (activityLevel) {
    case "Sedentary":
    case "Lightly Active":
      return "easy";
    case "Moderately Active":
      return "medium";
    case "Very Active":
      return "hard";
    default:
      return "easy";
  }
};

export const createWorkoutPlan = async (req, res) => {
  try {
    const { user_id } = req.body;
    if (!user_id) {
      return res.status(400).json({ message: "user_id is required" });
    }

    // 1️⃣ Get user profile
    const userProfile = await UserProfile.findOne({ user_id });
    if (!userProfile) {
      return res.status(404).json({ message: "User profile not found" });
    }

    const {
      age,
      weight,
      height,
      activityLevel = "Sedentary",
      fitnessGoal = "Maintain Fitness",
      healthConditions = [],
      preferences = [],
    } = userProfile;

    // 2️⃣ Prepare AI prompt
    const healthText = healthConditions.length
      ? `Health Conditions: ${healthConditions.join(", ")}`
      : "";

    const prefText = preferences.length
      ? `Preferences: ${preferences.join(", ")}`
      : "";

    const prompt = `
Create a 7-day weekly workout plan in JSON ONLY.

User:
- Age: ${age}
- Weight: ${weight}kg
- Height: ${height}cm
- Activity Level: ${activityLevel}
- Fitness Goal: ${fitnessGoal}
${healthText}
${prefText}

Rules:
- Use Push / Pull / Legs split when suitable
- Include Rest days
- Safe for teens
- Avoid exercises that may worsen user's health conditions
- No extreme workouts
- reps MUST be a STRING like "8-12"
- NO math expressions
- NO explanations
- NO trailing commas

Format:
{
  "days": [
    {
      "day": "Monday",
      "split": "Push | Pull | Legs | Cardio | Rest",
      "difficulty": "easy | medium | hard",
      "exercises": [
        {
          "name": "",
          "targetMuscle": "",
          "sets": number,
          "reps": "8-12",
          "restTime": number
        }
      ]
    }
  ]
}
`;

    // 3️⃣ Call AI service
    const aiRaw = await generateWorkoutPlan(prompt);
    console.log("AI Workout Response:", aiRaw);

    // 4️⃣ Parse AI JSON safely
    let workoutData;
    try {
      workoutData = JSON.parse(cleanAIResponse(aiRaw));
    } catch (err) {
      console.error("Invalid AI workout JSON:", err.message);
      return res.status(500).json({ message: "Invalid AI workout JSON", aiRaw });
    }

    // 5️⃣ Create Workout Plan
    const workoutPlan = await WorkoutPlan.create({
      user_id,
      fitnessGoal,
      difficulty: mapActivityLevelToDifficulty(activityLevel),
    });

    let totalCalories = 0;
    let totalDuration = 0;

    // 6️⃣ Save exercises for each day
    for (const day of workoutData.days || []) {
      const isRest = day.split === "Rest";
      const duration = isRest ? 0 : 45; // default per day
      const calories = isRest ? 0 : Math.round(weight * duration * 5);

      totalCalories += calories;
      totalDuration += duration;

      for (const ex of day.exercises || []) {
        await Exercise.create({
          workoutplan_id: workoutPlan._id,
          name: ex.name || "Unknown Exercise",
          targetMuscle: ex.targetMuscle || "",
          sets: Math.min(ex.sets || 0, 5),
          reps: ex.reps || "8-12", // store as string
          restTime: Math.min(ex.restTime || 60, 120),
        });
      }
    }

    workoutPlan.totalCaloriesBurned = totalCalories;
    workoutPlan.duration = totalDuration;
    await workoutPlan.save();

    res.json({ success: true, workoutPlan });
  } catch (err) {
    console.error("Workout Plan Error:", err);
    res.status(500).json({
      success: false,
      message: "Workout plan generation failed",
      error: err.message,
    });
  }
};
