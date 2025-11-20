import { Router } from "express";
import { getFoodInventory } from "../controllers/foodInventory.controller";

const router = Router();

router.get("/", getFoodInventory); // list all or filter by category

export default router;
