import { Response } from "express";
import { logger } from "../utils/logger.js";
import cloudinary from "../utils/cloudinary.js";
import streamifier from 'streamifier';
import User from "../schemas/users.schema.js";
import { AuthRequest } from "../types/auth.types.js";

interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
}

// Upload profile picture
export const uploadProfilePicture = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided"
      });
    }

    // Check file type (only allow images)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: "Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed"
      });
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (req.file.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: "File size too large. Maximum size is 5MB"
      });
    }

    const imageBuffer = req.file.buffer;

    // Delete old profile picture if it exists
    const currentUser = await User.findById(req.user.userId);
    if (currentUser && currentUser.profilePic && currentUser.profilePic.includes('cloudinary')) {
      try {
        // Extract public_id from the URL
        const urlParts = currentUser.profilePic.split('/');
        const filename = urlParts[urlParts.length - 1];
        const publicId = `nutrimate_profile_pics/${filename.split('.')[0]}`;

        await cloudinary.uploader.destroy(publicId);
        logger.info(`Old profile picture deleted: ${publicId}`);
      } catch (error) {
        logger.warn(`Failed to delete old profile picture: ${(error as Error).message}`);
        // Continue with upload even if deletion fails
      }
    }

    // Upload new image to Cloudinary
    const cloudinaryResult = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'nutrimate_profile_pics',
          transformation: [
            { width: 300, height: 300, crop: 'fill' }, // Resize to 300x300 square
            { quality: 'auto:good' }, // Optimize quality
            { fetch_format: 'auto' } // Serve optimal format
          ]
        },
        (err, result) => {
          if (err) return reject(err);
          if (!result) return reject(new Error('No result from Cloudinary'));
          resolve(result as CloudinaryUploadResult);
        }
      );
      streamifier.createReadStream(imageBuffer).pipe(stream);
    });

    // Update user profile with new picture URL
    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      {
        profilePic: cloudinaryResult.secure_url
      },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    logger.info(`Profile picture uploaded for user: ${req.user.username}`);

    res.status(200).json({
      success: true,
      message: "Profile picture uploaded successfully",
      data: {
        profilePic: updatedUser.profilePic,
        imageId: cloudinaryResult.public_id,
        imageUrl: cloudinaryResult.secure_url,
        updatedAt: updatedUser.updatedAt
      }
    });

  } catch (error) {
    const errorMessage = (error as Error).message;
    logger.error(`Profile picture upload error: ${errorMessage}`);
    logger.error(`Error stack: ${(error as Error).stack}`);
    res.status(500).json({
      success: false,
      message: "Internal server error while uploading profile picture",
      error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
  }
};

// Delete profile picture
export const deleteProfilePicture = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    // Get current user
    const currentUser = await User.findById(req.user.userId);
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (!currentUser.profilePic) {
      return res.status(400).json({
        success: false,
        message: "No profile picture to delete"
      });
    }

    // Delete from Cloudinary if it's a Cloudinary image
    if (currentUser.profilePic.includes('cloudinary')) {
      try {
        // Extract public_id from the URL
        const urlParts = currentUser.profilePic.split('/');
        const filename = urlParts[urlParts.length - 1];
        const publicId = `nutrimate_profile_pics/${filename.split('.')[0]}`;

        await cloudinary.uploader.destroy(publicId);
        logger.info(`Profile picture deleted from Cloudinary: ${publicId}`);
      } catch (error) {
        logger.warn(`Failed to delete profile picture from Cloudinary: ${(error as Error).message}`);
        // Continue with database update even if Cloudinary deletion fails
      }
    }

    // Update user profile to remove picture
    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      {
        profilePic: ""
      },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    logger.info(`Profile picture removed for user: ${req.user.username}`);

    res.status(200).json({
      success: true,
      message: "Profile picture deleted successfully",
      data: {
        profilePic: "",
        updatedAt: updatedUser.updatedAt
      }
    });

  } catch (error) {
    logger.error(`Profile picture deletion error: ${(error as Error).message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error while deleting profile picture"
    });
  }
};