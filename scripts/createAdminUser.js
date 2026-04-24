require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const createAdminUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");

    const adminEmail = process.argv[2] || "admin@smartcampus.com";
    const adminPassword = process.argv[3] || "Admin@123456";
    const adminName = process.argv[4] || "System Administrator";

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log(`Admin user with email ${adminEmail} already exists`);
      
      // Update to admin role if not already
      if (existingAdmin.role !== "ADMIN") {
        existingAdmin.role = "ADMIN";
        existingAdmin.permissions = [
          "READ_USERS",
          "WRITE_USERS",
          "DELETE_USERS",
          "MANAGE_ROLES",
          "READ_NOTIFICATIONS",
          "WRITE_NOTIFICATIONS",
          "DELETE_NOTIFICATIONS",
          "MANAGE_SYSTEM",
        ];
        await existingAdmin.save();
        console.log("Updated existing user to ADMIN role");
      }
      
      process.exit(0);
    }

    // Create new admin user
    const passwordHash = await bcrypt.hash(adminPassword, 12);

    const admin = await User.create({
      name: adminName,
      email: adminEmail,
      passwordHash,
      role: "ADMIN",
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
      isActive: true,
    });

    console.log("\n✅ Admin user created successfully!");
    console.log("-----------------------------------");
    console.log(`Email: ${admin.email}`);
    console.log(`Password: ${adminPassword}`);
    console.log(`Role: ${admin.role}`);
    console.log(`Permissions: ${admin.permissions.length}`);
    console.log("-----------------------------------");
    console.log("\n⚠️  Please change the password after first login!");

    process.exit(0);
  } catch (error) {
    console.error("Create admin user error:", error);
    process.exit(1);
  }
};

createAdminUser();
