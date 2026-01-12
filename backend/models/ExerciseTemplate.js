import mongoose from "mongoose";

const exerciseTemplateSchema = new mongoose.Schema({
  name: String,
  description: String,
  defaultSets: Number,
  defaultReps: Number,
  targetMuscle: String,
  baseCalories: Number,
});

export default mongoose.model("ExerciseTemplate", exerciseTemplateSchema);
