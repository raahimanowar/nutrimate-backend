import { Router } from "express";
import {
  getNutrientGapPrediction,
  getNutrientDeficiencies,
  getFoodSuggestions,
  getMealSuggestions,
  getNutritionInsights
} from "../controllers/nutrientGap.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * @route   GET /api/nutrient-gap/prediction
 * @desc    Get comprehensive AI-powered nutrient gap prediction and analysis
 * @access  Private
 * @query   analysisDays - Number of days to analyze (default: 30, min: 7, max: 90)
 * @returns Complete nutrient analysis with food and meal suggestions
 */
router.get("/prediction", getNutrientGapPrediction);

/**
 * @route   GET /api/nutrient-gap/deficiencies
 * @desc    Get detailed analysis of nutrient deficiencies
 * @access  Private
 * @query   analysisDays - Number of days to analyze (default: 30, min: 7, max: 90)
 * @query   severity - Filter by deficiency level (mild|moderate|severe, default: moderate)
 * @returns Nutrient deficiencies with health implications and severity levels
 */
router.get("/deficiencies", getNutrientDeficiencies);

/**
 * @route   GET /api/nutrient-gap/food-suggestions
 * @desc    Get specific food suggestions to fill identified nutrient gaps
 * @access  Private
 * @query   analysisDays - Number of days to analyze (default: 30, min: 7, max: 90)
 * @query   priority - Filter by suggestion priority (low|medium|high, default: high)
 * @query   availability - Filter by food availability (all|inventory|catalog, default: all)
 * @returns Specific food items with quantities, costs, and availability status
 */
router.get("/food-suggestions", getFoodSuggestions);

/**
 * @route   GET /api/nutrient-gap/meal-suggestions
 * @desc    Get meal suggestions that target multiple nutrient deficiencies
 * @access  Private
 * @query   analysisDays - Number of days to analyze (default: 30, min: 7, max: 90)
 * @query   mealType - Filter by meal type (breakfast|lunch|dinner|snack)
 * @returns Complete meal plans with ingredients and preparation instructions
 */
router.get("/meal-suggestions", getMealSuggestions);

/**
 * @route   GET /api/nutrient-gap/nutrition-insights
 * @desc    Get personalized nutrition insights and health recommendations
 * @access  Private
 * @query   analysisDays - Number of days to analyze (default: 30, min: 7, max: 90)
 * @returns Actionable insights, health risks, and improvement strategies
 */
router.get("/nutrition-insights", getNutritionInsights);

export default router;