import { Router } from "express";
import {
  getExpirationRiskPredictions,
  getHighRiskItems,
  getSeasonalAlerts
} from "../controllers/expirationRisk.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * @route   GET /api/expiration-risk/predictions
 * @desc    Get comprehensive AI-powered expiration risk predictions for user's inventory
 * @access  Private
 * @returns Detailed risk analysis, recommendations, and insights for all inventory items
 */
router.get("/predictions", getExpirationRiskPredictions);

/**
 * @route   GET /api/expiration-risk/high-risk
 * @desc    Get only critical and high-risk items that need immediate attention
 * @access  Private
 * @returns Filtered list of items at risk of expiring soon, perfect for quick alerts
 */
router.get("/high-risk", getHighRiskItems);

/**
 * @route   GET /api/expiration-risk/seasonal-alerts
 * @desc    Get seasonal alerts and weather-related expiration risks
 * @access  Private
 * @returns Season-specific warnings and recommendations based on user location
 */
router.get("/seasonal-alerts", getSeasonalAlerts);

export default router;