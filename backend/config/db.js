import mongoose from "mongoose";

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  // Never buffer queries when disconnected to avoid hanging requests
  mongoose.set("bufferCommands", false);

  if (!mongoUri) {
    throw new Error("MONGODB_URI is not defined in backend/.env");
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 1500,
    });
    console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);
    return true;
  } catch (error) {
    throw new Error(`MongoDB connection failed: ${error.message}`);
  }
};

export default connectDB;

