import { Request, Response } from "express";
import FoodInventory from "../schemas/foodInventory.schema";

// GET /api/food-inventory
export const getFoodInventory = async (req: Request, res: Response) => {
  try {
    const { category } = req.query;

    const query: any = {};
    if (category) query.category = (category as string).toLowerCase();

    const items = await FoodInventory.find(query).sort({ name: 1 });
    console.log(items);
    
    res.json({
      success: true,
      items,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
