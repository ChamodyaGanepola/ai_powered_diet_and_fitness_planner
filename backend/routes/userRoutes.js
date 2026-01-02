const express = require("express");
const router = express.Router();
const { createUser, getAllUsers } = require("../controllers/userController");

// POST /api/users
router.post("/", createUser);
// GET /api/users 
router.get("/", getAllUsers);
module.exports = router;
