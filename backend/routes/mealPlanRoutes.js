// routes/mealPlanRoutes.js
const express = require("express");
const { createMealPlan } = require("../controllers/mealPlanController.js");

const router = express.Router();

router.post("/create", createMealPlan);

module.exports = router;
