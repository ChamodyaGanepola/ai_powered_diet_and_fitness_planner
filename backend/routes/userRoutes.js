import express from "express";

import {
  createUser,
  getAllUsers,
} from "../controllers/userController.js";

const router = express.Router();
// POST /api/users
router.post("/", createUser);
// GET /api/users 
router.get("/", getAllUsers);
export default router;
