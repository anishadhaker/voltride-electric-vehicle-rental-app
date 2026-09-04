import express from "express";
import {
  createBooking,
  getBookingById,
  getBookings,
} from "../controllers/bookingController.js";

const router = express.Router();

router.route("/").get(getBookings).post(createBooking);
router.route("/:id").get(getBookingById);

export default router;
