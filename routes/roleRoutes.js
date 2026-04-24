const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUserRole,
  updateUserPermissions,
  toggleUserStatus,
  getCurrentUser,
  getRoleStatistics,
} = require("../controllers/roleController");
const { isAuthenticated, hasRole, hasPermission, isActive } = require("../middleware/auth");

// Get current user profile
router.get("/me", isAuthenticated, isActive, getCurrentUser);

// Get all users (Admin/Manager only)
router.get("/users", isAuthenticated, isActive, hasRole("ADMIN", "MANAGER"), getAllUsers);

// Get role statistics (Admin only)
router.get("/statistics", isAuthenticated, isActive, hasRole("ADMIN"), getRoleStatistics);

// Get user by ID (Admin/Manager only)
router.get("/users/:id", isAuthenticated, isActive, hasRole("ADMIN", "MANAGER"), getUserById);

// Update user role (Admin only)
router.put("/users/:id/role", isAuthenticated, isActive, hasRole("ADMIN"), updateUserRole);

// Update user permissions (Admin only)
router.put("/users/:id/permissions", isAuthenticated, isActive, hasRole("ADMIN"), updateUserPermissions);

// Toggle user active status (Admin only)
router.patch("/users/:id/toggle-status", isAuthenticated, isActive, hasRole("ADMIN"), toggleUserStatus);

module.exports = router;
