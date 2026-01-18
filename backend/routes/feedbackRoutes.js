import express from "express";
import {
  submitPlanFeedback,
  getAllFeedbackByUserAndProfile,
  getMealFeedbackByUserAndProfile,
  getWorkoutFeedbackByUserAndProfile,
} from "../controllers/planFeedbackController.js";

const router = express.Router();

router.post("/save", submitPlanFeedback);

// GET feedback (ONLY user_id & userProfile_id)
router.get("/all", getAllFeedbackByUserAndProfile);
router.get("/meal", getMealFeedbackByUserAndProfile);
router.get("/workout", getWorkoutFeedbackByUserAndProfile);

export default router;
