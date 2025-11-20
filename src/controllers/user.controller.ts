import { Response } from "express";
import { logger } from "../utils/logger.js";
import User from "../schemas/users.schema.js";
import { AuthRequest } from "../types/auth.types.js";

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const user = await User.findById(req.user.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile retrieved successfully",
      data: {
        id: user._id,
        username: user.username,
        fullname: user.fullname,
        email: user.email,
        height: user.height,
        weight: user.weight,
        address: user.address,
        profilePic: user.profilePic,
        dateOfBirth: user.dateOfBirth,
        householdSize: user.householdSize,
        budgetPreferences: user.budgetPreferences,
        dietaryNeeds: user.dietaryNeeds,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    logger.error(`Get profile error: ${(error as Error).message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching profile",
    });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const {
      fullname,
      height,
      weight,
      address,
      profilePic,
      dateOfBirth,
      budgetPreferences,
      dietaryNeeds,
      householdSize,
    } = req.body;

    const updateData: Partial<{
      fullname: string;
      height: number;
      weight: number;
      address: { country?: string; city?: string };
      profilePic: string;
      dateOfBirth: Date;
      budgetPreferences: typeof User.schema.obj.budgetPreferences;
      dietaryNeeds: typeof User.schema.obj.dietaryNeeds;
      householdSize: number;
    }> = {};

    if (fullname !== undefined) updateData.fullname = fullname;
    if (height !== undefined) updateData.height = height;
    if (weight !== undefined) updateData.weight = weight;
    if (address !== undefined) updateData.address = address;
    if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;
    if (householdSize !== undefined) updateData.householdSize = householdSize;
    if (budgetPreferences) updateData.budgetPreferences = budgetPreferences;
    if (dietaryNeeds) updateData.dietaryNeeds = dietaryNeeds;
    if (profilePic !== undefined) updateData.profilePic = profilePic;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    logger.info(`Profile updated: ${updatedUser.username}`);

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        id: updatedUser._id,
        username: updatedUser.username,
        fullname: updatedUser.fullname,
        email: updatedUser.email,
        height: updatedUser.height,
        weight: updatedUser.weight,
        address: updatedUser.address,
        profilePic: updatedUser.profilePic,
        dateOfBirth: updatedUser.dateOfBirth,
        householdSize: updatedUser.householdSize,
        budgetPreferences: updatedUser.budgetPreferences,
        dietaryNeeds: updatedUser.dietaryNeeds,
        role: updatedUser.role,
        updatedAt: updatedUser.updatedAt,
      },
    });
  } catch (error) {
    logger.error(`Update profile error: ${(error as Error).message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error while updating profile",
    });
  }
};
