import dotenv from "dotenv";
import mongoose from "mongoose";
import Vehicle from "./models/Vehicle.js";

dotenv.config();

const sampleVehicles = [
  {
    name: "Ather 450X",
    brand: "Ather Energy",
    model: "Gen 3 Pro",
    type: "Electric Scooter",
    registrationNumber: "PB-08-EV-1001",
    image:
      "https://images.unsplash.com/photo-1558981285-6f0c94958bb6?auto=format&fit=crop&w=1200&q=85",
    location: "Phagwara City Hub",
    battery: 94,
    range: 111,
    topSpeed: 90,
    chargingTime: "5.4 hrs",
    pricePerHour: 59,
    pricePerDay: 999,
    rating: 4.8,
    status: "Available",
  },
  {
    name: "Ola S1 Pro",
    brand: "Ola Electric",
    model: "Gen 2",
    type: "Electric Scooter",
    registrationNumber: "PB-08-EV-1002",
    image:
      "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1200&q=85",
    location: "Jalandhar Central Station",
    battery: 92,
    range: 180,
    topSpeed: 120,
    chargingTime: "6.5 hrs",
    pricePerHour: 65,
    pricePerDay: 1099,
    rating: 4.7,
    status: "Available",
  },
  {
    name: "TVS iQube",
    brand: "TVS Motor",
    model: "ST Edition",
    type: "Electric Scooter",
    registrationNumber: "PB-08-EV-1003",
    image:
      "https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&w=1200&q=85",
    location: "Ludhiana Mall Road Hub",
    battery: 91,
    range: 100,
    topSpeed: 82,
    chargingTime: "4.5 hrs",
    pricePerHour: 55,
    pricePerDay: 899,
    rating: 4.7,
    status: "Available",
  },
  {
    name: "Bajaj Chetak Electric",
    brand: "Bajaj Auto",
    model: "Premium 2026",
    type: "Electric Scooter",
    registrationNumber: "PB-08-EV-1004",
    image:
      "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=85",
    location: "Phagwara University Hub",
    battery: 89,
    range: 126,
    topSpeed: 73,
    chargingTime: "4.0 hrs",
    pricePerHour: 52,
    pricePerDay: 849,
    rating: 4.6,
    status: "Available",
  },
  {
    name: "Revolt RV400",
    brand: "Revolt Motors",
    model: "BRZ Stealth Edition",
    type: "Electric Bike",
    registrationNumber: "PB-08-EV-1005",
    image:
      "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1200&q=85",
    location: "Jalandhar Central Station",
    battery: 88,
    range: 150,
    topSpeed: 85,
    chargingTime: "4.5 hrs",
    pricePerHour: 69,
    pricePerDay: 1199,
    rating: 4.9,
    status: "Available",
  },
];

async function seedVehicles() {
  const mongoUri =
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/voltride";

  try {
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB for vehicle seeding...");

    for (const vehicle of sampleVehicles) {
      const upserted = await Vehicle.findOneAndUpdate(
        { registrationNumber: vehicle.registrationNumber },
        vehicle,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      console.log(`✓ Seeded: ${upserted.name} (${upserted._id})`);
    }

    console.log("All sample vehicles successfully seeded into MongoDB.");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exit(1);
  }
}

seedVehicles();
