import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, mobile, password, role } = req.body;

    // 1. Validate required fields
    if (!name || !email || !mobile || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields: name, email, mobile, password",
      });
    }

    // 2. Validate email format
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    // 3. Validate mobile format (clean digits check, 10-15 digits)
    const cleanMobile = mobile.replace(/[^0-9+]/g, "").trim();
    const digitsOnly = cleanMobile.replace(/\D/g, "");
    if (digitsOnly.length < 10) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid mobile number with at least 10 digits",
      });
    }

    // 4. Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // 5. Check if email already registered
    const normalizedEmail = email.toLowerCase().trim();
    const existingEmail = await User.findOne({ email: normalizedEmail });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "An account with this email address already exists",
      });
    }

    // 6. Check if mobile already registered
    const existingMobile = await User.findOne({
      $or: [{ mobile: cleanMobile }, { mobile: digitsOnly }],
    });
    if (existingMobile) {
      return res.status(400).json({
        success: false,
        message: "An account with this mobile number already exists",
      });
    }

    // 7. Create user (password will be automatically hashed by User pre-save hook)
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      mobile: cleanMobile,
      password,
      role: role && role === "admin" ? "admin" : "customer",
    });

    // 8. Generate JWT token
    const token = generateToken(user._id, user.role);

    // 9. Send response without password
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token (supports email OR mobile)
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;

    // 1. Validate inputs
    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide both identifier (email or mobile) and password",
      });
    }

    const trimmedIdentifier = identifier.trim();
    const isEmail = trimmedIdentifier.includes("@");
    const digitsOnly = trimmedIdentifier.replace(/\D/g, "");

    // 2. Find user by email OR mobile
    let query;
    if (isEmail) {
      query = { email: trimmedIdentifier.toLowerCase() };
    } else {
      query = {
        $or: [
          { mobile: trimmedIdentifier },
          { mobile: digitsOnly },
          { mobile: `+91${digitsOnly}` },
          { mobile: `+91 ${digitsOnly}` },
        ],
      };
    }

    const user = await User.findOne(query);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email/mobile or password",
      });
    }

    // 3. Verify password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email/mobile or password",
      });
    }

    // 4. Generate JWT
    const token = generateToken(user._id, user.role);

    // 5. Send safe response
    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};
