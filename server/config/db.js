const mongoose = require("mongoose");

let cached = null;

const connectDB = async () => {
  if (cached && mongoose.connection.readyState === 1) {
    return cached;
  }
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGO_URI environment variable is not set");
  }
  console.log("[DB] Connecting to:", uri.substring(0, 40) + "...");
  try {
    cached = await mongoose.connect(uri);
    console.log(`[DB] Connected: ${cached.connection.host}`);
    return cached;
  } catch (error) {
    console.error(`[DB] Connection error: ${error.message}`);
    cached = null;
    throw error;
  }
};

module.exports = connectDB;
