import { Request, Response } from "express";
import Chat from "../schemas/chat.schema";
import { nourishBotReply } from "../services/chat.service";

export const chatController = async (req: Request, res: Response) => {
  try {
    const { username, message } = req.body;

    console.log("📩 /chat endpoint hit");
    console.log("👤 Username:", username);
    console.log("💬 Message:", message);

    // Generate AI reply
    const reply = await nourishBotReply(username, message);
    console.log("📤 AI Reply:", reply);

    // Save chat to user's document (create if not exists)
    const userChat = await Chat.findOneAndUpdate(
      { username },
      { $push: { chats: { message, reply } } },
      { new: true, upsert: true } // return updated document
    );

    console.log("💾 Chat saved to DB:", userChat);

    // Return full document
    res.json(userChat);
  } catch (err) {
    console.error("❌ Chat error:", err);
    res.status(500).json({ message: "Chat failed" });
  }
};
