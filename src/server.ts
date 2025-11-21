import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { logger } from "./utils/logger.js";
import { connectDB } from "./db/db.js";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import inventoryRoutes from "./routes/inventory.routes.js";
import dailyLogRoutes from "./routes/daily-log.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import communityRoutes from "./routes/community.routes.js";
import resourceRoutes from "./routes/resource.route.js";
import trackingRoutes from "./routes/tracking.routes.js";
import foodImageRoutes from "./routes/food-image.routes.js";
import foodInventoryRoutes from "./routes/foodInventory.routes.js";
import mealOptimizerRoutes from "./routes/mealOptimizer.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import extractText from "./routes/extractText.routes.js";
import expirationRiskRoutes from "./routes/expirationRisk.routes.js";

dotenv.config();

const app = express();

app.set("trust proxy", true);

// CRITICAL: CORS must be the absolute FIRST middleware - handle OPTIONS immediately
app.use((req, res, next) => {
  // Set CORS headers on EVERY response
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://nutrimate-bice.vercel.app"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With, Accept"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,DELETE,OPTIONS,PATCH"
  );

  // Immediately respond to OPTIONS with 204 No Content
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  next();
});

// Backup: Also use cors() library
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow localhost for development
      if (
        !origin ||
        origin.includes("localhost") ||
        origin.includes("127.0.0.1")
      ) {
        callback(null, true);
      }
      // Allow production URLs
      else if (origin === "https://nutrimate-bice.vercel.app") {
        callback(null, true);
      }
      // Reject others
      else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
    ],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

connectDB();

app.get("/", (_req: Request, res: Response) => {
  res.redirect("/api");
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/daily-log", dailyLogRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/tracking", trackingRoutes);
app.use("/api/communities", communityRoutes);
app.use("/api/food-images", foodImageRoutes);
app.use("/api/food-inventory", foodInventoryRoutes);
app.use("/api/meal-optimizer", mealOptimizerRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/extractText", extractText);
app.use("/api/expiration-risk", expirationRiskRoutes);

app.get("/api", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    message: "Server is running!!!",
    version: "1.0.0",
  });
});

// Error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err.stack); // Log full error stack

  try {
    // Check if res is a valid Express response object
    if (
      res &&
      typeof res.status === "function" &&
      typeof res.json === "function"
    ) {
      return res.status(500).json({
        success: false,
        message: err.message || "Internal Server Error",
      });
    }

    // Fallback: Try to send response using basic methods
    if (
      res &&
      typeof res.writeHead === "function" &&
      typeof res.end === "function"
    ) {
      res.writeHead(500, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({
          success: false,
          message: err.message || "Internal Server Error",
        })
      );
    }

    // Last resort: Log and call next to prevent hanging
    console.error(
      "Could not send error response - response object:",
      typeof res,
      res
    );
    if (typeof next === "function") {
      next(err);
    }
  } catch (error) {
    console.error("Error in error handler:", error);
    if (typeof next === "function") {
      next(err);
    }
  }
});
const port = Number(process.env.PORT) || 5000;

app.listen(port, () => {
  logger.success(`🚀 Server running at http://localhost:${port}/api`);
});
