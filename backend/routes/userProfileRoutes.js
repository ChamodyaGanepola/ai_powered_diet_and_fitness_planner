const express = require("express");
const router = express.Router();
const {
  createProfile,
  updateProfile,
  getProfileByUserId,
  deleteProfile
} = require("../controllers/userProfileController");
const authMiddleware = require("../middleware/authMiddleware");

// POST → create profile
router.post("/", authMiddleware,createProfile);

// PATCH → update profile by user_id
router.patch("/", authMiddleware,updateProfile);

// GET → profile by user_id
router.get("/", authMiddleware, getProfileByUserId);

// DELETE → delete profile by user_id
router.delete("/", authMiddleware, deleteProfile);

module.exports = router;
