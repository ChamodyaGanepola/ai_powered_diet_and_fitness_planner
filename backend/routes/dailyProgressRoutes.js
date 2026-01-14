import express from "express";
import {
  getDailyProgress,
  saveDailyProgress,
  checkDailyProgressExists,
} from "../controllers/dailyProgressController.js";

const router = express.Router();

// GET daily progress by date
router.get("/daily", getDailyProgress);

// POST save/update daily progress
router.post("/daily", saveDailyProgress);

// GET check if progress exists for a day
router.get("/exists", checkDailyProgressExists);

export default router;
