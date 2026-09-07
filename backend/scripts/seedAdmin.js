import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/User.js";

dotenv.config();

const required = ["ADMIN_NAME", "ADMIN_EMAIL", "ADMIN_MOBILE", "ADMIN_PASSWORD"];
const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(`Missing required environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

const seedAdmin = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is required to seed an admin account.");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    const email = process.env.ADMIN_EMAIL.trim().toLowerCase();
    const mobile = process.env.ADMIN_MOBILE.trim();
    const existing = await User.findOne({ $or: [{ email }, { mobile }] });

    if (existing) {
      if (existing.role !== "admin") {
        throw new Error(`An existing customer already uses ${existing.email || existing.mobile}. Choose unused admin identifiers.`);
      } else {
        console.log(`Admin account already exists: ${existing.email}`);
      }
      return;
    }

    await User.create({
      name: process.env.ADMIN_NAME.trim(),
      email,
      mobile,
      password: process.env.ADMIN_PASSWORD,
      role: "admin",
    });
    console.log(`Admin account created successfully: ${email}`);
  } catch (error) {
    console.error(`Admin seed failed: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedAdmin();
