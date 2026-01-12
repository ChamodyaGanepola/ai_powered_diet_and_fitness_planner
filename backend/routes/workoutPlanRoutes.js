import express from "express";
import { createWorkoutPlan } from "../controllers/workoutPlanController.js";

const router = express.Router();

router.post("/create", createWorkoutPlan);

export default router;
