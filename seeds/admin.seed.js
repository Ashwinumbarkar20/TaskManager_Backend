const dotenv = require("dotenv");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/user.model");

dotenv.config();

const seedAdmin = async () => {
  try {
    const adminName = process.env.ADMIN_NAME || "Super Admin";
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.error("ADMIN_EMAIL and ADMIN_PASSWORD are required in .env");
      process.exit(1);
    }

    await connectDB();

    const existingUser = await User.findOne({ email: adminEmail.toLowerCase() });

    if (!existingUser) {
      await User.create({
        name: adminName,
        email: adminEmail.toLowerCase(),
        password: adminPassword,
        role: "admin",
        isActive: true,
      });
      console.log("Admin user created successfully.");
    } else {
      existingUser.name = adminName;
      existingUser.role = "admin";
      existingUser.isActive = true;
      existingUser.password = adminPassword;
      await existingUser.save();
      console.log("Existing user promoted/updated as admin successfully.");
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Admin seed failed:", error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedAdmin();
