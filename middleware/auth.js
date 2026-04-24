const User = require("../models/User");

// Check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: "Authentication required" });
};

// Check if user has specific role
const hasRole = (...roles) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (roles.includes(req.user.role)) {
      return next();
    }

    return res.status(403).json({ 
      message: "Access denied. Insufficient permissions.",
      requiredRole: roles,
      userRole: req.user.role,
    });
  };
};

// Check if user has specific permission
const hasPermission = (...permissions) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const userPermissions = req.user.permissions || [];
    const hasRequiredPermission = permissions.some(permission => 
      userPermissions.includes(permission)
    );

    if (hasRequiredPermission || req.user.role === "ADMIN") {
      return next();
    }

    return res.status(403).json({ 
      message: "Access denied. Insufficient permissions.",
      requiredPermissions: permissions,
      userPermissions,
    });
  };
};

// Check if user is active
const isActive = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }

  if (req.user.isActive) {
    return next();
  }

  return res.status(403).json({ 
    message: "Account is inactive. Please contact support.",
  });
};

module.exports = {
  isAuthenticated,
  hasRole,
  hasPermission,
  isActive,
};
