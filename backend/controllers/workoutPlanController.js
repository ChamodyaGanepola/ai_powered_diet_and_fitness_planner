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
    const user_id = req.user.id; // from authMiddleware
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
      activityLevel,
      fitnessGoal,
      healthConditions = [],
      workoutPreferences,
      days,
    } = userProfile;

    const healthText = healthConditions.length ? `Health Conditions: ${healthConditions.join(", ")}` : "";
    const durationDays = days && !isNaN(days)
      ? Number(days)
      : 7;
    // AI prompt
    const prompt = `
Create a weekly workout plan in JSON ONLY. User will follow this plan for number of ${durationDays}.
Include exercises ONLY from user's preferred workout type: ${workoutPreferences}.
Each exercise must have: name, targetMuscle, sets, reps, restTime, durationMinutes, caloriesBurned, day.
Include rest days as "Rest".

User Info:
Age: ${age}
Weight: ${weight} kg
Height: ${height} cm
Activity Level: ${activityLevel}
Fitness Goal: ${fitnessGoal}
Workout Preferences: ${workoutPreferences}
Health Conditions: ${healthText}

Rules:
- Safe for teens
- Avoid exercises worsening user's health conditions
- Do not truncate reps
- No explanations

Output format:
{
  "difficulty": "${mapActivityLevelToDifficulty(activityLevel)}",
  "exercises": [
    {
      "name": "string",
      "targetMuscle": "string",
      "sets": number,
      "reps": "8-12",
      "restTime": number,
      "durationMinutes": number,
      "caloriesBurned": number,
      "day": "Monday"
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

    const startDateUTC = new Date();
    startDateUTC.setUTCHours(0, 0, 0, 0);   // set time to 00:00:00 UTC

    const endDateUTC = new Date(startDateUTC);
    endDateUTC.setDate(endDateUTC.getDate() + durationDays - 1);



    // Create WorkoutPlan document
    const workoutPlan = await WorkoutPlan.create({
      user_id,
      userProfile_id: userProfile._id,
      fitnessGoal,
      difficulty: mapActivityLevelToDifficulty(activityLevel),
      status: "active",
      startDate: startDateUTC,
      endDate: endDateUTC,

    });

    // Save exercises per day

    let totalCalories = 0;
    let totalDuration = 0;

    for (const ex of workoutData.exercises || []) {
      const calories = ex.caloriesBurned || Math.round(weight * (ex.durationMinutes || 30) * 5);
      const duration = ex.durationMinutes || 30;

      await Exercise.create({
        workoutplan_id: workoutPlan._id,
        name: ex.name || "Unknown Exercise",
        targetMuscle: ex.targetMuscle || "General",
        sets: Math.min(Math.max(ex.sets || 3, 1), 5),
        reps: ex.reps || "8-12",
        restTime: Math.min(Math.max(ex.restTime || 60, 0), 120),
        durationMinutes: duration,
        caloriesBurned: calories,
        day: ex.day || "Monday",
      });

      totalCalories += calories;
      totalDuration += duration;
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
    const user_id = req.user.id; // from authMiddleware
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


export const getWorkoutPlanDetails = async (req, res) => {
  try {
    const user_id = req.user.id; // from auth middleware

    if (!user_id) {
      return res.status(400).json({ success: false, message: "user_id is required" });
    }

    // Get latest active workout plan by user_id
    const workoutPlan = await WorkoutPlan.findOne({
      user_id,
      status: "active",
    }).sort({ createdAt: -1 });

    if (!workoutPlan) {
      return res.status(404).json({
        success: false,
        message: "No active workout plan found",
      });
    }

    res.json({
      success: true,
      workoutPlan: {
        id: workoutPlan._id,
        user_id: workoutPlan.user_id,
        userProfile_id: workoutPlan.userProfile_id,
        fitnessGoal: workoutPlan.fitnessGoal,
        difficulty: workoutPlan.difficulty,
        status: workoutPlan.status,
        startDate: workoutPlan.startDate,
        endDate: workoutPlan.endDate,
        totalCaloriesBurned: workoutPlan.totalCaloriesBurned,
        duration: workoutPlan.duration,
        createdAt: workoutPlan.createdAt,
      },
    });
  } catch (err) {
    console.error("Get Workout Plan Details Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch workout plan details",
      error: err.message,
    });
  }
};


// Get exercises for a user on a specific date
export const getExercisesByDate = async (req, res) => {
  try {
    const userId = req.user.id; // from authMiddleware
    const { date } = req.query;
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

export const updateWorkoutPlanStatus = async (req, res) => {
  try {
    const { workoutPlanId } = req.params;
    const { status } = req.body;

    if (!["completed", "account-updated", "not-suitable"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Allowed: completed, account-updated, not-suitable",
      });
    }

    const workoutPlan = await WorkoutPlan.findById(workoutPlanId);
    if (!workoutPlan) {
      return res.status(404).json({ success: false, message: "Workout  plan not found" });
    }

    workoutPlan.status = status;
    await workoutPlan.save();

    res.json({
      success: true,
      message: `Workout plan status updated to ${status}`,
      workoutPlan: {
        id: workoutPlan._id,
        status: workoutPlan.status,
      },
    });
  } catch (err) {
    console.error("Update WorkoutPlan Status Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update workout plan status",
      error: err.message,
    });
  }
};
