import express from "express";
import {
  submitPlanFeedback,
  getAllFeedbackByUserAndProfile,
  getMealFeedbackByUserAndProfile,
  getWorkoutFeedbackByUserAndProfile,
} from "../controllers/planFeedbackController.js";
import authMiddleware from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/save", authMiddleware, submitPlanFeedback);
// GET feedback ( userProfile_id)
router.get("/all", authMiddleware, getAllFeedbackByUserAndProfile);
router.get("/meal", authMiddleware, getMealFeedbackByUserAndProfile);
router.get("/workout", authMiddleware, getWorkoutFeedbackByUserAndProfile);

export default router;
