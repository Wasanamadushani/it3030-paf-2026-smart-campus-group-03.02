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
});

module.exports = mongoose.model("User", userSchema);
