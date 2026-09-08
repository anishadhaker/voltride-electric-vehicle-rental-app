import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { vehicles } from "../../src/data/vehicles.js";
import Vehicle from "../models/Vehicle.js";
import { slugifyVehicleName } from "../utils/vehicleIdentifier.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const fieldsToMigrate = [
  "name",
  "brand",
  "model",
  "type",
  "image",
  "location",
  "battery",
  "range",
  "topSpeed",
  "chargingTime",
  "pricePerHour",
  "pricePerDay",
  "rating",
];

const migrate = async () => {
  const mongoUri = (process.env.MONGODB_URI || "").trim().replace(/^['"]+|['"]+$/g, "");
  if (!mongoUri) throw new Error("MONGODB_URI is not defined in backend/.env");

  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
  console.log(`Migrating ${vehicles.length} homepage vehicles...`);

  let added = 0;
  let updated = 0;
  for (const sourceVehicle of vehicles) {
    const vehicleData = Object.fromEntries(
      fieldsToMigrate
        .filter((field) => sourceVehicle[field] !== undefined)
        .map((field) => [field, sourceVehicle[field]])
    );
    vehicleData.registrationNumber = `MIGRATED-${sourceVehicle.id}`.toUpperCase();
    vehicleData.slug = slugifyVehicleName(sourceVehicle.name);

    const existing = await Vehicle.findOne({
      name: sourceVehicle.name,
      brand: sourceVehicle.brand,
      model: sourceVehicle.model,
    });

    if (existing) {
      await Vehicle.updateOne({ _id: existing._id }, { $set: vehicleData });
      updated += 1;
      console.log(`✓ Vehicle already exists: ${sourceVehicle.name}`);
    } else {
      await Vehicle.create(vehicleData);
      added += 1;
      console.log(`✓ Added vehicle: ${sourceVehicle.name}`);
    }
  }

  console.log(`Migration completed: ${added} added, ${updated} already existed.`);
};

try {
  await migrate();
  process.exitCode = 0;
} catch (error) {
  console.error(`Migration failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}