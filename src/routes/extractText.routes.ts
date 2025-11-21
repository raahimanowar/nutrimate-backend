import { Router } from "express";
import upload from "../middleware/upload.js";
import { uploadAndExtractText } from "../controllers/extractText.controller";

const router = Router();

router.post("/", upload.single("image"), uploadAndExtractText);

export default router;
