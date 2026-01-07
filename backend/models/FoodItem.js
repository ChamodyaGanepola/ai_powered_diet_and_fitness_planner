import mongoose from "mongoose";

const foodItemSchema = new mongoose.Schema(
  {
    meal_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Meal",
      required: true
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    calories: {
      type: Number,
      required: true,
      min: 0
    },

    protein: {
      type: Number,
      required: true,
      min: 0
    },

    fat: {
      type: Number,
      required: true,
      min: 0
    },

    category: {
      type: String,
      trim: true
    },

    unit: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("FoodItem", foodItemSchema);
