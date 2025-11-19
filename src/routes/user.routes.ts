import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { getProfile, updateProfile } from "../controllers/user.controller.js";

const router = Router();

// All user routes are protected
router.use(authenticateToken);

// Get user profile
router.get("/profile", getProfile);

// Update user profile
router.put("/profile", updateProfile);

export default router;