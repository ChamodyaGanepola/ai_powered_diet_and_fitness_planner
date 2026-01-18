import express from "express";
import { createWorkoutPlan, getLatestWorkoutPlan, getExercisesByDate, updateWorkoutPlanStatus } from "../controllers/workoutPlanController.js";
import authMiddleware from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/create",authMiddleware, createWorkoutPlan);
router.get("/latest", authMiddleware, getLatestWorkoutPlan);
router.get("/exercises-by-date", authMiddleware, getExercisesByDate);
router.put("/status/:workoutPlanId", authMiddleware, updateWorkoutPlanStatus);
export default router;
