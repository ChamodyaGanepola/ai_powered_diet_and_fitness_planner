import mongoose from "mongoose";

const exerciseSchema = new mongoose.Schema(
  {
    workoutplan_id: { type: mongoose.Schema.Types.ObjectId, ref: "WorkoutPlan", required: true },
    day: { type: String, required: true }, // Monday, Tuesday, etc.
    name: { type: String, required: true },
    targetMuscle: { type: String },
    sets: { type: Number, default: 3 },
    reps: { type: String, default: "8-12" }, // STRING to store ranges
    restTime: { type: Number, default: 60 }, // seconds
  },
  { timestamps: true }
);

const Exercise = mongoose.model("Exercise", exerciseSchema);
export default Exercise;
