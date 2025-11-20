import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware.js";
import {
  createCommunity,
  joinCommunity,
  getAllCommunities,
  getUserCommunities,
  leaveCommunity,
  createCommunityPost,
  getCommunityPosts
} from "../controllers/community.controller.js";
import { body, param, validationResult } from "express-validator";

const router = Router();

// All community routes are protected
router.use(authenticateToken);

// Validation rules
const validateCreateCommunity = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Community name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Community name must be between 1 and 100 characters'),

  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Location must be between 1 and 200 characters'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Description must be between 1 and 1000 characters')
];

const validateCommunityId = [
  param('communityId')
    .isMongoId()
    .withMessage('Invalid community ID')
];

const validateCreatePost = [
  param('communityId')
    .isMongoId()
    .withMessage('Invalid community ID'),

  body('content')
    .trim()
    .notEmpty()
    .withMessage('Post content is required')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Post content must be between 1 and 1000 characters')
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

// Create a new community
router.post("/", validateCreateCommunity, handleValidationErrors, createCommunity);

// Get all communities (with user membership info)
router.get("/", getAllCommunities);

// Get communities the user is a member of
router.get("/my-communities", getUserCommunities);

// Join a community
router.post("/:communityId/join", validateCommunityId, handleValidationErrors, joinCommunity);

// Leave a community
router.post("/:communityId/leave", validateCommunityId, handleValidationErrors, leaveCommunity);

// Create a post in community
router.post("/:communityId/posts", validateCreatePost, handleValidationErrors, createCommunityPost);

// Get posts from community
router.get("/:communityId/posts", validateCommunityId, handleValidationErrors, getCommunityPosts);

export default router;