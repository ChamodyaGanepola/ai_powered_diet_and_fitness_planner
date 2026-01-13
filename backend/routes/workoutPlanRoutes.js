import express from "express";
import { createWorkoutPlan, getLatestWorkoutPlan } from "../controllers/workoutPlanController.js";

const router = express.Router();

router.post("/create", createWorkoutPlan);
router.get("/latest", getLatestWorkoutPlan);
export default router;
