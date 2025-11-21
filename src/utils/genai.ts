import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { logger } from "./logger";

dotenv.config();

export const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

logger.success("Gemini API initialized");
