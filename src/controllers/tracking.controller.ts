import { Response } from "express";
import { AuthRequest } from "../types/auth.types.js";
import Inventory from "../schemas/inventory.schema.js";
import DailyLog from "../schemas/daily-log.schema.js";
import Resource from "../schemas/resource.schema.js";
import { logger } from "../utils/logger.js";

// Rule-based tracking and recommendations
export const getTrackingSummary = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }

    const userId = req.user.userId;

    // 1️⃣ Inventory summary
    const inventory = await Inventory.find({ userId });
    const totalItems = inventory.length;
    const expiringSoon = inventory.filter((item) => {
      if (!item.hasExpiration || !item.expirationDate) return false;
      const today = new Date();
      const threeDaysLater = new Date();
      threeDaysLater.setDate(today.getDate() + 3);
      return (
        item.expirationDate >= today && item.expirationDate <= threeDaysLater
      );
    });

    const inventorySummary = {
      totalItems,
      expiringSoonCount: expiringSoon.length,
      categories: Array.from(new Set(inventory.map((i) => i.category))),
    };

    // 2️⃣ Recent daily logs (last 3 days)
    const today = new Date();
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(today.getDate() - 2);
    threeDaysAgo.setHours(0, 0, 0, 0);

    const recentLogs = await DailyLog.find({
      userId,
      date: { $gte: threeDaysAgo, $lte: today },
    }).sort({ date: -1 });

    // 3️⃣ Resource recommendations
    const consumedCategories = Array.from(
      new Set(
        recentLogs.flatMap((log) => log.items.map((item) => item.category))
      )
    );

    const recommendedResources = await Resource.find({
      category: { $in: consumedCategories },
    }).limit(10);

    const recommendations = recommendedResources.map((resItem) => ({
      _id: resItem._id,
      title: resItem.title,
      description: resItem.description,
      url: resItem.url,
      category: resItem.category,
      reason: `Related to: ${resItem.category} category based on recent consumption`,
    }));

    // Return consolidated tracking summary
    res.status(200).json({
      success: true,
      message: "Tracking summary retrieved successfully",
      data: {
        inventory: inventorySummary,
        recentLogs: recentLogs.map((log) => ({
          date: log.date.toISOString().split("T")[0],
          itemsCount: log.items.length,
          totalCalories: log.totalCalories,
        })),
        recommendations,
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
