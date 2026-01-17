import express from "express";
import { submitPlanFeedback } from "../controllers/planFeedbackController.js";

const router = express.Router();

router.post("/save", submitPlanFeedback);

export default router;
