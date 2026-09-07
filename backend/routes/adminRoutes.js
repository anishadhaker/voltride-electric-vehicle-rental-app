import express from "express";
import {
  createAdminVehicle,
  deleteAdminVehicle,
  getAdminAnalytics,
  getAdminBookings,
  getAdminDashboard,
  getAdminUsers,
  getAdminVehicles,
  updateAdminVehicle,
} from "../controllers/adminController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";

const router = express.Router();
const adminOnly = [protect, authorizeRoles("admin")];

router.get("/dashboard", ...adminOnly, getAdminDashboard);
router.get("/vehicles", ...adminOnly, getAdminVehicles);
router.post("/vehicles", ...adminOnly, createAdminVehicle);
router.put("/vehicles/:id", ...adminOnly, updateAdminVehicle);
router.delete("/vehicles/:id", ...adminOnly, deleteAdminVehicle);
router.get("/bookings", ...adminOnly, getAdminBookings);
router.get("/users", ...adminOnly, getAdminUsers);
router.get("/analytics", ...adminOnly, getAdminAnalytics);

export default router;
