import { Request, Response } from "express";
import { logger } from "../utils/logger.js";
import expirationRiskService from "../services/expirationRisk.service.js";
import { AuthRequest } from "../types/auth.types.js";

// Get expiration risk predictions for user's inventory
export const getExpirationRiskPredictions = async (req: AuthRequest, res: Response) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please log in to access expiration risk predictions.",
        error: "USER_NOT_AUTHENTICATED"
      });
    }

    logger.info(`Generating expiration risk predictions for user ${req.user.userId}`);

    // Generate AI-powered expiration risk predictions
    const riskPredictions = await expirationRiskService.predictExpirationRisks(req.user.userId);

    logger.info(`Successfully generated ${riskPredictions.riskPredictions.length} expiration risk predictions for user ${req.user.userId}`);

    // Return success response with comprehensive data
    res.status(200).json({
      success: true,
      message: "Expiration risk predictions generated successfully",
      data: {
        summary: {
          totalItemsAnalyzed: riskPredictions.summary.totalItemsAtRisk,
          criticalAlerts: riskPredictions.summary.criticalItems,
          highRiskItems: riskPredictions.summary.highRiskItems,
          potentialLoss: riskPredictions.summary.estimatedPotentialLoss,
          userLocation: riskPredictions.summary.userLocation,
          currentSeason: riskPredictions.summary.currentSeason,
          analysisDate: riskPredictions.summary.analysisDate,
          overallRiskLevel: riskPredictions.insights.overallRiskLevel
        },
        riskPredictions: riskPredictions.riskPredictions.map(prediction => ({
          item: {
            id: prediction.item._id,
            name: prediction.item.itemName,
            category: prediction.item.category,
            quantity: prediction.item.quantity,
            unit: prediction.item.unit,
            expirationDate: prediction.item.expirationDate,
            daysUntilExpiration: prediction.item.daysUntilExpiration,
            estimatedValue: prediction.item.estimatedValue
          },
          riskAnalysis: {
            overallRiskScore: prediction.riskAnalysis.overallRiskScore,
            expirationRisk: prediction.riskAnalysis.expirationRisk,
            consumptionUrgency: prediction.riskAnalysis.consumptionUrgency,
            seasonalityRisk: prediction.riskAnalysis.seasonalityRisk,
            aiRiskScore: prediction.riskAnalysis.aiRiskScore
          },
          recommendations: {
            consumeBy: prediction.recommendations.consumeBy,
            consumptionPriority: prediction.recommendations.consumptionPriority,
            storageTips: prediction.recommendations.storageTips,
            alternativeUses: prediction.recommendations.alternativeUses,
            alertLevel: prediction.recommendations.alertLevel
          },
          reasoning: {
            primaryReason: prediction.reasoning.primaryReason,
            contributingFactors: prediction.reasoning.contributingFactors,
            seasonalityImpact: prediction.reasoning.seasonalityImpact,
            consumptionPatternAnalysis: prediction.reasoning.consumptionPatternAnalysis
          }
        })),
        consumptionPriority: riskPredictions.consumptionPriority,
        insights: {
          seasonalAlerts: riskPredictions.insights.seasonalAlerts,
          consumptionTips: riskPredictions.insights.consumptionTips,
          wastePreventionStrategies: riskPredictions.insights.wastePreventionStrategies
        }
      }
    });

  } catch (error) {
    logger.error(`Expiration risk prediction error: ${(error as Error).message}`);

    // Handle specific error types
    if ((error as Error).message.includes('User not found')) {
      return res.status(404).json({
        success: false,
        message: "User profile not found. Please ensure your account is properly set up.",
        error: "USER_NOT_FOUND"
      });
    }

    if ((error as Error).message.includes('Failed to predict expiration risks')) {
      return res.status(503).json({
        success: false,
        message: "AI service temporarily unavailable. Please try again in a few moments.",
        error: "AI_SERVICE_UNAVAILABLE",
        retryAfter: 30 // Suggest retry after 30 seconds
      });
    }

    if ((error as Error).message.includes('No inventory items')) {
      return res.status(200).json({
        success: true,
        message: "No items with expiration dates found in your inventory",
        data: {
          summary: {
            totalItemsAnalyzed: 0,
            criticalAlerts: 0,
            highRiskItems: 0,
            potentialLoss: 0,
            overallRiskLevel: 'low' as const,
            analysisDate: new Date()
          },
          riskPredictions: [],
          consumptionPriority: [],
          insights: {
            seasonalAlerts: [],
            consumptionTips: [],
            wastePreventionStrategies: []
          }
        }
      });
    }

    // General server error
    res.status(500).json({
      success: false,
      message: "An error occurred while generating expiration risk predictions. Please try again later.",
      error: "INTERNAL_SERVER_ERROR"
    });
  }
};

// Get high-risk items only (for quick alerts and notifications)
export const getHighRiskItems = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        error: "USER_NOT_AUTHENTICATED"
      });
    }

    logger.info(`Fetching high-risk items for user ${req.user.userId}`);

    const fullPredictions = await expirationRiskService.predictExpirationRisks(req.user.userId);

    // Filter for critical and high-risk items only
    const highRiskItems = fullPredictions.riskPredictions.filter(
      prediction => prediction.riskAnalysis.expirationRisk === 'critical' ||
                   prediction.riskAnalysis.expirationRisk === 'high'
    );

    logger.info(`Found ${highRiskItems.length} high-risk items for user ${req.user.userId}`);

    res.status(200).json({
      success: true,
      message: "High-risk items retrieved successfully",
      data: {
        summary: {
          totalHighRiskItems: highRiskItems.length,
          criticalItems: highRiskItems.filter(p => p.riskAnalysis.expirationRisk === 'critical').length,
          totalValueAtRisk: highRiskItems.reduce((sum, p) => sum + p.item.estimatedValue, 0)
        },
        highRiskItems: highRiskItems.map(prediction => ({
          id: prediction.item._id,
          name: prediction.item.itemName,
          category: prediction.item.category,
          quantity: prediction.item.quantity,
          unit: prediction.item.unit,
          expirationDate: prediction.item.expirationDate,
          daysUntilExpiration: prediction.item.daysUntilExpiration,
          alertLevel: prediction.recommendations.alertLevel,
          consumeBy: prediction.recommendations.consumeBy,
          primaryReason: prediction.reasoning.primaryReason,
          storageTips: prediction.recommendations.storageTips.slice(0, 2), // Return top 2 tips for brevity
          estimatedValue: prediction.item.estimatedValue
        })),
        urgentActions: fullPredictions.consumptionPriority.slice(0, 5), // Top 5 urgent actions
        seasonalAlerts: fullPredictions.insights.seasonalAlerts.filter(alert =>
          alert.includes('alert') || alert.includes('urgent')
        )
      }
    });

  } catch (error) {
    logger.error(`High-risk items fetch error: ${(error as Error).message}`);

    res.status(500).json({
      success: false,
      message: "Failed to fetch high-risk items. Please try again later.",
      error: "INTERNAL_SERVER_ERROR"
    });
  }
};

// Get seasonal alerts and recommendations
export const getSeasonalAlerts = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        error: "USER_NOT_AUTHENTICATED"
      });
    }

    logger.info(`Fetching seasonal alerts for user ${req.user.userId}`);

    const fullPredictions = await expirationRiskService.predictExpirationRisks(req.user.userId);

    res.status(200).json({
      success: true,
      message: "Seasonal alerts retrieved successfully",
      data: {
        currentSeason: fullPredictions.summary.currentSeason,
        userLocation: fullPredictions.summary.userLocation,
        seasonalAlerts: fullPredictions.insights.seasonalAlerts,
        affectedCategories: [...new Set(
          fullPredictions.riskPredictions
            .filter(p => p.riskAnalysis.seasonalityRisk === 'increased')
            .map(p => p.item.category)
        )],
        seasonalTips: fullPredictions.insights.wastePreventionStrategies.filter(
          tip => tip.includes('season') || tip.includes('weather')
        ),
        highRiskSeasonalItems: fullPredictions.riskPredictions
          .filter(p => p.riskAnalysis.seasonalityRisk === 'increased' &&
                       (p.riskAnalysis.expirationRisk === 'critical' ||
                        p.riskAnalysis.expirationRisk === 'high'))
          .map(p => ({
            id: p.item._id,
            name: p.item.itemName,
            category: p.item.category,
            seasonalityImpact: p.reasoning.seasonalityImpact,
            alertLevel: p.recommendations.alertLevel
          }))
      }
    });

  } catch (error) {
    logger.error(`Seasonal alerts fetch error: ${(error as Error).message}`);

    res.status(500).json({
      success: false,
      message: "Failed to fetch seasonal alerts. Please try again later.",
      error: "INTERNAL_SERVER_ERROR"
    });
  }
};