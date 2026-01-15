import express from "express";
import {
  getDailyProgress,
  saveDailyProgress,
  checkDailyProgressExists, resetPlanDatesIfNoProgress, getCompletedProgressDates, checkDailyProgressForUser
} from "../controllers/dailyProgressController.js";

const router = express.Router();

// GET daily progress by date
router.get("/daily", getDailyProgress);

// POST save/update daily progress
router.post("/daily", saveDailyProgress);

// GET check if progress exists for a day
router.get("/exists", checkDailyProgressExists);

// POST endpoint to reset plan dates
router.post("/reset-plan-dates", resetPlanDatesIfNoProgress);
router.get("/completed-dates", getCompletedProgressDates);
router.get("/checkProgress", checkDailyProgressForUser);
export default router;
