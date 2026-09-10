import bcrypt from "bcryptjs";
import mongoose from "mongoose";

/**
 * Check if real MongoDB connection is active
 */
export const isMongoConnected = () => {
  return mongoose.connection.readyState === 1;
};

class MemoryUser {
  constructor(data) {
    this._id = data._id || `66d8e001a1b2c3d4e5f6000${Math.floor(1000 + Math.random() * 9000)}`;
    this.name = data.name;
    this.email = data.email.toLowerCase().trim();
    this.mobile = data.mobile;
    this.password = data.password.startsWith("$2")
      ? data.password
      : bcrypt.hashSync(data.password, 10);
    this.role = data.role || "customer";
    this.profileImage = data.profileImage || "";
    this.dob = data.dob || "";
    this.address = data.address || "";
    this.resetPasswordOtpHash = data.resetPasswordOtpHash || null;
    this.resetPasswordOtpExpires = data.resetPasswordOtpExpires || null;
    this.resetPasswordOtpRequestedAt = data.resetPasswordOtpRequestedAt || null;
    this.resetPasswordTokenHash = data.resetPasswordTokenHash || null;
    this.createdAt = data.createdAt || new Date();
  }

  async matchPassword(enteredPassword) {
    return Boolean(enteredPassword) && bcrypt.compare(enteredPassword, this.password);
  }
}

const memoryUsers = [];

// Initial Seed Vehicles
const memoryVehicles = [
  {
    _id: "66d8e002a1b2c3d4e5f60001",
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
    reviews: 142,
    availability: "Available Now",
    status: "Available",
    about:
      "The Ather 450X Gen 3 Pro is a benchmark-setting smart electric scooter engineered with warp acceleration, true-range prediction, and Google Maps dashboard integration.",
    specifications: {
      motor: "PMSM 6.4 kW Peak Motor",
      batteryCapacity: "3.7 kWh IP67 Lithium-ion",
      charging: "Fast charge 0-80% in 50 min at Ather Grid",
      brakes: "Combined Braking System with Disc front/rear",
      features: "7-inch touchscreen, Bluetooth, Theft tracking",
    },
  },
  {
    _id: "66d8e002a1b2c3d4e5f60002",
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
    reviews: 98,
    availability: "Available Now",
    status: "Available",
    about:
      "The Ola S1 Pro Gen 2 delivers lightning quick 0-40 km/h in 2.6 seconds with best-in-class underseat storage and party mode speakers.",
    specifications: {
      motor: "Mid-drive 11 kW Peak Motor",
      batteryCapacity: "4.0 kWh High Density Pack",
      charging: "Home charging 6.5h / Hypercharger 15m",
      brakes: "Dual Hydraulic Disc with ABS",
      features: "MoveOS 4, Cruise control, Proximity unlock",
    },
  },
  {
    _id: "66d8e002a1b2c3d4e5f60003",
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
    reviews: 84,
    availability: "Available Now",
    status: "Available",
    about:
      "A trusted, comfortable family commuter EV designed for smooth, whisper-quiet city rides with generous legroom and connected smart features.",
    specifications: {
      motor: "BLDC Hub Motor 4.4 kW",
      batteryCapacity: "3.4 kWh Lithium-ion Pack",
      charging: "Portable plug charger 4.5 hrs",
      brakes: "Front Disc & Rear Drum with CBS",
      features: "Q-Park assist, Geo-fencing, USB charger",
    },
  },
  {
    _id: "66d8e002a1b2c3d4e5f60004",
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
    reviews: 62,
    availability: "Available Now",
    status: "Available",
    about:
      "Featuring a timeless all-metal body and classic design language merged with cutting-edge electric reliability.",
    specifications: {
      motor: "IP67 Solid Gearbox Drive Motor 4.2 kW",
      batteryCapacity: "3.2 kWh Water Resistant Pack",
      charging: "Standard 5A socket in 4.0 hrs",
      brakes: "Front Disc with regenerative braking",
      features: "Reverse mode, Keyless start, Bluetooth App",
    },
  },
  {
    _id: "66d8e002a1b2c3d4e5f60005",
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
    reviews: 110,
    availability: "Available Now",
    status: "Available",
    about:
      "India's leading AI-enabled electric motorcycle offering dynamic sound profiles, swappable battery pack technology, and sporty ergonomics.",
    specifications: {
      motor: "Mid-Drive 3.0 kW Motor with Belt Drive",
      batteryCapacity: "3.24 kWh Portable Swappable Battery",
      charging: "Normal plug 4.5 hrs or 60s swap station",
      brakes: "Front and Rear 240mm Disc with CBS",
      features: "MyRevolt App, Synthetic exhaust sounds, GPS",
    },
  },
];

// Initial Seed Bookings
const memoryBookings = [
  {
    _id: "66d8e003a1b2c3d4e5f60001",
    bookingId: "VR-2026-89104",
    user: "66d8e001a1b2c3d4e5f60001",
    vehicle: memoryVehicles[0],
    pickupLocation: "Phagwara City Hub",
    pickupDateTime: new Date(Date.now() + 86400000), // tomorrow
    returnDateTime: new Date(Date.now() + 100800000),
    duration: 4,
    rentalPrice: 236,
    serviceFee: 10,
    taxes: 12,
    totalAmount: 258,
    bookingStatus: "Upcoming",
    paymentStatus: "Paid",
    createdAt: new Date(),
  },
];

/* =======================================================
   STORE METHODS
   ======================================================= */
export const memoryStore = {
  users: {
    find: (query = {}) => {
      let results = [...memoryUsers];
      if (query.email) {
        results = results.filter((u) => u.email === query.email.toLowerCase().trim());
      }
      return results;
    },

    findOne: async (query) => {
      if (!query) return null;
      if (query.email) {
        const emailTarget = query.email.toLowerCase().trim();
        const found = memoryUsers.find((u) => u.email === emailTarget);
        if (found) return found;
      }
      if (query._id) {
        const idTarget = query._id.toString();
        const found = memoryUsers.find((u) => u._id.toString() === idTarget);
        if (found) return found;
      }
      if (query.$or && Array.isArray(query.$or)) {
        for (const condition of query.$or) {
          if (condition.mobile) {
            const cleanCondition = condition.mobile.replace(/\D/g, "");
            const found = memoryUsers.find(
              (u) =>
                u.mobile.replace(/\D/g, "").includes(cleanCondition) ||
                cleanCondition.includes(u.mobile.replace(/\D/g, ""))
            );
            if (found) return found;
          }
          if (condition.email) {
            const found = memoryUsers.find(
              (u) => u.email === condition.email.toLowerCase().trim()
            );
            if (found) return found;
          }
        }
      }
      return null;
    },

    findById: async (id) => {
      if (!id) return null;
      const targetId = id.toString();
      return memoryUsers.find((u) => u._id.toString() === targetId) || null;
    },

    create: async (userData) => {
      const newUser = new MemoryUser(userData);
      memoryUsers.push(newUser);
      return newUser;
    },

    findByIdAndUpdate: async (id, updateData) => {
      const user = await memoryStore.users.findById(id);
      if (!user) return null;
      if (updateData.name !== undefined) user.name = updateData.name;
      if (updateData.mobile !== undefined) user.mobile = updateData.mobile;
      if (updateData.email !== undefined) user.email = updateData.email.toLowerCase().trim();
      if (updateData.profileImage !== undefined) user.profileImage = updateData.profileImage;
      if (updateData.dob !== undefined) user.dob = updateData.dob;
      if (updateData.address !== undefined) user.address = updateData.address;
      if (updateData.password) {
        user.password = updateData.password.startsWith("$2")
          ? updateData.password
          : bcrypt.hashSync(updateData.password, 10);
      }
      for (const field of [
        "resetPasswordOtpHash",
        "resetPasswordOtpExpires",
        "resetPasswordOtpRequestedAt",
        "resetPasswordTokenHash",
      ]) {
        if (Object.prototype.hasOwnProperty.call(updateData, field)) {
          user[field] = updateData[field];
        }
      }
      return user;
    },
  },

  vehicles: {
    find: async (query = {}) => {
      let results = [...memoryVehicles];
      if (query.type && query.type !== "All") {
        results = results.filter((v) => v.type === query.type);
      }
      if (query.status) {
        results = results.filter((v) => v.status === query.status);
      }
      return results;
    },

    findById: async (id) => {
      if (!id) return null;
      const target = id.toString().toLowerCase();
      return (
        memoryVehicles.find(
          (v) =>
            v._id.toString().toLowerCase() === target ||
            v.name.toLowerCase().replaceAll(" ", "-") === target
        ) || null
      );
    },

    create: async (vehicleData) => {
      const vehicle = {
        _id: `66d8e002a1b2c3d4e5f6${String(memoryVehicles.length + 1).padStart(4, "0")}`,
        ...vehicleData,
        status: vehicleData.status || "Available",
        createdAt: new Date(),
      };
      memoryVehicles.push(vehicle);
      return vehicle;
    },

    update: async (id, updateData = {}) => {
      const vehicle = await memoryStore.vehicles.findById(id);
      if (!vehicle) return null;
      Object.assign(vehicle, updateData);
      return vehicle;
    },

    remove: async (id) => {
      const index = memoryVehicles.findIndex((vehicle) => vehicle._id.toString() === id.toString());
      if (index === -1) return null;
      return memoryVehicles.splice(index, 1)[0];
    },
  },

  bookings: {
    find: async (query = {}) => {
      let results = [...memoryBookings];
      if (query.user) {
        const userId = query.user.toString();
        results = results.filter((b) => {
          const bUserId = typeof b.user === "object" ? b.user._id : b.user;
          return bUserId.toString() === userId;
        });
      }
      if (query.vehicle) {
        const vehicleId = query.vehicle.toString();
        results = results.filter((b) => {
          const currentVehicleId =
            typeof b.vehicle === "object" ? b.vehicle._id : b.vehicle;
          return currentVehicleId.toString() === vehicleId;
        });
      }
      if (query.bookingStatus) {
        if (query.bookingStatus.$ne) {
          results = results.filter((b) => b.bookingStatus !== query.bookingStatus.$ne);
        } else {
          const bookedStatuses = query.bookingStatus?.$in || [query.bookingStatus];
          results = results.filter((b) => bookedStatuses.includes(b.bookingStatus));
        }
      }
      if (query.paymentStatus) {
        results = results.filter((b) => b.paymentStatus === query.paymentStatus);
      }
      return results;
    },

    findById: async (id) => {
      if (!id) return null;
      const target = id.toString().toUpperCase();
      return (
        memoryBookings.find(
          (b) =>
            b._id.toString().toUpperCase() === target ||
            (b.bookingId && b.bookingId.toUpperCase() === target)
        ) || null
      );
    },

    update: async (id, updateData = {}) => {
      const booking = await memoryStore.bookings.findById(id);
      if (!booking) return null;
      Object.assign(booking, updateData);
      return booking;
    },

    create: async (bookingData) => {
      const _id = `66d8e003a1b2c3d4e5f6000${Math.floor(1000 + Math.random() * 9000)}`;
      const bookingId =
        bookingData.bookingId ||
        `VR-2026-${Math.floor(10000 + Math.random() * 90000)}`;

      let vehicleObj = bookingData.vehicle;
      if (typeof vehicleObj === "string") {
        vehicleObj =
          (await memoryStore.vehicles.findById(vehicleObj)) || memoryVehicles[0];
      }

      let userObj = bookingData.user;
      if (typeof userObj === "string") {
        userObj = (await memoryStore.users.findById(userObj)) || memoryUsers[0];
      }

      const newBooking = {
        _id,
        bookingId,
        user: userObj,
        vehicle: vehicleObj,
        pickupLocation: bookingData.pickupLocation || vehicleObj.location,
        pickupDateTime: new Date(bookingData.pickupDateTime),
        returnDateTime: new Date(bookingData.returnDateTime),
        duration: bookingData.duration,
        rentalPrice: bookingData.rentalPrice,
        serviceFee: bookingData.serviceFee,
        taxes: bookingData.taxes,
        totalAmount: bookingData.totalAmount,
        bookingStatus: bookingData.bookingStatus || "pending_payment",
        paymentStatus: bookingData.paymentStatus || "Pending",
        createdAt: new Date(),
      };

      memoryBookings.unshift(newBooking);
      return newBooking;
    },
  },
};
