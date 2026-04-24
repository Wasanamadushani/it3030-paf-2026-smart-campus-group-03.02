const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["INFO", "SUCCESS", "WARNING", "ERROR", "SYSTEM"],
    default: "INFO",
  },
  priority: {
    type: String,
    enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
    default: "MEDIUM",
  },
  category: {
    type: String,
    enum: ["GENERAL", "ACCOUNT", "SECURITY", "SYSTEM", "ANNOUNCEMENT", "REMINDER"],
    default: "GENERAL",
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true,
  },
  readAt: Date,
  link: String,
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
  },
  expiresAt: Date,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Notification", notificationSchema);
