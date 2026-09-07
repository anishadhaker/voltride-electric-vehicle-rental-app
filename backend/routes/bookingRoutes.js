import express from "express";
import {
  cancelBooking,
  createBooking,
  getBookingById,
  getBookings,
  getMyBookings,
  getMyStats,
  updatePaymentStatus,
} from "../controllers/bookingController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Authenticated user's personal bookings
router.get("/my-bookings", protect, getMyBookings);
router.get("/my-stats", protect, getMyStats);

// General bookings collection route
router
  .route("/")
  .get(protect, getBookings)
  .post(protect, createBooking);

router.put("/:id/cancel", protect, cancelBooking);
router.put("/:id/payment-status", protect, updatePaymentStatus);

// Single booking by ID
router.route("/:id").get(protect, getBookingById);

export default router;
