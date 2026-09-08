import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Vehicle name is required"],
      trim: true,
    },
    brand: {
      type: String,
      required: [true, "Vehicle brand is required"],
      trim: true,
    },
    model: {
      type: String,
      required: [true, "Vehicle model is required"],
      trim: true,
    },
    slug: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
    },
    type: {
      type: String,
      required: [true, "Vehicle type is required"],
      enum: {
        values: ["Electric Scooter", "Electric Bike"],
        message: "{VALUE} is not a valid vehicle type",
      },
    },
    registrationNumber: {
      type: String,
      required: [true, "Registration number is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    image: {
      type: String,
      required: [true, "Vehicle image URL is required"],
    },
    imagePublicId: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      required: [true, "Location / Hub is required"],
      trim: true,
    },
    battery: {
      type: Number,
      required: [true, "Battery percentage is required"],
      min: [0, "Battery cannot be less than 0"],
      max: [100, "Battery cannot exceed 100"],
      default: 100,
    },
    range: {
      type: Number,
      required: [true, "Range in km is required"],
      min: [0, "Range cannot be negative"],
    },
    topSpeed: {
      type: Number,
      required: [true, "Top speed in km/h is required"],
      min: [0, "Top speed cannot be negative"],
    },
    chargingTime: {
      type: String,
      required: [true, "Charging time is required"],
      trim: true,
    },
    pricePerHour: {
      type: Number,
      required: [true, "Hourly rental price is required"],
      min: [0, "Price per hour cannot be negative"],
    },
    pricePerDay: {
      type: Number,
      required: [true, "Daily rental price is required"],
      min: [0, "Price per day cannot be negative"],
    },
    rating: {
      type: Number,
      default: 4.8,
      min: [0, "Rating cannot be less than 0"],
      max: [5, "Rating cannot exceed 5"],
    },
    status: {
      type: String,
      enum: {
        values: [
          "Available",
          "Unavailable",
          "Booked",
          "In Use",
          "Charging",
          "Maintenance",
          "Offline",
        ],
        message: "{VALUE} is not a valid vehicle status",
      },
      default: "Available",
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

const Vehicle = mongoose.model("Vehicle", vehicleSchema);

export default Vehicle;
