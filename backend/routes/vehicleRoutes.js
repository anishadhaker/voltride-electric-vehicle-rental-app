import express from "express";
import {
  createVehicle,
  getVehicleById,
  getVehicles,
} from "../controllers/vehicleController.js";

const router = express.Router();

router.route("/").get(getVehicles).post(createVehicle);
router.route("/:id").get(getVehicleById);

export default router;
