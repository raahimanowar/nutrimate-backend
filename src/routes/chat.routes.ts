import { Router } from "express";
import { chatController, getChatHistory } from "../controllers/chat.controller";

const router = Router();
router.post("/", chatController);
router.get("/:username", getChatHistory);

export default router;
