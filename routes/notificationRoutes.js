const express = require("express");
const router = express.Router();
const {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
  deleteAllRead,
} = require("../controllers/notificationController");
const { isAuthenticated, hasRole, hasPermission, isActive } = require("../middleware/auth");

// Get user notifications
router.get("/", isAuthenticated, isActive, getUserNotifications);

// Get unread count
router.get("/unread-count", isAuthenticated, isActive, getUnreadCount);

// Mark notification as read
router.patch("/:id/read", isAuthenticated, isActive, markAsRead);

// Mark all as read
router.patch("/read-all", isAuthenticated, isActive, markAllAsRead);

// Delete notification
router.delete("/:id", isAuthenticated, isActive, deleteNotification);

// Delete all read notifications
router.delete("/read/all", isAuthenticated, isActive, deleteAllRead);

// Create notification (Admin/Staff only)
router.post("/", isAuthenticated, isActive, hasRole("ADMIN", "STAFF", "MANAGER"), createNotification);

module.exports = router;
