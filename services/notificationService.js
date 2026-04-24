const Notification = require("../models/Notification");
const User = require("../models/User");

/**
 * Send notification to a single user
 */
const sendNotificationToUser = async (userId, notificationData) => {
  try {
    const notification = await Notification.create({
      userId,
      ...notificationData,
    });
    return notification;
  } catch (error) {
    console.error("Send notification error:", error);
    throw error;
  }
};

/**
 * Send notification to multiple users
 */
const sendNotificationToUsers = async (userIds, notificationData) => {
  try {
    const notifications = userIds.map(userId => ({
      userId,
      ...notificationData,
    }));
    
    const created = await Notification.insertMany(notifications);
    return created;
  } catch (error) {
    console.error("Send notifications error:", error);
    throw error;
  }
};

/**
 * Send notification to all users
 */
const sendNotificationToAll = async (notificationData, filters = {}) => {
  try {
    const query = { isActive: true, ...filters };
    const users = await User.find(query).select("_id");
    const userIds = users.map(u => u._id);
    
    return await sendNotificationToUsers(userIds, notificationData);
  } catch (error) {
    console.error("Send notification to all error:", error);
    throw error;
  }
};

/**
 * Send notification to users by role
 */
const sendNotificationByRole = async (roles, notificationData) => {
  try {
    const users = await User.find({ 
      role: { $in: roles },
      isActive: true 
    }).select("_id");
    
    const userIds = users.map(u => u._id);
    return await sendNotificationToUsers(userIds, notificationData);
  } catch (error) {
    console.error("Send notification by role error:", error);
    throw error;
  }
};

/**
 * Send welcome notification to new user
 */
const sendWelcomeNotification = async (userId) => {
  return await sendNotificationToUser(userId, {
    title: "Welcome to Smart Campus Hub!",
    message: "Thank you for joining us. Explore the platform and discover all the features we offer.",
    type: "SUCCESS",
    priority: "MEDIUM",
    category: "ACCOUNT",
  });
};

/**
 * Send security notification
 */
const sendSecurityNotification = async (userId, message) => {
  return await sendNotificationToUser(userId, {
    title: "Security Alert",
    message,
    type: "WARNING",
    priority: "HIGH",
    category: "SECURITY",
  });
};

/**
 * Send system announcement
 */
const sendSystemAnnouncement = async (title, message, priority = "MEDIUM") => {
  return await sendNotificationToAll({
    title,
    message,
    type: "SYSTEM",
    priority,
    category: "ANNOUNCEMENT",
  });
};

/**
 * Clean up expired notifications
 */
const cleanupExpiredNotifications = async () => {
  try {
    const result = await Notification.deleteMany({
      expiresAt: { $lt: new Date() },
    });
    console.log(`Cleaned up ${result.deletedCount} expired notifications`);
    return result.deletedCount;
  } catch (error) {
    console.error("Cleanup expired notifications error:", error);
    throw error;
  }
};

/**
 * Clean up old read notifications (older than 30 days)
 */
const cleanupOldReadNotifications = async (daysOld = 30) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    const result = await Notification.deleteMany({
      isRead: true,
      readAt: { $lt: cutoffDate },
    });
    
    console.log(`Cleaned up ${result.deletedCount} old read notifications`);
    return result.deletedCount;
  } catch (error) {
    console.error("Cleanup old read notifications error:", error);
    throw error;
  }
};

module.exports = {
  sendNotificationToUser,
  sendNotificationToUsers,
  sendNotificationToAll,
  sendNotificationByRole,
  sendWelcomeNotification,
  sendSecurityNotification,
  sendSystemAnnouncement,
  cleanupExpiredNotifications,
  cleanupOldReadNotifications,
};
