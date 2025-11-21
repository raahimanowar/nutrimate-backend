import { Request, Response } from "express";
import Waste from "../schemas/waste.schema";

// Minimal GET endpoint for weekly/monthly waste
export const getWasteEstimation = async (req: Request, res: Response) => {
  try {
    const username = req.params.username?.trim();
    if (!username)
      return res.status(400).json({ message: "Username required" });

    const userData = await Waste.findOne({ username }).lean();
    if (!userData) return res.status(404).json({ message: "User not found" });

    // Simple calculation
    const today = new Date();
    const weeklyWasted = userData.inventory.reduce((acc, item) => {
      const consumedQty = userData.consumption
        .filter(
          (c) =>
            c.name === item.name &&
            (today.getTime() - new Date(c.date).getTime()) /
              (1000 * 60 * 60 * 24) <=
              7
        )
        .reduce((sum, c) => sum + c.quantity, 0);
      return acc + Math.max(0, item.quantity - consumedQty) * item.price;
    }, 0);

    const monthlyWasted = userData.inventory.reduce((acc, item) => {
      const consumedQty = userData.consumption
        .filter(
          (c) =>
            c.name === item.name &&
            (today.getTime() - new Date(c.date).getTime()) /
              (1000 * 60 * 60 * 24) <=
              30
        )
        .reduce((sum, c) => sum + c.quantity, 0);
      return acc + Math.max(0, item.quantity - consumedQty) * item.price;
    }, 0);

    // Dummy community averages
    const community = { weekly_avg: 500, monthly_avg: 2000 };

    res.json({
      username,
      weeklyWasted,
      monthlyWasted,
      community,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Error calculating waste", error: err.message });
  }
};
