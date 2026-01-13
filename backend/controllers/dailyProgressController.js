import DailyProgress from "../models/DailyProgress.js";

// Get daily progress
export const getDailyProgress = async (req, res) => {
  try {
    const { user_id, date } = req.query;
    if (!user_id || !date) return res.status(400).json({ message: "user_id and date required" });

    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);

    const nextDate = new Date(selectedDate);
    nextDate.setDate(nextDate.getDate() + 1);

    const progress = await DailyProgress.findOne({
      user_id,
      date: { $gte: selectedDate, $lt: nextDate },
    });

    // always return 200 with null if not found
    res.json({ success: true, progress: progress || null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch daily progress", error: err.message });
  }
};


// Save daily progress
export const saveDailyProgress = async (req, res) => {
  try {
    const { user_id, date, meals, workouts } = req.body;

    const day = new Date(date);
    day.setHours(0, 0, 0, 0);

    // calculate totals
    const totalCaloriesTaken = meals.reduce((acc, m) => acc + (m.totalCalories || 0), 0);
    const totalCaloriesBurned = workouts.reduce((acc, w) => acc + (w.caloriesBurned || 0), 0);

    // Save progress
    const progress = await DailyProgress.findOneAndUpdate(
      { user_id, date: day },
      {
        user_id,
        date: day,
        meals,
        workouts,
        totalCaloriesTaken,
        totalCaloriesBurned,
        completed: true,
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, progress });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save daily progress", error: err.message });
  }
};
