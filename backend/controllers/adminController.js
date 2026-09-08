import Booking from "../models/Booking.js";
import User from "../models/User.js";
import Vehicle from "../models/Vehicle.js";
import { isMongoConnected, memoryStore } from "../config/memoryStore.js";
import cloudinary, { configureCloudinary } from "../config/cloudinary.js";
import streamifier from "streamifier";
import { slugifyVehicleName } from "../utils/vehicleIdentifier.js";

const bookingTotal = (booking) =>
  (Number(booking.rentalPrice) || 0) +
  (Number(booking.serviceFee) || 0) +
  (Number(booking.taxes) || 0);

const uploadToCloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "voltride/vehicles", resource_type: "image" },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });

const deleteCloudinaryImage = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
  } catch (error) {
    console.error("Cloudinary image deletion failed:", error.message);
  }
};

export const uploadAdminVehicleImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Please select an image to upload." });
    }
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return res.status(500).json({ success: false, message: "Cloudinary is not configured on the server." });
    }

    configureCloudinary();
    const result = await uploadToCloudinary(req.file.buffer);
    return res.status(201).json({
      success: true,
      imageUrl: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    next(new Error(`Image upload failed: ${error.message}`));
  }
};

const safeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  mobile: user.mobile,
  role: user.role,
  createdAt: user.createdAt,
});

export const getAdminDashboard = async (req, res, next) => {
  try {
    const [vehicles, bookings, users] = isMongoConnected()
      ? await Promise.all([
          Vehicle.find(),
          Booking.find().populate("vehicle").populate("user", "name email mobile role").sort({ createdAt: -1 }),
          User.find().select("-password"),
        ])
      : await Promise.all([
          memoryStore.vehicles.find(),
          memoryStore.bookings.find(),
          memoryStore.users.find(),
        ]);

    const confirmedBookings = bookings.filter(
      (booking) => booking.bookingStatus !== "pending_payment" && booking.paymentStatus === "Paid"
    );
    const pendingBookings = bookings.filter(
      (booking) => booking.bookingStatus === "pending_payment" || booking.paymentStatus === "Pending"
    );

    const activeVehicles = vehicles.filter((vehicle) =>
      ["Available", "Booked", "In Use"].includes(vehicle.status)
    ).length;
    const today = new Date();
    const todaysRides = confirmedBookings.filter((booking) => {
      const createdAt = new Date(booking.createdAt || booking.pickupDateTime);
      return createdAt.toDateString() === today.toDateString();
    }).length;

    res.json({
      success: true,
      data: {
        counts: {
          vehicles: vehicles.length,
          activeVehicles,
          bookings: confirmedBookings.length,
          pendingPayments: pendingBookings.length,
          todaysRides,
          users: users.length,
        },
        recentBookings: confirmedBookings.slice(0, 8),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminVehicles = async (req, res, next) => {
  try {
    const vehicles = isMongoConnected()
      ? await Vehicle.find().sort({ createdAt: -1 })
      : await memoryStore.vehicles.find();
    res.json({ success: true, count: vehicles.length, data: vehicles });
  } catch (error) {
    next(error);
  }
};

export const createAdminVehicle = async (req, res, next) => {
  try {
    const vehicleData = { ...req.body, slug: req.body.slug || slugifyVehicleName(req.body.name) };
    const vehicle = isMongoConnected()
      ? await Vehicle.create(vehicleData)
      : await memoryStore.vehicles.create(vehicleData);
    res.status(201).json({ success: true, message: "Vehicle created successfully", data: vehicle });
  } catch (error) {
    next(error);
  }
};

export const updateAdminVehicle = async (req, res, next) => {
  try {
    const existingVehicle = isMongoConnected()
      ? await Vehicle.findById(req.params.id)
      : await memoryStore.vehicles.findById(req.params.id);
    if (!existingVehicle) return res.status(404).json({ success: false, message: "Vehicle not found" });

    const vehicleData = {
      ...req.body,
      ...(req.body.name && !req.body.slug ? { slug: slugifyVehicleName(req.body.name) } : {}),
    };
    const vehicle = isMongoConnected()
      ? await Vehicle.findByIdAndUpdate(req.params.id, vehicleData, { new: true, runValidators: true })
      : await memoryStore.vehicles.update(req.params.id, vehicleData);
    if (req.body.imagePublicId && req.body.imagePublicId !== existingVehicle.imagePublicId) {
      await deleteCloudinaryImage(existingVehicle.imagePublicId);
    }
    res.json({ success: true, message: "Vehicle updated successfully", data: vehicle });
  } catch (error) {
    next(error);
  }
};

export const deleteAdminVehicle = async (req, res, next) => {
  try {
    const vehicle = isMongoConnected()
      ? await Vehicle.findById(req.params.id)
      : await memoryStore.vehicles.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ success: false, message: "Vehicle not found" });
    const activeBookings = isMongoConnected()
      ? await Booking.countDocuments({ vehicle: vehicle._id, bookingStatus: { $in: ["Upcoming", "Active"] } })
      : (await memoryStore.bookings.find({ vehicle: vehicle._id, bookingStatus: { $in: ["Upcoming", "Active"] } })).length;
    if (activeBookings > 0) {
      return res.status(409).json({ success: false, message: "This vehicle cannot be deleted while it has active or upcoming bookings." });
    }
    await deleteCloudinaryImage(vehicle.imagePublicId);
    if (isMongoConnected()) {
      await Vehicle.findByIdAndDelete(req.params.id);
    } else {
      await memoryStore.vehicles.remove(req.params.id);
    }
    res.json({ success: true, message: "Vehicle deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const getAdminBookings = async (req, res, next) => {
  try {
    const { status, type } = req.query;
    const filter = {};

    if (type === "pending") {
      filter.bookingStatus = "pending_payment";
    } else if (type === "confirmed") {
      filter.bookingStatus = { $ne: "pending_payment" };
      filter.paymentStatus = "Paid";
    } else if (status) {
      filter.bookingStatus = status;
    }

    const bookings = isMongoConnected()
      ? await Booking.find(filter).populate("vehicle").populate("user", "name email mobile role").sort({ createdAt: -1 })
      : await memoryStore.bookings.find(filter);
    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    next(error);
  }
};

export const getAdminUsers = async (req, res, next) => {
  try {
    const users = isMongoConnected()
      ? await User.find().select("-password").sort({ createdAt: -1 })
      : await memoryStore.users.find();
    res.json({
      success: true,
      count: users.length,
      data: users.map((user) => safeUser(user)),
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminAnalytics = async (req, res, next) => {
  try {
    const [vehicles, bookings, users] = isMongoConnected()
      ? await Promise.all([
          Vehicle.find().sort({ createdAt: -1 }),
          Booking.find().populate("vehicle").populate("user", "name email mobile role").sort({ createdAt: -1 }),
          User.find().select("-password").sort({ createdAt: -1 }),
        ])
      : await Promise.all([
          memoryStore.vehicles.find(),
          memoryStore.bookings.find(),
          memoryStore.users.find(),
        ]);

    const confirmedBookings = bookings.filter(
      (b) => b.bookingStatus !== "pending_payment" && b.paymentStatus === "Paid"
    );

    const totalRevenue = confirmedBookings.reduce(
      (sum, booking) => sum + bookingTotal(booking),
      0
    );

    const bookingStatusCounts = bookings.reduce((acc, booking) => {
      const status = booking.bookingStatus || "Unknown";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const vehicleStatusCounts = vehicles.reduce((acc, vehicle) => {
      const status = vehicle.status || "Unknown";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const vehicleBookingCounts = confirmedBookings.reduce((acc, booking) => {
      const vehicleName =
        booking.vehicle && typeof booking.vehicle === "object"
          ? booking.vehicle.name || "Unknown"
          : "Unknown";
      acc[vehicleName] = (acc[vehicleName] || 0) + 1;
      return acc;
    }, {});

    const mostBookedVehicles = Object.entries(vehicleBookingCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const recentActivity = confirmedBookings.slice(0, 6).map((booking) => {
      const user = booking.user && typeof booking.user === "object" ? booking.user : null;
      const vehicle = booking.vehicle && typeof booking.vehicle === "object" ? booking.vehicle : null;

      return {
        id: booking._id || booking.bookingId,
        bookingId: booking.bookingId || booking._id,
        customer: user ? user.name || "Unknown" : "Unknown",
        vehicle: vehicle ? vehicle.name || "Unknown vehicle" : "Unknown vehicle",
        status: booking.bookingStatus || "Unknown",
        totalAmount: Number(booking.totalAmount) || 0,
        createdAt: booking.createdAt || new Date(),
      };
    });

    res.json({
      success: true,
      data: {
        totalRevenue,
        totalBookings: confirmedBookings.length,
        totalUsers: users.length,
        totalVehicles: vehicles.length,
        bookingStatusCounts,
        vehicleStatusCounts,
        mostBookedVehicles,
        recentActivity,
      },
    });
  } catch (error) {
    next(error);
  }
};
