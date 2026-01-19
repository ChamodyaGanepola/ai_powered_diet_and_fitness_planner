import DailyProgress from "../models/DailyProgress.js";
import MealPlan from "../models/MealPlan.js";
import WorkoutPlan from "../models/WorkoutPlan.js";
import Meal from "../models/Meal.js";
import FoodItem from "../models/FoodItem.js";
import Exercise from "../models/Exercise.js";

/* ---------------------------
   Helper: Convert any date to UTC midnight
---------------------------- */


const toUTCDate = (d) => {
  const date = new Date(d);
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
};

/* Get full planned meals */
const getPlannedMealsFull = async (mealPlanId) => {
  const meals = await Meal.find({ mealplan_id: mealPlanId });
  const fullMeals = [];
  for (const meal of meals) {
    const foods = await FoodItem.find({ meal_id: meal._id });
    fullMeals.push({
      mealType: meal.mealType,
      foods: foods.map((f) => ({
        name: f.name,
        calories: f.calories,
        protein: f.protein,
        fat: f.fat,
        unit: f.unit,
      })),
    });
  }
  return fullMeals;
};

/* Check if meals deviate */
const isMealPlanDeviated = (plannedMeals, actualMeals) => {
  if (!plannedMeals || !actualMeals) return true;
  if (plannedMeals.length !== actualMeals.length) return true;

  for (const actualMeal of actualMeals) {
    const plannedMeal = plannedMeals.find(m => m.mealType === actualMeal.mealType);
    if (!plannedMeal) return true; // meal type missing in plan

    const plannedFoods = plannedMeal.foods || [];
    const actualFoods = actualMeal.items || [];

    // Check each food in actual meal
    for (const consumed of actualFoods) {
      const match = plannedFoods.find(
        f =>
          f.name === consumed.name &&
          Number(f.calories) === Number(consumed.calories) &&
          Number(f.protein) === Number(consumed.protein) &&
          Number(f.fat) === Number(consumed.fat) &&
          f.unit === consumed.unit
      );
      if (!match) return true; // consumed food does not match plan
    }

    // Optional: check if user missed any planned food
    if (plannedFoods.length !== actualFoods.length) return true;
  }

  return false; // everything matches
};


/* Check if workouts deviate */
const isWorkoutPlanDeviated = (plannedExercises, actualExercises) => {
  if (!plannedExercises || !actualExercises) return true;
  if (plannedExercises.length !== actualExercises.length) return true;

  for (const actual of actualExercises) {
    const planned = plannedExercises.find(p => 
      p.day.toLowerCase() === actual.day.toLowerCase() &&
      p.name.trim() === actual.name.trim() &&
      Number(p.sets) === Number(actual.sets) &&
      p.reps.trim() === actual.reps.trim() &&
      Number(p.restTime) === Number(actual.restTime)
    );

    if (!planned) return true; // mismatch found
  }

  return false; // everything matches
};



/* Get planned workouts full */
const getPlannedWorkoutsFull = async (workoutPlanId) => {
  return await Exercise.find({ workoutplan_id: workoutPlanId });
};

/* --------------------------- SAVE DAILY PROGRESS --------------------------- */
export const saveDailyProgress = async (req, res) => {
  try {
    const { date, weight, bodyFatPercentage, measurements, meals, workouts } = req.body;
    const user_id = req.user.id;

    if (!user_id || !date || weight == null || bodyFatPercentage == null || !measurements || !meals || !workouts) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const dayStr = new Date(date).toISOString().split("T")[0]; 

    const mealPlan = await MealPlan.findOne({ user_id, status: "active" });
    if (!mealPlan) return res.status(400).json({ message: "No active meal plan found" });

    const workoutPlan = await WorkoutPlan.findOne({ user_id, status: "active" });

    const totalCaloriesTaken = meals.reduce((sum, meal) => {
      const mealTotal = (meal.items || []).reduce((s, item) => s + (Number(item.calories) || 0), 0);
      return sum + mealTotal;
    }, 0);

    const totalCaloriesBurned = workouts.reduce((sum, w) => sum + (Number(w.caloriesBurned) || 0), 0);

    const plannedMeals = await getPlannedMealsFull(mealPlan._id);
    const plannedWorkouts = workoutPlan ? await getPlannedWorkoutsFull(workoutPlan._id) : [];

    const deviatedMealPlan = isMealPlanDeviated(plannedMeals, meals);
    const deviatedWorkoutPlan = workoutPlan ? isWorkoutPlanDeviated(plannedWorkouts, workouts) : false;

    const mealAdherenceScore = deviatedMealPlan ? 0 : 100;
    const workoutAdherenceScore = deviatedWorkoutPlan ? 0 : 100;

    const progress = await DailyProgress.findOneAndUpdate(
      { user_id, date: dayStr },
      {
        user_id,
        date: dayStr,
        weight,
        bodyFatPercentage,
        measurements,
        meals,
        workouts,
        totalCaloriesTaken,
        totalCaloriesBurned,
        mealAdherenceScore,
        workoutAdherenceScore,
        deviatedMealPlan,
        deviatedWorkoutPlan,
        mealplan_id: mealPlan._id,
        workoutplan_id: workoutPlan?._id,
        completed: true,
      },
      { new: true, upsert: true }
    );

    res.json({ success: true, progress });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save daily progress", error: err.message });
  }
};


/* ---------------------------
   GET DAILY PROGRESS BY DATE
---------------------------- */


export const getDailyProgress = async (req, res) => {
  try {
    const { date } = req.query;
    const user_id = req.user.id;

    if (!user_id || !date)
      return res.status(400).json({ message: "user_id and date required" });

    const dayUTC = toUTCDate(date);
    const nextDayUTC = new Date(dayUTC);
    nextDayUTC.setUTCDate(nextDayUTC.getUTCDate() + 1);

    const activeMealPlan = await MealPlan.findOne({
      user_id,
      status: "active",
    });

    const activeWorkoutPlan = await WorkoutPlan.findOne({
      user_id,
      status: "active",
    });

    const query = {
      user_id,
      date: { $gte: dayUTC, $lt: nextDayUTC },
    };

    if (activeMealPlan) query.mealplan_id = activeMealPlan._id;
    if (activeWorkoutPlan) query.workoutplan_id = activeWorkoutPlan._id;

    const progress = await DailyProgress.findOne(query);

    res.json({ success: true, progress: progress || null });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch daily progress",
      error: err.message,
    });
  }
};


/**
 * Reset start/end dates for latest active plans if no progress exists
 * @param selectedStartDate - new start date selected by user
 */

export const resetPlanDatesIfNoProgress = async (req, res) => {
  try {
    const { selectedStartDate } = req.body;
    const user_id = req.user.id;

    if (!user_id || !selectedStartDate) {
      return res.status(400).json({
        success: false,
        message: "user_id and selectedStartDate are required",
      });
    }

    // Parse new start date as UTC midnight
    const newStart = new Date(selectedStartDate);
    newStart.setUTCHours(0, 0, 0, 0); // UTC midnight

    // Get latest active MealPlan & WorkoutPlan
    const mealPlan = await MealPlan.findOne({ user_id, status: "active" }).sort({ createdAt: -1 });
    const workoutPlan = await WorkoutPlan.findOne({ user_id, status: "active" }).sort({ createdAt: -1 });

    if (!mealPlan && !workoutPlan) {
      return res.status(404).json({ success: false, message: "No active meal or workout plans found" });
    }

    // Check if any DailyProgress exists for these plans
    const progressExists = await DailyProgress.exists({
      user_id,
      $or: [
        { mealplan_id: mealPlan?._id },
        { workoutplan_id: workoutPlan?._id },
      ],
    });

    if (progressExists) {
      return res.json({
        success: false,
        message: "Daily progress already exists. Cannot reset plan dates.",
      });
    }

    const updates = {};
    const defaultDurationDays = 30;

    // Helper: calculate end date as UTC midnight
    const calcEndDateUTC = (start, durationDays) => {
      const end = new Date(start);
      end.setUTCDate(end.getUTCDate() + durationDays - 1); // inclusive
      end.setUTCHours(0, 0, 0, 0);
      return end;
    };

    // Reset MealPlan dates safely
    if (mealPlan) {
      let durationDays = defaultDurationDays;

      if (mealPlan.startDate && mealPlan.endDate) {
        durationDays = Math.round(
          (mealPlan.endDate.getTime() - mealPlan.startDate.getTime()) / (1000 * 60 * 60 * 24) + 1
        );
      }

      mealPlan.startDate = newStart;
      mealPlan.endDate = calcEndDateUTC(newStart, durationDays);
      await mealPlan.save();

      updates.mealPlan = {
        id: mealPlan._id,
        startDate: mealPlan.startDate,
        endDate: mealPlan.endDate,
      };
    }


    // Reset WorkoutPlan dates safely

    if (workoutPlan) {
      let durationDays = defaultDurationDays;

      if (workoutPlan.startDate && workoutPlan.endDate) {
        durationDays = Math.round(
          (workoutPlan.endDate.getTime() - workoutPlan.startDate.getTime()) / (1000 * 60 * 60 * 24) + 1
        );
      }

      workoutPlan.startDate = newStart;
      workoutPlan.endDate = calcEndDateUTC(newStart, durationDays);
      await workoutPlan.save();

      updates.workoutPlan = {
        id: workoutPlan._id,
        startDate: workoutPlan.startDate,
        endDate: workoutPlan.endDate,
      };
    }

    res.json({
      success: true,
      message: "Plan dates reset successfully",
      updatedPlans: updates,
    });
  } catch (err) {
    console.error("Reset Plan Dates Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to reset plan dates",
      error: err.message,
    });
  }
};


/**
 * GET all completed progress dates for a user filtered by meal/workout plan
 * Returns array of date strings (YYYY-MM-DD)
 */


export const getCompletedProgressDates = async (req, res) => {
  try {
    const user_id = req.user.id;
    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "user_id required",
      });
    }

    // 1) Get active plans
    const activeMealPlan = await MealPlan.findOne({
      user_id,
      status: "active",
    });

    const activeWorkoutPlan = await WorkoutPlan.findOne({
      user_id,
      status: "active",
    });

    // 2) Build query using only active plan IDs
    const query = { user_id, completed: true };

    if (activeMealPlan) query.mealplan_id = activeMealPlan._id;
    if (activeWorkoutPlan) query.workoutplan_id = activeWorkoutPlan._id;

    // 3) Fetch dates
    const progresses = await DailyProgress.find(query, "date").sort({
      date: 1,
    });

    // 4) Convert dates to YYYY-MM-DD
    const completedDates = progresses.map((p) =>
      new Date(p.date).toISOString().split("T")[0]
    );

    res.json({ success: true, completedDates });
  } catch (err) {
    console.error("Get Completed Dates Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to get completed dates",
      error: err.message,
    });
  }
};



// Check if any daily progress exists for a user considering their active meal/workout plan

export const checkDailyProgressForUser = async (req, res) => {
  try {
    const user_id = req.user.id;
    if (!user_id) return res.status(400).json({ success: false, message: "user_id required" });

    // Get active meal/workout plans
    const mealPlan = await MealPlan.findOne({ user_id, status: "active" }).sort({ createdAt: -1 });
    const workoutPlan = await WorkoutPlan.findOne({ user_id, status: "active" }).sort({ createdAt: -1 });

    // Check if there’s any progress for these plans
    let exists = false;
    if (mealPlan || workoutPlan) {
      const query = { user_id, completed: true };
      if (mealPlan) query.mealplan_id = mealPlan._id;
      if (workoutPlan) query.workoutplan_id = workoutPlan._id;

      const progress = await DailyProgress.findOne(query);
      exists = !!progress;
    }

    res.json({
      success: true,
      exists,
      mealPlan: mealPlan
        ? { id: mealPlan._id, startDate: mealPlan.startDate, endDate: mealPlan.endDate }
        : null,
      workoutPlan: workoutPlan
        ? { id: workoutPlan._id, startDate: workoutPlan.startDate, endDate: workoutPlan.endDate }
        : null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to check progress", error: err.message });
  }
};
