import mongoose from "mongoose";

const dailyProgressSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    
    mealplan_id: { type: mongoose.Schema.Types.ObjectId, ref: "MealPlan", required: true },
    workoutplan_id: { type: mongoose.Schema.Types.ObjectId, ref: "WorkoutPlan", required: false },

    date: {
      type: Date,
      required: true,
    },

    weight: {
      type: Number,
      required: true,
    },

    bodyFatPercentage: {
      type: Number,
      required: true,
    },

    measurements: {
      chest: { type: Number, required: true },
      waist: { type: Number, required: true },
      hips: { type: Number, required: true },
    },

    // ---- MEALS ----
    meals: {
      type: [
        {
          mealType: {
            type: String,
            enum: ["Breakfast", "Lunch", "Dinner", "Snack"],
            required: true,
          },
          items: {
            type: [
              {
                name: { type: String, required: true },
                calories: { type: Number, required: true },
                protein: { type: Number, required: true },
                fat: { type: Number, required: true },
                unit: { type: String, required: true },
              },
            ],
            required: true,
          },
          totalCalories: { type: Number, required: true },
        },
      ],
      required: true,
    },

    // ---- WORKOUTS ----
    workouts: {
      type: [
        {
          name: { type: String, required: true },
          targetMuscle: { type: String, required: true },
          sets: { type: Number, required: true },
          reps: { type: String, required: true },
          caloriesBurned: { type: Number, required: true },
          duration: { type: Number, required: true },
        },
      ],
      required: true,
    },

    totalCaloriesTaken: {
      type: Number,
      required: true,
    },

    totalCaloriesBurned: {
      type: Number,
      required: true,
    },

    completed: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true }
);

dailyProgressSchema.index({ user_id: 1, date: 1 }, { unique: true });

export default mongoose.model("DailyProgress", dailyProgressSchema);
