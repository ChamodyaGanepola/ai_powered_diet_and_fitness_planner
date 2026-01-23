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

/* Get planned workouts full */
const getPlannedWorkoutsFull = async (workoutPlanId) => {
  return await Exercise.find({ workoutplan_id: workoutPlanId });
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
export const getAllProgressForUser = async (req, res) => {
  try {
    const user_id = req.user.id;
    if (!user_id)
      return res.status(400).json({ success: false, message: "user_id required" });

    const mealPlan = await MealPlan.findOne({ user_id, status: "active" }).sort({ createdAt: -1 });
    const workoutPlan = await WorkoutPlan.findOne({ user_id, status: "active" }).sort({ createdAt: -1 });

    // If no plan exists
    if (!mealPlan && !workoutPlan) {
      return res.json({ success: true, progress: [] });
    }

    // Fetch progress (all, but filtered by active plan ids)
    const query = {
      user_id,
      $or: [],
    };

    if (mealPlan) query.$or.push({ mealplan_id: mealPlan._id });
    if (workoutPlan) query.$or.push({ workoutplan_id: workoutPlan._id });

    const progress = await DailyProgress.find(query)
      .select({
        date: 1,
        mealAdherenceScore: 1,
        workoutAdherenceScore: 1,
        totalCaloriesTaken: 1,
        totalCaloriesBurned: 1,
        weight: 1,
        completed: 1,
      })
      .sort({ date: 1 });

    res.json({
      success: true,
      mealPlan: mealPlan
        ? { id: mealPlan._id, startDate: mealPlan.startDate, endDate: mealPlan.endDate }
        : null,
      workoutPlan: workoutPlan
        ? { id: workoutPlan._id, startDate: workoutPlan.startDate, endDate: workoutPlan.endDate }
        : null,
      progress,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to get progress", error: err.message });
  }
};


/* --------------------------- SAVE DAILY PROGRESS --------------------------- */
export const saveDailyProgress = async (req, res) => {
  try {
    const { date, weight, bodyFatPercentage, measurements, meals, workouts } = req.body;
    const user_id = req.user.id;

    if (!user_id || !date || weight == null || bodyFatPercentage == null || !measurements) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const dayStr = new Date(date).toISOString().split("T")[0];

    const mealPlan = await MealPlan.findOne({ user_id, status: "active" });
    const workoutPlan = await WorkoutPlan.findOne({ user_id, status: "active" });

    // Must have at least one plan or data
    if (!mealPlan && !workoutPlan) {
      return res.status(400).json({ message: "No active meal or workout plan found" });
    }

    // Calculate calories only if meals/workouts exist
    const totalCaloriesTaken = (meals || []).reduce((sum, meal) => {
      const mealTotal = (meal.items || []).reduce((s, item) => s + (Number(item.calories) || 0), 0);
      return sum + mealTotal;
    }, 0);

    const totalCaloriesBurned = (workouts || []).reduce((sum, w) => sum + (Number(w.caloriesBurned) || 0), 0);

    const plannedMeals = mealPlan ? await getPlannedMealsFull(mealPlan._id) : [];
    const plannedWorkouts = workoutPlan ? await getPlannedWorkoutsFull(workoutPlan._id) : [];

    const deviatedMealPlan = meals ? isMealPlanDeviated(plannedMeals, meals) : false;
    const deviatedWorkoutPlan = workouts ? isWorkoutPlanDeviated(plannedWorkouts, workouts) : false;

    const mealAdherenceScore = meals ? (deviatedMealPlan ? 0 : 100) : null;
    const workoutAdherenceScore = workouts ? (deviatedWorkoutPlan ? 0 : 100) : null;

    const progress = await DailyProgress.findOneAndUpdate(
      { user_id, date: dayStr },
      {
        user_id,
        date: dayStr,
        weight,
        bodyFatPercentage,
        measurements,
        meals: meals || [],
        workouts: workouts || [],
        totalCaloriesTaken,
        totalCaloriesBurned,
        mealAdherenceScore,
        workoutAdherenceScore,
        deviatedMealPlan,
        deviatedWorkoutPlan,
        mealplan_id: mealPlan?._id,
        workoutplan_id: workoutPlan?._id,
        completed: true,
      },
      { new: true, upsert: true }
    );

    res.json({ success: true, progress });
  } catch (err) {
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

    // **IMPORTANT**
    // Use $or when both plans exist
    if (activeMealPlan && activeWorkoutPlan) {
      query.$or = [
        { mealplan_id: activeMealPlan._id },
        { workoutplan_id: activeWorkoutPlan._id },
      ];
    } else if (activeMealPlan) {
      query.mealplan_id = activeMealPlan._id;
    } else if (activeWorkoutPlan) {
      query.workoutplan_id = activeWorkoutPlan._id;
    }

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



export const resetPlanDatesIfNoProgress = async (req, res) => {
  try {
    const { selectedMealStartDate, selectedWorkoutStartDate } = req.body;
    const user_id = req.user.id;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "user_id is required",
      });
    }

    const mealPlan = await MealPlan.findOne({ user_id, status: "active" }).sort({ createdAt: -1 });
    const workoutPlan = await WorkoutPlan.findOne({ user_id, status: "active" }).sort({ createdAt: -1 });

    if (!mealPlan && !workoutPlan) {
      return res.status(404).json({ success: false, message: "No active meal or workout plans found" });
    }

    // CHECK progress separately for each plan
    const mealProgressExists = mealPlan
      ? await DailyProgress.exists({
          user_id,
          mealplan_id: mealPlan._id,
          completed: true,
        })
      : false;

    const workoutProgressExists = workoutPlan
      ? await DailyProgress.exists({
          user_id,
          workoutplan_id: workoutPlan._id,
          completed: true,
        })
      : false;

    // If BOTH have progress => cannot reset anything
    if (mealProgressExists && workoutProgressExists) {
      return res.json({
        success: false,
        message: "Progress already exists for both plans. Cannot reset dates.",
      });
    }

    const updates = {};
    const defaultDurationDays = 30;

    const calcEndDateUTC = (start, durationDays) => {
      const end = new Date(start);
      end.setUTCDate(end.getUTCDate() + durationDays - 1);
      end.setUTCHours(0, 0, 0, 0);
      return end;
    };

    // RESET ONLY MEAL PLAN if no meal progress
    if (mealPlan && !mealProgressExists) {
      if (!selectedMealStartDate) {
        return res.status(400).json({
          success: false,
          message: "selectedMealStartDate is required",
        });
      }

      const newMealStart = new Date(selectedMealStartDate);
      newMealStart.setUTCHours(0, 0, 0, 0);

      let durationDays = defaultDurationDays;

      if (mealPlan.startDate && mealPlan.endDate) {
        durationDays = Math.round(
          (mealPlan.endDate.getTime() - mealPlan.startDate.getTime()) / (1000 * 60 * 60 * 24) + 1
        );
      }

      mealPlan.startDate = newMealStart;
      mealPlan.endDate = calcEndDateUTC(newMealStart, durationDays);
      await mealPlan.save();

      updates.mealPlan = {
        id: mealPlan._id,
        startDate: mealPlan.startDate,
        endDate: mealPlan.endDate,
      };
    }

    // RESET ONLY WORKOUT PLAN if no workout progress
    if (workoutPlan && !workoutProgressExists) {
      if (!selectedWorkoutStartDate) {
        return res.status(400).json({
          success: false,
          message: "selectedWorkoutStartDate is required",
        });
      }

      const newWorkoutStart = new Date(selectedWorkoutStartDate);
      newWorkoutStart.setUTCHours(0, 0, 0, 0);

      let durationDays = defaultDurationDays;

      if (workoutPlan.startDate && workoutPlan.endDate) {
        durationDays = Math.round(
          (workoutPlan.endDate.getTime() - workoutPlan.startDate.getTime()) / (1000 * 60 * 60 * 24) + 1
        );
      }

      workoutPlan.startDate = newWorkoutStart;
      workoutPlan.endDate = calcEndDateUTC(newWorkoutStart, durationDays);
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

    // Get active plans
    const activeMealPlan = await MealPlan.findOne({
      user_id,
      status: "active",
    });

    const activeWorkoutPlan = await WorkoutPlan.findOne({
      user_id,
      status: "active",
    });

    // Prepare sets
    const mealCompletedDatesSet = new Set();
    const workoutCompletedDatesSet = new Set();

    // Fetch meal progress dates
    if (activeMealPlan) {
      const mealProgress = await DailyProgress.find(
        {
          user_id,
          completed: true,
          mealplan_id: activeMealPlan._id,
        },
        "date"
      );

      mealProgress.forEach(p => {
        mealCompletedDatesSet.add(
          new Date(p.date).toISOString().split("T")[0]
        );
      });
    }

    // Fetch workout progress dates
    if (activeWorkoutPlan) {
      const workoutProgress = await DailyProgress.find(
        {
          user_id,
          completed: true,
          workoutplan_id: activeWorkoutPlan._id,
        },
        "date"
      );

      workoutProgress.forEach(p => {
        workoutCompletedDatesSet.add(
          new Date(p.date).toISOString().split("T")[0]
        );
      });
    }

    res.json({
      success: true,
      mealCompletedDates: Array.from(mealCompletedDatesSet),
      workoutCompletedDates: Array.from(workoutCompletedDatesSet),
    });
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
    if (!user_id)
      return res.status(400).json({ success: false, message: "user_id required" });

    const mealPlan = await MealPlan.findOne({ user_id, status: "active" }).sort({ createdAt: -1 });
    const workoutPlan = await WorkoutPlan.findOne({ user_id, status: "active" }).sort({ createdAt: -1 });

    let mealProgressExists = false;
    let workoutProgressExists = false;

    if (mealPlan) {
      mealProgressExists = !!(await DailyProgress.findOne({
        user_id,
        mealplan_id: mealPlan._id,
        completed: true,
      }));
    }

    if (workoutPlan) {
      workoutProgressExists = !!(await DailyProgress.findOne({
        user_id,
        workoutplan_id: workoutPlan._id,
        completed: true,
      }));
    }

    res.json({
      success: true,
      mealPlan: mealPlan
        ? { id: mealPlan._id, startDate: mealPlan.startDate, endDate: mealPlan.endDate, progressExists: mealProgressExists }
        : null,
      workoutPlan: workoutPlan
        ? { id: workoutPlan._id, startDate: workoutPlan.startDate, endDate: workoutPlan.endDate, progressExists: workoutProgressExists }
        : null,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to check progress", error: err.message });
  }
};

/**
 * UPDATE Daily Progress (supports partial update for meal OR workout)
 * Useful when user already logged meal and later adds workout (or vice versa)
 */
export const updateDailyProgress = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      date,
      weight,
      bodyFatPercentage,
      measurements,
      meals,
      workouts,
    } = req.body;

    const existing = await DailyProgress.findOne({ userId, date });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "No progress found for this date. Please create it first.",
      });
    }

    // Update only provided fields (optional meals/workouts)
    if (weight !== undefined) existing.weight = weight;
    if (bodyFatPercentage !== undefined)
      existing.bodyFatPercentage = bodyFatPercentage;
    if (measurements !== undefined) existing.measurements = measurements;
    if (meals !== undefined) existing.meals = meals;
    if (workouts !== undefined) existing.workouts = workouts;

    existing.completed = true;  // once updated, mark completed

    await existing.save();

    return res.json({
      success: true,
      message: "Progress updated successfully",
      progress: existing,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
