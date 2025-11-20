import { Response } from "express";
import { AuthRequest } from "../types/auth.types.js";
import Inventory from "../schemas/inventory.schema.js";
import DailyLog from "../schemas/daily-log.schema.js";
import Resource from "../schemas/resource.schema.js";
import { logger } from "../utils/logger.js";

interface TrackingLog {
  date: string;
  totalCalories: number;
  totalProtein: number;
}

interface RecommendedResource {
  title: string;
  url: string;
  relatedTo: string;
}

// Rule-based tracking and recommendations
export const getTrackingSummary = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }

    const userId = req.user.userId;

    // 1️⃣ Inventory count
    const inventory = await Inventory.find({ userId });
    const inventoryCount = inventory.length;

    // 2️⃣ Recent daily logs (last 7 days)
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const recentLogs = await DailyLog.find({
      userId,
      date: { $gte: sevenDaysAgo, $lte: today },
    }).sort({ date: -1 });

    // Format recent logs with aggregated nutrition data
    const formattedRecentLogs: TrackingLog[] = recentLogs.map((log) => {
      // Calculate total protein from all items in the log
      const totalProtein = log.items.reduce((sum, item) => {
        return sum + (item.protein || 0);
      }, 0);

      return {
        date: log.date.toISOString().split("T")[0],
        totalCalories: log.totalCalories || 0,
        totalProtein: Math.round(totalProtein),
      };
    });

    // 3️⃣ Resource recommendations
    const consumedCategories = Array.from(
      new Set(
        recentLogs.flatMap((log) => log.items.map((item) => item.category))
      )
    );

    const recommendedResources = await Resource.find({
      category: { $in: consumedCategories },
    }).limit(5);

    // Format recommendations with simplified structure
    const recommendedResourcesList: RecommendedResource[] = recommendedResources.map(
      (resItem) => ({
        title: resItem.title,
        url: resItem.url || "",
        relatedTo: `${resItem.category} category`,
      })
    );

    // Return consolidated tracking summary
    res.status(200).json({
      success: true,
      message: "Basic tracking data retrieved",
      data: {
        inventoryCount,
        recentLogs: formattedRecentLogs,
        recommendedResources: recommendedResourcesList,
      },
    });
  } catch (error) {
    logger.error(`Tracking summary error: ${(error as Error).message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching tracking summary",
    });
  }
};
