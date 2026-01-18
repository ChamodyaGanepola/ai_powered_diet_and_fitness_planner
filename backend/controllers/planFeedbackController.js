import PlanFeedback from "../models/PlanFeedback.js";
import MealPlan from "../models/MealPlan.js";
import WorkoutPlan from "../models/WorkoutPlan.js";

export const submitPlanFeedback = async (req, res) => {
  try {
    const user_id = req.user.id; // from authMiddleware
    const {
      userProfile_id,
      planType,
      mealPlan_id,
      workoutPlan_id,
      reason,
    } = req.body;

    // Validation
    if (!["meal", "workout"].includes(planType)) {
      return res.status(400).json({ success: false, message: "Invalid plan type" });
    }

    if (planType === "meal" && !mealPlan_id) {
      return res.status(400).json({ success: false, message: "mealPlan_id required" });
    }

    if (planType === "workout" && !workoutPlan_id) {
      return res.status(400).json({ success: false, message: "workoutPlan_id required" });
    }

    // 1️⃣ Save feedback
    const feedback = await PlanFeedback.create({
      user_id,
      userProfile_id,
      planType,
      mealPlan_id: planType === "meal" ? mealPlan_id : null,
      workoutPlan_id: planType === "workout" ? workoutPlan_id : null,
      reason,
    });

    // 2️⃣ Update plan status → not-suitable
    if (planType === "meal") {
      await MealPlan.findByIdAndUpdate(mealPlan_id, { status: "not-suitable" });
    } else {
      await WorkoutPlan.findByIdAndUpdate(workoutPlan_id, { status: "not-suitable" });
    }

    res.status(201).json({
      success: true,
      message: "Feedback saved and plan marked as not suitable",
      feedback,
    });
  } catch (err) {
    console.error("Submit Feedback Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to submit feedback",
      error: err.message,
    });
  }
};

export const getAllFeedbackByUserAndProfile = async (req, res) => {
  try {
    const { userProfile_id } = req.query;
    const user_id = req.user.id; // from authMiddleware

    if (!user_id || !userProfile_id) {
      return res.status(400).json({
        success: false,
        message: "user_id and userProfile_id are required",
      });
    }

    const feedbacks = await PlanFeedback.find({
      user_id,
      userProfile_id,
    })
      .populate("mealPlan_id")
      .populate("workoutPlan_id")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: feedbacks.length,
      data: feedbacks,
    });
  } catch (err) {
    console.error("Get Feedback Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch feedback",
      error: err.message,
    });
  }
};

export const getMealFeedbackByUserAndProfile = async (req, res) => {
  try {
    const {  userProfile_id } = req.query;
    const user_id = req.user.id; 
    if (!user_id || !userProfile_id) {
      return res.status(400).json({
        success: false,
        message: "user_id and userProfile_id are required",
      });
    }

    const feedbacks = await PlanFeedback.find({
      user_id,
      userProfile_id,
      planType: "meal",
    })
      .populate("mealPlan_id")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: feedbacks.length,
      data: feedbacks,
    });
  } catch (err) {
    console.error("Meal Feedback Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch meal feedback",
      error: err.message,
    });
  }
};

export const getWorkoutFeedbackByUserAndProfile = async (req, res) => {
  try {
    const { userProfile_id } = req.query;
    const user_id = req.user.id; // from authMiddleware

    if (!user_id || !userProfile_id) {
      return res.status(400).json({
        success: false,
        message: "user_id and userProfile_id are required",
      });
    }

    const feedbacks = await PlanFeedback.find({
      user_id,
      userProfile_id,
      planType: "workout",
    })
      .populate("workoutPlan_id")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: feedbacks.length,
      data: feedbacks,
    });
  } catch (err) {
    console.error("Workout Feedback Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch workout feedback",
      error: err.message,
    });
  }
};

