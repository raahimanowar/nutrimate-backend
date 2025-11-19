import { Request, Response } from "express";
import { logger } from "../utils/logger.js";
import Inventory from "../schemas/inventory.schema.js";
import { AuthRequest } from "../types/auth.types.js";

// Add item to inventory
export const addItem = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const { itemName, category, expirationDate, hasExpiration, costPerUnit } = req.body;

    const newItem = new Inventory({
      itemName,
      category,
      expirationDate: hasExpiration && expirationDate ? new Date(expirationDate) : null,
      hasExpiration: hasExpiration !== undefined ? hasExpiration : true,
      costPerUnit,
      userId: req.user.userId
    });

    await newItem.save();

    logger.info(`Item added to inventory: ${newItem.itemName}`);

    res.status(201).json({
      success: true,
      message: "Item added successfully",
      data: newItem
    });

  } catch (error) {
    logger.error(`Add item error: ${(error as Error).message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error while adding item"
    });
  }
};

// Get user's inventory
export const getInventory = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const items = await Inventory.find({ userId: req.user.userId });

    res.status(200).json({
      success: true,
      message: "Inventory retrieved successfully",
      data: items
    });

  } catch (error) {
    logger.error(`Get inventory error: ${(error as Error).message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching inventory"
    });
  }
};

// Update inventory item
export const updateItem = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const { id } = req.params;
    const { itemName, category, expirationDate, hasExpiration, costPerUnit } = req.body;

    const item = await Inventory.findOne({ _id: id, userId: req.user.userId });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found"
      });
    }

    const updateData: any = { itemName, category, costPerUnit };

    // Only update expirationDate if hasExpiration is true and expirationDate is provided
    if (hasExpiration && expirationDate) {
      updateData.expirationDate = new Date(expirationDate);
    } else if (!hasExpiration) {
      updateData.expirationDate = null;
    }

    updateData.hasExpiration = hasExpiration !== undefined ? hasExpiration : true;

    const updatedItem = await Inventory.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).json({
        success: false,
        message: "Item not found"
      });
    }

    logger.info(`Item updated: ${updatedItem.itemName}`);

    res.status(200).json({
      success: true,
      message: "Item updated successfully",
      data: updatedItem
    });

  } catch (error) {
    logger.error(`Update item error: ${(error as Error).message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error while updating item"
    });
  }
};

// Delete inventory item
export const deleteItem = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const { id } = req.params;

    const item = await Inventory.findOne({ _id: id, userId: req.user.userId });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found"
      });
    }

    await Inventory.findByIdAndDelete(id);

    logger.info(`Item deleted: ${item.itemName}`);

    res.status(200).json({
      success: true,
      message: "Item deleted successfully"
    });

  } catch (error) {
    logger.error(`Delete item error: ${(error as Error).message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error while deleting item"
    });
  }
};