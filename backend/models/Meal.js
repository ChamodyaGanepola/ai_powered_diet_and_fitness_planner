import mongoose from "mongoose";

const mealSchema = new mongoose.Schema(
  {
    mealplan_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MealPlan",
      required: true
    },

    mealType: {
      type: String,
      enum: ["Breakfast", "Lunch", "Dinner", "Snack"],
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Meal", mealSchema);
