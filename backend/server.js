import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import adminRouter from "./routes/adminRoute.js";
import doctorRouter from "./routes/doctorRoute.js";
import userRouter from "./routes/userRoute.js";
import paymentRouter from "./routes/paymentRoute.js";
import medicationRouter from "./routes/medicationRoute.js";

// Load environment variables explicitly
dotenv.config();

// app config
const app = express();
const port = process.env.PORT || 4000;

// middlewares
app.use(express.json());
app.use(cors({
  origin: [
    'http://localhost:5175', 
    'http://localhost:5174', 
    'http://localhost:3000', 
    'http://localhost:5173',
    'https://meddirect-frontend.onrender.com',
    'https://meddirect-admin.onrender.com',
    process.env.FRONTEND_URL,
    process.env.ADMIN_URL
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'token', 'aToken', 'dToken']
}));

// Serve static files from public directory
app.use('/images', express.static('public/images'));

// api endpoints
app.use("/api/admin", adminRouter);
app.use("/api/doctor", doctorRouter);
app.use("/api/user", userRouter);
app.use("/api/payment", paymentRouter);
app.use("/api/medication", medicationRouter);

app.get("/", (req, res) => {
  res.send("MEDDIRECT API WORKING");
});

// Health check endpoint for Render
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "MedDirect Backend API",
    version: "1.0.0",
    uptime: process.uptime()
  });
});

// Test endpoint for OpenFDA API
app.get("/test-fda", async (req, res) => {
  try {
    const { default: OpenFDAService } = await import('./services/openFDAService.js');
    const fdaService = new OpenFDAService();
    
    const result = await fdaService.searchMedicine("aspirin");
    
    res.json({
      success: true,
      message: "OpenFDA API test",
      result: result
    });
  } catch (error) {
    res.json({
      success: false,
      error: error.message
    });
  }
});

// Initialize database and cloudinary connections, then start server
const initializeAndStart = async () => {
  try {
    console.log("🔄 Initializing connections...");
    await connectDB();
    await connectCloudinary();
    console.log("✅ All connections initialized successfully");
    
    // Start server after successful connections
    app.listen(port, () => {
      console.log(`✅ Server started successfully on port ${port}`);
      console.log(`🌐 API available at: http://localhost:${port}`);
      console.log(`📚 API endpoints:`);
      console.log(`   - Admin: http://localhost:${port}/api/admin`);
      console.log(`   - Doctor: http://localhost:${port}/api/doctor`);
      console.log(`   - User: http://localhost:${port}/api/user`);
      console.log(`   - Payment: http://localhost:${port}/api/payment`);
      console.log(`   - Medication: http://localhost:${port}/api/medication`);
      console.log(`🧪 Test endpoints:`);
      console.log(`   - FDA Test: http://localhost:${port}/test-fda`);
      console.log(`   - Doctor List: http://localhost:${port}/api/doctor/list`);
      console.log(`   - FDA Search: http://localhost:${port}/api/medication/fda/search/aspirin`);
    });
  } catch (error) {
    console.error("❌ Failed to initialize connections:", error);
    process.exit(1);
  }
};

initializeAndStart();
