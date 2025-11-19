import { Request, Response } from "express";
import { logger } from "../utils/logger.js";
import User from "../schemas/users.schema.js";

// Get user profile (protected route)
export const getProfile = async (req: any, res: Response) => {
  try {
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
export const updateProfile = async (req: any, res: Response) => {
  try {
    const { height, weight, address, profilePic, dateOfBirth } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      {
        height,
        weight,
        address,
        profilePic,
        dateOfBirth
      },
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