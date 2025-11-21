import { Router } from "express";
import {
  getMealOptimization,
  getBudgetAnalysis,
  getNutritionalRecommendations,
  validateMealOptimizationRequest
} from "../controllers/mealOptimizer.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = Router();

// All meal optimizer routes are protected
router.use(authenticateToken);

// Get AI-powered meal optimization recommendations
router.post("/optimize", validateMealOptimizationRequest, getMealOptimization);

// Get budget analysis without AI (faster response)
router.post("/budget-analysis", getBudgetAnalysis);

// Get simple nutritional recommendations
router.get("/recommendations", getNutritionalRecommendations);

export default router;