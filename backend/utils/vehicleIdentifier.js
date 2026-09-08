import mongoose from "mongoose";

export const slugifyVehicleName = (value) =>
  String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const findVehicleByIdentifier = async (Vehicle, identifier) => {
  if (!identifier) return null;

  if (mongoose.Types.ObjectId.isValid(identifier)) {
    return Vehicle.findById(identifier);
  }

  return Vehicle.findOne({
    $or: [
      { slug: identifier.toLowerCase() },
      { name: new RegExp(`^${identifier.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/-/g, "[ -]")}$`, "i") },
    ],
  });
};