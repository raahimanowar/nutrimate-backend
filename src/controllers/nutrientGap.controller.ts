import { Request, Response } from "express";
import { logger } from "../utils/logger.js";
import nutrientGapService from "../services/nutrientGap.service.js";
import { AuthRequest } from "../types/auth.types.js";

// Get comprehensive nutrient gap prediction
export const getNutrientGapPrediction = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please log in to access nutrient gap analysis.",
        error: "USER_NOT_AUTHENTICATED"
      });
    }

    const { analysisDays = 30 } = req.query;

    // Validate parameters
    const parsedAnalysisDays = Math.min(Math.max(parseInt(analysisDays as string) || 30, 7), 90); // 7-90 days

    logger.info(`Starting nutrient gap prediction for user ${req.user.userId} over ${parsedAnalysisDays} days`);

    const nutrientGapAnalysis = await nutrientGapService.predictNutrientGaps(
      req.user.userId,
      parsedAnalysisDays
    );

    logger.info(`Successfully completed nutrient gap analysis for user ${req.user.userId}`);

    res.status(200).json({
      success: true,
      message: "Nutrient gap prediction completed successfully",
      data: nutrientGapAnalysis
    });

  } catch (error) {
    logger.error(`Nutrient gap prediction error: ${(error as Error).message}`);

    if ((error as Error).message.includes('User not found')) {
      return res.status(404).json({
        success: false,
        message: "User profile not found. Please ensure your account is properly set up.",
        error: "USER_NOT_FOUND"
      });
    }

    if ((error as Error).message.includes('Failed to predict nutrient gaps')) {
      return res.status(503).json({
        success: false,
        message: "AI service temporarily unavailable. Please try again in a few moments.",
        error: "AI_SERVICE_UNAVAILABLE",
        retryAfter: 30
      });
    }

    res.status(500).json({
      success: false,
      message: "An error occurred during nutrient gap analysis. Please try again later.",
      error: "INTERNAL_SERVER_ERROR"
    });
  }
};

// Get specific nutrient deficiencies only
export const getNutrientDeficiencies = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        error: "USER_NOT_AUTHENTICATED"
      });
    }

    const { analysisDays = 30, severity = 'moderate' } = req.query;
    const parsedAnalysisDays = Math.min(Math.max(parseInt(analysisDays as string) || 30, 7), 90);

    logger.info(`Fetching nutrient deficiencies for user ${req.user.userId} over ${parsedAnalysisDays} days`);

    const nutrientGapAnalysis = await nutrientGapService.predictNutrientGaps(
      req.user.userId,
      parsedAnalysisDays
    );

    // Filter deficiencies by severity level
    const severityLevels = {
      mild: ['mild', 'moderate', 'severe'],
      moderate: ['moderate', 'severe'],
      severe: ['severe']
    };

    const filteredDeficiencies = nutrientGapAnalysis.nutrientAnalysis.filter(
      nutrient => severityLevels[severity as keyof typeof severityLevels]?.includes(nutrient.deficiencyLevel)
    );

    const priorityDeficiencies = filteredDeficiencies.filter(
      nutrient => nutrient.deficiencyLevel === 'severe' || nutrient.deficiencyLevel === 'moderate'
    );

    res.status(200).json({
      success: true,
      message: "Nutrient deficiencies retrieved successfully",
      data: {
        summary: {
          totalDeficiencies: nutrientGapAnalysis.nutrientAnalysis.length,
          filteredDeficiencies: filteredDeficiencies.length,
          priorityDeficiencies: priorityDeficiencies.length,
          overallNutritionScore: nutrientGapAnalysis.summary.overallNutritionScore,
          analysisPeriod: nutrientGapAnalysis.summary.analysisPeriod
        },
        nutrientAnalysis: filteredDeficiencies,
        priorityActions: priorityDeficiencies.flatMap(n => n.healthImplications),
        insights: {
          keyFindings: nutrientGapAnalysis.insights.keyFindings,
          recommendations: nutrientGapAnalysis.insights.recommendations
        }
      }
    });

  } catch (error) {
    logger.error(`Nutrient deficiencies fetch error: ${(error as Error).message}`);

    res.status(500).json({
      success: false,
      message: "Failed to fetch nutrient deficiencies. Please try again later.",
      error: "INTERNAL_SERVER_ERROR"
    });
  }
};

// Get food suggestions to fill nutrient gaps
export const getFoodSuggestions = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        error: "USER_NOT_AUTHENTICATED"
      });
    }

    const { analysisDays = 30, priority = 'high', availability = 'all' } = req.query;
    const parsedAnalysisDays = Math.min(Math.max(parseInt(analysisDays as string) || 30, 7), 90);

    logger.info(`Fetching food suggestions for user ${req.user.userId} over ${parsedAnalysisDays} days`);

    const nutrientGapAnalysis = await nutrientGapService.predictNutrientGaps(
      req.user.userId,
      parsedAnalysisDays
    );

    // Filter suggestions by priority
    const priorityLevels = {
      low: ['low', 'medium', 'high'],
      medium: ['medium', 'high'],
      high: ['high']
    };

    let filteredSuggestions = nutrientGapAnalysis.foodSuggestions.filter(
      suggestion => priorityLevels[priority as keyof typeof priorityLevels]?.includes(suggestion.priority)
    );

    // Filter by availability
    if (availability === 'inventory') {
      filteredSuggestions = filteredSuggestions.filter(s => s.availability === 'in_inventory');
    } else if (availability === 'catalog') {
      filteredSuggestions = filteredSuggestions.filter(s => s.availability === 'in_catalog');
    }

    // Group by category for better organization
    const suggestionsByCategory = filteredSuggestions.reduce((groups, suggestion) => {
      if (!groups[suggestion.category]) {
        groups[suggestion.category] = [];
      }
      groups[suggestion.category].push(suggestion);
      return groups;
    }, {} as Record<string, any[]>);

    // Calculate estimated total cost
    const totalEstimatedCost = filteredSuggestions.reduce((total, suggestion) =>
      total + (suggestion.estimatedCost || 0), 0
    );

    res.status(200).json({
      success: true,
      message: "Food suggestions retrieved successfully",
      data: {
        summary: {
          totalSuggestions: nutrientGapAnalysis.foodSuggestions.length,
          filteredSuggestions: filteredSuggestions.length,
          inventoryItems: filteredSuggestions.filter(s => s.availability === 'in_inventory').length,
          catalogItems: filteredSuggestions.filter(s => s.availability === 'in_catalog').length,
          totalEstimatedCost: Math.round(totalEstimatedCost * 100) / 100,
          analysisPeriod: nutrientGapAnalysis.summary.analysisPeriod
        },
        foodSuggestions: filteredSuggestions,
        suggestionsByCategory,
        priorityItems: filteredSuggestions.filter(s => s.priority === 'high'),
        inventoryAvailable: filteredSuggestions.filter(s => s.availability === 'in_inventory'),
        needPurchase: filteredSuggestions.filter(s => s.availability !== 'in_inventory')
      }
    });

  } catch (error) {
    logger.error(`Food suggestions fetch error: ${(error as Error).message}`);

    res.status(500).json({
      success: false,
      message: "Failed to fetch food suggestions. Please try again later.",
      error: "INTERNAL_SERVER_ERROR"
    });
  }
};

// Get meal suggestions to address nutrient gaps
export const getMealSuggestions = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        error: "USER_NOT_AUTHENTICATED"
      });
    }

    const { analysisDays = 30, mealType } = req.query;
    const parsedAnalysisDays = Math.min(Math.max(parseInt(analysisDays as string) || 30, 7), 90);

    logger.info(`Fetching meal suggestions for user ${req.user.userId} over ${parsedAnalysisDays} days`);

    const nutrientGapAnalysis = await nutrientGapService.predictNutrientGaps(
      req.user.userId,
      parsedAnalysisDays
    );

    let filteredMealSuggestions = nutrientGapAnalysis.mealSuggestions;

    // Filter by meal type if specified
    if (mealType) {
      filteredMealSuggestions = filteredMealSuggestions.filter(
        meal => meal.mealType === mealType
      );
    }

    // Group by meal type
    const mealsByType = filteredMealSuggestions.reduce((groups, meal) => {
      if (!groups[meal.mealType]) {
        groups[meal.mealType] = [];
      }
      groups[meal.mealType].push(meal);
      return groups;
    }, {} as Record<string, any[]>);

    // Calculate total estimated cost
    const totalEstimatedCost = filteredMealSuggestions.reduce((total, meal) =>
      total + (meal.estimatedCost || 0), 0
    );

    res.status(200).json({
      success: true,
      message: "Meal suggestions retrieved successfully",
      data: {
        summary: {
          totalMeals: nutrientGapAnalysis.mealSuggestions.length,
          filteredMeals: filteredMealSuggestions.length,
          totalEstimatedCost: Math.round(totalEstimatedCost * 100) / 100,
          analysisPeriod: nutrientGapAnalysis.summary.analysisPeriod,
          mealTypesAvailable: [...new Set(nutrientGapAnalysis.mealSuggestions.map(m => m.mealType))]
        },
        mealSuggestions: filteredMealSuggestions,
        mealsByType,
        breakfastOptions: mealsByType.breakfast || [],
        lunchOptions: mealsByType.lunch || [],
        dinnerOptions: mealsByType.dinner || [],
        snackOptions: mealsByType.snack || []
      }
    });

  } catch (error) {
    logger.error(`Meal suggestions fetch error: ${(error as Error).message}`);

    res.status(500).json({
      success: false,
      message: "Failed to fetch meal suggestions. Please try again later.",
      error: "INTERNAL_SERVER_ERROR"
    });
  }
};

// Get personalized nutrition insights
export const getNutritionInsights = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        error: "USER_NOT_AUTHENTICATED"
      });
    }

    const { analysisDays = 30 } = req.query;
    const parsedAnalysisDays = Math.min(Math.max(parseInt(analysisDays as string) || 30, 7), 90);

    logger.info(`Fetching nutrition insights for user ${req.user.userId} over ${parsedAnalysisDays} days`);

    const nutrientGapAnalysis = await nutrientGapService.predictNutrientGaps(
      req.user.userId,
      parsedAnalysisDays
    );

    // Categorize insights by type and urgency
    const insights = {
      immediate: nutrientGapAnalysis.insights.priorityActions,
      shortTerm: nutrientGapAnalysis.insights.recommendations,
      informational: nutrientGapAnalysis.insights.keyFindings,
      preventive: nutrientGapAnalysis.insights.preventiveMeasures
    };

    // Identify top priority nutrients
    const priorityNutrients = nutrientGapAnalysis.nutrientAnalysis
      .filter(n => n.deficiencyLevel === 'severe' || n.deficiencyLevel === 'moderate')
      .sort((a, b) => b.deficiencyPercentage - a.deficiencyPercentage)
      .slice(0, 5);

    res.status(200).json({
      success: true,
      message: "Nutrition insights retrieved successfully",
      data: {
        summary: {
          overallNutritionScore: nutrientGapAnalysis.summary.overallNutritionScore,
          totalDeficiencies: nutrientGapAnalysis.summary.totalDeficiencies,
          severeDeficiencies: nutrientGapAnalysis.summary.severeDeficiencies,
          dataCompleteness: nutrientGapAnalysis.summary.dataCompleteness,
          analysisPeriod: nutrientGapAnalysis.summary.analysisPeriod,
          userProfile: nutrientGapAnalysis.summary.userProfile
        },
        nutrientAnalysis: nutrientGapAnalysis.nutrientAnalysis,
        priorityNutrients,
        insights,
        actionPlan: {
          immediateActions: insights.immediate.slice(0, 3),
          weeklyGoals: insights.shortTerm.slice(0, 3),
          longTermHealth: insights.preventive.slice(0, 3)
        },
        healthImpact: {
          currentRisks: priorityNutrients.flatMap(n => n.healthImplications).slice(0, 5),
          preventionTips: insights.preventive.slice(0, 5)
        }
      }
    });

  } catch (error) {
    logger.error(`Nutrition insights fetch error: ${(error as Error).message}`);

    res.status(500).json({
      success: false,
      message: "Failed to fetch nutrition insights. Please try again later.",
      error: "INTERNAL_SERVER_ERROR"
    });
  }
};