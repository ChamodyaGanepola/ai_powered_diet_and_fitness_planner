import express from "express";
import { createMealPlan, getLatestMealPlan, updateMealPlanStartDate, getCompletedMealPlans,
     getNotSuitableMealPlans,updateMealPlanStatus, deleteMealPlansByUserProfile } from "../controllers/mealPlanController.js";
import authMiddleware from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/create", authMiddleware, createMealPlan);
router.get("/latest", authMiddleware, getLatestMealPlan);
router.get("/not-suitable", authMiddleware, getNotSuitableMealPlans);
router.get("/completed", authMiddleware, getCompletedMealPlans);
router.patch("/:mealPlanId/start-date", authMiddleware, updateMealPlanStartDate);
router.put("/status/:mealPlanId", authMiddleware, updateMealPlanStatus);
router.delete("/", authMiddleware, deleteMealPlansByUserProfile)
export default router;
