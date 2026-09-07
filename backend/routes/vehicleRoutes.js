import express from "express";
import {
  createVehicle,
  getVehicleById,
  getVehicles,
} from "../controllers/vehicleController.js";
import { checkVehicleAvailability } from "../controllers/bookingController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(getVehicles).post(protect, authorizeRoles("admin"), createVehicle);
router.route("/:id/check-availability").post(protect, checkVehicleAvailability);
router.route("/:id").get(getVehicleById);

export default router;
