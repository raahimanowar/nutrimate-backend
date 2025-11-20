import { Response } from "express";
import { logger } from "../utils/logger.js";
import DailyLog from "../schemas/daily-log.schema.js";
import { AuthRequest, DailyLogItemCreate, DailyLogQueryParams, WaterIntakeUpdate, DailyLogSummary } from "../types/daily-log.types.js";

// Get or create daily log for a specific date
export const getDailyLog = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const { date } = req.query;
    const targetDate = date ? new Date(date as string) : new Date();

    // Validate date
    if (isNaN(targetDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Use YYYY-MM-DD format"
      });
    }

    // Find or create daily log
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dailyLog = await (DailyLog as any).findOrCreate(req.user.userId, targetDate);

    res.status(200).json({
      success: true,
      message: "Daily log retrieved successfully",
      data: {
        _id: dailyLog._id,
        userId: dailyLog.userId,
        date: dailyLog.date.toISOString().split('T')[0],
        items: dailyLog.items,
        totalCalories: dailyLog.totalCalories,
        totalProtein: dailyLog.totalProtein,
        totalCarbs: dailyLog.totalCarbs,
        totalFats: dailyLog.totalFats,
        totalFiber: dailyLog.totalFiber,
        totalSugar: dailyLog.totalSugar,
        totalSodium: dailyLog.totalSodium,
        waterIntake: dailyLog.waterIntake,
        createdAt: dailyLog.createdAt,
        updatedAt: dailyLog.updatedAt
      }
    });

  } catch (error) {
    logger.error(`Get daily log error: ${(error as Error).message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching daily log"
    });
  }
};

// Get multiple daily logs with filtering
export const getDailyLogs = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const query = req.query as DailyLogQueryParams;

    // Build date filter
    let dateFilter: Record<string, Date> = {};
    if (query.date) {
      const targetDate = new Date(query.date);
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);
      dateFilter = { $gte: startOfDay, $lte: endOfDay };
    } else if (query.startDate && query.endDate) {
      const start = new Date(query.startDate);
      const end = new Date(query.endDate);
      end.setHours(23, 59, 59, 999);
      dateFilter = { $gte: start, $lte: end };
    }

    // Build base query
    const mongoQuery: Record<string, unknown> = { userId: req.user.userId };
    if (Object.keys(dateFilter).length > 0) {
      mongoQuery.date = dateFilter;
    }

    // Sort options
    const sortField = query.sortBy || 'date';
    const sortOrder = query.sortOrder === 'asc' ? 1 : -1;
    const sortOptions: Record<string, 1 | -1> = { [sortField]: sortOrder };

    // Pagination
    const page = parseInt(query.page || '1');
    const limit = parseInt(query.limit || '30');
    const skip = (page - 1) * limit;

    // Execute query
    const [dailyLogs, total] = await Promise.all([
      DailyLog.find(mongoQuery)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit),
      DailyLog.countDocuments(mongoQuery)
    ]);

    res.status(200).json({
      success: true,
      message: "Daily logs retrieved successfully",
      data: dailyLogs.map(log => ({
        _id: log._id,
        userId: log.userId,
        date: log.date.toISOString().split('T')[0],
        items: log.items,
        totalCalories: log.totalCalories,
        totalProtein: log.totalProtein,
        totalCarbs: log.totalCarbs,
        totalFats: log.totalFats,
        totalFiber: log.totalFiber,
        totalSugar: log.totalSugar,
        totalSodium: log.totalSodium,
        waterIntake: log.waterIntake,
        itemsCount: log.items.length,
        createdAt: log.createdAt,
        updatedAt: log.updatedAt
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    logger.error(`Get daily logs error: ${(error as Error).message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching daily logs"
    });
  }
};

// Add item to daily log
export const addDailyLogItem = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const { date, item } = req.body as { date?: string; item: DailyLogItemCreate };

    if (!item) {
      return res.status(400).json({
        success: false,
        message: "Item data is required"
      });
    }

    const targetDate = date ? new Date(date) : new Date();

    // Validate date
    if (isNaN(targetDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Use YYYY-MM-DD format"
      });
    }

    // Validate item data
    const { itemName, quantity, category, mealType } = item;
    if (!itemName || !quantity || !category || !mealType) {
      return res.status(400).json({
        success: false,
        message: "Item name, quantity, category, and meal type are required"
      });
    }

    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be greater than 0"
      });
    }

    // Find or create daily log
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dailyLog = await (DailyLog as any).findOrCreate(req.user.userId, targetDate);

    // Add item to log
    dailyLog.items.push({
      ...item,
      itemName: item.itemName.trim(),
      unit: item.unit || 'servings'
    });

    await dailyLog.save();

    logger.info(`Item added to daily log: ${item.itemName} for user ${req.user.username}`);

    res.status(201).json({
      success: true,
      message: "Item added to daily log successfully",
      data: {
        _id: dailyLog._id,
        userId: dailyLog.userId,
        date: dailyLog.date.toISOString().split('T')[0],
        items: dailyLog.items,
        totalCalories: dailyLog.totalCalories,
        totalProtein: dailyLog.totalProtein,
        totalCarbs: dailyLog.totalCarbs,
        totalFats: dailyLog.totalFats,
        totalFiber: dailyLog.totalFiber,
        totalSugar: dailyLog.totalSugar,
        totalSodium: dailyLog.totalSodium,
        waterIntake: dailyLog.waterIntake,
        updatedAt: dailyLog.updatedAt
      }
    });

  } catch (error) {
    logger.error(`Add daily log item error: ${(error as Error).message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error while adding item to daily log"
    });
  }
};

// Update item in daily log
export const updateDailyLogItem = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const { logId, itemId } = req.params;
    const updateData = req.body;

    if (!logId || !itemId) {
      return res.status(400).json({
        success: false,
        message: "Log ID and item ID are required"
      });
    }

    // Find daily log
    const dailyLog = await DailyLog.findOne({
      _id: logId,
      userId: req.user.userId
    });

    if (!dailyLog) {
      return res.status(404).json({
        success: false,
        message: "Daily log not found"
      });
    }

    // Find and update item
    const itemIndex = dailyLog.items.findIndex(item =>
      item._id?.toString() === itemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Item not found in daily log"
      });
    }

    // Update item fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined && key !== '_id') {
        if (key === 'itemName') {
          dailyLog.items[itemIndex][key] = updateData[key].trim();
        } else {
          dailyLog.items[itemIndex][key] = updateData[key];
        }
      }
    });

    await dailyLog.save();

    logger.info(`Item updated in daily log: ${itemId} for user ${req.user.username}`);

    res.status(200).json({
      success: true,
      message: "Item updated successfully",
      data: {
        _id: dailyLog._id,
        userId: dailyLog.userId,
        date: dailyLog.date.toISOString().split('T')[0],
        items: dailyLog.items,
        totalCalories: dailyLog.totalCalories,
        totalProtein: dailyLog.totalProtein,
        totalCarbs: dailyLog.totalCarbs,
        totalFats: dailyLog.totalFats,
        totalFiber: dailyLog.totalFiber,
        totalSugar: dailyLog.totalSugar,
        totalSodium: dailyLog.totalSodium,
        waterIntake: dailyLog.waterIntake,
        updatedAt: dailyLog.updatedAt
      }
    });

  } catch (error) {
    logger.error(`Update daily log item error: ${(error as Error).message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error while updating item"
    });
  }
};

// Delete item from daily log
export const deleteDailyLogItem = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const { logId, itemId } = req.params;

    if (!logId || !itemId) {
      return res.status(400).json({
        success: false,
        message: "Log ID and item ID are required"
      });
    }

    // Find daily log
    const dailyLog = await DailyLog.findOne({
      _id: logId,
      userId: req.user.userId
    });

    if (!dailyLog) {
      return res.status(404).json({
        success: false,
        message: "Daily log not found"
      });
    }

    // Remove item
    const itemIndex = dailyLog.items.findIndex(item =>
      item._id?.toString() === itemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Item not found in daily log"
      });
    }

    const deletedItem = dailyLog.items[itemIndex];
    dailyLog.items.splice(itemIndex, 1);

    await dailyLog.save();

    logger.info(`Item deleted from daily log: ${deletedItem.itemName} for user ${req.user.username}`);

    res.status(200).json({
      success: true,
      message: "Item deleted successfully",
      data: {
        _id: dailyLog._id,
        userId: dailyLog.userId,
        date: dailyLog.date.toISOString().split('T')[0],
        items: dailyLog.items,
        totalCalories: dailyLog.totalCalories,
        totalProtein: dailyLog.totalProtein,
        totalCarbs: dailyLog.totalCarbs,
        totalFats: dailyLog.totalFats,
        totalFiber: dailyLog.totalFiber,
        totalSugar: dailyLog.totalSugar,
        totalSodium: dailyLog.totalSodium,
        waterIntake: dailyLog.waterIntake,
        updatedAt: dailyLog.updatedAt
      }
    });

  } catch (error) {
    logger.error(`Delete daily log item error: ${(error as Error).message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error while deleting item"
    });
  }
};

// Update water intake
export const updateWaterIntake = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const { date } = req.query;
    const { waterIntake } = req.body as WaterIntakeUpdate;

    if (typeof waterIntake !== 'number' || waterIntake < 0 || waterIntake > 50) {
      return res.status(400).json({
        success: false,
        message: "Water intake must be a number between 0 and 50"
      });
    }

    const targetDate = date ? new Date(date as string) : new Date();

    // Validate date
    if (isNaN(targetDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Use YYYY-MM-DD format"
      });
    }

    // Find or create daily log
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dailyLog = await (DailyLog as any).findOrCreate(req.user.userId, targetDate);

    // Update water intake
    dailyLog.waterIntake = waterIntake;
    await dailyLog.save();

    logger.info(`Water intake updated to ${waterIntake} glasses for user ${req.user.username}`);

    res.status(200).json({
      success: true,
      message: "Water intake updated successfully",
      data: {
        _id: dailyLog._id,
        userId: dailyLog.userId,
        date: dailyLog.date.toISOString().split('T')[0],
        waterIntake: dailyLog.waterIntake,
        updatedAt: dailyLog.updatedAt
      }
    });

  } catch (error) {
    logger.error(`Update water intake error: ${(error as Error).message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error while updating water intake"
    });
  }
};

// Get daily log summary
export const getDailyLogSummary = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const { startDate, endDate } = req.query as {
      startDate?: string;
      endDate?: string;
    };

    // Default to last 7 days if no dates provided
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date();
    start.setDate(start.getDate() - 7);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Use YYYY-MM-DD format"
      });
    }

    const dailyLogs = await DailyLog.find({
      userId: req.user.userId,
      date: {
        $gte: start,
        $lte: end
      }
    }).sort({ date: 1 });

    const summaries: DailyLogSummary[] = dailyLogs.map(log => ({
      date: log.date.toISOString().split('T')[0],
      totalCalories: log.totalCalories,
      totalProtein: log.totalProtein,
      totalCarbs: log.totalCarbs,
      totalFats: log.totalFats,
      totalFiber: log.totalFiber,
      totalSugar: log.totalSugar,
      totalSodium: log.totalSodium,
      waterIntake: log.waterIntake,
      itemsCount: log.items.length,
      mealsByCategory: log.items.reduce((acc: Record<string, number>, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {})
    }));

    res.status(200).json({
      success: true,
      message: "Daily log summary retrieved successfully",
      data: {
        summaries,
        period: {
          startDate: start.toISOString().split('T')[0],
          endDate: end.toISOString().split('T')[0]
        },
        totals: {
          avgCalories: summaries.length > 0 ? Math.round(summaries.reduce((sum, s) => sum + s.totalCalories, 0) / summaries.length) : 0,
          avgProtein: summaries.length > 0 ? Math.round(summaries.reduce((sum, s) => sum + s.totalProtein, 0) / summaries.length) : 0,
          avgCarbs: summaries.length > 0 ? Math.round(summaries.reduce((sum, s) => sum + s.totalCarbs, 0) / summaries.length) : 0,
          avgFats: summaries.length > 0 ? Math.round(summaries.reduce((sum, s) => sum + s.totalFats, 0) / summaries.length) : 0,
          avgWaterIntake: summaries.length > 0 ? Math.round(summaries.reduce((sum, s) => sum + s.waterIntake, 0) / summaries.length) : 0
        }
      }
    });

  } catch (error) {
    logger.error(`Get daily log summary error: ${(error as Error).message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching daily log summary"
    });
  }
};

// Get all-time consumption history and analysis
export const getAllTimeConsumptionHistory = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const {
      limit = '1000',
      page = '1',
      sortBy = 'date',
      sortOrder = 'desc',
      includeTotals = 'true'
    } = req.query as {
      limit?: string;
      page?: string;
      sortBy?: string;
      sortOrder?: string;
      includeTotals?: string;
    };

    // Pagination
    const limitNum = parseInt(limit);
    const pageNum = parseInt(page);
    const skip = (pageNum - 1) * limitNum;

    // Build sort options
    const sortOptions: Record<string, 1 | -1> = {};
    if (sortBy === 'date') {
      sortOptions.date = sortOrder === 'asc' ? 1 : -1;
    } else if (sortBy === 'totalCalories') {
      sortOptions.totalCalories = sortOrder === 'asc' ? 1 : -1;
    } else if (sortBy === 'totalProtein') {
      sortOptions.totalProtein = sortOrder === 'asc' ? 1 : -1;
    } else {
      sortOptions.date = -1; // default sort
    }

    // Get all daily logs for user
    const [dailyLogs, total] = await Promise.all([
      DailyLog.find({ userId: req.user.userId })
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum),
      DailyLog.countDocuments({ userId: req.user.userId })
    ]);

    if (dailyLogs.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No consumption history found",
        data: {
          history: [],
          summary: {
            totalDays: 0,
            firstLogDate: null,
            lastLogDate: null,
            overallTotals: null,
            dailyAverages: null,
            foodFrequency: {},
            mealFrequency: {},
            categoryFrequency: {},
            topFoods: [],
            monthlyTrends: [],
            yearlyTrends: []
          },
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: 0,
            totalPages: 0
          }
        }
      });
    }

    // Process daily logs for analysis
    const history = dailyLogs.map(log => ({
      _id: log._id,
      date: log.date.toISOString().split('T')[0],
      items: log.items,
      totalCalories: log.totalCalories,
      totalProtein: log.totalProtein,
      totalCarbs: log.totalCarbs,
      totalFats: log.totalFats,
      totalFiber: log.totalFiber,
      totalSugar: log.totalSugar,
      totalSodium: log.totalSodium,
      waterIntake: log.waterIntake,
      itemsCount: log.items.length,
      createdAt: log.createdAt
    }));

    let summary = null;

    if (includeTotals === 'true') {
      // Calculate comprehensive statistics
      const totalDays = dailyLogs.length;
      const firstLogDate = new Date(Math.min(...dailyLogs.map(log => log.date.getTime())));
      const lastLogDate = new Date(Math.max(...dailyLogs.map(log => log.date.getTime())));

      // Overall totals
      const overallTotals = {
        totalCalories: dailyLogs.reduce((sum, log) => sum + log.totalCalories, 0),
        totalProtein: dailyLogs.reduce((sum, log) => sum + log.totalProtein, 0),
        totalCarbs: dailyLogs.reduce((sum, log) => sum + log.totalCarbs, 0),
        totalFats: dailyLogs.reduce((sum, log) => sum + log.totalFats, 0),
        totalFiber: dailyLogs.reduce((sum, log) => sum + log.totalFiber, 0),
        totalSugar: dailyLogs.reduce((sum, log) => sum + log.totalSugar, 0),
        totalSodium: dailyLogs.reduce((sum, log) => sum + log.totalSodium, 0),
        totalWaterIntake: dailyLogs.reduce((sum, log) => sum + log.waterIntake, 0),
        totalItems: dailyLogs.reduce((sum, log) => sum + log.items.length, 0),
        totalDaysLogged: totalDays
      };

      // Daily averages
      const dailyAverages = {
        avgCalories: Math.round(overallTotals.totalCalories / totalDays),
        avgProtein: Math.round(overallTotals.totalProtein / totalDays),
        avgCarbs: Math.round(overallTotals.totalCarbs / totalDays),
        avgFats: Math.round(overallTotals.totalFats / totalDays),
        avgFiber: Math.round(overallTotals.totalFiber / totalDays),
        avgSugar: Math.round(overallTotals.totalSugar / totalDays),
        avgSodium: Math.round(overallTotals.totalSodium / totalDays),
        avgWaterIntake: Math.round((overallTotals.totalWaterIntake / totalDays) * 10) / 10,
        avgItemsPerDay: Math.round((overallTotals.totalItems / totalDays) * 10) / 10
      };

      // Food frequency analysis
      const foodFrequency: Record<string, number> = {};
      const mealFrequency: Record<string, number> = { breakfast: 0, lunch: 0, dinner: 0, snack: 0, beverage: 0 };
      const categoryFrequency: Record<string, number> = { fruits: 0, vegetables: 0, dairy: 0, grains: 0, protein: 0, beverages: 0, snacks: 0, other: 0 };

      dailyLogs.forEach(log => {
        log.items.forEach(item => {
          // Track food frequency
          const foodKey = `${item.itemName.toLowerCase().trim()}|${item.category}`;
          foodFrequency[foodKey] = (foodFrequency[foodKey] || 0) + 1;

          // Track meal type frequency
          mealFrequency[item.mealType] = (mealFrequency[item.mealType] || 0) + 1;

          // Track category frequency
          categoryFrequency[item.category] = (categoryFrequency[item.category] || 0) + 1;
        });
      });

      // Top foods (most frequently consumed)
      const topFoods = Object.entries(foodFrequency)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 20)
        .map(([key, count]) => {
          const [itemName, category] = key.split('|');
          return {
            itemName,
            category,
            count,
            percentage: Math.round((count / overallTotals.totalItems) * 100)
          };
        });

      // Monthly trends
      const monthlyTrends: Array<{ month: string; avgCalories: number; avgProtein: number; totalDays: number }> = [];
      const monthlyData: Record<string, { calories: number[]; protein: number[]; days: number }> = {};

      dailyLogs.forEach(log => {
        const monthKey = log.date.toISOString().slice(0, 7); // YYYY-MM
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { calories: [], protein: [], days: 0 };
        }
        monthlyData[monthKey].calories.push(log.totalCalories);
        monthlyData[monthKey].protein.push(log.totalProtein);
        monthlyData[monthKey].days++;
      });

      Object.entries(monthlyData)
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([month, data]) => {
          monthlyTrends.push({
            month,
            avgCalories: Math.round(data.calories.reduce((sum, val) => sum + val, 0) / data.days),
            avgProtein: Math.round(data.protein.reduce((sum, val) => sum + val, 0) / data.days),
            totalDays: data.days
          });
        });

      // Yearly trends
      const yearlyTrends: Array<{ year: string; avgCalories: number; avgProtein: number; totalDays: number }> = [];
      const yearlyData: Record<string, { calories: number[]; protein: number[]; days: number }> = {};

      dailyLogs.forEach(log => {
        const yearKey = log.date.toISOString().slice(0, 4); // YYYY
        if (!yearlyData[yearKey]) {
          yearlyData[yearKey] = { calories: [], protein: [], days: 0 };
        }
        yearlyData[yearKey].calories.push(log.totalCalories);
        yearlyData[yearKey].protein.push(log.totalProtein);
        yearlyData[yearKey].days++;
      });

      Object.entries(yearlyData)
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([year, data]) => {
          yearlyTrends.push({
            year,
            avgCalories: Math.round(data.calories.reduce((sum, val) => sum + val, 0) / data.days),
            avgProtein: Math.round(data.protein.reduce((sum, val) => sum + val, 0) / data.days),
            totalDays: data.days
          });
        });

      summary = {
        totalDays,
        firstLogDate: firstLogDate.toISOString().split('T')[0],
        lastLogDate: lastLogDate.toISOString().split('T')[0],
        overallTotals,
        dailyAverages,
        foodFrequency,
        mealFrequency,
        categoryFrequency,
        topFoods,
        monthlyTrends,
        yearlyTrends
      };
    }

    logger.info(`All-time consumption history retrieved for user ${req.user.username}: ${dailyLogs.length} days`);

    res.status(200).json({
      success: true,
      message: "All-time consumption history retrieved successfully",
      data: {
        history,
        summary,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        }
      }
    });

  } catch (error) {
    logger.error(`Get all-time consumption history error: ${(error as Error).message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching all-time consumption history"
    });
  }
};