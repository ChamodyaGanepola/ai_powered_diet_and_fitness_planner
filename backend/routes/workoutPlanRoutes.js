import express from "express";
import { createWorkoutPlan, getLatestWorkoutPlan, getExercisesByDate, updateWorkoutPlanStatus, getWorkoutPlanDetails } from "../controllers/workoutPlanController.js";
import authMiddleware from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/create",authMiddleware, createWorkoutPlan);
router.get("/latest", authMiddleware, getLatestWorkoutPlan);
router.get("/exercises-by-date", authMiddleware, getExercisesByDate);
router.put("/status/:workoutPlanId", authMiddleware, updateWorkoutPlanStatus);
router.get("/latest-workoutPlan", authMiddleware, getWorkoutPlanDetails)
export default router;
