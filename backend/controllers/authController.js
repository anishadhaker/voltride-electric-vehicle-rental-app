import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { isMongoConnected, memoryStore } from "../config/memoryStore.js";
import { generateToken } from "../utils/generateToken.js";
import { sendPasswordResetOtp } from "../utils/passwordResetEmail.js";

const PASSWORD_RESET_OTP_TTL_MS = 10 * 60 * 1000;
const PASSWORD_RESET_RESEND_COOLDOWN_MS = 60 * 1000;
const PASSWORD_RESET_TOKEN_TTL = "10m";
const genericResetMessage = "If an account exists for that email, a password reset code has been sent.";
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const resetTokenSecret = () =>
  process.env.JWT_SECRET || "voltride_development_jwt_secret_key_2026";

const hashResetToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

const findResetUserByEmail = async (email) => {
  if (isMongoConnected()) {
    return User.findOne({ email }).select(
      "+resetPasswordOtpHash +resetPasswordOtpExpires +resetPasswordOtpRequestedAt +resetPasswordTokenHash"
    );
  }
  return memoryStore.users.findOne({ email });
};

const findResetUserById = async (id) => {
  if (isMongoConnected()) {
    return User.findById(id).select(
      "+resetPasswordOtpHash +resetPasswordOtpExpires +resetPasswordOtpRequestedAt +resetPasswordTokenHash"
    );
  }
  return memoryStore.users.findById(id);
};

const updateResetUser = async (user, updates) => {
  if (isMongoConnected()) {
    Object.assign(user, updates);
    await user.save();
    return user;
  }
  return memoryStore.users.findByIdAndUpdate(user._id, updates);
};

const clearResetState = () => ({
  resetPasswordOtpHash: null,
  resetPasswordOtpExpires: null,
  resetPasswordOtpRequestedAt: null,
  resetPasswordTokenHash: null,
});

export const getCurrentUser = async (req, res, next) => {
  try {
    const user = isMongoConnected()
      ? await User.findById(req.user._id).select("-password")
      : await memoryStore.users.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        profileImage: user.profileImage || "",
        dob: user.dob || "",
        address: user.address || "",
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, mobile, password } = req.body;

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
    const existingEmail = isMongoConnected()
      ? await User.findOne({ email: normalizedEmail })
      : await memoryStore.users.findOne({ email: normalizedEmail });

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "An account with this email address already exists",
      });
    }

    // 6. Check if mobile already registered
    const existingMobile = isMongoConnected()
      ? await User.findOne({
          $or: [{ mobile: cleanMobile }, { mobile: digitsOnly }],
        })
      : await memoryStore.users.findOne({
          $or: [{ mobile: cleanMobile }, { mobile: digitsOnly }],
        });

    if (existingMobile) {
      return res.status(400).json({
        success: false,
        message: "An account with this mobile number already exists",
      });
    }

    // 7. Create user
    const user = isMongoConnected()
      ? await User.create({
          name: name.trim(),
          email: normalizedEmail,
          mobile: cleanMobile,
          password,
          role: "customer",
        })
      : await memoryStore.users.create({
          name: name.trim(),
          email: normalizedEmail,
          mobile: cleanMobile,
          password,
          role: "customer",
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
        profileImage: user.profileImage || "",
        dob: user.dob || "",
        address: user.address || "",
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

    const user = isMongoConnected()
      ? await User.findOne(query)
      : await memoryStore.users.findOne(query);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email/mobile number or password",
      });
    }

    // 3. Verify password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email/mobile number or password",
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
        profileImage: user.profileImage || "",
        dob: user.dob || "",
        address: user.address || "",
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const email = String(req.body.email || "").toLowerCase().trim();
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    const user = await findResetUserByEmail(email);
    if (!user) {
      return res.status(200).json({ success: true, message: genericResetMessage });
    }

    const requestedAt = user.resetPasswordOtpRequestedAt
      ? new Date(user.resetPasswordOtpRequestedAt).getTime()
      : 0;
    if (requestedAt && Date.now() - requestedAt < PASSWORD_RESET_RESEND_COOLDOWN_MS) {
      return res.status(200).json({ success: true, message: genericResetMessage });
    }

    const otp = crypto.randomInt(0, 1000000).toString().padStart(6, "0");
    await updateResetUser(user, {
      resetPasswordOtpHash: await bcrypt.hash(otp, 10),
      resetPasswordOtpExpires: new Date(Date.now() + PASSWORD_RESET_OTP_TTL_MS),
      resetPasswordOtpRequestedAt: new Date(),
      resetPasswordTokenHash: null,
    });

    try {
      await sendPasswordResetOtp(email, otp);
    } catch (emailError) {
      await updateResetUser(user, clearResetState());
      console.error("Password reset email delivery failed:", emailError.message);
      return res.status(503).json({
        success: false,
        message: "Unable to send the reset code right now. Please try again later.",
      });
    }

    return res.status(200).json({ success: true, message: genericResetMessage });
  } catch (error) {
    next(error);
  }
};

export const verifyResetOtp = async (req, res, next) => {
  try {
    const email = String(req.body.email || "").toLowerCase().trim();
    const otp = String(req.body.otp || "").trim();
    if (!emailRegex.test(email) || !/^\d{6}$/.test(otp)) {
      return res.status(400).json({ success: false, message: "Invalid or expired reset code." });
    }

    const user = await findResetUserByEmail(email);
    const expiresAt = user?.resetPasswordOtpExpires
      ? new Date(user.resetPasswordOtpExpires).getTime()
      : 0;
    const validOtp = user?.resetPasswordOtpHash && expiresAt > Date.now()
      ? await bcrypt.compare(otp, user.resetPasswordOtpHash)
      : false;
    if (!validOtp) {
      return res.status(400).json({ success: false, message: "Invalid or expired reset code." });
    }

    const resetToken = jwt.sign(
      { id: user._id.toString(), purpose: "password-reset" },
      resetTokenSecret(),
      { expiresIn: PASSWORD_RESET_TOKEN_TTL }
    );
    await updateResetUser(user, {
      resetPasswordOtpHash: null,
      resetPasswordOtpExpires: null,
      resetPasswordOtpRequestedAt: null,
      resetPasswordTokenHash: hashResetToken(resetToken),
    });

    return res.status(200).json({
      success: true,
      message: "Reset code verified successfully.",
      resetToken,
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { resetToken, newPassword, confirmPassword } = req.body;
    if (!resetToken || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: "Please complete all password reset fields." });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters long." });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match." });
    }

    let decoded;
    try {
      decoded = jwt.verify(resetToken, resetTokenSecret());
    } catch {
      return res.status(400).json({ success: false, message: "Reset authorization is invalid or expired." });
    }
    if (decoded.purpose !== "password-reset" || !decoded.id) {
      return res.status(400).json({ success: false, message: "Reset authorization is invalid or expired." });
    }

    const user = await findResetUserById(decoded.id);
    const storedHash = user?.resetPasswordTokenHash;
    const providedHash = hashResetToken(resetToken);
    const tokenMatches = storedHash && crypto.timingSafeEqual(
      Buffer.from(storedHash, "utf8"),
      Buffer.from(providedHash, "utf8")
    );
    if (!tokenMatches) {
      return res.status(400).json({ success: false, message: "Reset authorization is invalid or expired." });
    }

    await updateResetUser(user, {
      password: newPassword,
      ...clearResetState(),
    });

    return res.status(200).json({ success: true, message: "Password reset successfully." });
  } catch (error) {
    next(error);
  }
};
