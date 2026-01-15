import WorkoutPlan from "../models/WorkoutPlan.js";
import Exercise from "../models/Exercise.js";
import UserProfile from "../models/UserProfile.js";
import { generateWorkoutPlan } from "../services/openRouterWorkoutService.js";

// Clean AI response safely
const cleanAIResponse = (str) => {
  if (!str) return "{}";

  // Remove ```json or ``` wrappers
  str = str.trim()
    .replace(/^```json\s*/, "")
    .replace(/^```/, "")
    .replace(/```$/, "");

  // Wrap reps ranges in quotes: e.g., 8-12 → "8-12"
  str = str.replace(/(\breps\b\s*:\s*)(\d+\s*-\s*\d+)/g, '$1"$2"');

  // Replace NaN with 0
  str = str.replace(/\bNaN\b/g, "0");

  // Remove incomplete trailing entries after last closing brace
  const lastBrace = str.lastIndexOf("}");
  if (lastBrace > 0) {
    str = str.slice(0, lastBrace + 1);
  }

  return str;
};

// Map activity level to difficulty
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

    // Fetch user profile
    const userProfile = await UserProfile.findOne({ user_id, status: "active" });
    if (!userProfile) {
      return res.status(404).json({ success: false, message: "Active User profile not found" });
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

    const healthText = healthConditions.length ? `Health Conditions: ${healthConditions.join(", ")}` : "";
    const prefText = preferences.length ? `Preferences: ${preferences.join(", ")}` : "";

    // AI prompt
    const prompt = `
Create a 5-day weekly workout plan in JSON ONLY, each day max 4 exercises.
Reps must be strings like "8-12". Do not truncate.
User:
- Age: ${age}
- Weight: ${weight}kg
- Height: ${height}cm
- Activity Level: ${activityLevel}
- Fitness Goal: ${fitnessGoal}
${healthText}
${prefText}

Rules:
- Use Push / Pull / Legs split
- Include Rest days
- Safe for teens
- Avoid exercises worsening user's health conditions
- No extreme workouts
- reps MUST be string
- No explanations or trailing commas

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

    // Call AI
    const aiRaw = await generateWorkoutPlan(prompt);
    console.log("AI Workout Response:", aiRaw);

    // Parse safely
    let workoutData;
    try {
      workoutData = JSON.parse(cleanAIResponse(aiRaw));
    } catch (err) {
      // Fallback: truncate at last bracket
      const lastBracket = aiRaw.lastIndexOf("}");
      const lastArrayBracket = aiRaw.lastIndexOf("]");
      const cleaned = aiRaw.substring(0, Math.max(lastBracket, lastArrayBracket) + 1);
      try {
        workoutData = JSON.parse(cleanAIResponse(cleaned));
      } catch (err2) {
        return res.status(500).json({ message: "AI workout JSON invalid", aiRaw });
      }
    }

    // Create WorkoutPlan document
    const workoutPlan = await WorkoutPlan.create({
      user_id,
      userProfile_id: userProfile._id,
      fitnessGoal,
      difficulty: mapActivityLevelToDifficulty(activityLevel),
      status: "active",
    });

    let totalCalories = 0;
    let totalDuration = 0;

    // Save exercises per day
    for (const day of workoutData.days || []) {
      const isRest = day.split === "Rest";
      const duration = isRest ? 0 : 45; // default duration per day
      const calories = isRest ? 0 : Math.round(weight * duration * 5);

      totalCalories += calories;
      totalDuration += duration;

      for (const ex of day.exercises || []) {
        await Exercise.create({
          workoutplan_id: workoutPlan._id,
          name: ex.name || "Unknown Exercise",
          targetMuscle: ex.targetMuscle || "General",
          sets: Math.min(Math.max(ex.sets || 3, 1), 5),
          reps: ex.reps || "8-12",
          restTime: Math.min(Math.max(ex.restTime || 60, 0), 120),
        });
      }
    }

    workoutPlan.totalCaloriesBurned = totalCalories;
    workoutPlan.duration = totalDuration;
    await workoutPlan.save();

    res.json({ success: true, workoutPlan });
  } catch (err) {
    console.error("Workout Plan Error:", err);
    res.status(500).json({ success: false, message: "Workout plan generation failed", error: err.message });
  }
};

// Fetch latest workout plan
export const getLatestWorkoutPlan = async (req, res) => {
  try {
    const { user_id } = req.query;
    if (!user_id) return res.status(400).json({ message: "user_id is required" });

    const workoutPlan = await WorkoutPlan.findOne({ user_id, status: "active" }).sort({ createdAt: -1 });
    if (!workoutPlan) return res.json({ success: false, message: "No workout plan found", exercises: [] });

    const exercises = await Exercise.find({ workoutplan_id: workoutPlan._id });

    res.json({ success: true, workoutPlan: exercises });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch workout plan", error: err.message });
  }
};



// Get exercises for a user on a specific date
export const getExercisesByDate = async (req, res) => {
  try {
    const { userId, date } = req.query;
    if (!userId || !date) return res.status(400).json({ message: "User ID and date are required" });

    // Find active workout plan for user
    const plan = await WorkoutPlan.findOne({ user_id: userId, status: "active" });
    if (!plan) return res.status(404).json({ message: "No active workout plan found" });

    const selectedDate = new Date(date);
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayOfWeek = dayNames[selectedDate.getDay()];

    // Fetch exercises for that day
    const exercises = await Exercise.find({ workoutplan_id: plan._id, day: dayOfWeek });

    res.json({ exercises, dayOfWeek });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch exercises", error: err.message });
  }
};
