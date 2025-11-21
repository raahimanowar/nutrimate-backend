import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

export const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});
console.log(process.env.GEMINI_API_KEY);
