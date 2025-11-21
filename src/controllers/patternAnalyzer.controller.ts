import { Request, Response } from "express";
import { logger } from "../utils/logger.js";
import patternAnalyzerService from "../services/patternAnalyzer.service.js";
import { AuthRequest } from "../types/auth.types.js";

// Get comprehensive consumption pattern analysis
export const getConsumptionPatterns = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please log in to access pattern analysis.",
        error: "USER_NOT_AUTHENTICATED"
      });
    }

    const { periodDays = 30, includeInventoryWastePrediction = true } = req.query;

    // Validate parameters
    const parsedPeriodDays = Math.min(Math.max(parseInt(periodDays as string) || 30, 7), 365); // 7-365 days
    const includeWastePrediction = includeInventoryWastePrediction === 'true';

    logger.info(`Starting pattern analysis for user ${req.user.userId} over ${parsedPeriodDays} days`);

    const patternAnalysis = await patternAnalyzerService.analyzeConsumptionPatterns(
      req.user.userId,
      parsedPeriodDays,
      includeWastePrediction
    );

    logger.info(`Successfully completed pattern analysis for user ${req.user.userId}`);

    res.status(200).json({
      success: true,
      message: "Consumption pattern analysis completed successfully",
      data: {
        summary: patternAnalysis.summary,
        weeklyTrends: patternAnalysis.weeklyTrends,
        categoryConsumption: patternAnalysis.categoryConsumption,
        wastePredictions: patternAnalysis.wastePredictions,
        imbalancesDetected: patternAnalysis.imbalancesDetected,
        consumptionPatterns: patternAnalysis.consumptionPatterns,
        nutritionInsights: patternAnalysis.nutritionInsights,
        heatmapData: patternAnalysis.heatmapData
      }
    });

  } catch (error) {
    logger.error(`Pattern analysis error: ${(error as Error).message}`);

    if ((error as Error).message.includes('User not found')) {
      return res.status(404).json({
        success: false,
        message: "User profile not found. Please ensure your account is properly set up.",
        error: "USER_NOT_FOUND"
      });
    }

    if ((error as Error).message.includes('Failed to analyze consumption patterns')) {
      return res.status(503).json({
        success: false,
        message: "AI service temporarily unavailable. Please try again in a few moments.",
        error: "AI_SERVICE_UNAVAILABLE",
        retryAfter: 30
      });
    }

    res.status(500).json({
      success: false,
      message: "An error occurred during pattern analysis. Please try again later.",
      error: "INTERNAL_SERVER_ERROR"
    });
  }
};

// Get weekly trends specifically
export const getWeeklyTrends = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        error: "USER_NOT_AUTHENTICATED"
      });
    }

    const { periodDays = 30 } = req.query;
    const parsedPeriodDays = Math.min(Math.max(parseInt(periodDays as string) || 30, 7), 365);

    logger.info(`Fetching weekly trends for user ${req.user.userId} over ${parsedPeriodDays} days`);

    const patternAnalysis = await patternAnalyzerService.analyzeConsumptionPatterns(
      req.user.userId,
      parsedPeriodDays,
      false
    );

    res.status(200).json({
      success: true,
      message: "Weekly trends retrieved successfully",
      data: {
        summary: patternAnalysis.summary,
        weeklyTrends: patternAnalysis.weeklyTrends,
        consumptionPatterns: {
          mealTiming: patternAnalysis.consumptionPatterns.mealTiming,
          eatingFrequency: patternAnalysis.consumptionPatterns.eatingFrequency,
          preferredCategories: patternAnalysis.consumptionPatterns.preferredCategories
        }
      }
    });

  } catch (error) {
    logger.error(`Weekly trends fetch error: ${(error as Error).message}`);

    res.status(500).json({
      success: false,
      message: "Failed to fetch weekly trends. Please try again later.",
      error: "INTERNAL_SERVER_ERROR"
    });
  }
};

// Get category consumption analysis
export const getCategoryAnalysis = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        error: "USER_NOT_AUTHENTICATED"
      });
    }

    const { periodDays = 30 } = req.query;
    const parsedPeriodDays = Math.min(Math.max(parseInt(periodDays as string) || 30, 7), 365);

    logger.info(`Fetching category analysis for user ${req.user.userId} over ${parsedPeriodDays} days`);

    const patternAnalysis = await patternAnalyzerService.analyzeConsumptionPatterns(
      req.user.userId,
      parsedPeriodDays,
      false
    );

    res.status(200).json({
      success: true,
      message: "Category consumption analysis retrieved successfully",
      data: {
        summary: {
          analysisPeriod: patternAnalysis.summary.analysisPeriod,
          dataCompleteness: patternAnalysis.summary.dataCompleteness
        },
        categoryConsumption: patternAnalysis.categoryConsumption,
        imbalancesDetected: patternAnalysis.imbalancesDetected,
        nutritionInsights: patternAnalysis.nutritionInsights
      }
    });

  } catch (error) {
    logger.error(`Category analysis fetch error: ${(error as Error).message}`);

    res.status(500).json({
      success: false,
      message: "Failed to fetch category analysis. Please try again later.",
      error: "INTERNAL_SERVER_ERROR"
    });
  }
};

// Get waste predictions
export const getWastePredictions = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        error: "USER_NOT_AUTHENTICATED"
      });
    }

    const { periodDays = 14 } = req.query; // Shorter period for waste prediction
    const parsedPeriodDays = Math.min(Math.max(parseInt(periodDays as string) || 14, 7), 90);

    logger.info(`Generating waste predictions for user ${req.user.userId} based on ${parsedPeriodDays} days of data`);

    const patternAnalysis = await patternAnalyzerService.analyzeConsumptionPatterns(
      req.user.userId,
      parsedPeriodDays,
      true
    );

    // Filter for high-risk waste predictions
    const highRiskPredictions = patternAnalysis.wastePredictions.filter(
      prediction => prediction.wasteRisk.riskLevel === 'high' || prediction.wasteRisk.riskLevel === 'critical'
    );

    res.status(200).json({
      success: true,
      message: "Waste predictions generated successfully",
      data: {
        summary: {
          totalInventoryItems: patternAnalysis.wastePredictions.length,
          highRiskItems: highRiskPredictions.length,
          totalPotentialLoss: patternAnalysis.wastePredictions.reduce(
            (total, pred) => total + pred.item.estimatedValue, 0
          ),
          analysisDate: new Date().toISOString()
        },
        wastePredictions: patternAnalysis.wastePredictions,
        highRiskItems: highRiskPredictions,
        recommendations: patternAnalysis.wastePredictions
          .filter(pred => pred.reasoning.recommendations.length > 0)
          .flatMap(pred => pred.reasoning.recommendations)
          .slice(0, 10) // Top 10 recommendations
      }
    });

  } catch (error) {
    logger.error(`Waste prediction error: ${(error as Error).message}`);

    res.status(500).json({
      success: false,
      message: "Failed to generate waste predictions. Please try again later.",
      error: "INTERNAL_SERVER_ERROR"
    });
  }
};

// Get heatmap data for visualization
export const getHeatmapData = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        error: "USER_NOT_AUTHENTICATED"
      });
    }

    const { periodDays = 30 } = req.query;
    const parsedPeriodDays = Math.min(Math.max(parseInt(periodDays as string) || 30, 7), 365);

    logger.info(`Generating heatmap data for user ${req.user.userId} over ${parsedPeriodDays} days`);

    const patternAnalysis = await patternAnalyzerService.analyzeConsumptionPatterns(
      req.user.userId,
      parsedPeriodDays,
      false
    );

    // Format heatmap data for easier frontend consumption
    const formattedHeatmapData = patternAnalysis.heatmapData.map(data => ({
      ...data,
      // Add color intensity for visualization
      colorIntensity: Math.round(data.consumptionIntensity / 10), // 0-10 scale
      // Add meal group for better visualization
      mealGroup: data.mealType === 'breakfast' || data.mealType === 'lunch' || data.mealType === 'dinner'
        ? 'meal'
        : 'snack'
    }));

    res.status(200).json({
      success: true,
      message: "Heatmap data generated successfully",
      data: {
        summary: {
          analysisPeriod: patternAnalysis.summary.analysisPeriod,
          dataCompleteness: patternAnalysis.summary.dataCompleteness,
          totalDataPoints: formattedHeatmapData.length,
          maxIntensity: Math.max(...formattedHeatmapData.map(d => d.consumptionIntensity))
        },
        heatmapData: formattedHeatmapData,
        dayOfWeekOrder: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        mealTypes: ['breakfast', 'lunch', 'dinner', 'snack', 'beverage'],
        categories: ['fruits', 'vegetables', 'dairy', 'grains', 'protein', 'beverages', 'snacks', 'other']
      }
    });

  } catch (error) {
    logger.error(`Heatmap data generation error: ${(error as Error).message}`);

    res.status(500).json({
      success: false,
      message: "Failed to generate heatmap data. Please try again later.",
      error: "INTERNAL_SERVER_ERROR"
    });
  }
};

// Get nutritional imbalances specifically
export const getNutritionalImbalances = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        error: "USER_NOT_AUTHENTICATED"
      });
    }

    const { periodDays = 30 } = req.query;
    const parsedPeriodDays = Math.min(Math.max(parseInt(periodDays as string) || 30, 7), 365);

    logger.info(`Analyzing nutritional imbalances for user ${req.user.userId} over ${parsedPeriodDays} days`);

    const patternAnalysis = await patternAnalyzerService.analyzeConsumptionPatterns(
      req.user.userId,
      parsedPeriodDays,
      false
    );

    // Categorize imbalances by severity
    const severeImbalances = patternAnalysis.imbalancesDetected.filter(
      imbalance => imbalance.severity === 'severe'
    );
    const moderateImbalances = patternAnalysis.imbalancesDetected.filter(
      imbalance => imbalance.severity === 'moderate'
    );

    res.status(200).json({
      success: true,
      message: "Nutritional imbalance analysis completed",
      data: {
        summary: {
          overallHealthScore: patternAnalysis.summary.overallHealthScore,
          totalImbalances: patternAnalysis.imbalancesDetected.length,
          severeImbalances: severeImbalances.length,
          moderateImbalances: moderateImbalances.length,
          analysisPeriod: patternAnalysis.summary.analysisPeriod
        },
        imbalancesDetected: patternAnalysis.imbalancesDetected,
        nutritionInsights: patternAnalysis.nutritionInsights,
        recommendations: {
          immediate: severeImbalances.flatMap(i => i.suggestions),
          shortTerm: moderateImbalances.flatMap(i => i.suggestions),
          general: patternAnalysis.summary.recommendations
        }
      }
    });

  } catch (error) {
    logger.error(`Nutritional imbalances analysis error: ${(error as Error).message}`);

    res.status(500).json({
      success: false,
      message: "Failed to analyze nutritional imbalances. Please try again later.",
      error: "INTERNAL_SERVER_ERROR"
    });
  }
};