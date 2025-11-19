import { Response } from "express";
import { logger } from "../utils/logger.js";
import User from "../schemas/users.schema.js";
import { AuthRequest } from "../types/auth.types.js";

// Get user profile (protected route)
export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const user = await User.findById(req.user.userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile retrieved successfully",
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        height: user.height,
        weight: user.weight,
        address: user.address,
        profilePic: user.profilePic,
        dateOfBirth: user.dateOfBirth,
        budgetPreferences: user.budgetPreferences,
        dietaryNeeds: user.dietaryNeeds,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });

  } catch (error) {
    logger.error(`Get profile error: ${(error as Error).message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching profile"
    });
  }
};

// Update user profile (protected route)
export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const {
      height,
      weight,
      address,
      profilePic,
      dateOfBirth,
      budgetPreferences,
      dietaryNeeds
    } = req.body;

    const updateData: any = {
      height,
      weight,
      address,
      profilePic,
      dateOfBirth
    };

    // Add budget preferences if provided
    if (budgetPreferences) {
      updateData.budgetPreferences = budgetPreferences;
    }

    // Add dietary needs if provided
    if (dietaryNeeds) {
      updateData.dietaryNeeds = dietaryNeeds;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    logger.info(`Profile updated: ${updatedUser.username}`);

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        height: updatedUser.height,
        weight: updatedUser.weight,
        address: updatedUser.address,
        profilePic: updatedUser.profilePic,
        dateOfBirth: updatedUser.dateOfBirth,
        budgetPreferences: updatedUser.budgetPreferences,
        dietaryNeeds: updatedUser.dietaryNeeds,
        role: updatedUser.role,
        updatedAt: updatedUser.updatedAt
      }
    });

  } catch (error) {
    logger.error(`Update profile error: ${(error as Error).message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error while updating profile"
    });
  }
};