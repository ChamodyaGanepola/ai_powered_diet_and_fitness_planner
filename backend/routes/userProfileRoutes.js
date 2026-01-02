const express = require("express");
const router = express.Router();
const {
  createProfile,
  updateProfile,
  getProfileByUserId,
  deleteProfile
} = require("../controllers/userProfileController");

// POST → create profile
router.post("/", createProfile);

// PATCH → update profile by user_id
router.patch("/:user_id", updateProfile);

// GET → profile by user_id
router.get("/:user_id", getProfileByUserId);

// DELETE → delete profile by user_id
router.delete("/:user_id", deleteProfile);

module.exports = router;
