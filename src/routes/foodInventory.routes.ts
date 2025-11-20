import { Router } from "express";
import { getFoodInventory } from "../controllers/foodInventory.controller.js";

const router = Router();

router.get("/", getFoodInventory); // list all or filter by category

export default router;
