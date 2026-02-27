const mongoose = require("mongoose");

let cachedConnection = null;
let cachedPromise = null;

const connectDB = async () => {
  if (cachedConnection) {
    return cachedConnection;
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not set");
  }

  if (!cachedPromise) {
    cachedPromise = mongoose
      .connect(process.env.MONGO_URI)
      .then((conn) => {
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        cachedConnection = conn;
        return conn;
      })
      .catch((error) => {
        cachedPromise = null;
        throw error;
      });
  }

  return cachedPromise;
};

module.exports = connectDB;
