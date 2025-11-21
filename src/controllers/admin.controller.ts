import { Request, Response } from "express";
import { Food, Nutrient, Category } from "../schemas/admin.schema.js";
import User from "../schemas/users.schema.js"; // For analytics

export const adminController = {
  // --- CRUD Foods ---
  getFoods: async (req: Request, res: Response) => {
    try {
      const foods = await Food.find().sort({ name: 1 });
      res.json({ success: true, foods });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  addFood: async (req: Request, res: Response) => {
    try {
      const {
        name,
        category,
        costPerUnit,
        expirationDays,
        quantity = 0,
      } = req.body;
      const food = new Food({
        name,
        category,
        costPerUnit,
        expirationDays,
        quantity,
      });
      await food.save();
      res.status(201).json({ success: true, food });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // --- CRUD Nutrients ---
  getNutrients: async (req: Request, res: Response) => {
    try {
      const nutrients = await Nutrient.find().sort({ name: 1 });
      res.json({ success: true, nutrients });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  addNutrient: async (req: Request, res: Response) => {
    try {
      const { name, dailyRecommended } = req.body;
      const nutrient = new Nutrient({ name, dailyRecommended });
      await nutrient.save();
      res.status(201).json({ success: true, nutrient });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // --- CRUD Categories ---
  getCategories: async (req: Request, res: Response) => {
    try {
      const categories = await Category.find().sort({ name: 1 });
      res.json({ success: true, categories });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  addCategory: async (req: Request, res: Response) => {
    try {
      const { name } = req.body;
      const category = new Category({ name });
      await category.save();
      res.status(201).json({ success: true, category });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // --- Analytics ---
  analytics: async (req: Request, res: Response) => {
    try {
      const totalUsers = await User.countDocuments();
      const popularFoods = await Food.find().sort({ quantity: -1 }).limit(5);
      const nutrients = await Nutrient.find().sort({ dailyRecommended: -1 });

      res.json({
        success: true,
        analytics: {
          totalUsers,
          popularFoods,
          nutrients,
        },
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
};
