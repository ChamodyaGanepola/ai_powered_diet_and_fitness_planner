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
router.patch("/:user_id", authMiddleware,updateProfile);

// GET → profile by user_id
router.get("/:user_id", authMiddleware, getProfileByUserId);

// DELETE → delete profile by user_id
router.delete("/:user_id", authMiddleware, deleteProfile);

module.exports = router;
