import { Router } from "express";
import { getTrackingSummary } from "../controllers/tracking.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = Router();

// GET /api/tracking/summary
router.get("/summary", authenticateToken, getTrackingSummary);

export default router;
