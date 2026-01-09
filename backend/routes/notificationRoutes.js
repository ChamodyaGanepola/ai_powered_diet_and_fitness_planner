import express from "express";
import {
  getNotifications,
  getUnreadCount,
  markAsRead, createNotificationHandler
} from "../controllers/NotificationController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getNotifications);
router.get("/unread-count", authMiddleware, getUnreadCount);
router.post("/mark-read", authMiddleware, markAsRead);
router.post("/", authMiddleware, createNotificationHandler);

export default router;
