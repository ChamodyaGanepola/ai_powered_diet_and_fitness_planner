import mongoose from "mongoose";

const dailyProgressSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    mealplan_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MealPlan",
      required: false,
    },

    workoutplan_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkoutPlan",
      required: false,
    },

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

    /* Meals consumed */
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
                carbohydrates: { type: Number, required: true },
                unit: { type: String, required: true },
              },
            ],
            required: true,
          },
          totalCalories: { type: Number, required: true },
        },
      ],
      required: false,
    },

    /* Workouts done */
    workouts: {
      type: [
        {
          day: { type: String, required: true }, // Monday, Tuesday, etc.
          name: { type: String, required: true },
          targetMuscle: { type: String, required: true },
          sets: { type: Number, required: true },
          reps: { type: String, required: true },
          restTime: { type: Number, required: true },
          caloriesBurned: { type: Number, required: true },
        },
      ],
      required: false,
    },

    totalCaloriesTaken: {
      type: Number,
      required: false,
    },

    totalCaloriesBurned: {
      type: Number,
      required: false,
    },

    /* Adherence metrics */
    mealAdherenceScore: { type: Number, min: 0, max: 100, required: false},
    workoutAdherenceScore: { type: Number, min: 0, max: 100, required: false },

    deviatedMealPlan: { type: Boolean, required: false },
    deviatedWorkoutPlan: { type: Boolean, required: false },

    completed: { type: Boolean, required: true },
  },
  { timestamps: true }
);

dailyProgressSchema.index({ user_id: 1, date: 1 }, { unique: true });

export default mongoose.model("DailyProgress", dailyProgressSchema);
