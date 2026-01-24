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
You are a certified fitness coach.

Create a WEEKLY WORKOUT PLAN in STRICT VALID JSON ONLY.
The user will follow this plan for ${durationDays} days.

INCLUDE ONLY exercises that match this workout preference:
${workoutPreferences}

EACH exercise MUST include ALL of the following fields:
- name
- targetMuscle
- sets
- reps
- restTime
- durationMinutes
- caloriesBurned
- day

USER PROFILE (must be considered):
- Age: ${age}
- Weight: ${weight} kg
- Height: ${height} cm
- Activity Level: ${activityLevel}
- Fitness Goal: ${fitnessGoal}
- Workout Preferences: ${workoutPreferences}
- Health Conditions: ${healthText}

STRICT RULES (VERY IMPORTANT):
1. Strength / resistance exercises (e.g. gym, bodyweight, weights):
   - reps MUST be a STRING range like "8-12", "10-15"
2. Cardio exercises (e.g. running, walking, cycling, swimming):
   - reps MUST be exactly "N/A"
3. Reps MUST ALWAYS be a STRING
   - Never a number
   - Never empty
4. DurationMinutes MUST be provided for ALL exercises
5. Sets MUST be a number
   - For cardio exercises, sets = 1
6. Numbers must be plain digits ONLY (no units)
7. Rest days are OPTIONAL (do NOT add unless necessary)
8. Safe for teens
9. Avoid exercises that worsen health conditions
10. NO explanations, NO comments, NO markdown

OUTPUT FORMAT (STRICT):
{
  "difficulty": "${mapActivityLevelToDifficulty(activityLevel)}",
  "exercises": [
    {
      "name": "string",
      "targetMuscle": "string",
      "sets": number,
      "reps": "string",
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

    let workoutData;
    try {
      workoutData = JSON.parse(aiRaw);
      console.log(workoutData);
    } catch (err) {
      console.error("AI workout JSON invalid:", aiRaw);
      return res.status(500).json({
        success: false,
        message: "AI workout JSON invalid"
      });
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
      const reps =
        typeof ex.reps === "string" && ex.reps.trim() !== ""
          ? ex.reps
          : "N/A";

      await Exercise.create({
        workoutplan_id: workoutPlan._id,
        name: ex.name || "Unknown Exercise",
        targetMuscle: ex.targetMuscle || "General",
        sets: Math.min(Math.max(ex.sets || 3, 1), 5),
        reps: reps || "8-12",
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
    // AFTER SUCCESS -> mark old plan as updated
    await WorkoutPlan.updateMany(
      { user_id, status: "active", _id: { $ne: workoutPlan._id } },
      { status: "account-updated" }
    );

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
