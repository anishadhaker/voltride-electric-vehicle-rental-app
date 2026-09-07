import Vehicle from "../models/Vehicle.js";
import { isMongoConnected, memoryStore } from "../config/memoryStore.js";

// @desc    Get all vehicles
// @route   GET /api/vehicles
// @access  Public
export const getVehicles = async (req, res, next) => {
  try {
    const { status, type, location } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (type) filter.type = type;
    if (location) filter.location = new RegExp(location, "i");

    const vehicles = isMongoConnected()
      ? await Vehicle.find(filter).sort({ createdAt: -1 })
      : await memoryStore.vehicles.find(filter);

    res.status(200).json({
      success: true,
      count: vehicles.length,
      data: vehicles,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single vehicle by MongoDB ID
// @route   GET /api/vehicles/:id
// @access  Public
export const getVehicleById = async (req, res, next) => {
  try {
    const vehicle = isMongoConnected()
      ? await Vehicle.findById(req.params.id)
      : await memoryStore.vehicles.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: `Vehicle not found with ID ${req.params.id}`,
      });
    }

    res.status(200).json({
      success: true,
      data: vehicle,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new vehicle (for testing & seeding)
// @route   POST /api/vehicles
// @access  Public (dev/testing)
export const createVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.create(req.body);

    res.status(201).json({
      success: true,
      message: "Vehicle created successfully",
      data: vehicle,
    });
  } catch (error) {
    next(error);
  }
};
