import { Response } from "express";
import cloudinary from "../utils/cloudinary.js";
import streamifier from "streamifier";
import { AuthRequest } from "../types/auth.types.js";
import { extractText } from "../utils/extractText.js";

interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
}

export const uploadAndExtractText = async (req: AuthRequest, res: Response) => {
  try {
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
        message: "Invalid file type. Only JPEG and PNG are allowed",
      });
    }

    const maxSize = 10 * 1024 * 1024;
    if (req.file.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: "File too large. Max 10MB",
      });
    }

    const imageBuffer = req.file.buffer;

    // Upload → Cloudinary
    const cloudinaryResult = await new Promise<CloudinaryUploadResult>(
      (resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "text_extract",
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

    const imageUrl = cloudinaryResult.secure_url;

    // Extract text using your function
    const extractedText = await extractText(imageUrl);

    return res.status(200).json({
      success: true,
      message: "Text extracted successfully",
      data: {
        imageUrl,
        extractedText,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to extract text",
      error: (error as Error).message,
    });
  }
};
