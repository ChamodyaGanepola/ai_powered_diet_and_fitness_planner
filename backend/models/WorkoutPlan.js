import mongoose from "mongoose";

const workoutPlanSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "UserProfile", required: true },
    userProfile_id: {   
          type: mongoose.Schema.Types.ObjectId,
          ref: "UserProfile",
          required: true,
        },
    fitnessGoal: {
      type: String,
      enum: ["Weight Loss", "Muscle Gain", "Maintain Fitness", "Improve Endurance"],
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"], // mapped from activityLevel
      required: true,
    },
    totalCaloriesBurned: { type: Number, default: 0 },
    duration: { type: Number, default: 0 }, // total minutes
    status: {
      type: String,
      enum: ["active", "completed", "account-updated", "account-deleted", "not-suitable"],
      default: "active"
    },
     startDate: {
      type: Date,
      required: true
    },

    endDate: {
      type: Date,
      required: true
    },
  },
  { timestamps: true }
);

const WorkoutPlan = mongoose.model("WorkoutPlan", workoutPlanSchema);
export default WorkoutPlan;
