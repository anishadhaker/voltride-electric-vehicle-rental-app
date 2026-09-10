import assert from "node:assert/strict";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, ".env") });

import User from "./models/User.js";
import { isMongoConnected, memoryStore } from "./config/memoryStore.js";
import { generateToken } from "./utils/generateToken.js";
import { getUserProfile, updateUserProfile } from "./controllers/userController.js";
import { registerUser, loginUser, getCurrentUser } from "./controllers/authController.js";

async function runProfileTests() {
  console.log("=== STARTING VOLTRIDE PROFILE UPDATE TEST SUITE ===");

  const mongoUri = process.env.MONGODB_URI;
  let mongoActive = false;
  if (mongoUri) {
    try {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
      mongoActive = true;
      console.log("Connected to MongoDB Atlas.");
    } catch (err) {
      console.warn("MongoDB Atlas connection timed out, running tests against memoryStore:", err.message);
    }
  }

  const stamp = Date.now();
  const testUserData = {
    name: "Profile Test User",
    email: `profiletest_${stamp}@example.com`,
    mobile: `9199${String(stamp).slice(-6)}`,
    password: "Password@123",
  };

  // Helper to create mock res
  const mockResponse = () => {
    const res = {
      statusCode: 200,
      jsonData: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(data) {
        this.jsonData = data;
        return this;
      },
    };
    return res;
  };

  // Helper next
  const mockNext = (err) => {
    if (err) throw err;
  };

  try {
    // TEST 1: Register user without DOB/Address
    console.log("\n--- TEST 1: Register User (No DOB/Address Provided) ---");
    const regReq = { body: testUserData };
    const regRes = mockResponse();
    await registerUser(regReq, regRes, mockNext);

    assert.equal(regRes.statusCode, 201, "Registration failed");
    assert.equal(regRes.jsonData.success, true);
    assert.equal(regRes.jsonData.user.dob, "", "Registration must default DOB to empty string");
    assert.equal(regRes.jsonData.user.address, "", "Registration must default address to empty string");
    console.log("PASS: Registration user payload contains blank DOB and address (no fake defaults)");

    const userId = regRes.jsonData.user.id;
    const token = regRes.jsonData.token;

    // TEST 2: Login user -> verify DOB/Address not auto-filled
    console.log("\n--- TEST 2: Login User (Ensure DOB/Address Not Auto-filled) ---");
    const loginReq = {
      body: {
        identifier: testUserData.email,
        password: testUserData.password,
      },
    };
    const loginRes = mockResponse();
    await loginUser(loginReq, loginRes, mockNext);

    assert.equal(loginRes.statusCode, 200, "Login failed");
    assert.equal(loginRes.jsonData.user.dob, "", "Login user must have blank DOB");
    assert.equal(loginRes.jsonData.user.address, "", "Login user must have blank address");
    console.log("PASS: Login payload contains blank DOB and address without automatic filling");

    // TEST 3: getCurrentUser (/api/auth/me)
    console.log("\n--- TEST 3: getCurrentUser (/api/auth/me) ---");
    const meReq = { user: { _id: userId, role: "customer" } };
    const meRes = mockResponse();
    await getCurrentUser(meReq, meRes, mockNext);

    assert.equal(meRes.statusCode, 200);
    assert.equal(meRes.jsonData.data.dob, "");
    assert.equal(meRes.jsonData.data.address, "");
    console.log("PASS: /api/auth/me returns blank DOB and address");

    // TEST 4: getUserProfile (/api/users/profile)
    console.log("\n--- TEST 4: getUserProfile (/api/users/profile) ---");
    const profReq = { user: { _id: userId, role: "customer" } };
    const profRes = mockResponse();
    await getUserProfile(profReq, profRes, mockNext);

    assert.equal(profRes.statusCode, 200);
    assert.equal(profRes.jsonData.data.dob, "");
    assert.equal(profRes.jsonData.data.address, "");
    console.log("PASS: getUserProfile returns blank DOB and address");

    // TEST 5: updateUserProfile with DOB, Address, and Profile Photo
    console.log("\n--- TEST 5: updateUserProfile with DOB, Address, and Profile Image ---");
    const updateReq = {
      user: { _id: userId, role: "customer" },
      body: {
        name: "Updated Rider Name",
        mobile: `9198${String(stamp).slice(-6)}`,
        email: `updated_${stamp}@example.com`,
        dob: "1999-07-25",
        address: "742 Evergreen Terrace, Springfield",
        profileImage: "https://images.unsplash.com/photo-test-rider.jpg",
      },
    };
    const updateRes = mockResponse();
    await updateUserProfile(updateReq, updateRes, mockNext);

    assert.equal(updateRes.statusCode, 200, "Profile update failed: " + JSON.stringify(updateRes.jsonData));
    assert.equal(updateRes.jsonData.success, true);
    assert.equal(updateRes.jsonData.data.name, "Updated Rider Name");
    assert.equal(updateRes.jsonData.data.dob, "1999-07-25");
    assert.equal(updateRes.jsonData.data.address, "742 Evergreen Terrace, Springfield");
    assert.equal(updateRes.jsonData.data.profileImage, "https://images.unsplash.com/photo-test-rider.jpg");
    console.log("PASS: updateUserProfile successfully updated DOB, address, and profile photo");

    // TEST 6: Verify persistent retrieval in getUserProfile
    console.log("\n--- TEST 6: Fetch Profile to Verify Persistence ---");
    const verifyReq = { user: { _id: userId, role: "customer" } };
    const verifyRes = mockResponse();
    await getUserProfile(verifyReq, verifyRes, mockNext);

    assert.equal(verifyRes.statusCode, 200);
    assert.equal(verifyRes.jsonData.data.dob, "1999-07-25");
    assert.equal(verifyRes.jsonData.data.address, "742 Evergreen Terrace, Springfield");
    assert.equal(verifyRes.jsonData.data.profileImage, "https://images.unsplash.com/photo-test-rider.jpg");
    console.log("PASS: Verified persistent storage of DOB and address");

    // TEST 7: Allow clearing DOB and Address (optional fields)
    console.log("\n--- TEST 7: Clear Optional DOB and Address ---");
    const clearReq = {
      user: { _id: userId, role: "customer" },
      body: {
        dob: "",
        address: "",
      },
    };
    const clearRes = mockResponse();
    await updateUserProfile(clearReq, clearRes, mockNext);

    assert.equal(clearRes.statusCode, 200);
    assert.equal(clearRes.jsonData.data.dob, "");
    assert.equal(clearRes.jsonData.data.address, "");
    console.log("PASS: Optional DOB and address can be cleared to blank without validation error");

    // TEST 8: Security - ensure only logged-in user can update their profile
    console.log("\n--- TEST 8: Security - Profile Update is scoped to authenticated req.user._id ---");
    // updateUserProfile uses req.user._id exclusively from JWT auth middleware, never a client-supplied user ID in req.body
    const attackerReq = {
      user: { _id: userId, role: "customer" },
      body: {
        id: "another_user_id_12345",
        name: "Security Scope Test",
      },
    };
    const attackerRes = mockResponse();
    await updateUserProfile(attackerReq, attackerRes, mockNext);
    assert.equal(attackerRes.jsonData.data.id.toString(), userId.toString());
    console.log("PASS: Security verified - profile updates are strictly isolated to req.user._id");

    // Cleanup test user if mongo connected
    if (mongoActive) {
      await User.deleteOne({ _id: userId });
      await User.deleteOne({ email: testUserData.email });
      await User.deleteOne({ email: `updated_${stamp}@example.com` });
      console.log("\nCleaned up test user record from MongoDB.");
    }

    console.log("\n==================================================");
    console.log("ALL 8 BACKEND PROFILE TESTS PASSED SUCCESSFULLY!");
    console.log("==================================================");
  } finally {
    if (mongoActive) {
      await mongoose.disconnect();
    }
  }
}

runProfileTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
