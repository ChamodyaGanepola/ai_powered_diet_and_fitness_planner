import mongoose from "mongoose";

const exerciseSchema = new mongoose.Schema({
  workoutplan_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "WorkoutPlan",
    required: true,
  },

  day: {
    type: String,
    required: true, // Monday, Tuesday, Rest
  },

  name: { type: String, required: true },
  targetMuscle: { type: String },

  sets: { type: Number, default: 3 },
  reps: { type: String, default: "8-12" },
  restTime: { type: Number, default: 60 }, // seconds

  durationMinutes: {
    type: Number,
    required: true,
    min: 0,
  },

  caloriesBurned: {
    type: Number,
    required: true,
    min: 0,
  },
}, { timestamps: true });


const Exercise = mongoose.model("Exercise", exerciseSchema);
export default Exercise;
