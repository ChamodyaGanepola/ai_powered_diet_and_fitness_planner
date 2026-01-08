const express = require("express");
const router = express.Router();
const {
  login,
  forgotPassword,
  resetPassword
} = require("../controllers/authController");

router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.patch("/reset-password/:token", resetPassword);

module.exports = router;
