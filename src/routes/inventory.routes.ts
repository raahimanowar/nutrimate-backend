import { Router } from "express";
import { addItem, getInventory, updateItem, deleteItem, validateInventoryItem } from "../controllers/inventory.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = Router();

// All inventory routes are protected
router.use(authenticateToken);

// Add item to inventory
router.post("/", validateInventoryItem, addItem);

// Get user's inventory
router.get("/", getInventory);

// Update inventory item
router.put("/:id", updateItem);

// Delete inventory item
router.delete("/:id", deleteItem);

export default router;