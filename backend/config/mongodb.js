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

    // Check if MongoDB URI is still the placeholder
    if (mongoUri === 'mongodb+srv://username:password@cluster.mongodb.net/database') {
      throw new Error("❌ Please configure a real MongoDB URI in your .env file. Current URI is a placeholder.");
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
    console.log("💡 To fix this:");
    console.log("1. Create a MongoDB Atlas account at https://cloud.mongodb.com");
    console.log("2. Create a cluster and get your connection string");
    console.log("3. Update MONGODB_URI in your .env file");
    throw error;
  }
};

export default connectDB;
