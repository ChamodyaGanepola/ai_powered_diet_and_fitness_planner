const mongoose = require("mongoose");

const userProfileSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  age: { type: Number, required: true, min: 13, max: 120 },
  gender: { type: String, required: true, enum: ["Male", "Female", "Other"] },
  weight: { type: Number, required: true, min: 0 },
  height: { type: Number, required: true, min: 0 },
  fitnessGoal: { type: String, required: true },
  activityLevel: { type: String, required: true },
  dietaryRestrictions: { type: [String], default: [] },
  healthConditions: { type: [String], default: [] },
  workoutPreferences: { type: String, required: true, enum: ["Yoga", "Gym", "Home Workouts", "Walking", "Running", "Cycling", "Swimming"] },
  culturalDietaryPatterns: { type: [String], default: [] },
  days: {
  type: Number,
  required: true,
  default: 0
},
  bmi: { type:Number},
  bmiCategory: { type: String }, 
  
  status: {
      type: String,
      enum: ["active", "updated"],
      default: "active"
    }
}, { timestamps: true });

const UserProfile = mongoose.model("UserProfile", userProfileSchema);
module.exports = UserProfile;
