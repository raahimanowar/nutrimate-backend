/* eslint-disable @typescript-eslint/no-explicit-any */
import { Response } from "express";
import mongoose from "mongoose";
import { logger } from "../utils/logger.js";
import cloudinary from "../utils/cloudinary.js";
import streamifier from "streamifier";
import FoodImage, { FoodImageType } from "../schemas/food-image.schema.js";
import { AuthRequest } from "../types/auth.types.js";

interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  bytes: number;
  format: string;
}

export const uploadFoodImage = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      });
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: "Invalid file type. Only JPEG and PNG images are allowed",
      });
    }

    const maxSize = 10 * 1024 * 1024;
    if (req.file.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: "File size too large. Maximum size is 10MB",
      });
    }

    const { title, description, imageType = "receipt", tags } = req.body;
    const imageBuffer = req.file.buffer;

    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    if (
      !["receipt", "food_label", "meal_photo", "ingredient"].includes(imageType)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid image type. Must be receipt, food_label, meal_photo, or ingredient",
      });
    }

    let parsedTags: string[] = [];
    if (tags) {
      if (typeof tags === "string") {
        parsedTags = tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0);
      } else if (Array.isArray(tags)) {
        parsedTags = tags
          .map((tag) => tag.toString().trim())
          .filter((tag) => tag.length > 0);
      }
    }

    const cloudinaryResult = await new Promise<CloudinaryUploadResult>(
      (resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "nutrimate_food_scans",
            resource_type: "auto",
            transformation: [
              { quality: "auto:good" },
              { fetch_format: "auto" },
            ],
          },
          (err, result) => {
            if (err) return reject(err);
            if (!result) return reject(new Error("No result from Cloudinary"));
            resolve(result as CloudinaryUploadResult);
          }
        );
        streamifier.createReadStream(imageBuffer).pipe(stream);
      }
    );

    const foodImage = new FoodImage({
      userId: req.user.userId,
      title: title.trim(),
      description: description?.trim() || undefined,
      imageUrl: cloudinaryResult.secure_url,
      cloudinaryPublicId: cloudinaryResult.public_id,
      imageType: imageType as FoodImageType,
      tags: parsedTags,
      associationType: "none",
      scanStatus: "manual_only",
      metadata: {
        originalFileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
      },
    });

    await foodImage.save();

    logger.info(`Food image uploaded: ${title} by user: ${req.user.username}`);

    res.status(201).json({
      success: true,
      message: "Food image uploaded successfully",
      data: {
        id: foodImage._id,
        title: foodImage.title,
        description: foodImage.description,
        imageUrl: foodImage.imageUrl,
        imageType: foodImage.imageType,
        tags: foodImage.tags,
        associationType: foodImage.associationType,
        scanStatus: foodImage.scanStatus,
        metadata: foodImage.metadata,
        createdAt: foodImage.createdAt,
      },
    });
  } catch (error) {
    const errorMessage = (error as Error).message;
    logger.error(`Food image upload error: ${errorMessage}`);
    logger.error(`Error stack: ${(error as Error).stack}`);
    res.status(500).json({
      success: false,
      message: "Internal server error while uploading food image",
      error: process.env.NODE_ENV === "development" ? errorMessage : undefined,
    });
  }
};

export const getUserFoodImages = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const {
      imageType,
      associationType,
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string) || 20));
    const skip = (pageNum - 1) * limitNum;

    const query: any = { userId: req.user.userId };

    if (
      imageType &&
      ["receipt", "food_label", "meal_photo", "ingredient"].includes(
        imageType as string
      )
    ) {
      query.imageType = imageType;
    }

    if (
      associationType &&
      ["inventory", "daily_log", "none"].includes(associationType as string)
    ) {
      query.associationType = associationType;
    }

    const sort: any = {};
    const validSortFields = ["createdAt", "title", "imageType", "scanStatus"];
    const sortField = validSortFields.includes(sortBy as string)
      ? (sortBy as string)
      : "createdAt";
    const sortDirection = sortOrder === "asc" ? 1 : -1;
    sort[sortField] = sortDirection;

    const [images, totalCount] = await Promise.all([
      FoodImage.find(query).sort(sort).skip(skip).limit(limitNum).lean(),
      FoodImage.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);

    res.status(200).json({
      success: true,
      message: "Food images retrieved successfully",
      data: {
        images: images.map((image) => ({
          id: image._id,
          title: image.title,
          description: image.description,
          imageUrl: image.imageUrl,
          imageType: image.imageType,
          tags: image.tags,
          associationType: image.associationType,
          associatedId: image.associatedId,
          scanStatus: image.scanStatus,
          metadata: image.metadata,
          createdAt: image.createdAt,
          updatedAt: image.updatedAt,
        })),
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems: totalCount,
          itemsPerPage: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
        },
      },
    });
  } catch (error) {
    logger.error(`Get food images error: ${(error as Error).message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error while retrieving food images",
    });
  }
};

export const getFoodImageById = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Image ID is required",
      });
    }

    const foodImage = await FoodImage.findOne({
      _id: id,
      userId: req.user.userId,
    }).lean();

    if (!foodImage) {
      return res.status(404).json({
        success: false,
        message: "Food image not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Food image retrieved successfully",
      data: {
        id: foodImage._id,
        title: foodImage.title,
        description: foodImage.description,
        imageUrl: foodImage.imageUrl,
        imageType: foodImage.imageType,
        tags: foodImage.tags,
        associationType: foodImage.associationType,
        associatedId: foodImage.associatedId,
        scanStatus: foodImage.scanStatus,
        extractedData: foodImage.extractedData,
        metadata: foodImage.metadata,
        createdAt: foodImage.createdAt,
        updatedAt: foodImage.updatedAt,
      },
    });
  } catch (error) {
    logger.error(`Get food image by ID error: ${(error as Error).message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error while retrieving food image",
    });
  }
};

export const associateWithInventory = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { id } = req.params;
    const { inventoryId } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Image ID is required",
      });
    }

    if (!inventoryId) {
      return res.status(400).json({
        success: false,
        message: "Inventory ID is required",
      });
    }

    const foodImage = await FoodImage.findOne({
      _id: id,
      userId: req.user.userId,
    });

    if (!foodImage) {
      return res.status(404).json({
        success: false,
        message: "Food image not found",
      });
    }

    foodImage.associationType = "inventory";
    foodImage.associatedId = new mongoose.Types.ObjectId(inventoryId);
    foodImage.metadata.lastModified = new Date();
    await foodImage.save();

    logger.info(
      `Food image ${id} associated with inventory item ${inventoryId} by user: ${req.user.username}`
    );

    res.status(200).json({
      success: true,
      message: "Image successfully associated with inventory item",
      data: {
        id: foodImage._id,
        associationType: foodImage.associationType,
        associatedId: foodImage.associatedId,
        updatedAt: foodImage.updatedAt,
      },
    });
  } catch (error) {
    logger.error(`Associate with inventory error: ${(error as Error).message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error while associating image with inventory",
    });
  }
};

export const associateWithDailyLog = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { id } = req.params;
    const { dailyLogId } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Image ID is required",
      });
    }

    if (!dailyLogId) {
      return res.status(400).json({
        success: false,
        message: "Daily log ID is required",
      });
    }

    const foodImage = await FoodImage.findOne({
      _id: id,
      userId: req.user.userId,
    });

    if (!foodImage) {
      return res.status(404).json({
        success: false,
        message: "Food image not found",
      });
    }

    foodImage.associationType = "daily_log";
    foodImage.associatedId = new mongoose.Types.ObjectId(dailyLogId);
    foodImage.metadata.lastModified = new Date();
    await foodImage.save();

    logger.info(
      `Food image ${id} associated with daily log ${dailyLogId} by user: ${req.user.username}`
    );

    res.status(200).json({
      success: true,
      message: "Image successfully associated with daily log",
      data: {
        id: foodImage._id,
        associationType: foodImage.associationType,
        associatedId: foodImage.associatedId,
        updatedAt: foodImage.updatedAt,
      },
    });
  } catch (error) {
    logger.error(`Associate with daily log error: ${(error as Error).message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error while associating image with daily log",
    });
  }
};

export const removeAssociation = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Image ID is required",
      });
    }

    const foodImage = await FoodImage.findOne({
      _id: id,
      userId: req.user.userId,
    });

    if (!foodImage) {
      return res.status(404).json({
        success: false,
        message: "Food image not found",
      });
    }

    foodImage.associationType = "none";
    foodImage.associatedId = undefined;
    foodImage.metadata.lastModified = new Date();
    await foodImage.save();

    logger.info(
      `Association removed from food image ${id} by user: ${req.user.username}`
    );

    res.status(200).json({
      success: true,
      message: "Association successfully removed",
      data: {
        id: foodImage._id,
        associationType: foodImage.associationType,
        updatedAt: foodImage.updatedAt,
      },
    });
  } catch (error) {
    logger.error(`Remove association error: ${(error as Error).message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error while removing association",
    });
  }
};

export const deleteFoodImage = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Image ID is required",
      });
    }

    const foodImage = await FoodImage.findOne({
      _id: id,
      userId: req.user.userId,
    });

    if (!foodImage) {
      return res.status(404).json({
        success: false,
        message: "Food image not found",
      });
    }

    try {
      await cloudinary.uploader.destroy(foodImage.cloudinaryPublicId);
      logger.info(
        `Food image deleted from Cloudinary: ${foodImage.cloudinaryPublicId}`
      );
    } catch (cloudinaryError) {
      logger.warn(
        `Failed to delete food image from Cloudinary: ${
          (cloudinaryError as Error).message
        }`
      );
    }

    await FoodImage.deleteOne({ _id: id });

    logger.info(
      `Food image deleted: ${foodImage.title} by user: ${req.user.username}`
    );

    res.status(200).json({
      success: true,
      message: "Food image deleted successfully",
    });
  } catch (error) {
    logger.error(`Delete food image error: ${(error as Error).message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error while deleting food image",
    });
  }
};
