import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware.js";
import {
  uploadFoodImage,
  getUserFoodImages,
  getFoodImageById,
  associateWithInventory,
  associateWithDailyLog,
  removeAssociation,
  deleteFoodImage
} from "../controllers/food-image.controller.js";
import multer from 'multer';

// Configure multer for memory storage
interface UploadLimits {
  fileSize: number;
}

type UploadFileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => void;

interface UploadConfig {
  storage: multer.StorageEngine;
  limits: UploadLimits;
  fileFilter: UploadFileFilter;
}

const uploadOptions: UploadConfig = {
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for food images
  },
  fileFilter: (req, file, cb) => {
    // Accept only JPEG and PNG files as specified
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG and PNG image files are allowed'));
    }
  }
};

const upload = multer(uploadOptions);

const router = Router();

// All food image routes are protected
router.use(authenticateToken);

// Upload food image (receipt, food label, meal photo, ingredient)
router.post("/upload", upload.single('image'), uploadFoodImage);

// Get user's food images with filtering and pagination
router.get("/", getUserFoodImages);

// Get single food image by ID
router.get("/:id", getFoodImageById);

// Associate food image with inventory item
router.post("/:id/associate/inventory", associateWithInventory);

// Associate food image with daily log
router.post("/:id/associate/daily-log", associateWithDailyLog);

// Remove association from food image
router.delete("/:id/associate", removeAssociation);

// Delete food image
router.delete("/:id", deleteFoodImage);

export default router;