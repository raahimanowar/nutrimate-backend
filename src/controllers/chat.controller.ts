import { Request, Response } from "express";
import { nourishBotReply } from "../services/generateChat.service";

export const chatController = async (req: Request, res: Response) => {
  console.log("📩 /chat endpoint hit");

  try {
    const { username, message } = req.body;

    console.log("👤 username:", username);
    console.log("💬 message:", message);

    const reply = await nourishBotReply(username, message);

    console.log("📤 Sending reply");

    res.json({ reply });
  } catch (err) {
    console.error("❌ Chat error:", err);
    res.status(500).json({ message: "Chat failed" });
  }
};
