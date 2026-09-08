import Booking from "../models/Booking.js";
import Vehicle from "../models/Vehicle.js";
import { isMongoConnected, memoryStore } from "../config/memoryStore.js";
import { isVehicleBookingAllowed } from "../utils/bookingAvailability.js";
import { findVehicleByIdentifier } from "../utils/vehicleIdentifier.js";

const bookingTotal = (booking) =>
  (Number(booking.rentalPrice) || 0) +
  (Number(booking.serviceFee) || 0) +
  (Number(booking.taxes) || 0);

// @desc    Get all bookings (Admin or general listing)
// @route   GET /api/bookings
// @access  Private/Admin
export const getBookings = async (req, res, next) => {
  try {
    const { status, bookingId } = req.query;
    const filter = {};

    if (status) filter.bookingStatus = status;
    if (bookingId) filter.bookingId = bookingId.toUpperCase();

    // If regular customer, restrict to their own bookings
    if (req.user && req.user.role !== "admin") {
      filter.user = req.user._id;
    }

    const bookings = isMongoConnected()
      ? await Booking.find(filter)
          .populate("vehicle")
          .populate("user", "name email mobile role")
          .sort({ createdAt: -1 })
      : await memoryStore.bookings.find(filter);

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get bookings of the currently logged-in user
// @route   GET /api/bookings/my-bookings
// @access  Private
export const getMyBookings = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = { user: req.user._id };

    if (status) {
      filter.bookingStatus = status;
    }

    const bookings = isMongoConnected()
      ? await Booking.find(filter)
          .populate("vehicle")
          .sort({ createdAt: -1 })
      : await memoryStore.bookings.find(filter);

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyStats = async (req, res, next) => {
  try {
    const bookings = isMongoConnected()
      ? await Booking.find({ user: req.user._id }).select("bookingStatus totalAmount duration")
      : await memoryStore.bookings.find({ user: req.user._id });

    const stats = {
      totalRides: bookings.length,
      upcomingRides: bookings.filter((booking) => booking.bookingStatus === "Upcoming").length,
      activeRides: bookings.filter((booking) => booking.bookingStatus === "Active").length,
      completedRides: bookings.filter((booking) => booking.bookingStatus === "Completed").length,
      cancelledRides: bookings.filter((booking) => booking.bookingStatus === "Cancelled").length,
      totalAmountSpent: bookings
        .filter((booking) => booking.bookingStatus !== "Cancelled")
        .reduce((total, booking) => total + bookingTotal(booking), 0),
    };

    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single booking by MongoDB ID or bookingId
// @route   GET /api/bookings/:id
// @access  Private/Public (ownership checked if authenticated)
export const getBookingById = async (req, res, next) => {
  try {
    const param = req.params.id;
    let booking;

    if (isMongoConnected()) {
      if (param.match(/^[0-9a-fA-F]{24}$/)) {
        booking = await Booking.findById(param)
          .populate("vehicle")
          .populate("user", "name email mobile");
      } else {
        booking = await Booking.findOne({ bookingId: param.toUpperCase() })
          .populate("vehicle")
          .populate("user", "name email mobile");
      }
    } else {
      booking = await memoryStore.bookings.findById(param);
    }

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `Booking not found with identifier ${param}`,
      });
    }

    // Ownership check: if authenticated customer, cannot view other users' bookings
    if (
      req.user &&
      req.user.role !== "admin" &&
      (!booking.user || (booking.user._id || booking.user).toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this booking",
      });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

export const checkVehicleAvailability = async (req, res, next) => {
  try {
    const { pickupDateTime, returnDateTime } = req.body;
    const vehicleId = req.params.id;

    if (!pickupDateTime || !returnDateTime) {
      return res.status(400).json({
        success: false,
        message: "Pickup and return date/times are required.",
      });
    }

    const pickup = new Date(pickupDateTime);
    const returnTime = new Date(returnDateTime);

    if (Number.isNaN(pickup.getTime()) || Number.isNaN(returnTime.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid pickup or return date/time format.",
      });
    }

    if (returnTime <= pickup) {
      return res.status(400).json({
        success: false,
        message: "Return date/time must be later than pickup date/time.",
      });
    }

    const vehicleDoc = isMongoConnected()
      ? await findVehicleByIdentifier(Vehicle, vehicleId)
      : await memoryStore.vehicles.findById(vehicleId);

    if (!vehicleDoc) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found.",
      });
    }

    const overlappingBookings = isMongoConnected()
      ? await Booking.find({
          vehicle: vehicleDoc._id,
          bookingStatus: { $in: ["Upcoming", "Active"] },
        })
      : await memoryStore.bookings.find({
          vehicle: vehicleDoc._id,
          bookingStatus: { $in: ["Upcoming", "Active"] },
        });

    const availability = isVehicleBookingAllowed(
      vehicleDoc,
      overlappingBookings,
      pickup,
      returnTime
    );

    return res.status(200).json({
      success: true,
      available: availability.allowed,
      message: availability.message,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new booking (attached to authenticated user)
// @route   POST /api/bookings
// @access  Private
export const createBooking = async (req, res, next) => {
  try {
    const {
      vehicle,
      pickupLocation,
      pickupDateTime,
      returnDateTime,
    } = req.body;

    const targetVehicleId = vehicle || req.body.vehicleId;

    if (!targetVehicleId) {
      return res.status(400).json({
        success: false,
        message: "Vehicle ID is required to create a booking",
      });
    }

    const vehicleDoc = isMongoConnected()
      ? await findVehicleByIdentifier(Vehicle, targetVehicleId)
      : await memoryStore.vehicles.findById(targetVehicleId);

    if (!vehicleDoc) {
      return res.status(404).json({
        success: false,
        message: "Referenced vehicle does not exist",
      });
    }

    const start = new Date(pickupDateTime);
    const end = new Date(returnDateTime);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid pickup or return date/time format",
      });
    }

    if (end <= start) {
      return res.status(400).json({
        success: false,
        message: "Return date/time must be strictly after pickup date/time",
      });
    }

    const existingBookings = isMongoConnected()
      ? await Booking.find({
          vehicle: vehicleDoc._id,
          bookingStatus: { $in: ["Upcoming", "Active"] },
        })
      : await memoryStore.bookings.find({
          vehicle: vehicleDoc._id,
          bookingStatus: { $in: ["Upcoming", "Active"] },
        });

    const availability = isVehicleBookingAllowed(vehicleDoc, existingBookings, start, end);
    if (!availability.allowed) {
      return res.status(409).json({
        success: false,
        message: availability.message,
      });
    }

    const calculatedDuration = Math.ceil((end - start) / (1000 * 60 * 60));
    const calculatedRentalPrice = calculatedDuration * vehicleDoc.pricePerHour;
    const calculatedServiceFee = 10;
    const calculatedTaxes = Math.round(calculatedRentalPrice * 0.05);
    const calculatedTotal =
      calculatedRentalPrice +
      calculatedServiceFee +
      calculatedTaxes;

    let bookingId = req.body.bookingId;
    if (!bookingId) {
      bookingId = `VR-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    }

    const assignedUser = req.user._id;
    if (!assignedUser) {
      return res.status(401).json({
        success: false,
        message: "Authentication required to create a booking.",
      });
    }

    if (isMongoConnected()) {
      const newBooking = await Booking.create({
        bookingId,
        user: assignedUser,
        vehicle: vehicleDoc._id,
        pickupLocation: pickupLocation || vehicleDoc.location,
        pickupDateTime: start,
        returnDateTime: end,
        duration: calculatedDuration,
        rentalPrice: calculatedRentalPrice,
        serviceFee: calculatedServiceFee,
        taxes: calculatedTaxes,
        totalAmount: calculatedTotal,
        bookingStatus: "Upcoming",
        paymentStatus: "Pending",
      });

      const populated = await Booking.findById(newBooking._id)
        .populate("vehicle")
        .populate("user", "name email mobile");

      return res.status(201).json({
        success: true,
        message: "Booking created successfully",
        data: populated,
      });
    }

    const newBooking = await memoryStore.bookings.create({
      bookingId,
      user: assignedUser,
      vehicle: vehicleDoc,
      pickupLocation: pickupLocation || vehicleDoc.location,
      pickupDateTime: start,
      returnDateTime: end,
      duration: calculatedDuration,
      rentalPrice: calculatedRentalPrice,
      serviceFee: calculatedServiceFee,
      taxes: calculatedTaxes,
      totalAmount: calculatedTotal,
      bookingStatus: "Upcoming",
      paymentStatus: "Pending",
    });

    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: newBooking,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (req, res, next) => {
  try {
    const param = req.params.id;
    let booking;

    if (isMongoConnected()) {
      booking = param.match(/^[0-9a-fA-F]{24}$/)
        ? await Booking.findById(param).populate("vehicle").populate("user", "name email mobile")
        : await Booking.findOne({ bookingId: param.toUpperCase() }).populate("vehicle").populate("user", "name email mobile");
    } else {
      booking = await memoryStore.bookings.findById(param);
    }

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `Booking not found with identifier ${param}`,
      });
    }

    const bookingOwnerId = booking.user && (booking.user._id || booking.user).toString();
    if (req.user && req.user.role !== "admin" && bookingOwnerId !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only cancel your own booking.",
      });
    }

    if (booking.bookingStatus === "Completed") {
      return res.status(400).json({
        success: false,
        message: "Completed bookings cannot be cancelled.",
      });
    }

    if (booking.bookingStatus !== "Upcoming") {
      return res.status(400).json({
        success: false,
        message: `Bookings with status ${booking.bookingStatus} cannot be cancelled.`,
      });
    }

    if (booking.bookingStatus === "Cancelled") {
      return res.status(400).json({
        success: false,
        message: "This booking is already cancelled.",
      });
    }

    if (isMongoConnected()) {
      booking.bookingStatus = "Cancelled";
      await booking.save();
      return res.status(200).json({
        success: true,
        message: "Booking cancelled successfully.",
        data: booking,
      });
    }

    const updatedBooking = await memoryStore.bookings.update(booking._id, {
      bookingStatus: "Cancelled",
    });

    return res.status(200).json({
      success: true,
      message: "Booking cancelled successfully.",
      data: updatedBooking,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePaymentStatus = async (req, res, next) => {
  try {
    const { paymentStatus } = req.body;
    const param = req.params.id;
    let booking;

    if (!["Paid"].includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: "Only Pending to Paid payment updates are supported.",
      });
    }

    if (isMongoConnected()) {
      booking = param.match(/^[0-9a-fA-F]{24}$/)
        ? await Booking.findById(param).populate("vehicle").populate("user", "name email mobile")
        : await Booking.findOne({ bookingId: param.toUpperCase() }).populate("vehicle").populate("user", "name email mobile");
    } else {
      booking = await memoryStore.bookings.findById(param);
    }

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    const bookingOwnerId = booking.user && (booking.user._id || booking.user).toString();
    if (req.user.role !== "admin" && bookingOwnerId !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only update payment for your own booking.",
      });
    }

    if (booking.paymentStatus !== "Pending") {
      return res.status(400).json({
        success: false,
        message: `Payment status cannot change from ${booking.paymentStatus}.`,
      });
    }

    if (booking.bookingStatus !== "Upcoming") {
      return res.status(400).json({
        success: false,
        message: "Only upcoming bookings can be paid.",
      });
    }

    if (isMongoConnected()) {
      booking.paymentStatus = "Paid";
      await booking.save();
    } else {
      booking = await memoryStore.bookings.update(booking._id, { paymentStatus: "Paid" });
    }

    return res.status(200).json({
      success: true,
      message: "Payment marked as paid successfully.",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};
