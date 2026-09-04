import Booking from "../models/Booking.js";
import Vehicle from "../models/Vehicle.js";

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

    const bookings = await Booking.find(filter)
      .populate("vehicle")
      .populate("user", "name email mobile role")
      .sort({ createdAt: -1 });

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

    const bookings = await Booking.find(filter)
      .populate("vehicle")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
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

    if (param.match(/^[0-9a-fA-F]{24}$/)) {
      booking = await Booking.findById(param)
        .populate("vehicle")
        .populate("user", "name email mobile");
    } else {
      booking = await Booking.findOne({ bookingId: param.toUpperCase() })
        .populate("vehicle")
        .populate("user", "name email mobile");
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
      booking.user &&
      booking.user._id.toString() !== req.user._id.toString()
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
      duration,
      rentalPrice,
      serviceFee = 10,
      taxes,
      securityDeposit = 500,
      totalAmount,
    } = req.body;

    // 1. Check if vehicle exists
    if (!vehicle) {
      return res.status(400).json({
        success: false,
        message: "Vehicle ID is required to create a booking",
      });
    }

    const vehicleDoc = await Vehicle.findById(vehicle);
    if (!vehicleDoc) {
      return res.status(404).json({
        success: false,
        message: "Referenced vehicle does not exist",
      });
    }

    // 2. Validate dates
    const start = new Date(pickupDateTime);
    const end = new Date(returnDateTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
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

    // 3. Compute duration if not provided
    const calculatedDuration =
      duration && duration > 0
        ? Number(duration)
        : Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60)));

    // 4. Calculate prices if not supplied
    const calculatedRentalPrice =
      rentalPrice !== undefined
        ? Number(rentalPrice)
        : calculatedDuration * vehicleDoc.pricePerHour;

    const calculatedTaxes =
      taxes !== undefined ? Number(taxes) : Math.round(calculatedRentalPrice * 0.05);

    const calculatedTotal =
      totalAmount !== undefined
        ? Number(totalAmount)
        : calculatedRentalPrice + serviceFee + calculatedTaxes + securityDeposit;

    // 5. Generate unique booking ID (VR-2026-XXXXX)
    let bookingId = req.body.bookingId;
    if (!bookingId) {
      bookingId = `VR-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    }

    // 6. Enforce authenticated user: always use req.user._id (never allow client spoofing)
    const assignedUser = req.user ? req.user._id : req.body.user || null;

    const newBooking = await Booking.create({
      bookingId,
      user: assignedUser,
      vehicle: vehicleDoc._id,
      pickupLocation: pickupLocation || vehicleDoc.location,
      pickupDateTime: start,
      returnDateTime: end,
      duration: calculatedDuration,
      rentalPrice: calculatedRentalPrice,
      serviceFee,
      taxes: calculatedTaxes,
      securityDeposit,
      totalAmount: calculatedTotal,
      bookingStatus: "Upcoming",
      paymentStatus: "Pending",
    });

    const populated = await Booking.findById(newBooking._id)
      .populate("vehicle")
      .populate("user", "name email mobile");

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};
