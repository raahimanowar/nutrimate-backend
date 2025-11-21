import { Response } from "express";
import { logger } from "../utils/logger.js";
import mealOptimizerService from "../services/mealOptimizer.service.js";
import { AuthRequest } from "../types/auth.types.js";
import { body, validationResult } from "express-validator";

interface MealOptimizationRequest {
  budget?: number;
  dietaryRestrictions?: string[];
  preferences?: string[];
  familySize?: number;
  weeklyBudget?: boolean;
}

interface UserProfile {
  budget: number;
  dietaryRestrictions?: string[];
  preferences?: string[];
  familySize?: number;
  weeklyBudget?: boolean;
}

// Input validation for meal optimization
export const validateMealOptimizationRequest = [
  body('budget')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Budget must be a positive number'),

  body('familySize')
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage('Family size must be between 1 and 20'),

  body('weeklyBudget')
    .optional()
    .isBoolean()
    .withMessage('Weekly budget must be a boolean'),

  body('dietaryRestrictions')
    .optional()
    .isArray()
    .withMessage('Dietary restrictions must be an array'),

  body('dietaryRestrictions.*')
    .optional()
    .isString()
    .withMessage('Each dietary restriction must be a string'),

  body('preferences')
    .optional()
    .isArray()
    .withMessage('Preferences must be an array'),

  body('preferences.*')
    .optional()
    .isString()
    .withMessage('Each preference must be a string')
];

// Get meal optimization recommendations
export const getMealOptimization = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array()
      });
    }

    // Get user preferences from request or use defaults
    const requestData: MealOptimizationRequest = req.body;

    // Create user profile for optimization
    const userProfile: UserProfile = {
      budget: requestData.budget || 200, // Default budget
      dietaryRestrictions: requestData.dietaryRestrictions || [],
      preferences: requestData.preferences || [],
      familySize: requestData.familySize || 1,
      weeklyBudget: requestData.weeklyBudget || false
    };

    logger.info(`Starting meal optimization for user ${req.user.username} with budget $${userProfile.budget}`);

    // Get AI-powered meal optimization
    const optimizationResult = await mealOptimizerService.optimizeMeals(
      req.user.userId,
      userProfile
    );

    logger.info(`Meal optimization completed for user ${req.user.username}. Recommended ${optimizationResult.recommendations.length} items`);

    res.status(200).json({
      success: true,
      message: "Meal optimization completed successfully",
      data: optimizationResult
    });

  } catch (error) {
    logger.error(`Meal optimization error for user ${req.user?.username}: ${(error as Error).message}`);

    // Handle different types of errors
    if ((error as Error).message.includes('API')) {
      res.status(503).json({
        success: false,
        message: "AI service temporarily unavailable. Please try again later.",
        error: "AI_SERVICE_ERROR"
      });
    } else if ((error as Error).message.includes('budget')) {
      res.status(400).json({
        success: false,
        message: "Invalid budget configuration provided.",
        error: "INVALID_BUDGET"
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Internal server error during meal optimization",
        error: "INTERNAL_ERROR"
      });
    }
  }
};

// Get quick budget analysis
export const getBudgetAnalysis = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const { budget, familySize = 1, weeklyBudget = false } = req.body;

    if (!budget || budget <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid budget is required"
      });
    }

    logger.info(`Budget analysis requested for user ${req.user.username}`);

    // Get basic inventory and catalog analysis without AI
    const userInventory = await mealOptimizerService['getUserInventory'](req.user.userId);
    const foodCatalog = await mealOptimizerService['getFoodCatalog']();

    const totalBudget = weeklyBudget ? budget * 4 : budget;
    const inventoryValue = userInventory.reduce((total, item) => total + (item.quantity * item.costPerUnit), 0);

    // Basic analysis without AI
    const analysis = {
      budget: {
        total: totalBudget,
        weekly: weeklyBudget ? budget : totalBudget / 4,
        allocated: 0,
        remaining: totalBudget
      },
      currentInventory: {
        totalItems: userInventory.length,
        totalValue: inventoryValue,
        categories: userInventory.reduce((cats, item) => {
          cats[item.category] = (cats[item.category] || 0) + 1;
          return cats;
        }, {} as Record<string, number>)
      },
      availableOptions: {
        totalItems: foodCatalog.length,
        averageCost: foodCatalog.reduce((sum, item) => sum + item.costPerUnit, 0) / foodCatalog.length,
        categories: foodCatalog.reduce((cats, item) => {
          cats[item.category] = (cats[item.category] || 0) + 1;
          return cats;
        }, {} as Record<string, number>)
      },
      recommendations: {
        budgetUtilization: inventoryValue > 0 ?
          `Your current inventory represents ${(inventoryValue / totalBudget * 100).toFixed(1)}% of your budget` :
          'No current inventory found',
        suggestedAllocation: {
          proteins: totalBudget * 0.35,
          grains: totalBudget * 0.25,
          vegetables: totalBudget * 0.20,
          fruits: totalBudget * 0.10,
          dairy: totalBudget * 0.05,
          other: totalBudget * 0.05
        }
      }
    };

    res.status(200).json({
      success: true,
      message: "Budget analysis completed",
      data: analysis
    });

  } catch (error) {
    logger.error(`Budget analysis error: ${(error as Error).message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error during budget analysis"
    });
  }
};

// Get nutritional recommendations (simpler version without full optimization)
export const getNutritionalRecommendations = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const { categories, budget } = req.query;

    logger.info(`Nutritional recommendations requested for user ${req.user.username}`);

    // Get basic food catalog info
    const foodCatalog = await mealOptimizerService['getFoodCatalog']();

    let filteredCatalog = foodCatalog;

    // Filter by categories if provided
    if (categories) {
      const categoryList = (categories as string).split(',');
      filteredCatalog = foodCatalog.filter(item =>
        categoryList.includes(item.category)
      );
    }

    // Sort by cost-effectiveness (lower cost per item first)
    filteredCatalog.sort((a, b) => a.costPerUnit - b.costPerUnit);

    // Limit results based on budget
    const maxItems = budget ? Math.floor(Number(budget) / filteredCatalog[0]?.costPerUnit || 1) : 20;
    const recommendations = filteredCatalog.slice(0, Math.min(maxItems, 15));

    const totalCost = recommendations.reduce((sum, item) => sum + item.costPerUnit, 0);

    res.status(200).json({
      success: true,
      message: "Nutritional recommendations generated",
      data: {
        recommendations: recommendations.map(item => ({
          name: item.name,
          category: item.category,
          costPerUnit: item.costPerUnit,
          expirationDays: item.expirationDays,
          nutritionalScore: calculateNutritionalScore(item.category)
        })),
        summary: {
          totalItems: recommendations.length,
          totalCost,
          averageCost: totalCost / recommendations.length,
          categories: [...new Set(recommendations.map(item => item.category))]
        }
      }
    });

  } catch (error) {
    logger.error(`Nutritional recommendations error: ${(error as Error).message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error while getting recommendations"
    });
  }
};

// Helper function to calculate basic nutritional score
function calculateNutritionalScore(category: string): number {
  const scores: Record<string, number> = {
    fruits: 9,
    vegetables: 10,
    protein: 8,
    grains: 7,
    dairy: 6,
    beverages: 5,
    snacks: 4,
    other: 3
  };

  return scores[category] || 5;
}