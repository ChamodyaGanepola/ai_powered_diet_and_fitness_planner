import express from "express";
import { createWorkoutPlan, getLatestWorkoutPlan, getExercisesByDate } from "../controllers/workoutPlanController.js";

const router = express.Router();

router.post("/create", createWorkoutPlan);
router.get("/latest", getLatestWorkoutPlan);
router.get("/exercises-by-date", getExercisesByDate);
export default router;
