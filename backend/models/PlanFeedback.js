import mongoose from "mongoose";

const planFeedbackSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    userProfile_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserProfile",
      required: true,
    },

    planType: {
      type: String,
      enum: ["meal", "workout"],
      required: true,
    },

    mealPlan_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MealPlan",
      default: null,
    },

    workoutPlan_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkoutPlan",
      default: null,
    },

    reason: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("PlanFeedback", planFeedbackSchema);
