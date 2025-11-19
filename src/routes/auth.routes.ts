import { Router } from "express";
import { z } from "zod";
import { register, login } from "../controllers/auth.controller.js";

const router = Router();

// Validation schema for registration
const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

// Signup route
router.post("/signup", async (req, res) => {
  try {
    // Validate input
    const validatedData = registerSchema.parse(req.body);

    // Call register controller
    await register({ ...req, body: validatedData }, res);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }

    // Let the controller handle other errors
    await register(req, res);
  }
});

// Validation schema for login
const loginSchema = z.object({
  identifier: z.string().min(1, "Username or email is required"),
  password: z.string().min(1, "Password is required")
});

// Signin route
router.post("/signin", async (req, res) => {
  try {
    // Validate input
    const validatedData = loginSchema.parse(req.body);

    // Call login controller
    await login({ ...req, body: validatedData }, res);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }

    // Let the controller handle other errors
    await login(req, res);
  }
});

export default router;