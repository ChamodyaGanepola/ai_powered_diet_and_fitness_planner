import DailyProgress from "../models/DailyProgress.js";
import MealPlan from "../models/MealPlan.js";

/* ---------------------------
   Helper: Convert any date to UTC midnight
---------------------------- */
const toUTCDate = (d) => {
  const date = new Date(d);
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
};

/* ---------------------------
   GET DAILY PROGRESS BY DATE
---------------------------- */
export const getDailyProgress = async (req, res) => {
  try {
    const { user_id, date } = req.query;
    if (!user_id || !date)
      return res.status(400).json({ message: "user_id and date required" });

    const dayUTC = toUTCDate(date);
    const nextDayUTC = new Date(dayUTC);
    nextDayUTC.setUTCDate(nextDayUTC.getUTCDate() + 1);

    const progress = await DailyProgress.findOne({
      user_id,
      date: { $gte: dayUTC, $lt: nextDayUTC },
    });

    res.json({ success: true, progress: progress || null });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch daily progress",
      error: err.message,
    });
  }
};

/* -------------------------------------
   CHECK IF ANY PROGRESS EXISTS FOR DATE
-------------------------------------- */
export const checkDailyProgressExists = async (req, res) => {
  try {
    const { user_id, date } = req.query;
    if (!user_id || !date)
      return res.status(400).json({ message: "user_id and date required" });

    const dayUTC = toUTCDate(date);
    const nextDayUTC = new Date(dayUTC);
    nextDayUTC.setUTCDate(nextDayUTC.getUTCDate() + 1);

    const exists = await DailyProgress.exists({
      user_id,
      date: { $gte: dayUTC, $lt: nextDayUTC },
    });

    res.json({ success: true, exists: !!exists });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to check progress",
      error: err.message,
    });
  }
};

/* ---------------------------
   SAVE DAILY PROGRESS
---------------------------- */
export const saveDailyProgress = async (req, res) => {
  try {
    const {
      user_id,
      date,
      weight,
      bodyFatPercentage,
      measurements,
      meals,
      workouts,
    } = req.body;

    // ---- Validate required fields ----
    if (
      !user_id ||
      !date ||
      weight == null ||
      bodyFatPercentage == null ||
      !measurements ||
      !meals ||
      !workouts
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // ---- Normalize date to UTC ----
    const dayUTC = toUTCDate(date);

    // ---- Find active meal plan ----
    const mealPlan = await MealPlan.findOne({
      user_id,
      status: "active",
    });

    if (!mealPlan) {
      return res.status(400).json({
        message: "No active meal plan found",
      });
    }

    const startUTC = toUTCDate(mealPlan.startDate);
    const endUTC = toUTCDate(mealPlan.endDate);
console.log("Meal Plan Dates:", startUTC, endUTC);
    // ---- Date validation against meal plan ----
    if (dayUTC < startUTC || dayUTC > endUTC) {
      return res.status(400).json({
        message: "Daily progress allowed only between meal plan start and end dates",
      });
    }

    // ---- Calculate totals ----
    const totalCaloriesTaken = meals.reduce((sum, m) => sum + m.totalCalories, 0);
    const totalCaloriesBurned = workouts.reduce((sum, w) => sum + w.caloriesBurned, 0);

    // ---- Save / Update progress ----
    const progress = await DailyProgress.findOneAndUpdate(
      { user_id, date: dayUTC },
      {
        user_id,
        date: dayUTC,
        weight,
        bodyFatPercentage,
        measurements,
        meals,
        workouts,
        totalCaloriesTaken,
        totalCaloriesBurned,
        completed: true,
      },
      { new: true, upsert: true }
    );

    res.json({ success: true, progress });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        message: "Progress already exists for this date",
      });
    }

    res.status(500).json({
      message: "Failed to save daily progress",
      error: err.message,
    });
  }
};
