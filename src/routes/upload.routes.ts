import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { uploadProfilePicture, deleteProfilePicture } from "../controllers/upload.controller.js";
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
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
};

const upload = multer(uploadOptions);

const router = Router();

// All upload routes are protected
router.use(authenticateToken);

// Upload profile picture
router.post("/profile-picture", upload.single('image'), uploadProfilePicture);

// Delete profile picture
router.delete("/profile-picture", deleteProfilePicture);

export default router;