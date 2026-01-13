import express from "express";
import {
 getDailyProgress,saveDailyProgress
} from "../controllers/dailyProgressController.js";

const router = express.Router();

router.get("/daily", getDailyProgress);
router.post("/daily", saveDailyProgress);

export default router;
