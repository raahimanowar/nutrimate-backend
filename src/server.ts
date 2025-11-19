import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { logger } from "./utils/logger.js";
import { connectDB } from "./db/db.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import inventoryRoutes from "./routes/inventory.routes.js";
import dailyLogRoutes from "./routes/daily-log.routes.js";
import uploadRoutes from "./routes/upload.routes.js";

dotenv.config();

const app = express();

// ---------------- SECURITY MIDDLEWARE ----------------
app.use(helmet()); // Security headers

// ---------------- CORE MIDDLEWARE ----------------
app.use(express.json());
app.use(
  cors({
    origin: process.env.NODE_ENV === 'production'
      ? (process.env.FRONTEND_URL || 'https://yourdomain.com') // Restrict to your frontend domain in production
      : "*", // Allow all origins in development
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  })
);

// Rate limiting (configurable via environment) - AFTER CORS
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes default
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // 100 requests default
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for OPTIONS requests (CORS preflight)
  skip: (req) => req.method === 'OPTIONS'
});

app.use(limiter); // Apply rate limiting after CORS

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

// Upload routes (protected)
app.use("/api/upload", uploadRoutes);

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

// ---------------- SERVER ----------------
const port = Number(process.env.PORT) || 5000;

app.listen(port, () => {
  logger.success(`🚀 Server running at http://localhost:${port}/api`);
});
