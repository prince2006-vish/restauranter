import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import Admin from "../models/Admin.js";

dotenv.config();

const createAdmin = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from environment variables");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const username = "admin";
    const email = "admin@meethapani.com";

    const existingAdmin = await Admin.findOne({
      $or: [{ username }, { email }],
    });

    if (existingAdmin) {
      console.log("An admin with this username or email already exists.");
      console.log("No account was changed.");
      return;
    }

    const password = process.env.INITIAL_ADMIN_PASSWORD;

    if (!password || password.length < 12) {
      throw new Error(
        "Set INITIAL_ADMIN_PASSWORD to a strong password of at least 12 characters",
      );
    }

    await Admin.create({
      username,
      email,
      password,
      fullName: "Meetha Pani General Manager",
      role: "superadmin",
    });

    console.log("Admin account created successfully.");
    console.log("Username: admin");
    console.log("Email: admin@meethapani.com");
    console.log("Use the password you set in INITIAL_ADMIN_PASSWORD.");
  } catch (error) {
    console.error("Admin creation failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
};

createAdmin();
