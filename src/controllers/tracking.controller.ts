import { Response } from "express";
import { AuthRequest } from "../types/auth.types.js";
import {
  TrackingResponse,
  TrackingLog,
  InventorySummary,
  RecommendedResource,
  RecommendationRule,
  RecommendationData,
  FoodCategory,
  TimeRange,
  TrackingQueryParams
} from "../types/tracking.types.js";
import Inventory from "../schemas/inventory.schema.js";
import DailyLog from "../schemas/daily-log.schema.js";
import Resource from "../schemas/resource.schema.js";
import { logger } from "../utils/logger.js";

// Helper function to calculate date ranges based on query parameters
const calculateDateRange = (query: any) => {
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  let startDate = new Date();
  let endDate = new Date(today);
  let rangeType: TimeRange = "weekly";

  // If custom dates are provided, use them
  if (query.startDate || query.endDate) {
    rangeType = "custom";
    if (query.startDate) {
      startDate = new Date(query.startDate);
      startDate.setHours(0, 0, 0, 0);
    }
    if (query.endDate) {
      endDate = new Date(query.endDate);
      endDate.setHours(23, 59, 59, 999);
    }
  }
  // Otherwise use preset ranges
  else {
    switch (query.range) {
      case "daily":
        rangeType = "daily";
        startDate = new Date(today);
        startDate.setHours(0, 0, 0, 0);
        break;
      case "weekly":
        rangeType = "weekly";
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 6);
        startDate.setHours(0, 0, 0, 0);
        break;
      case "monthly":
        rangeType = "monthly";
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 29);
        startDate.setHours(0, 0, 0, 0);
        break;
      default:
        // Default to weekly
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 6);
        startDate.setHours(0, 0, 0, 0);
    }
  }

  // Ensure start date is not after end date
  if (startDate > endDate) {
    const temp = startDate;
    startDate = endDate;
    endDate = temp;
  }

  const dayCount = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  return {
    startDate,
    endDate,
    rangeType,
    dayCount,
    startDateString: startDate.toISOString().split('T')[0],
    endDateString: endDate.toISOString().split('T')[0]
  };
};

// Helper function to calculate inventory summary
const calculateInventorySummary = (inventory: any[]): InventorySummary => {
  const categoryBreakdown: Record<FoodCategory, number> = {
    fruits: 0,
    vegetables: 0,
    dairy: 0,
    grains: 0,
    protein: 0,
    beverages: 0,
    snacks: 0,
    other: 0,
  };

  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
  threeDaysFromNow.setHours(23, 59, 59, 999);

  let expiringSoon = 0;
  let totalCost = 0;

  inventory.forEach((item) => {
    const category = item.category as FoodCategory;
    if (categoryBreakdown.hasOwnProperty(category)) {
      categoryBreakdown[category]++;
    }

    // Check expiration
    if (item.hasExpiration && item.expirationDate) {
      const expirationDate = new Date(item.expirationDate);
      if (expirationDate <= threeDaysFromNow) {
        expiringSoon++;
      }
    }

    totalCost += item.costPerUnit || 0;
  });

  return {
    totalCount: inventory.length,
    categoryBreakdown,
    expiringSoon,
    averageCostPerUnit: inventory.length > 0 ? Math.round((totalCost / inventory.length) * 100) / 100 : 0,
  };
};

// Rule-based recommendation engine
const recommendationRules: RecommendationRule[] = [
  {
    id: "dairy-storage",
    name: "Dairy Storage Tips",
    condition: (data: RecommendationData) => data.consumedCategories.includes("dairy"),
    resourceFilter: { category: "dairy", keywords: ["storage", "preservation"] },
    explanation: "Because you consumed dairy products",
    priority: 3,
  },
  {
    id: "expiration-recipes",
    name: "Expiring Items Recipes",
    condition: (data: RecommendationData) => data.inventory.some(item =>
      item.hasExpiration && item.expirationDate &&
      new Date(item.expirationDate) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    ),
    resourceFilter: { keywords: ["recipe", "cooking", "quick meals"] },
    explanation: "Because you have items expiring soon",
    priority: 5,
  },
  {
    id: "low-protein",
    name: "Protein Resources",
    condition: (data: RecommendationData) => {
      const avgProtein = data.nutritionAverages.protein;
      return avgProtein < 50; // Less than 50g protein per day
    },
    resourceFilter: { category: "protein", keywords: ["protein", "nutrition"] },
    explanation: "Because your protein intake seems low",
    priority: 4,
  },
  {
    id: "category-match",
    name: "Category Based",
    condition: (data: RecommendationData) => data.consumedCategories.length > 0,
    resourceFilter: {},
    explanation: "Related to your food categories",
    priority: 1,
  },
];

// Apply recommendation rules to find relevant resources
const applyRecommendationRules = async (
  data: RecommendationData,
  allResources: any[]
): Promise<RecommendedResource[]> => {
  const recommendations: RecommendedResource[] = [];
  const usedResources = new Set<string>();

  // Sort rules by priority
  const sortedRules = recommendationRules.sort((a, b) => b.priority - a.priority);

  for (const rule of sortedRules) {
    if (rule.condition(data)) {
      let matchingResources = allResources;

      // Apply filters
      if (rule.resourceFilter.category) {
        matchingResources = matchingResources.filter((resource: any) =>
          resource.category === rule.resourceFilter.category
        );
      }

      if (rule.resourceFilter.keywords) {
        matchingResources = matchingResources.filter((resource: any) =>
          rule.resourceFilter.keywords!.some((keyword: string) =>
            resource.title.toLowerCase().includes(keyword.toLowerCase()) ||
            resource.description.toLowerCase().includes(keyword.toLowerCase())
          )
        );
      }

      // Add new recommendations from this rule
      for (const resource of matchingResources.slice(0, 2)) {
        if (!usedResources.has(resource._id.toString())) {
          recommendations.push({
            title: resource.title,
            url: resource.url || "",
            relatedTo: resource.category || "General",
            reason: rule.explanation,
            category: resource.category || "general",
          });
          usedResources.add(resource._id.toString());
        }
      }
    }
  }

  return recommendations.slice(0, 5); // Limit to 5 recommendations
};

// Main tracking function
export const getTrackingSummary = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }

    const userId = req.user.userId;

    // Calculate date range based on query parameters
    const dateRange = calculateDateRange(req.query);

    // 1️⃣ Get inventory data
    const inventory = await Inventory.find({ userId });
    const inventorySummary = calculateInventorySummary(inventory);

    // 2️⃣ Get daily logs for the specified date range
    const recentLogs = await DailyLog.find({
      userId,
      date: { $gte: dateRange.startDate, $lte: dateRange.endDate },
    })
    .sort({ date: -1 })
    .limit(req.query.limit ? parseInt(req.query.limit as string) : 365); // Default to 365 days max

    // Format recent logs with aggregated nutrition data
    const formattedRecentLogs: TrackingLog[] = recentLogs.map((log) => {
      const totalProtein = log.items.reduce((sum: number, item: any) => {
        return sum + (item.protein || 0);
      }, 0);

      return {
        date: log.date.toISOString().split("T")[0],
        totalCalories: log.totalCalories || 0,
        totalProtein: Math.round(totalProtein),
        totalItems: log.items.length,
      };
    });

    // 3️⃣ Prepare recommendation data
    const consumedCategories: FoodCategory[] = Array.from(
      new Set(
        recentLogs.flatMap((log) =>
          log.items.map((item: any) => item.category as FoodCategory)
        )
      )
    );

    // Calculate nutrition averages
    const nutritionAverages = recentLogs.length > 0 ? {
      calories: Math.round(recentLogs.reduce((sum, log) => sum + (log.totalCalories || 0), 0) / recentLogs.length),
      protein: Math.round(recentLogs.reduce((sum, log) => sum + (log.totalProtein || 0), 0) / recentLogs.length),
      carbs: Math.round(recentLogs.reduce((sum, log) => sum + (log.totalCarbs || 0), 0) / recentLogs.length),
      fats: Math.round(recentLogs.reduce((sum, log) => sum + (log.totalFats || 0), 0) / recentLogs.length),
    } : {
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
    };

    const recommendationData: RecommendationData = {
      recentLogs: recentLogs.flatMap(log => log.items),
      inventory: inventory as any[], // Cast to match InventoryItem type
      consumedCategories,
      nutritionAverages,
    };

    // 4️⃣ Get all resources and apply rules
    const allResources = await Resource.find();
    const recommendedResources = await applyRecommendationRules(recommendationData, allResources);

    // Return consolidated tracking summary
    const response: TrackingResponse = {
      success: true,
      message: `Enhanced tracking data retrieved for ${dateRange.rangeType} view (${dateRange.dayCount} days)`,
      data: {
        inventory: inventorySummary,
        recentLogs: formattedRecentLogs,
        recommendedResources,
      },
      timeRange: {
        type: dateRange.rangeType,
        startDate: dateRange.startDateString,
        endDate: dateRange.endDateString,
        dayCount: dateRange.dayCount,
      },
    };

    return res.status(200).json(response);
  } catch (error) {
    logger.error(`Tracking summary error: ${(error as Error).message}`);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching tracking summary",
    });
  }
};

// Get calorie tracking data for graphs
export const getCalorieGraphData = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }

    const userId = req.user.userId;

    // Calculate date range based on query parameters
    const dateRange = calculateDateRange(req.query);

    // Get daily logs for the specified date range
    const dailyLogs = await DailyLog.find({
      userId,
      date: { $gte: dateRange.startDate, $lte: dateRange.endDate },
    })
    .sort({ date: 'asc' }) // Sort by date for graph display
    .select('date totalCalories totalProtein totalCarbs totalFats items');

    // Format data for calorie graph consumption
    const graphData = dailyLogs.map((log) => ({
      date: log.date.toISOString().split('T')[0], // YYYY-MM-DD format
      calories: log.totalCalories || 0,
      protein: log.totalProtein || 0,
      carbs: log.totalCarbs || 0,
      fats: log.totalFats || 0,
      itemsCount: log.items.length
    }));

    // Calculate summary statistics for calories
    const totalDays = graphData.length;
    const summary = {
      calories: {
        total: graphData.reduce((sum, day) => sum + day.calories, 0),
        average: totalDays > 0 ? Math.round(graphData.reduce((sum, day) => sum + day.calories, 0) / totalDays) : 0,
        min: totalDays > 0 ? Math.min(...graphData.map(day => day.calories)) : 0,
        max: totalDays > 0 ? Math.max(...graphData.map(day => day.calories)) : 0,
      },
      protein: {
        total: graphData.reduce((sum, day) => sum + day.protein, 0),
        average: totalDays > 0 ? Math.round(graphData.reduce((sum, day) => sum + day.protein, 0) / totalDays * 10) / 10 : 0,
      },
      carbs: {
        total: graphData.reduce((sum, day) => sum + day.carbs, 0),
        average: totalDays > 0 ? Math.round(graphData.reduce((sum, day) => sum + day.carbs, 0) / totalDays * 10) / 10 : 0,
      },
      fats: {
        total: graphData.reduce((sum, day) => sum + day.fats, 0),
        average: totalDays > 0 ? Math.round(graphData.reduce((sum, day) => sum + day.fats, 0) / totalDays * 10) / 10 : 0,
      }
    };

    // Calculate moving averages for smoother calorie graph
    const movingAverages = graphData.map((day, index) => {
      const windowSize = Math.min(7, index + 1); // 7-day moving average
      const startIdx = Math.max(0, index - windowSize + 1);
      const windowData = graphData.slice(startIdx, index + 1);

      return {
        date: day.date,
        caloriesMovingAvg: windowData.length > 0 ? Math.round(windowData.reduce((sum, d) => sum + d.calories, 0) / windowData.length) : 0,
      };
    });

    const response = {
      success: true,
      message: `Calorie graph data retrieved for ${dateRange.rangeType} view (${dateRange.dayCount} days)`,
      data: {
        graphData,
        movingAverages,
        summary,
        timeRange: {
          type: dateRange.rangeType,
          startDate: dateRange.startDateString,
          endDate: dateRange.endDateString,
          dayCount: dateRange.dayCount,
        },
        chartData: {
          // Pre-formatted for easy chart consumption
          calories: graphData.map(day => ({
            date: day.date,
            value: day.calories,
            movingAverage: movingAverages.find(ma => ma.date === day.date)?.caloriesMovingAvg || 0
          })),
          protein: graphData.map(day => ({
            date: day.date,
            value: day.protein
          })),
          carbs: graphData.map(day => ({
            date: day.date,
            value: day.carbs
          })),
          fats: graphData.map(day => ({
            date: day.date,
            value: day.fats
          }))
        }
      }
    };

    return res.status(200).json(response);
  } catch (error) {
    logger.error(`Calorie graph data error: ${(error as Error).message}`);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching calorie graph data"
    });
  }
};

// Get water intake tracking data for graphs
export const getWaterGraphData = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }

    const userId = req.user.userId;

    // Calculate date range based on query parameters
    const dateRange = calculateDateRange(req.query);

    // Get daily logs for the specified date range
    const dailyLogs = await DailyLog.find({
      userId,
      date: { $gte: dateRange.startDate, $lte: dateRange.endDate },
    })
    .sort({ date: 'asc' }) // Sort by date for graph display
    .select('date waterIntake items');

    // Format data for water intake graph consumption
    const graphData = dailyLogs.map((log) => ({
      date: log.date.toISOString().split('T')[0], // YYYY-MM-DD format
      waterIntake: log.waterIntake || 0,
      itemsCount: log.items.length
    }));

    // Calculate summary statistics for water intake
    const totalDays = graphData.length;
    const summary = {
      waterIntake: {
        total: graphData.reduce((sum, day) => sum + day.waterIntake, 0),
        average: totalDays > 0 ? Math.round(graphData.reduce((sum, day) => sum + day.waterIntake, 0) / totalDays * 10) / 10 : 0,
        min: totalDays > 0 ? Math.min(...graphData.map(day => day.waterIntake)) : 0,
        max: totalDays > 0 ? Math.max(...graphData.map(day => day.waterIntake)) : 0,
      },
      hydrationGoal: {
        daily: 8, // Standard 8 glasses recommendation
        totalMet: graphData.filter(day => day.waterIntake >= 8).length,
        percentageMet: totalDays > 0 ? Math.round((graphData.filter(day => day.waterIntake >= 8).length / totalDays) * 100) : 0
      }
    };

    // Calculate moving averages for smoother water intake graph
    const movingAverages = graphData.map((day, index) => {
      const windowSize = Math.min(7, index + 1); // 7-day moving average
      const startIdx = Math.max(0, index - windowSize + 1);
      const windowData = graphData.slice(startIdx, index + 1);

      return {
        date: day.date,
        waterMovingAvg: windowData.length > 0 ? Math.round(windowData.reduce((sum, d) => sum + d.waterIntake, 0) / windowData.length * 10) / 10 : 0,
      };
    });

    const response = {
      success: true,
      message: `Water intake graph data retrieved for ${dateRange.rangeType} view (${dateRange.dayCount} days)`,
      data: {
        graphData,
        movingAverages,
        summary,
        timeRange: {
          type: dateRange.rangeType,
          startDate: dateRange.startDateString,
          endDate: dateRange.endDateString,
          dayCount: dateRange.dayCount,
        },
        chartData: {
          // Pre-formatted for easy chart consumption
          waterIntake: graphData.map(day => ({
            date: day.date,
            value: day.waterIntake,
            movingAverage: movingAverages.find(ma => ma.date === day.date)?.waterMovingAvg || 0,
            goalMet: day.waterIntake >= 8
          }))
        }
      }
    };

    return res.status(200).json(response);
  } catch (error) {
    logger.error(`Water intake graph data error: ${(error as Error).message}`);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching water intake graph data"
    });
  }
};

// Get tracking data for graphs (calories and water intake) - DEPRECATED
export const getTrackingGraphData = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }

    const userId = req.user.userId;

    // Calculate date range based on query parameters
    const dateRange = calculateDateRange(req.query);

    // Get daily logs for the specified date range
    const dailyLogs = await DailyLog.find({
      userId,
      date: { $gte: dateRange.startDate, $lte: dateRange.endDate },
    })
    .sort({ date: 'asc' }) // Sort by date for graph display
    .select('date totalCalories totalProtein waterIntake items totalFats totalCarbs');

    // Format data for graph consumption
    const graphData = dailyLogs.map((log) => ({
      date: log.date.toISOString().split('T')[0], // YYYY-MM-DD format
      calories: log.totalCalories || 0,
      protein: log.totalProtein || 0,
      carbs: log.totalCarbs || 0,
      fats: log.totalFats || 0,
      waterIntake: log.waterIntake || 0,
      itemsCount: log.items.length
    }));

    // Calculate summary statistics
    const totalDays = graphData.length;
    const summary = {
      calories: {
        total: graphData.reduce((sum, day) => sum + day.calories, 0),
        average: totalDays > 0 ? Math.round(graphData.reduce((sum, day) => sum + day.calories, 0) / totalDays) : 0,
        min: totalDays > 0 ? Math.min(...graphData.map(day => day.calories)) : 0,
        max: totalDays > 0 ? Math.max(...graphData.map(day => day.calories)) : 0,
      },
      waterIntake: {
        total: graphData.reduce((sum, day) => sum + day.waterIntake, 0),
        average: totalDays > 0 ? Math.round(graphData.reduce((sum, day) => sum + day.waterIntake, 0) / totalDays * 10) / 10 : 0,
        min: totalDays > 0 ? Math.min(...graphData.map(day => day.waterIntake)) : 0,
        max: totalDays > 0 ? Math.max(...graphData.map(day => day.waterIntake)) : 0,
      },
      protein: {
        total: graphData.reduce((sum, day) => sum + day.protein, 0),
        average: totalDays > 0 ? Math.round(graphData.reduce((sum, day) => sum + day.protein, 0) / totalDays * 10) / 10 : 0,
      },
      carbs: {
        total: graphData.reduce((sum, day) => sum + day.carbs, 0),
        average: totalDays > 0 ? Math.round(graphData.reduce((sum, day) => sum + day.carbs, 0) / totalDays * 10) / 10 : 0,
      },
      fats: {
        total: graphData.reduce((sum, day) => sum + day.fats, 0),
        average: totalDays > 0 ? Math.round(graphData.reduce((sum, day) => sum + day.fats, 0) / totalDays * 10) / 10 : 0,
      }
    };

    // Calculate moving averages for smoother graphs (optional)
    const movingAverages = graphData.map((day, index) => {
      const windowSize = Math.min(7, index + 1); // 7-day moving average
      const startIdx = Math.max(0, index - windowSize + 1);
      const windowData = graphData.slice(startIdx, index + 1);

      return {
        date: day.date,
        caloriesMovingAvg: windowData.length > 0 ? Math.round(windowData.reduce((sum, d) => sum + d.calories, 0) / windowData.length) : 0,
        waterMovingAvg: windowData.length > 0 ? Math.round(windowData.reduce((sum, d) => sum + d.waterIntake, 0) / windowData.length * 10) / 10 : 0,
      };
    });

    const response = {
      success: true,
      message: `Graph data retrieved for ${dateRange.rangeType} view (${dateRange.dayCount} days)`,
      data: {
        graphData,
        movingAverages,
        summary,
        timeRange: {
          type: dateRange.rangeType,
          startDate: dateRange.startDateString,
          endDate: dateRange.endDateString,
          dayCount: dateRange.dayCount,
        },
        chartData: {
          // Pre-formatted for easy chart consumption
          calories: graphData.map(day => ({
            date: day.date,
            value: day.calories,
            movingAverage: movingAverages.find(ma => ma.date === day.date)?.caloriesMovingAvg || 0
          })),
          waterIntake: graphData.map(day => ({
            date: day.date,
            value: day.waterIntake,
            movingAverage: movingAverages.find(ma => ma.date === day.date)?.waterMovingAvg || 0
          })),
          protein: graphData.map(day => ({
            date: day.date,
            value: day.protein
          })),
          carbs: graphData.map(day => ({
            date: day.date,
            value: day.carbs
          })),
          fats: graphData.map(day => ({
            date: day.date,
            value: day.fats
          }))
        }
      }
    };

    return res.status(200).json(response);
  } catch (error) {
    logger.error(`Tracking graph data error: ${(error as Error).message}`);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching tracking graph data"
    });
  }
};
