import Booking from "../models/Booking.js";
import User from "../models/User.js";
import Vehicle from "../models/Vehicle.js";
import { isMongoConnected, memoryStore } from "../config/memoryStore.js";

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
      ? await Promise.all([Vehicle.find(), Booking.find(), User.find().select("-password")])
      : await Promise.all([
          memoryStore.vehicles.find(),
          memoryStore.bookings.find(),
          memoryStore.users.find(),
        ]);

    const activeVehicles = vehicles.filter((vehicle) =>
      ["Available", "Booked", "In Use"].includes(vehicle.status)
    ).length;
    const today = new Date();
    const todaysRides = bookings.filter((booking) => {
      const createdAt = new Date(booking.createdAt || booking.pickupDateTime);
      return createdAt.toDateString() === today.toDateString();
    }).length;

    res.json({
      success: true,
      data: {
        counts: {
          vehicles: vehicles.length,
          activeVehicles,
          bookings: bookings.length,
          todaysRides,
          users: users.length,
        },
        recentBookings: bookings.slice(0, 8),
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
    const vehicle = isMongoConnected()
      ? await Vehicle.create(req.body)
      : await memoryStore.vehicles.create(req.body);
    res.status(201).json({ success: true, message: "Vehicle created successfully", data: vehicle });
  } catch (error) {
    next(error);
  }
};

export const updateAdminVehicle = async (req, res, next) => {
  try {
    const vehicle = isMongoConnected()
      ? await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      : await memoryStore.vehicles.update(req.params.id, req.body);
    if (!vehicle) return res.status(404).json({ success: false, message: "Vehicle not found" });
    res.json({ success: true, message: "Vehicle updated successfully", data: vehicle });
  } catch (error) {
    next(error);
  }
};

export const deleteAdminVehicle = async (req, res, next) => {
  try {
    const vehicle = isMongoConnected()
      ? await Vehicle.findByIdAndDelete(req.params.id)
      : await memoryStore.vehicles.remove(req.params.id);
    if (!vehicle) return res.status(404).json({ success: false, message: "Vehicle not found" });
    res.json({ success: true, message: "Vehicle deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const getAdminBookings = async (req, res, next) => {
  try {
    const bookings = isMongoConnected()
      ? await Booking.find().populate("vehicle").populate("user", "name email mobile role").sort({ createdAt: -1 })
      : await memoryStore.bookings.find();
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

    const totalRevenue = bookings.reduce(
      (sum, booking) => sum + (Number(booking.totalAmount) || 0),
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

    const vehicleBookingCounts = bookings.reduce((acc, booking) => {
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

    const recentActivity = bookings.slice(0, 6).map((booking) => {
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
        totalBookings: bookings.length,
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
