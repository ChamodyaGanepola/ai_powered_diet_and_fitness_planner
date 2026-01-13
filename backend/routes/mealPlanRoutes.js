// routes/mealPlanRoutes.js
const express = require("express");
const { createMealPlan, getLatestMealPlan } = require("../controllers/mealPlanController.js");

const router = express.Router();

router.post("/create", createMealPlan);
router.get("/latest", getLatestMealPlan);
module.exports = router;
