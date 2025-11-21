import { Request, Response } from "express";
import FoodInventory from "../schemas/foodInventory.schema.js";

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

// POST /api/food-inventory
export const addFoodItem = async (req: Request, res: Response) => {
  try {
    const { name, category, expirationDays, costPerUnit, quantity = 0 } = req.body;

    // Validate required fields
    if (!name || !category || !expirationDays || !costPerUnit) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: name, category, expirationDays, costPerUnit"
      });
    }

    const newItem = new FoodInventory({
      name: name.trim(),
      category: category.toLowerCase(),
      expirationDays,
      costPerUnit,
      quantity
    });

    await newItem.save();

    res.status(201).json({
      success: true,
      message: "Food item added successfully",
      item: newItem
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
