import { ai } from "../utils/genai";
import { nourishTemplate } from "../prompts/nourishBot.template";

export async function nourishBotReply(username: string, message: string) {
  console.log("🚀 nourishBotReply called");
  console.log("👤 Username:", username);
  console.log("➡️ Message:", message);

  const prompt = nourishTemplate(username, message);

  // Using single string (simplest format as in your example)
  const response = await ai.models.generateContent({
    model: "gemini-2.5-pro",
    contents: prompt, // just a string
  });

  console.log("✅ Gemini Response:", response.text);

  return response.text;
}
