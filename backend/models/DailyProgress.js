import mongoose from "mongoose";

const dailyProgressSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    date: { type: Date, required: true },

    // ---- MEAL PROGRESS ----
    meals: [
      {
        mealType: {
          type: String,
          enum: ["Breakfast", "Lunch", "Dinner", "Snack"],
        },
        items: [
          {
            name: String,
            calories: Number,
            protein: Number,
            fat: Number,
            unit: String,
          }
        ],
        totalCalories: Number,
      }
    ],

    // ---- WORKOUT PROGRESS ----
    workouts: [
      {
        name: String,
        targetMuscle: String,
        sets: Number,
        reps: String,
        caloriesBurned: Number,
        duration: Number,
      }
    ],

    totalCaloriesTaken: { type: Number, default: 0 },
    totalCaloriesBurned: { type: Number, default: 0 },

    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

dailyProgressSchema.index({ user_id: 1, date: 1 }, { unique: true });

export default mongoose.model("DailyProgress", dailyProgressSchema);
