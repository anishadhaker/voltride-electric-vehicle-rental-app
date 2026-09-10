import User from "../models/User.js";
import { isMongoConnected, memoryStore } from "../config/memoryStore.js";

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res, next) => {
  try {
    const user = isMongoConnected()
      ? await User.findById(req.user._id).select("-password")
      : await memoryStore.users.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User profile not found",
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

// @desc    Update current user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res, next) => {
  try {
    const user = isMongoConnected()
      ? await User.findById(req.user._id)
      : await memoryStore.users.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const { name, email, mobile, profileImage, dob, address } = req.body;

    // Check email uniqueness if email is changed
    if (email && email.toLowerCase().trim() !== user.email) {
      const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid email address",
        });
      }

      const existingEmail = isMongoConnected()
        ? await User.findOne({
            email: email.toLowerCase().trim(),
            _id: { $ne: user._id },
          })
        : (await memoryStore.users.find()).find(
            (candidate) => candidate.email === email.toLowerCase().trim() && candidate._id !== user._id
          );

      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: "Email address is already in use by another account",
        });
      }

      user.email = email.toLowerCase().trim();
    }

    // Check mobile uniqueness if mobile is changed
    if (mobile && mobile.trim() !== user.mobile) {
      const cleanMobile = mobile.replace(/[^0-9+]/g, "").trim();
      const digitsOnly = cleanMobile.replace(/\D/g, "");
      if (digitsOnly.length < 10) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid mobile number with at least 10 digits",
        });
      }

      const existingMobile = isMongoConnected()
        ? await User.findOne({ mobile: cleanMobile, _id: { $ne: user._id } })
        : (await memoryStore.users.find()).find(
            (candidate) => candidate.mobile === cleanMobile && candidate._id !== user._id
          );

      if (existingMobile) {
        return res.status(400).json({
          success: false,
          message: "Mobile number is already in use by another account",
        });
      }

      user.mobile = cleanMobile;
    }

    if (name) user.name = name.trim();
    if (profileImage !== undefined) user.profileImage = typeof profileImage === "string" ? profileImage.trim() : "";
    if (dob !== undefined) user.dob = typeof dob === "string" ? dob.trim() : "";
    if (address !== undefined) user.address = typeof address === "string" ? address.trim() : "";

    const updatedUser = isMongoConnected()
      ? await user.save()
      : await memoryStore.users.findByIdAndUpdate(req.user._id, {
          name: user.name,
          mobile: user.mobile,
          email: user.email,
          profileImage: user.profileImage,
          dob: user.dob,
          address: user.address,
        });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        mobile: updatedUser.mobile,
        role: updatedUser.role,
        profileImage: updatedUser.profileImage || "",
        dob: updatedUser.dob || "",
        address: updatedUser.address || "",
        createdAt: updatedUser.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change user password
// @route   PUT /api/users/change-password
// @access  Private
export const changeUserPassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide both current password and new password",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long",
      });
    }

    const user = isMongoConnected()
      ? await User.findById(req.user._id)
      : await memoryStore.users.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password does not match",
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from current password",
      });
    }

    if (isMongoConnected()) {
      user.password = newPassword;
      await user.save();
    } else {
      await memoryStore.users.findByIdAndUpdate(req.user._id, {
        password: newPassword,
      });
    }

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (req, res, next) => {
  try {
    const users = isMongoConnected()
      ? await User.find().select("-password").sort({ createdAt: -1 })
      : await memoryStore.users.find();

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};
