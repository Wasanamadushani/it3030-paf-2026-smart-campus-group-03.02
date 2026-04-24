const User = require("../models/User");
const Role = require("../models/Role");

// Get all users with pagination and filters
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, isActive, search } = req.query;
    
    const filter = {};
    
    if (role) {
      filter.role = role.toUpperCase();
    }
    
    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(filter)
      .select("-passwordHash -googleId")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await User.countDocuments(filter);

    res.status(200).json({
      users,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalUsers: count,
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select("-passwordHash -googleId");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({ message: "Failed to fetch user" });
  }
};

// Update user role
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ["CUSTOMER", "ADMIN", "STAFF", "MANAGER"];
    
    if (!role || !validRoles.includes(role.toUpperCase())) {
      return res.status(400).json({ 
        message: "Invalid role",
        validRoles 
      });
    }

    // Prevent users from changing their own role
    if (req.user._id.toString() === id) {
      return res.status(403).json({ 
        message: "You cannot change your own role" 
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role: role.toUpperCase() },
      { new: true }
    ).select("-passwordHash -googleId");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ 
      message: "User role updated successfully",
      user 
    });
  } catch (error) {
    console.error("Update user role error:", error);
    res.status(500).json({ message: "Failed to update user role" });
  }
};

// Update user permissions
const updateUserPermissions = async (req, res) => {
  try {
    const { id } = req.params;
    const { permissions } = req.body;

    if (!Array.isArray(permissions)) {
      return res.status(400).json({ message: "Permissions must be an array" });
    }

    const validPermissions = [
      "READ_USERS",
      "WRITE_USERS",
      "DELETE_USERS",
      "MANAGE_ROLES",
      "READ_NOTIFICATIONS",
      "WRITE_NOTIFICATIONS",
      "DELETE_NOTIFICATIONS",
      "MANAGE_SYSTEM",
    ];

    const invalidPermissions = permissions.filter(p => !validPermissions.includes(p));
    
    if (invalidPermissions.length > 0) {
      return res.status(400).json({ 
        message: "Invalid permissions",
        invalidPermissions,
        validPermissions 
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { permissions },
      { new: true }
    ).select("-passwordHash -googleId");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ 
      message: "User permissions updated successfully",
      user 
    });
  } catch (error) {
    console.error("Update user permissions error:", error);
    res.status(500).json({ message: "Failed to update user permissions" });
  }
};

// Toggle user active status
const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent users from deactivating themselves
    if (req.user._id.toString() === id) {
      return res.status(403).json({ 
        message: "You cannot deactivate your own account" 
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({ 
      message: `User ${user.isActive ? "activated" : "deactivated"} successfully`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
      }
    });
  } catch (error) {
    console.error("Toggle user status error:", error);
    res.status(500).json({ message: "Failed to toggle user status" });
  }
};

// Get current user profile
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-passwordHash -googleId");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ message: "Failed to fetch user profile" });
  }
};

// Get role statistics
const getRoleStatistics = async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          role: "$_id",
          count: 1,
          _id: 0,
        },
      },
    ]);

    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const inactiveUsers = await User.countDocuments({ isActive: false });

    res.status(200).json({
      roleDistribution: stats,
      totalUsers,
      activeUsers,
      inactiveUsers,
    });
  } catch (error) {
    console.error("Get role statistics error:", error);
    res.status(500).json({ message: "Failed to fetch role statistics" });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUserRole,
  updateUserPermissions,
  toggleUserStatus,
  getCurrentUser,
  getRoleStatistics,
};
