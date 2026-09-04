import express from "express";
import {
  changeUserPassword,
  getUserProfile,
  getUsers,
  updateUserProfile,
} from "../controllers/userController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// User profile routes (protected)
router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// Change password route (protected)
router.put("/change-password", protect, changeUserPassword);

// Admin user listing route
router.route("/").get(protect, authorizeRoles("admin"), getUsers);

export default router;
