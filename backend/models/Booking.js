import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: [true, "Booking ID is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Booking user is required"],
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: [true, "Vehicle reference is required"],
    },
    pickupLocation: {
      type: String,
      required: [true, "Pickup location is required"],
      trim: true,
    },
    pickupDateTime: {
      type: Date,
      required: [true, "Pickup date and time is required"],
    },
    returnDateTime: {
      type: Date,
      required: [true, "Return date and time is required"],
    },
    duration: {
      type: Number,
      required: [true, "Rental duration in hours is required"],
      min: [1, "Duration must be at least 1 hour"],
    },
    rentalPrice: {
      type: Number,
      required: [true, "Rental price is required"],
      min: [0, "Rental price cannot be negative"],
    },
    serviceFee: {
      type: Number,
      default: 10,
      min: [0, "Service fee cannot be negative"],
    },
    taxes: {
      type: Number,
      required: [true, "Taxes amount is required"],
      min: [0, "Taxes cannot be negative"],
    },
    securityDeposit: {
      type: Number,
      default: 500,
      min: [0, "Security deposit cannot be negative"],
    },
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: [0, "Total amount cannot be negative"],
    },
    bookingStatus: {
      type: String,
      enum: {
        values: ["Upcoming", "Active", "Completed", "Cancelled"],
        message: "{VALUE} is not a valid booking status",
      },
      default: "Upcoming",
    },
    paymentStatus: {
      type: String,
      enum: {
        values: ["Pending", "Paid", "Failed", "Refunded"],
        message: "{VALUE} is not a valid payment status",
      },
      default: "Pending",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
