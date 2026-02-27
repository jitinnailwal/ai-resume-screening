const mongoose = require("mongoose");

let cached = null;

const connectDB = async () => {
  if (cached && mongoose.connection.readyState === 1) {
    return cached;
  }
  try {
    cached = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${cached.connection.host}`);
    return cached;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    cached = null;
    throw error;
  }
};

module.exports = connectDB;
