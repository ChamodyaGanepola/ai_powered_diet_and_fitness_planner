import mongoose from "mongoose";

const mealPlanSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    startDate: {
      type: Date,
      required: true
    },

    endDate: {
      type: Date,
      required: true
    },

    totalCalories: {
      type: Number,
      required: true,
      min: 0
    },

    totalProtein: {
      type: Number,
      required: true,
      min: 0
    },

    totalCarbs: {
      type: Number,
      required: true,
      min: 0
    },

    totalFat: {
      type: Number,
      required: true,
      min: 0
    },

    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active"
    }
  },
  { timestamps: true }
);

export default mongoose.model("MealPlan", mealPlanSchema);
