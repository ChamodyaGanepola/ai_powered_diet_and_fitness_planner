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
  preferences: { type: [String], default: [] },
  culturalDietaryPatterns: { type: [String], default: [] },

  bmi: { type: Number }, // new
  bmiCategory: { type: String } // new
}, { timestamps: true });

const UserProfile = mongoose.model("UserProfile", userProfileSchema);
module.exports = UserProfile;
