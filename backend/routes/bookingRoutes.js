import express from "express";
import {
  createBooking,
  getBookingById,
  getBookings,
  getMyBookings,
} from "../controllers/bookingController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Authenticated user's personal bookings
router.get("/my-bookings", protect, getMyBookings);

// General bookings collection route
router
  .route("/")
  .get(protect, getBookings)
  .post(protect, createBooking);

// Single booking by ID
router.route("/:id").get(protect, getBookingById);

export default router;
