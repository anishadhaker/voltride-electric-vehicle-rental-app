import express from "express";
import {
	forgotPassword,
	getCurrentUser,
	loginUser,
	registerUser,
	resetPassword,
	verifyResetOtp,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { passwordResetRateLimit } from "../middleware/passwordResetRateLimit.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", passwordResetRateLimit, forgotPassword);
router.post("/verify-reset-otp", passwordResetRateLimit, verifyResetOtp);
router.post("/reset-password", passwordResetRateLimit, resetPassword);
router.get("/me", protect, getCurrentUser);

export default router;
