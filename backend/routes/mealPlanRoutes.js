const express = require("express");
const { createMealPlan, getLatestMealPlan, updateMealPlanStartDate, getCompletedMealPlans,
     getNotSuitableMealPlans,updateMealPlanStatus, deleteMealPlansByUserProfile } = require("../controllers/mealPlanController.js");

const router = express.Router();

router.post("/create", createMealPlan);
router.get("/latest", getLatestMealPlan);
router.get("/not-suitable", getNotSuitableMealPlans);
router.get("/completed", getCompletedMealPlans);
router.patch("/:mealPlanId/start-date", updateMealPlanStartDate);
router.put("/status/:mealPlanId", updateMealPlanStatus);
router.delete("/", deleteMealPlansByUserProfile)
module.exports = router;
