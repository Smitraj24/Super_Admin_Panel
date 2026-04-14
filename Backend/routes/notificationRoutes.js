import express from "express";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
  broadcastToDepartment,
  broadcastToAll,
} from "../controllers/notificationController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get all notifications
router.get("/", getNotifications);

// Get unread count
router.get("/unread-count", getUnreadCount);

// Mark notification as read
router.put("/:id/read", markAsRead);

// Mark all as read
router.put("/read-all", markAllAsRead);

// Delete notification
router.delete("/:id", deleteNotification);

// Broadcast message to department (Admin only)
router.post("/broadcast", broadcastToDepartment);

// Broadcast message to all users or specific department (Super Admin only)
router.post("/broadcast-all", broadcastToAll);

// Create notification (admin only - can add role middleware if needed)
router.post("/", createNotification);

export default router;
