import { v2 as cloudinary } from "cloudinary";

const connectCloudinary = async () => {
  try {
    // Check if Cloudinary credentials are provided
    if (!process.env.CLOUDINARY_CLOUD_NAME || 
        !process.env.CLOUDINARY_API_KEY || 
        !process.env.CLOUDINARY_API_SECRET ||
        process.env.CLOUDINARY_CLOUD_NAME === 'your_cloudinary_cloud_name') {
      console.log("⚠️ Cloudinary credentials not configured - image uploads will be disabled");
      return;
    }

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    
    console.log("✅ Cloudinary configured successfully");
  } catch (error) {
    console.error("❌ Cloudinary configuration failed:", error.message);
    console.log("⚠️ Continuing without Cloudinary - image uploads will be disabled");
  }
};

export default connectCloudinary;
