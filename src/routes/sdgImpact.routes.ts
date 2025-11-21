import { Router } from "express";
import {
  getSDGImpactScore,
  getSDGTrends,
  getSDGActionSteps,
  getEnvironmentalImpact,
  getSDGAchievements
} from "../controllers/sdgImpact.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * @route   GET /api/sdg-impact/score
 * @desc    Get comprehensive AI-powered SDG impact score analysis
 * @access  Private
 * @query   analysisDays - Number of days to analyze (default: 30, min: 7, max: 90)
 * @query   comparisonPeriod - Number of days for comparison (default: 7, min: 3, max: 30)
 * @returns Complete SDG 2 & 12 impact scoring with detailed analysis
 */
router.get("/score", getSDGImpactScore);

/**
 * @route   GET /api/sdg-impact/trends
 * @desc    Get SDG score trends and weekly insights on improvements
 * @access  Private
 * @query   analysisDays - Number of days to analyze (default: 30, min: 7, max: 90)
 * @query   comparisonPeriod - Number of days for comparison (default: 7, min: 3, max: 30)
 * @returns Weekly trends, SDG score changes, and improvement patterns
 */
router.get("/trends", getSDGTrends);

/**
 * @route   GET /api/sdg-impact/action-steps
 * @desc    Get actionable next steps to improve SDG score based on lowest scoring areas
 * @access  Private
 * @query   analysisDays - Number of days to analyze (default: 30, min: 7, max: 90)
 * @query   comparisonPeriod - Number of days for comparison (default: 7, min: 3, max: 30)
 * @query   priority - Filter steps by priority (all|high|medium|low, default: all)
 * @returns Personalized action steps with impact estimates and SDG targets
 */
router.get("/action-steps", getSDGActionSteps);

/**
 * @route   GET /api/sdg-impact/environmental-impact
 * @desc    Get environmental impact metrics and sustainability contributions
 * @access  Private
 * @query   analysisDays - Number of days to analyze (default: 30, min: 7, max: 90)
 * @query   comparisonPeriod - Number of days for comparison (default: 7, min: 3, max: 30)
 * @returns CO2 reduction, water saved, waste prevented, and sustainability metrics
 */
router.get("/environmental-impact", getEnvironmentalImpact);

/**
 * @route   GET /api/sdg-impact/achievements
 * @desc    Get SDG achievements, badges, milestones, and progress tracking
 * @access  Private
 * @query   analysisDays - Number of days to analyze (default: 30, min: 7, max: 90)
 * @query   comparisonPeriod - Number of days for comparison (default: 7, min: 3, max: 30)
 * @returns Badges earned, milestones reached, streaks, and next objectives
 */
router.get("/achievements", getSDGAchievements);

export default router;