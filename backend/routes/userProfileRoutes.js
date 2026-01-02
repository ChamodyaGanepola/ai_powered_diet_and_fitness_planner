const express = require("express");
const router = express.Router();
const {
  createProfile,
  updateProfile,
  getProfileByUserId
} = require("../controllers/userProfileController");

// POST → create profile
router.post("/", createProfile);

// PATCH → update profile by user_id
router.patch("/:user_id", updateProfile);

// GET → profile by user_id
router.get("/:user_id", getProfileByUserId);

module.exports = router;
