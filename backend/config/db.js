import mongoose from "mongoose";

const connectDB = async () => {
  const rawMongoUri = (process.env.MONGODB_URI ?? "").trim();
  const mongoUri = rawMongoUri.replace(/^['"]+|['"]+$/g, "");

  // Never buffer queries when disconnected to avoid hanging requests
  mongoose.set("bufferCommands", false);

  if (!mongoUri) {
    throw new Error("MONGODB_URI is not defined in backend/.env");
  }

  if (mongoUri.includes(" ") || mongoUri.includes("\n") || mongoUri.includes("\r")) {
    throw new Error("MONGODB_URI has invalid whitespace or malformed content");
  }

  if (!mongoUri.startsWith("mongodb://") && !mongoUri.startsWith("mongodb+srv://")) {
    throw new Error("MONGODB_URI is invalid: expected mongodb:// or mongodb+srv://");
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

