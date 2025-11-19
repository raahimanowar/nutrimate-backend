import dotenv from "dotenv";
import mongoose from "mongoose";
import { logger } from "../utils/logger.js";

dotenv.config();

const DATABASE_URL = process.env.DB_URL;

if (!DATABASE_URL) {
  logger.error("DB_URL is not defined in environment variables");
  process.exit(1);
}

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(DATABASE_URL);
    logger.success("MongoDB connected successfully");
  } catch (err) {
    logger.error(`MongoDB connection error: ${(err as Error).message}`);
    process.exit(1);
  }
};
