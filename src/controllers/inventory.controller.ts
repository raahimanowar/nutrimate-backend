import { Request, Response } from "express";
import { logger } from "../utils/logger.js";
import Inventory from "../schemas/inventory.schema.js";
import { AuthRequest } from "../types/auth.types.js";
import { ObjectId } from "mongoose";
import { body, validationResult } from "express-validator";
import { convertToBase, getBaseUnit, UNIT_CONVERSIONS } from "../utils/unitConverter.js";

// Filter interfaces for type safety
interface InventoryFilters {
  category?: string;
  hasExpiration?: boolean;
  expiring_soon?: boolean;
  min_cost?: number;
  max_cost?: number;
  search?: string;
  sort_by?: 'createdAt' | 'itemName' | 'category' | 'costPerUnit' | 'expirationDate';
  sort_order?: 'asc' | 'desc';
}

interface InventoryQueryParams {
  category?: string;
  hasExpiration?: string;
  expiring_soon?: string;
  min_cost?: string;
  max_cost?: string;
  search?: string;
  sort_by?: string;
  sort_order?: string;
}

// Define proper inventory item type instead of using any
interface InventoryItemDocument {
  _id: ObjectId;
  itemName: string;
  category: string;
  expirationDate: Date | null;
  hasExpiration: boolean;
  costPerUnit: number;
  userId: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

interface FilteredInventoryResponse {
  success: boolean;
  message: string;
  data: InventoryItemDocument[]; // Inventory items returned from DB
  filters: InventoryFilters;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Input validation rules
export const validateInventoryItem = [
  body('itemName')
    .trim()
    .notEmpty()
    .withMessage('Item name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Item name must be between 1 and 100 characters'),

  body('category')
    .isIn(['fruits', 'vegetables', 'dairy', 'grains', 'protein', 'beverages', 'snacks', 'other'])
    .withMessage('Invalid category'),

  body('costPerUnit')
    .isFloat({ min: 0 })
    .withMessage('Cost per unit must be a positive number'),

  body('hasExpiration')
    .isBoolean()
    .withMessage('Has expiration must be a boolean'),

  body('unit')
    .optional()
    .isIn(Object.keys(UNIT_CONVERSIONS))
    .withMessage('Invalid unit. Use kg, g, lb, oz, l, ml, pieces, etc.'),

  body('quantity')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Quantity must be a non-negative number'),

  body('expirationDate')
    .if(body('hasExpiration').equals('true'))
    .isISO8601()
    .withMessage('Valid expiration date is required when hasExpiration is true')
    .custom(value => {
      if (value && new Date(value) <= new Date()) {
        throw new Error('Expiration date must be in the future');
      }
      return true;
    })
];

// Add item to inventory
export const addItem = async (req: AuthRequest, res: Response) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array()
      });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const { itemName, category, expirationDate, hasExpiration, costPerUnit, quantity = 1, unit = 'pieces' } = req.body;

    // Convert quantity to base unit for consistent tracking
    const baseUnit = getBaseUnit(unit);
    const baseQuantity = convertToBase(Number(quantity), unit);

    const newItem = new Inventory({
      itemName: itemName.trim(),
      category,
      expirationDate: hasExpiration && expirationDate ? new Date(expirationDate) : null,
      hasExpiration: hasExpiration !== undefined ? hasExpiration : true,
      costPerUnit,
      quantity: Math.max(0, Number(quantity) || 1),
      unit,
      baseQuantity: Math.max(0, baseQuantity),
      baseUnit,
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

// Type guard function for sort fields
const isValidSortField = (field: string): field is 'createdAt' | 'itemName' | 'category' | 'costPerUnit' | 'expirationDate' => {
  return ['createdAt', 'itemName', 'category', 'costPerUnit', 'expirationDate'].includes(field);
};

// Helper function to parse and validate filters
const parseFilters = (query: InventoryQueryParams): InventoryFilters => {
  const filters: InventoryFilters = {};

  // Category filter (comma-separated values)
  if (query.category) {
    filters.category = query.category;
  }

  // Has expiration filter
  if (query.hasExpiration !== undefined) {
    filters.hasExpiration = query.hasExpiration === 'true';
  }

  // Expiring soon filter
  if (query.expiring_soon === 'true') {
    filters.expiring_soon = true;
  }

  // Cost range filters
  if (query.min_cost && !isNaN(Number(query.min_cost))) {
    filters.min_cost = Number(query.min_cost);
  }

  if (query.max_cost && !isNaN(Number(query.max_cost))) {
    filters.max_cost = Number(query.max_cost);
  }

  // Search filter
  if (query.search) {
    filters.search = query.search.trim();
  }

  // Sort field with proper type safety - no type assertions
  if (query.sort_by && isValidSortField(query.sort_by)) {
    filters.sort_by = query.sort_by;
  }

  // Sort order with proper type checking
  if (query.sort_order === 'asc' || query.sort_order === 'desc') {
    filters.sort_order = query.sort_order;
  }

  return filters;
};

// Build MongoDB query from filters
const buildInventoryQuery = (userId: string, filters: InventoryFilters) => {
  // Base query - always filter by user
  const query: {
    userId: string;
    category?: { $in: string[] };
    hasExpiration?: boolean;
    itemName?: { $regex: string; $options: string };
  } = { userId };

  // Category filter (support multiple categories)
  if (filters.category) {
    const categories = filters.category.split(',').map(cat => cat.trim());
    query.category = { $in: categories };
  }

  // Has expiration filter
  if (filters.hasExpiration !== undefined) {
    query.hasExpiration = filters.hasExpiration;
  }

  // Search filter (case-insensitive regex)
  if (filters.search) {
    query.itemName = { $regex: filters.search, $options: 'i' };
  }

  return query;
};

// Apply additional filters that need special handling
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const applySpecialFilters = (mongooseQuery: any, filters: InventoryFilters): any => {
  // Expiring soon filter (items expiring within 3 days)
  if (filters.expiring_soon) {
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    const today = new Date();

    mongooseQuery = mongooseQuery.where('expirationDate').gte(today.getTime()).lte(threeDaysFromNow.getTime());
  }

  // Cost range filters
  if (filters.min_cost !== undefined || filters.max_cost !== undefined) {
    if (filters.min_cost !== undefined) {
      mongooseQuery = mongooseQuery.where('costPerUnit').gte(filters.min_cost);
    }
    if (filters.max_cost !== undefined) {
      mongooseQuery = mongooseQuery.where('costPerUnit').lte(filters.max_cost);
    }
  }

  // Sorting
  if (filters.sort_by) {
    const sortOrder = filters.sort_order === 'asc' ? 1 : -1;
    mongooseQuery = mongooseQuery.sort({ [filters.sort_by]: sortOrder });
  } else {
    // Default sort by createdAt desc
    mongooseQuery = mongooseQuery.sort({ createdAt: -1 });
  }

  return mongooseQuery;
};

// Get user's inventory with comprehensive filtering
export const getInventory = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    // Parse and validate filters
    const filters = parseFilters(req.query as InventoryQueryParams);

    // Build base query
    const baseQuery = buildInventoryQuery(req.user.userId, filters);

    // Create mongoose query
    let mongooseQuery = Inventory.find(baseQuery);

    // Apply special filters (cost, expiration, sorting)
    mongooseQuery = applySpecialFilters(mongooseQuery, filters);

    // Execute query
    const items = await mongooseQuery.exec() as unknown as InventoryItemDocument[];

    res.status(200).json({
      success: true,
      message: "Inventory retrieved successfully",
      data: items,
      filters: filters
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

    const updateData: {
      itemName: string;
      category: string;
      costPerUnit: number;
      expirationDate?: Date | null;
      hasExpiration: boolean;
    } = { itemName, category, costPerUnit, hasExpiration: hasExpiration !== undefined ? hasExpiration : true };

    // Only update expirationDate if hasExpiration is true and expirationDate is provided
    if (hasExpiration && expirationDate) {
      updateData.expirationDate = new Date(expirationDate);
    } else if (!hasExpiration) {
      updateData.expirationDate = null;
    }

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
