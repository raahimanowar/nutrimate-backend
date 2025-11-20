/* eslint-disable @typescript-eslint/no-explicit-any */
import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware.js";
import {
  createCommunity,
  joinCommunity,
  getCommunityDetails,
  getAllCommunities,
  getUserCommunities,
  leaveCommunity,
  removeUserFromCommunity,
  createCommunityPost,
  getCommunityPosts,
  votePost,
  createComment,
  getComments,
  voteComment
} from "../controllers/community.controller.js";
import { body, param, query, validationResult } from "express-validator";

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
    .withMessage('Invalid community ID'),

  query('category')
    .optional()
    .isIn(['general', 'tips', 'food-sharing'])
    .withMessage('Category must be general, tips, or food-sharing')
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
    .withMessage('Post content must be between 1 and 1000 characters'),

  body('category')
    .optional()
    .isIn(['general', 'tips', 'food-sharing'])
    .withMessage('Category must be general, tips, or food-sharing')
];

const validateVote = [
  param('communityId')
    .isMongoId()
    .withMessage('Invalid community ID'),

  body('voteType')
    .isIn(['upvote', 'downvote'])
    .withMessage('Vote type must be upvote or downvote')
];

const validatePostId = [
  param('communityId')
    .isMongoId()
    .withMessage('Invalid community ID'),

  param('postId')
    .isMongoId()
    .withMessage('Invalid post ID')
];

const validateRemoveUser = [
  param('communityId')
    .isMongoId()
    .withMessage('Invalid community ID'),

  param('userId')
    .isMongoId()
    .withMessage('Invalid user ID')
];

const validateCreateComment = [
  param('communityId')
    .isMongoId()
    .withMessage('Invalid community ID'),

  param('postId')
    .isMongoId()
    .withMessage('Invalid post ID'),

  body('content')
    .trim()
    .notEmpty()
    .withMessage('Comment content is required')
    .isLength({ min: 1, max: 500 })
    .withMessage('Comment content must be between 1 and 500 characters')
];

// Validation middleware
const handleValidationErrors = (req: any, res: any, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((error: any) => ({
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

// Get a single community's details
router.get("/:communityId", validateCommunityId, handleValidationErrors, getCommunityDetails);

// Get communities the user is a member of
router.get("/my-communities", getUserCommunities);

// Join a community
router.post("/:communityId/join", validateCommunityId, handleValidationErrors, joinCommunity);

// Leave a community
router.post("/:communityId/leave", validateCommunityId, handleValidationErrors, leaveCommunity);

// Remove a user from community (Admin only)
router.delete("/:communityId/members/:userId", validateRemoveUser, handleValidationErrors, removeUserFromCommunity);

// Create a post in community
router.post("/:communityId/posts", validateCreatePost, handleValidationErrors, createCommunityPost);

// Get posts from community
router.get("/:communityId/posts", validateCommunityId, handleValidationErrors, getCommunityPosts);

// Vote on a post
router.post("/:communityId/posts/:postId/vote", validateVote, handleValidationErrors, votePost);

// Create comment on post
router.post("/:communityId/posts/:postId/comments", validateCreateComment, handleValidationErrors, createComment);

// Get comments for post
router.get("/:communityId/posts/:postId/comments", validatePostId, handleValidationErrors, getComments);

// Vote on a comment
router.post("/:communityId/posts/:postId/comments/:commentId/vote", validateVote, handleValidationErrors, voteComment);

export default router;