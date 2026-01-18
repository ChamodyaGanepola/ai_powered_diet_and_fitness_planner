import Notification from "../models/Notification.js";
import { io } from "../server.js"; // import the socket.io server

/* Create notification */
export const createNotificationHandler = async (req, res) => {
    try {
        const { message } = req.body;
        const user_id = req.user.id; // from authMiddleware
        if (!user_id || !message) {
            return res.status(400).json({ message: "user_id and message are required" });
        }

        const notification = await Notification.create({
            user_id,
            message,
        });


        //  Emit real-time event to the specific user room
        io.to(`user-${user_id}`).emit(`notification-${user_id}`, notification);

        res.status(201).json(notification);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to create notification" });
    }
};

/* Get all notifications */
export const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({
            user_id: req.user.id
        }).sort({ createdAt: -1 });

        res.json(notifications);
    } catch {
        res.status(500).json({ message: "Failed to fetch notifications" });
    }
};

/* Get unread count */
export const getUnreadCount = async (req, res) => {
    try {
        const count = await Notification.countDocuments({
            user_id: req.user.id,
            isRead: false
        });

        res.json({ count });
    } catch {
        res.status(500).json({ message: "Failed to fetch unread count" });
    }
};

/* Mark all as read */
export const markAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { user_id: req.user.id, isRead: false },
            { $set: { isRead: true } }
        );

        res.json({ message: "Notifications marked as read" });
    } catch {
        res.status(500).json({ message: "Failed to mark as read" });
    }
};
