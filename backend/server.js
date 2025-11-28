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
import hospitalRouter from "./routes/hospitalRoute.js";
import { listLoginEvents } from "./controllers/adminController.js";
import authAdmin from "./middlewares/authAdmin.js";

// Load environment variables explicitly
dotenv.config();

// app config
const app = express();
const port = process.env.PORT || 4000;

// middlewares
app.use(express.json());

// Flexible CORS: allow configured URLs plus common local/dev and hosted patterns
const STATIC_ALLOWED = [
  'http://localhost:5175',
  'http://localhost:5174',
  'http://localhost:5173',
  'http://localhost:3000',
  'https://meddirect-frontend.onrender.com',
  'https://meddirect-admin.onrender.com',
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL,
].filter(Boolean);

const ORIGIN_PATTERNS = [
  /\.vercel\.app$/i,
  /\.onrender\.com$/i,
  /^http:\/\/localhost:(\d{2,5})$/
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g., health checks, server-to-server)
    if (!origin) return callback(null, true);
    if (STATIC_ALLOWED.includes(origin)) return callback(null, true);
    if (ORIGIN_PATTERNS.some((re) => re.test(origin))) return callback(null, true);
    return callback(new Error(`CORS blocked: ${origin}`));
  },
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
app.use("/api/hospital", hospitalRouter);

// Hard-wire critical admin endpoint to avoid 404 in case of router mismatch on some deployments
app.all("/api/admin/login-events", authAdmin, listLoginEvents);

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
    
    // Try to connect to MongoDB (required)
    await connectDB();
    
    // Try to connect to Cloudinary (optional)
    try {
      await connectCloudinary();
    } catch (cloudinaryError) {
      console.log("⚠️ Cloudinary setup skipped - image uploads will be limited");
    }
    
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
      console.log(`   - Health Check: http://localhost:${port}/api/health`);
      console.log(`   - FDA Test: http://localhost:${port}/test-fda`);
      console.log(`   - Doctor List: http://localhost:${port}/api/doctor/list`);
    });
  } catch (error) {
    console.error("❌ Failed to initialize connections:", error.message);
    console.log("");
    console.log("🔧 TROUBLESHOOTING:");
    console.log("1. Check your .env file has correct MongoDB URI");
    console.log("2. See backend/SETUP_GUIDE.md for detailed setup instructions");
    console.log("3. Ensure MongoDB Atlas cluster is running and accessible");
    console.log("");
    process.exit(1);
  }
};

initializeAndStart();

// JSON 404 handler for unknown API routes (prevents HTML DOCTYPE responses)
app.use((req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ success: false, message: `Not found: ${req.method} ${req.path}` });
  }
  return next();
});

// Generic error handler to return JSON for API paths
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return res.status(err.status || 500).json({ success: false, message: err.message || "Server error" });
  }
  return res.status(err.status || 500).send(err.message || "Server error");
});
