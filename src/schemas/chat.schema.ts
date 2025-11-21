import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    chats: [
      {
        message: { type: String, required: true },
        reply: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model("Chat", ChatSchema);
