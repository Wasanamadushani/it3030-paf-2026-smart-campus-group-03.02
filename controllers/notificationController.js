const Notification = require("../models/Notification");
const User = require("../models/User");

// Get all notifications for the authenticated user
const getUserNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, isRead, type, category, priority } = req.query;
    
    const filter = { userId: req.user._id };
    
    if (isRead !== undefined) {
      filter.isRead = isRead === "true";
    }
    
    if (type) {
      filter.type = type.toUpperCase();
    }
    
    if (category) {
      filter.category = category.toUpperCase();
    }
    
    if (priority) {
      filter.priority = priority.toUpperCase();
    }

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("createdBy", "name email");

    const count = await Notification.countDocuments(filter);
    const unreadCount = await Notification.countDocuments({ 
      userId: req.user._id, 
      isRead: false 
    });

    res.status(200).json({
      notifications,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalNotifications: count,
      unreadCount,
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

// Get unread notification count
const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ 
      userId: req.user._id, 
      isRead: false 
    });

    res.status(200).json({ unreadCount: count });
  } catch (error) {
    console.error("Get unread count error:", error);
    res.status(500).json({ message: "Failed to fetch unread count" });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json({ 
      message: "Notification marked as read",
      notification 
    });
  } catch (error) {
    console.error("Mark as read error:", error);
    res.status(500).json({ message: "Failed to mark notification as read" });
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.status(200).json({ 
      message: "All notifications marked as read",
      modifiedCount: result.modifiedCount 
    });
  } catch (error) {
    console.error("Mark all as read error:", error);
    res.status(500).json({ message: "Failed to mark all notifications as read" });
  }
};

// Delete notification
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOneAndDelete({
      _id: id,
      userId: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Delete notification error:", error);
    res.status(500).json({ message: "Failed to delete notification" });
  }
};

// Create notification (Admin/System)
const createNotification = async (req, res) => {
  try {
    const { 
      userId, 
      userIds, 
      title, 
      message, 
      type, 
      priority, 
      category, 
      link, 
      metadata,
      expiresAt,
      sendToAll 
    } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: "Title and message are required" });
    }

    let targetUserIds = [];

    if (sendToAll) {
      const users = await User.find({ isActive: true }).select("_id");
      targetUserIds = users.map(u => u._id);
    } else if (userIds && Array.isArray(userIds)) {
      targetUserIds = userIds;
    } else if (userId) {
      targetUserIds = [userId];
    } else {
      return res.status(400).json({ 
        message: "Please specify userId, userIds array, or sendToAll flag" 
      });
    }

    const notifications = targetUserIds.map(uid => ({
      userId: uid,
      title,
      message,
      type: type || "INFO",
      priority: priority || "MEDIUM",
      category: category || "GENERAL",
      link,
      metadata,
      expiresAt,
      createdBy: req.user._id,
    }));

    const created = await Notification.insertMany(notifications);

    res.status(201).json({ 
      message: "Notifications created successfully",
      count: created.length,
      notifications: created 
    });
  } catch (error) {
    console.error("Create notification error:", error);
    res.status(500).json({ message: "Failed to create notification" });
  }
};

// Delete all read notifications
const deleteAllRead = async (req, res) => {
  try {
    const result = await Notification.deleteMany({
      userId: req.user._id,
      isRead: true,
    });

    res.status(200).json({ 
      message: "All read notifications deleted",
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    console.error("Delete all read error:", error);
    res.status(500).json({ message: "Failed to delete read notifications" });
  }
};

module.exports = {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
  deleteAllRead,
};
