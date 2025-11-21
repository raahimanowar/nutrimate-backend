import { Router } from "express";
import { getFoodInventory, addFoodItem } from "../controllers/foodInventory.controller.js";

const router = Router();

router.get("/", getFoodInventory); // list all or filter by category
router.post("/", addFoodItem); // add new food item

export default router;
