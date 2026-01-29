import express from "express";

const router = express.Router();
import {
  createProfile,
  updateProfile,
  getProfileByUserId,
  deleteProfile, }
from "../controllers/userProfileController.js";
import authMiddleware from "../middleware/authMiddleware.js";



// POST → create profile
router.post("/", authMiddleware,createProfile);

// PATCH → update profile by user_id
router.patch("/", authMiddleware,updateProfile);

// GET → profile by user_id
router.get("/", authMiddleware, getProfileByUserId);

// DELETE → delete profile by user_id
router.delete("/", authMiddleware, deleteProfile);

export default router;
