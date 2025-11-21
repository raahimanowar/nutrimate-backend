import { Router } from "express";
import {
  getConsumptionPatterns,
  getWeeklyTrends,
  getCategoryAnalysis,
  getWastePredictions,
  getHeatmapData,
  getNutritionalImbalances
} from "../controllers/patternAnalyzer.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * @route   GET /api/pattern-analyzer/analysis
 * @desc    Get comprehensive AI-powered consumption pattern analysis
 * @access  Private
 * @query   periodDays - Number of days to analyze (default: 30, min: 7, max: 365)
 * @query   includeInventoryWastePrediction - Include waste prediction analysis (default: true)
 * @returns Complete pattern analysis with trends, insights, and recommendations
 */
router.get("/analysis", getConsumptionPatterns);

/**
 * @route   GET /api/pattern-analyzer/weekly-trends
 * @desc    Get weekly consumption trends and meal timing patterns
 * @access  Private
 * @query   periodDays - Number of days to analyze (default: 30, min: 7, max: 365)
 * @returns Weekly trends, meal timing, and eating frequency data
 */
router.get("/weekly-trends", getWeeklyTrends);

/**
 * @route   GET /api/pattern-analyzer/category-analysis
 * @desc    Get detailed category consumption analysis and imbalances
 * @access  Private
 * @query   periodDays - Number of days to analyze (default: 30, min: 7, max: 365)
 * @returns Category consumption patterns, nutritional imbalances, and insights
 */
router.get("/category-analysis", getCategoryAnalysis);

/**
 * @route   GET /api/pattern-analyzer/waste-predictions
 * @desc    Get AI-powered waste predictions for current inventory items
 * @access  Private
 * @query   periodDays - Number of days to base predictions on (default: 14, min: 7, max: 90)
 * @returns Waste risk predictions, consumption rate recommendations, and prevention strategies
 */
router.get("/waste-predictions", getWastePredictions);

/**
 * @route   GET /api/pattern-analyzer/heatmap-data
 * @desc    Get heatmap data for consumption visualization
 * @access  Private
 * @query   periodDays - Number of days to analyze (default: 30, min: 7, max: 365)
 * @returns Formatted data for heatmap visualization (day/time/category intensity)
 */
router.get("/heatmap-data", getHeatmapData);

/**
 * @route   GET /api/pattern-analyzer/nutritional-imbalances
 * @desc    Get detailed nutritional imbalance analysis and recommendations
 * @access  Private
 * @query   periodDays - Number of days to analyze (default: 30, min: 7, max: 365)
 * @returns Nutritional deficiencies, excesses, health implications, and dietary recommendations
 */
router.get("/nutritional-imbalances", getNutritionalImbalances);

export default router;