import express from "express";
import {
  getDailyProgress,
  saveDailyProgress,
  resetPlanDatesIfNoProgress, getCompletedProgressDates, checkDailyProgressForUser
} from "../controllers/dailyProgressController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

//  daily progress by date
router.get("/daily", authMiddleware, getDailyProgress);
// save/update daily progress
router.post("/daily", authMiddleware, saveDailyProgress);
router.post("/reset-plan-dates", authMiddleware, resetPlanDatesIfNoProgress);
router.get("/completed-dates", authMiddleware, getCompletedProgressDates);
router.get("/checkProgress", authMiddleware, checkDailyProgressForUser);
export default router;
