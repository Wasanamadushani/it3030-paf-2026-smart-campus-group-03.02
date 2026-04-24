require("dotenv").config();
const mongoose = require("mongoose");
const Role = require("../models/Role");

const defaultRoles = [
  {
    name: "ADMIN",
    displayName: "Administrator",
    description: "Full system access with all permissions",
    permissions: [
      "READ_USERS",
      "WRITE_USERS",
      "DELETE_USERS",
      "MANAGE_ROLES",
      "READ_NOTIFICATIONS",
      "WRITE_NOTIFICATIONS",
      "DELETE_NOTIFICATIONS",
      "MANAGE_SYSTEM",
    ],
    isSystem: true,
  },
  {
    name: "MANAGER",
    displayName: "Manager",
    description: "Can manage users and view system data",
    permissions: [
      "READ_USERS",
      "WRITE_USERS",
      "READ_NOTIFICATIONS",
      "WRITE_NOTIFICATIONS",
    ],
    isSystem: true,
  },
  {
    name: "STAFF",
    displayName: "Staff Member",
    description: "Can send notifications and view basic user data",
    permissions: [
      "READ_USERS",
      "READ_NOTIFICATIONS",
      "WRITE_NOTIFICATIONS",
    ],
    isSystem: true,
  },
  {
    name: "CUSTOMER",
    displayName: "Customer",
    description: "Standard user with basic access",
    permissions: [
      "READ_NOTIFICATIONS",
    ],
    isSystem: true,
  },
];

const seedRoles = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");

    // Clear existing roles
    await Role.deleteMany({ isSystem: true });
    console.log("Cleared existing system roles");

    // Insert default roles
    const roles = await Role.insertMany(defaultRoles);
    console.log(`Seeded ${roles.length} roles successfully`);

    roles.forEach(role => {
      console.log(`- ${role.displayName} (${role.name}): ${role.permissions.length} permissions`);
    });

    process.exit(0);
  } catch (error) {
    console.error("Seed roles error:", error);
    process.exit(1);
  }
};

seedRoles();
