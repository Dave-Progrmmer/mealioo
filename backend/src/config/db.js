import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      connectTimeoutMS: 10000, // Give it 10s to establish initial connection
      heartbeatFrequencyMS: 10000,
    };

    console.log("Attempting to connect to MongoDB...");

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log("✅ Successfully connected to MongoDB Atlas");
        return mongoose;
      })
      .catch((err) => {
        console.error("❌ MongoDB connection error details:");
        console.error("Name:", err.name);
        console.error("Message:", err.message);
        if (err.reason) {
          console.error("Reason:", JSON.stringify(err.reason, null, 2));
        }
        cached.promise = null; // Reset promise so we can retry
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
