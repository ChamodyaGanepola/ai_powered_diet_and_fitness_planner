import express from "express";
import { createWorkoutPlan, getLatestWorkoutPlan, getExercisesByDate, updateWorkoutPlanStatus } from "../controllers/workoutPlanController.js";

const router = express.Router();

router.post("/create", createWorkoutPlan);
router.get("/latest", getLatestWorkoutPlan);
router.get("/exercises-by-date", getExercisesByDate);
router.put("/status/:workoutPlanId", updateWorkoutPlanStatus);
export default router;
