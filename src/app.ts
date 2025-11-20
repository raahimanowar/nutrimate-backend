import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import { logger } from "./utils/logger.js";
import { connectDB } from "./db/db.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import inventoryRoutes from "./routes/inventory.routes.js";
import dailyLogRoutes from "./routes/daily-log.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import foodImageRoutes from "./routes/food-image.routes.js";
import communityRoutes from "./routes/community.routes.js";
import resourceRoutes from "./routes/resource.route.js";
import trackingRoutes from "./routes/tracking.routes.js";

dotenv.config();

// Create Express app
const app = express();

// ---------------- PROXY CONFIGURATION ----------------
// Trust proxy settings for proper IP detection behind reverse proxies
app.set('trust proxy', true);

// ---------------- CORE MIDDLEWARE ----------------
// FIX 1: CORS must be the FIRST middleware - handle OPTIONS immediately
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://nutrimate-bice.vercel.app");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS,PATCH");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200); // VERY IMPORTANT - respond immediately to preflight
  }

  next();
});

// FIX 2: Also enable cors() library
app.use(
  cors({
    origin: "https://nutrimate-bice.vercel.app",
    credentials: true,
    methods: "GET,POST,PUT,DELETE,OPTIONS,PATCH",
  })
);

// ---------------- SECURITY MIDDLEWARE ----------------
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
})); // Security headers

// Body parser middleware - MUST be before routes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ---------------- DATABASE ----------------
connectDB();

// ---------------- ROUTES ----------------
app.get("/", (_req, res) => {
  res.redirect("/api");
});

// Tasks routes
// app.use("/api/tasks", tasksRouter);

// Auth routes
app.use("/api/auth", authRoutes);

// User routes (protected)
app.use("/api/users", userRoutes);

// Inventory routes (protected)
app.use("/api/inventory", inventoryRoutes);

// Daily log routes (protected)
app.use("/api/daily-log", dailyLogRoutes);
// Resource routes <- added
app.use("/api/resources", resourceRoutes);

// Upload routes (protected)
app.use("/api/upload", uploadRoutes);

// Food image routes (protected) - for food scanning functionality
app.use("/api/food-images", foodImageRoutes);

app.use("/api/tracking", trackingRoutes);
// Community routes (protected)
app.use("/api/communities", communityRoutes);

// API info route
app.get("/api", (_req, res) => {
  const response = {
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    message: "Server is running!!!",
    version: "1.0.0",
  };
  res.json(response);
});

// Export the Express app
export default app;