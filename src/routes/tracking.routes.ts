import { Router } from "express";
import { getTrackingSummary, getCalorieGraphData, getWaterGraphData, getTrackingGraphData } from "../controllers/tracking.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = Router();

// GET /api/tracking/summary
router.get("/summary", authenticateToken, getTrackingSummary);

// GET /api/tracking/calories - Get calorie graph data
router.get("/calories", authenticateToken, getCalorieGraphData);

// GET /api/tracking/water - Get water intake graph data
router.get("/water", authenticateToken, getWaterGraphData);

// GET /api/tracking/graph - DEPRECATED: Get combined graph data
router.get("/graph", authenticateToken, getTrackingGraphData);

export default router;
