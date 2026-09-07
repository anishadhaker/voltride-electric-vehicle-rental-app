import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import connectDB from "./config/db.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import vehicleRoutes from "./routes/vehicleRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the backend environment file explicitly so the Atlas URI resolves from backend/.env
// even when the process is started from the project root or another working directory.
dotenv.config({ path: path.resolve(__dirname, ".env") });

// Initialize Express app
const app = express();

// MongoDB is the persistent source of truth for accounts and application data.

// Global Middlewares
app.use(
  cors({
    origin: (origin, callback) => {
      // In development, allow no origin (mobile/curl), any localhost/127.0.0.1 port, or LAN IPs
      if (
        !origin ||
        /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) ||
        origin.startsWith("http://192.168.") ||
        origin.startsWith("http://10.")
      ) {
        return callback(null, true);
      }
      // Fallback: allow all origins in dev environment to prevent any Network Error
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "VoltRide API is running",
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/users", userRoutes);

// 404 & Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

// Start HTTP Server
const PORT = Number(process.env.PORT) || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 VoltRide Backend server listening on port ${PORT}`);
      console.log(`📡 Health Check URL: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error(`❌ VoltRide backend stopped: ${error.message}`);
    process.exitCode = 1;
  }
};

startServer();

export default app;
