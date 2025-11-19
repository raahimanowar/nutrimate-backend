import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware.js";
import {
  getDailyLog,
  getDailyLogs,
  addDailyLogItem,
  updateDailyLogItem,
  deleteDailyLogItem,
  updateWaterIntake,
  getDailyLogSummary
} from "../controllers/daily-log.controller.js";
import { body, param, query, validationResult } from "express-validator";

const router = Router();

// All daily log routes are protected
router.use(authenticateToken);

// Validation rules
const validateAddItem = [
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be in valid ISO8601 format (YYYY-MM-DD)'),

  body('item.itemName')
    .trim()
    .notEmpty()
    .withMessage('Item name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Item name must be between 1 and 100 characters'),

  body('item.quantity')
    .isFloat({ min: 0.1, max: 10000 })
    .withMessage('Quantity must be between 0.1 and 10000'),

  body('item.unit')
    .optional()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Unit must be between 1 and 20 characters'),

  body('item.category')
    .isIn(['fruits', 'vegetables', 'dairy', 'grains', 'protein', 'beverages', 'snacks', 'other'])
    .withMessage('Invalid category'),

  body('item.mealType')
    .isIn(['breakfast', 'lunch', 'dinner', 'snack', 'beverage'])
    .withMessage('Invalid meal type'),

  body('item.calories')
    .optional()
    .isFloat({ min: 0, max: 10000 })
    .withMessage('Calories must be between 0 and 10000'),

  body('item.protein')
    .optional()
    .isFloat({ min: 0, max: 1000 })
    .withMessage('Protein must be between 0 and 1000 grams'),

  body('item.carbs')
    .optional()
    .isFloat({ min: 0, max: 1000 })
    .withMessage('Carbs must be between 0 and 1000 grams'),

  body('item.fats')
    .optional()
    .isFloat({ min: 0, max: 1000 })
    .withMessage('Fats must be between 0 and 1000 grams'),

  body('item.fiber')
    .optional()
    .isFloat({ min: 0, max: 500 })
    .withMessage('Fiber must be between 0 and 500 grams'),

  body('item.sugar')
    .optional()
    .isFloat({ min: 0, max: 500 })
    .withMessage('Sugar must be between 0 and 500 grams'),

  body('item.sodium')
    .optional()
    .isFloat({ min: 0, max: 5000 })
    .withMessage('Sodium must be between 0 and 5000 mg'),

  body('item.notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must be less than 500 characters')
];

const validateUpdateItem = [
  param('logId')
    .isMongoId()
    .withMessage('Invalid log ID'),

  param('itemId')
    .isMongoId()
    .withMessage('Invalid item ID'),

  body('itemName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Item name must be between 1 and 100 characters'),

  body('quantity')
    .optional()
    .isFloat({ min: 0.1, max: 10000 })
    .withMessage('Quantity must be between 0.1 and 10000'),

  body('unit')
    .optional()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Unit must be between 1 and 20 characters'),

  body('category')
    .optional()
    .isIn(['fruits', 'vegetables', 'dairy', 'grains', 'protein', 'beverages', 'snacks', 'other'])
    .withMessage('Invalid category'),

  body('mealType')
    .optional()
    .isIn(['breakfast', 'lunch', 'dinner', 'snack', 'beverage'])
    .withMessage('Invalid meal type'),

  body('calories')
    .optional()
    .isFloat({ min: 0, max: 10000 })
    .withMessage('Calories must be between 0 and 10000'),

  body('protein')
    .optional()
    .isFloat({ min: 0, max: 1000 })
    .withMessage('Protein must be between 0 and 1000 grams'),

  body('carbs')
    .optional()
    .isFloat({ min: 0, max: 1000 })
    .withMessage('Carbs must be between 0 and 1000 grams'),

  body('fats')
    .optional()
    .isFloat({ min: 0, max: 1000 })
    .withMessage('Fats must be between 0 and 1000 grams'),

  body('fiber')
    .optional()
    .isFloat({ min: 0, max: 500 })
    .withMessage('Fiber must be between 0 and 500 grams'),

  body('sugar')
    .optional()
    .isFloat({ min: 0, max: 500 })
    .withMessage('Sugar must be between 0 and 500 grams'),

  body('sodium')
    .optional()
    .isFloat({ min: 0, max: 5000 })
    .withMessage('Sodium must be between 0 and 5000 mg'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must be less than 500 characters')
];

const validateDeleteItem = [
  param('logId')
    .isMongoId()
    .withMessage('Invalid log ID'),

  param('itemId')
    .isMongoId()
    .withMessage('Invalid item ID')
];

const validateDateQuery = [
  query('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be in valid ISO8601 format (YYYY-MM-DD)'),

  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be in valid ISO8601 format (YYYY-MM-DD)'),

  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be in valid ISO8601 format (YYYY-MM-DD)'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('sortBy')
    .optional()
    .isIn(['date', 'totalCalories', 'totalProtein'])
    .withMessage('Invalid sort field'),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),

  query('mealType')
    .optional()
    .isIn(['breakfast', 'lunch', 'dinner', 'snack', 'beverage'])
    .withMessage('Invalid meal type'),

  query('category')
    .optional()
    .isIn(['fruits', 'vegetables', 'dairy', 'grains', 'protein', 'beverages', 'snacks', 'other'])
    .withMessage('Invalid category')
];

const validateWaterIntake = [
  body('waterIntake')
    .isInt({ min: 0, max: 50 })
    .withMessage('Water intake must be between 0 and 50 glasses'),

  query('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be in valid ISO8601 format (YYYY-MM-DD)')
];

const validateSummaryQuery = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be in valid ISO8601 format (YYYY-MM-DD)'),

  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be in valid ISO8601 format (YYYY-MM-DD)')
];

// Validation middleware
const handleValidationErrors = (req: any, res: any, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map(error => ({
        field: error.param,
        message: error.msg
      }))
    });
  }
  next();
};

// Routes

// Get single daily log (for a specific date)
router.get("/log", validateDateQuery, handleValidationErrors, getDailyLog);

// Get multiple daily logs with filtering and pagination
router.get("/", validateDateQuery, handleValidationErrors, getDailyLogs);

// Get daily log summary (statistics)
router.get("/summary", validateSummaryQuery, handleValidationErrors, getDailyLogSummary);

// Add item to daily log
router.post("/item", validateAddItem, handleValidationErrors, addDailyLogItem);

// Update item in daily log
router.put("/item/:logId/:itemId", validateUpdateItem, handleValidationErrors, updateDailyLogItem);

// Delete item from daily log
router.delete("/item/:logId/:itemId", validateDeleteItem, handleValidationErrors, deleteDailyLogItem);

// Update water intake
router.put("/water", validateWaterIntake, handleValidationErrors, updateWaterIntake);

export default router;