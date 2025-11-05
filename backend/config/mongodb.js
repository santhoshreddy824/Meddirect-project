import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the backend directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error("❌ MONGODB_URI not found in environment variables");
    }

    // Connection options with better error handling
    const options = {
      serverSelectionTimeoutMS: 10000, // 10 seconds
      socketTimeoutMS: 45000, // 45 seconds
      maxPoolSize: 10,
      minPoolSize: 1,
      retryWrites: true,
      retryReads: true,
    };

    // Connection event listeners
    mongoose.connection.on("connected", () => {
      console.log("✅ Database Connected Successfully");
    });

    mongoose.connection.on("error", (err) => {
      console.error("❌ Database Connection Error:", err.message);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("⚠️ Database Disconnected");
    });

    // Connect to MongoDB with options
    console.log("🔗 Attempting to connect to MongoDB...");
    await mongoose.connect(mongoUri, options);
    
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:", error.message);
    throw error;
  }
};

export default connectDB;
