import User from "../models/User.js";

// @desc    Get all users (placeholder for dev/testing)
// @route   GET /api/users
// @access  Public
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user by ID
// @route   GET /api/users/:id
// @access  Public
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User not found with ID ${req.params.id}`,
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create user (placeholder for testing models before auth phase)
// @route   POST /api/users
// @access  Public
export const createUser = async (req, res, next) => {
  try {
    const { name, email, mobile, password, role } = req.body;

    const user = await User.create({
      name,
      email,
      mobile,
      password,
      role: role || "customer",
    });

    const sanitized = user.toObject();
    delete sanitized.password;

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: sanitized,
    });
  } catch (error) {
    next(error);
  }
};
