import { Router } from "express";
import { adminController } from "../controllers/admin.controller.js";

const router = Router();

// Foods
router.get("/foods", adminController.getFoods);
router.post("/foods", adminController.addFood);

// Nutrients
router.get("/nutrients", adminController.getNutrients);
router.post("/nutrients", adminController.addNutrient);

// Categories
router.get("/categories", adminController.getCategories);
router.post("/categories", adminController.addCategory);

// Analytics
router.get("/analytics", adminController.analytics);

export default router;
