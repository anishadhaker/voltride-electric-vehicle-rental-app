import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { isMongoConnected, memoryStore } from "../config/memoryStore.js";

/**
 * Protect routes: Authenticate JWT from Authorization header
 */
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    try {
      // Extract token from 'Bearer <token>'
      token = req.headers.authorization.split(" ")[1];

      // Verify JWT token
      const secret =
        process.env.JWT_SECRET || "voltride_development_jwt_secret_key_2026";
      const decoded = jwt.verify(token, secret);

      // Fetch user from DB or memoryStore, excluding password
      req.user = isMongoConnected()
        ? await User.findById(decoded.id).select("-password")
        : await memoryStore.users.findById(decoded.id);

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "User account associated with this token no longer exists",
        });
      }

      return next();
    } catch (error) {
      console.error("JWT Verification failed:", error.message);
      return res.status(401).json({
        success: false,
        message: "Not authorized, token is invalid or expired",
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, no token provided",
    });
  }
};

/**
 * Role-based authorization middleware
 * @param  {...string} roles - Allowed roles (e.g. 'admin', 'customer')
 */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, authentication required",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: roles.includes("admin") ? "Admin access required" : `Role '${req.user.role}' is not authorized to access this resource`,
      });
    }

    next();
  };
};
