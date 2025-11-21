/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import FoodInventory from "../schemas/foodInventory.schema.js";

export const getFoodInventory = async (req: Request, res: Response) => {
  try {
    const { category, page = "1", limit = "20" } = req.query;

    const query: any = {};
    if (category) query.category = (category as string).toLowerCase();

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    const total = await FoodInventory.countDocuments(query);
    const items = await FoodInventory.find(query)
      .sort({ name: 1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    res.json({
      success: true,
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
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
    const {
      name,
      category,
      expirationDays,
      costPerUnit,
      quantity = 0,
    } = req.body;

    if (!name || !category || !expirationDays || !costPerUnit) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: name, category, expirationDays, costPerUnit",
      });
    }

    const newItem = new FoodInventory({
      name: name.trim(),
      category: category.toLowerCase(),
      expirationDays,
      costPerUnit,
      quantity,
    });

    await newItem.save();

    res.status(201).json({
      success: true,
      message: "Food item added successfully",
      item: newItem,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
