import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { logger } from "./utils/logger.js";
import { connectDB } from "./db/db.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import inventoryRoutes from "./routes/inventory.routes.js";

dotenv.config();

const app = express();

// ---------------- MIDDLEWARE ----------------
app.use(express.json());
app.use(
  cors({
    origin: "*",
    methods: "*",
    allowedHeaders: "*",
  })
);

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
