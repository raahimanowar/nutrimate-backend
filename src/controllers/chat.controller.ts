import { Request, Response } from "express";
import Chat from "../schemas/chat.schema";
import User from "../schemas/users.schema";
import { ai } from "../utils/genai";

export const chatController = async (req: Request, res: Response) => {
  try {
    const username = req.body.username?.trim();
    const message = req.body.message?.trim();

    if (!username || !message) {
      return res
        .status(400)
        .json({ message: "Username and message are required" });
    }

    console.log("📩 /chat endpoint hit", { username, message });

    // Fetch user data
    const user = await User.findOne({ username }).lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    // Log user data to verify
    console.log("👤 User data retrieved:", user);

    // Minimal, focused, token-friendly prompt
    const prompt = `
You are NourishBot, a chatbot specializing ONLY in:
- Reducing food waste
- Nutrition balancing
- Budget meal planning
- Creative ideas for leftovers
- Local food sharing
- Environmental impacts of food

Use ONLY the following information:
- User message: "${message}"
- User data: ${JSON.stringify(user)}

Rules:
- Only answer questions related to the subjects above.
- If the user asks something unrelated (coding, space, sports, etc.), respond politely: 
  "Sorry, I am not familiar with that topic. I only provide advice on food, nutrition, and sustainability."
- Keep responses concise, practical, and relevant.
- Personalize answers using the user's dietary needs, allergies, budget, and preferences.
`;

    // Generate AI reply
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
    });

    const reply = response.text;
    console.log("📤 AI Reply:", reply);

    // Save chat
    const userChat = await Chat.findOneAndUpdate(
      { username },
      { $push: { chats: { message, reply } } },
      { new: true, upsert: true }
    );

    res.json(userChat);
  } catch (err) {
    console.error("❌ Chat error:", err);
    res.status(500).json({ message: "Chat failed", error: err.message });
  }
};
