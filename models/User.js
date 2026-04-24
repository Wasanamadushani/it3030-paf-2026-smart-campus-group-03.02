const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  googleId: String,
  name: String,
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  profilePic: String,
  passwordHash: {
    type: String,
    default: null,
  },
  role: {
    type: String,
    enum: ["CUSTOMER", "ADMIN", "STAFF", "MANAGER"],
    default: "CUSTOMER",
  },
  permissions: [{
    type: String,
    enum: [
      "READ_USERS",
      "WRITE_USERS",
      "DELETE_USERS",
      "MANAGE_ROLES",
      "READ_NOTIFICATIONS",
      "WRITE_NOTIFICATIONS",
      "DELETE_NOTIFICATIONS",
      "MANAGE_SYSTEM",
    ],
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: Date,
}, {
  timestamps: true,
});

module.exports = mongoose.model("User", userSchema);
