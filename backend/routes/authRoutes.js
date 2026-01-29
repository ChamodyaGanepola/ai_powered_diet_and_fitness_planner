import express from "express";

const router = express.Router();
import {
  login,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";

router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.patch("/reset-password/:token", resetPassword);

export default router;
