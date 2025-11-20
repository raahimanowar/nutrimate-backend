import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { logger } from "../utils/logger.js";

// Extend Request interface to include user
interface AuthRequest extends Request {
  user?: {
    userId: string;
    username: string;
    email: string;
  };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Skip authentication for OPTIONS requests (CORS preflight)
    if (req.method === 'OPTIONS') {
      return next();
    }

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token is required"
      });
    }

    jwt.verify(token, process.env.JWT_SECRET!, (err, decoded) => {
      if (err) {
        logger.warn(`Invalid token attempt: ${err.message}`);
        return res.status(403).json({
          success: false,
          message: "Invalid or expired token"
        });
      }

      // Add user info to request object
      req.user = decoded as {
        userId: string;
        username: string;
        email: string;
      };

      next();
    });
  } catch (error) {
    logger.error(`Authentication middleware error: ${(error as Error).message}`);
    return res.status(500).json({
      success: false,
      message: "Internal server error during authentication"
    });
  }
};

// Optional: Middleware to check if user is admin
export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required"
    });
  }

  // You would typically check the user's role from database
  // For now, we'll just pass through
  next();
};