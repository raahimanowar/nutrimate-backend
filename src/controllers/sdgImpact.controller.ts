import { Request, Response } from "express";
import { logger } from "../utils/logger.js";
import sdgImpactService from "../services/sdgImpact.service.js";
import { AuthRequest } from "../types/auth.types.js";

// Get comprehensive SDG impact score
export const getSDGImpactScore = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please log in to access SDG impact scoring.",
        error: "USER_NOT_AUTHENTICATED"
      });
    }

    const { analysisDays = 30, comparisonPeriod = 7 } = req.query;

    // Validate parameters
    const parsedAnalysisDays = Math.min(Math.max(parseInt(analysisDays as string) || 30, 7), 90); // 7-90 days
    const parsedComparisonPeriod = Math.min(Math.max(parseInt(comparisonPeriod as string) || 7, 3), 30); // 3-30 days

    logger.info(`Starting SDG impact scoring for user ${req.user.userId} over ${parsedAnalysisDays} days`);

    const sdgImpactResult = await sdgImpactService.calculateSDGImpactScore(
      req.user.userId,
      parsedAnalysisDays,
      parsedComparisonPeriod
    );

    logger.info(`Successfully completed SDG impact scoring for user ${req.user.userId}`);

    res.status(200).json({
      success: true,
      message: "SDG impact score calculated successfully",
      data: sdgImpactResult
    });

  } catch (error) {
    logger.error(`SDG impact scoring error: ${(error as Error).message}`);

    if ((error as Error).message.includes('User not found')) {
      return res.status(404).json({
        success: false,
        message: "User profile not found. Please ensure your account is properly set up.",
        error: "USER_NOT_FOUND"
      });
    }

    if ((error as Error).message.includes('Failed to calculate SDG impact score')) {
      return res.status(503).json({
        success: false,
        message: "AI service temporarily unavailable. Please try again in a few moments.",
        error: "AI_SERVICE_UNAVAILABLE",
        retryAfter: 30
      });
    }

    res.status(500).json({
      success: false,
      message: "An error occurred during SDG impact scoring. Please try again later.",
      error: "INTERNAL_SERVER_ERROR"
    });
  }
};

// Get SDG score trends over time
export const getSDGTrends = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        error: "USER_NOT_AUTHENTICATED"
      });
    }

    const { analysisDays = 30, comparisonPeriod = 7 } = req.query;
    const parsedAnalysisDays = Math.min(Math.max(parseInt(analysisDays as string) || 30, 7), 90);
    const parsedComparisonPeriod = Math.min(Math.max(parseInt(comparisonPeriod as string) || 7, 3), 30);

    logger.info(`Fetching SDG trends for user ${req.user.userId}`);

    const sdgImpactResult = await sdgImpactService.calculateSDGImpactScore(
      req.user.userId,
      parsedAnalysisDays,
      parsedComparisonPeriod
    );

    res.status(200).json({
      success: true,
      message: "SDG trends retrieved successfully",
      data: {
        summary: {
          personalSDGScore: sdgImpactResult.summary.personalSDGScore,
          scoreChange: sdgImpactResult.summary.scoreChange,
          ranking: sdgImpactResult.summary.ranking,
          analysisPeriod: sdgImpactResult.summary.analysisPeriod
        },
        sdgScores: sdgImpactResult.sdgScores,
        weeklyInsights: sdgImpactResult.weeklyInsights,
        trends: {
          sdg2Trends: sdgImpactResult.sdgScores.sdg2Score.trends,
          sdg12Trends: sdgImpactResult.sdgScores.sdg12Score.trends,
          overallTrend: sdgImpactResult.summary.scoreChange > 5 ? 'improving' :
                      sdgImpactResult.summary.scoreChange < -5 ? 'declining' : 'stable'
        },
        achievements: sdgImpactResult.achievements
      }
    });

  } catch (error) {
    logger.error(`SDG trends fetch error: ${(error as Error).message}`);

    res.status(500).json({
      success: false,
      message: "Failed to fetch SDG trends. Please try again later.",
      error: "INTERNAL_SERVER_ERROR"
    });
  }
};

// Get actionable steps to improve SDG score
export const getSDGActionSteps = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        error: "USER_NOT_AUTHENTICATED"
      });
    }

    const { analysisDays = 30, comparisonPeriod = 7, priority = 'all' } = req.query;
    const parsedAnalysisDays = Math.min(Math.max(parseInt(analysisDays as string) || 30, 7), 90);
    const parsedComparisonPeriod = Math.min(Math.max(parseInt(comparisonPeriod as string) || 7, 3), 30);

    logger.info(`Fetching SDG action steps for user ${req.user.userId}`);

    const sdgImpactResult = await sdgImpactService.calculateSDGImpactScore(
      req.user.userId,
      parsedAnalysisDays,
      parsedComparisonPeriod
    );

    // Filter action steps by priority if specified
    let filteredActionSteps = sdgImpactResult.actionableSteps;
    if (priority !== 'all') {
      filteredActionSteps = sdgImpactResult.actionableSteps.filter(
        step => step.priority === priority
      );
    }

    // Group steps by category
    const stepsByCategory = filteredActionSteps.reduce((groups, step) => {
      if (!groups[step.category]) {
        groups[step.category] = [];
      }
      groups[step.category].push(step);
      return groups;
    }, {} as Record<string, any[]>);

    // Calculate total potential impact
    const totalPotentialImpact = filteredActionSteps.reduce(
      (total, step) => total + step.impact, 0
    );

    res.status(200).json({
      success: true,
      message: "SDG action steps retrieved successfully",
      data: {
        summary: {
          personalSDGScore: sdgImpactResult.summary.personalSDGScore,
          totalActionSteps: sdgImpactResult.actionableSteps.length,
          filteredSteps: filteredActionSteps.length,
          totalPotentialImpact,
          lowestScoringAreas: getLowestScoringAreas(sdgImpactResult.sdgScores)
        },
        actionableSteps: filteredActionSteps,
        stepsByCategory,
        highImpactSteps: filteredActionSteps.filter(step => step.impact >= 10),
        immediateActions: filteredActionSteps.filter(step => step.timeframe === 'immediate'),
        weeklyGoals: filteredActionSteps.filter(step => step.timeframe === 'week'),
        monthlyTargets: filteredActionSteps.filter(step => step.timeframe === 'month')
      }
    });

  } catch (error) {
    logger.error(`SDG action steps fetch error: ${(error as Error).message}`);

    res.status(500).json({
      success: false,
      message: "Failed to fetch SDG action steps. Please try again later.",
      error: "INTERNAL_SERVER_ERROR"
    });
  }
};

// Get environmental impact metrics
export const getEnvironmentalImpact = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        error: "USER_NOT_AUTHENTICATED"
      });
    }

    const { analysisDays = 30, comparisonPeriod = 7 } = req.query;
    const parsedAnalysisDays = Math.min(Math.max(parseInt(analysisDays as string) || 30, 7), 90);
    const parsedComparisonPeriod = Math.min(Math.max(parseInt(comparisonPeriod as string) || 7, 3), 30);

    logger.info(`Fetching environmental impact for user ${req.user.userId}`);

    const sdgImpactResult = await sdgImpactService.calculateSDGImpactScore(
      req.user.userId,
      parsedAnalysisDays,
      parsedComparisonPeriod
    );

    // Calculate additional environmental metrics
    const impactMetrics = sdgImpactResult.impactMetrics;
    const sdg12Score = sdgImpactResult.sdgScores.sdg12Score;

    res.status(200).json({
      success: true,
      message: "Environmental impact metrics retrieved successfully",
      data: {
        summary: {
          personalSDGScore: sdgImpactResult.summary.personalSDGScore,
          sdg12Score: sdg12Score.overall,
          wasteReductionScore: sdg12Score.wasteReduction,
          analysisPeriod: sdgImpactResult.summary.analysisPeriod
        },
        impactMetrics: {
          co2Reduction: impactMetrics.co2Reduction,
          waterSaved: impactMetrics.waterSaved,
          hungerContribution: impactMetrics.hungerContribution,
          wastePrevented: impactMetrics.wastePrevented,
          sustainabilityScore: sdg12Score.sustainableConsumption
        },
        comparisons: {
          co2EquivalentCars: Math.round(impactMetrics.co2Reduction / 4500), // Average car emits 4.5 tons CO2/year
          waterShowers: Math.round(impactMetrics.waterSaved / 80), // Average shower uses 80 liters
          mealsProvided: Math.round(impactMetrics.hungerContribution * 10) // Estimated meals
        },
        trends: {
          wasteReductionTrend: sdg12Score.trends.wasteReduction,
          sustainableConsumptionTrend: sdg12Score.trends.sustainableConsumption,
          awarenessTrend: sdg12Score.trends.awareness
        },
        achievements: sdgImpactResult.achievements.badges.filter(
          badge => badge.includes('Sustainable') || badge.includes('Waste')
        )
      }
    });

  } catch (error) {
    logger.error(`Environmental impact fetch error: ${(error as Error).message}`);

    res.status(500).json({
      success: false,
      message: "Failed to fetch environmental impact metrics. Please try again later.",
      error: "INTERNAL_SERVER_ERROR"
    });
  }
};

// Get SDG achievements and milestones
export const getSDGAchievements = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        error: "USER_NOT_AUTHENTICATED"
      });
    }

    const { analysisDays = 30, comparisonPeriod = 7 } = req.query;
    const parsedAnalysisDays = Math.min(Math.max(parseInt(analysisDays as string) || 30, 7), 90);
    const parsedComparisonPeriod = Math.min(Math.max(parseInt(comparisonPeriod as string) || 7, 3), 30);

    logger.info(`Fetching SDG achievements for user ${req.user.userId}`);

    const sdgImpactResult = await sdgImpactService.calculateSDGImpactScore(
      req.user.userId,
      parsedAnalysisDays,
      parsedComparisonPeriod
    );

    const achievements = sdgImpactResult.achievements;

    // Calculate next milestones
    const nextMilestones = calculateNextMilestones(sdgImpactResult.sdgScores, achievements);

    res.status(200).json({
      success: true,
      message: "SDG achievements retrieved successfully",
      data: {
        summary: {
          personalSDGScore: sdgImpactResult.summary.personalSDGScore,
          ranking: sdgImpactResult.summary.ranking,
          totalBadges: achievements.badges.length,
          totalMilestones: achievements.milestones.length,
          analysisPeriod: sdgImpactResult.summary.analysisPeriod
        },
        achievements: {
          badges: achievements.badges,
          milestones: achievements.milestones,
          streaks: achievements.streaks
        },
        nextMilestones,
        progressToNextBadge: calculateProgressToNextBadge(sdgImpactResult.sdgScores),
        sdgContributions: {
          sdg2Contribution: sdgImpactResult.sdgScores.sdg2Score.overall,
          sdg12Contribution: sdgImpactResult.sdgScores.sdg12Score.overall,
          overallContribution: sdgImpactResult.summary.personalSDGScore
        },
        comparison: {
          topPerformers: 'Top 10%',
          average: 'Average user',
          improvement: `+${sdgImpactResult.summary.scoreChange} points from last period`
        }
      }
    });

  } catch (error) {
    logger.error(`SDG achievements fetch error: ${(error as Error).message}`);

    res.status(500).json({
      success: false,
      message: "Failed to fetch SDG achievements. Please try again later.",
      error: "INTERNAL_SERVER_ERROR"
    });
  }
};

// Helper function to identify lowest scoring areas
function getLowestScoringAreas(sdgScores: any): string[] {
  const areas = [
    { name: 'Food Security (SDG 2.1)', score: sdgScores.sdg2Score.foodSecurity },
    { name: 'Nutrition Quality (SDG 2.2)', score: sdgScores.sdg2Score.nutritionQuality },
    { name: 'Dietary Diversity (SDG 2.5)', score: sdgScores.sdg2Score.dietaryDiversity },
    { name: 'Waste Reduction (SDG 12.3)', score: sdgScores.sdg12Score.wasteReduction },
    { name: 'Sustainable Consumption (SDG 12.8)', score: sdgScores.sdg12Score.sustainableConsumption }
  ];

  return areas
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)
    .map(area => area.name);
}

// Helper function to calculate next milestones
function calculateNextMilestones(sdgScores: any, currentAchievements: any): Array<{
  title: string;
  description: string;
  target: number;
  current: number;
  progress: number;
  sdgTarget: string;
}> {
  const nextMilestones = [];

  // SDG 2 milestones
  if (sdgScores.sdg2Score.overall < 75) {
    nextMilestones.push({
      title: 'SDG 2 Champion',
      description: 'Achieve good performance in Zero Hunger goals',
      target: 75,
      current: sdgScores.sdg2Score.overall,
      progress: Math.round((sdgScores.sdg2Score.overall / 75) * 100),
      sdgTarget: 'SDG 2.1, 2.2, 2.4, 2.5'
    });
  }

  // SDG 12 milestones
  if (sdgScores.sdg12Score.overall < 75) {
    nextMilestones.push({
      title: 'SDG 12 Champion',
      description: 'Achieve good performance in Responsible Consumption',
      target: 75,
      current: sdgScores.sdg12Score.overall,
      progress: Math.round((sdgScores.sdg12Score.overall / 75) * 100),
      sdgTarget: 'SDG 12.3, 12.5, 12.8'
    });
  }

  // Overall score milestones
  if (sdgScores.personalSDGScore < 85) {
    nextMilestones.push({
      title: 'SDG Excellence',
      description: 'Achieve excellent overall SDG performance',
      target: 85,
      current: sdgScores.personalSDGScore,
      progress: Math.round((sdgScores.personalSDGScore / 85) * 100),
      sdgTarget: 'SDG 2 & 12 Combined'
    });
  }

  return nextMilestones;
}

// Helper function to calculate progress to next badge
function calculateProgressToNextBadge(sdgScores: any): {
  currentBadge: string;
  nextBadge: string;
  progress: number;
  pointsNeeded: number;
} {
  const score = sdgScores.personalSDGScore;
  let currentBadge = 'Beginner';
  let nextBadge = 'Novice';
  let progress = 0;
  let pointsNeeded = 0;

  if (score < 25) {
    currentBadge = 'Beginner';
    nextBadge = 'Novice';
    progress = (score / 25) * 100;
    pointsNeeded = 25 - score;
  } else if (score < 50) {
    currentBadge = 'Novice';
    nextBadge = 'Apprentice';
    progress = ((score - 25) / 25) * 100;
    pointsNeeded = 50 - score;
  } else if (score < 75) {
    currentBadge = 'Apprentice';
    nextBadge = 'Champion';
    progress = ((score - 50) / 25) * 100;
    pointsNeeded = 75 - score;
  } else {
    currentBadge = 'Champion';
    nextBadge = 'Master';
    progress = ((score - 75) / 25) * 100;
    pointsNeeded = 100 - score;
  }

  return {
    currentBadge,
    nextBadge,
    progress: Math.min(100, progress),
    pointsNeeded: Math.max(0, pointsNeeded)
  };
}

