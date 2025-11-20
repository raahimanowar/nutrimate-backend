import { Request, Response } from "express";
import resourceSchema from "../schemas/resource.schema";

export const getResources = async (req: Request, res: Response) => {
  try {
    const { category, type, page = 1, limit = 6 } = req.query;
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 6));

    const query: Record<string, string> = {};
    
    // If category query is provided, filter by category
    if (category && typeof category === "string") {
      query.category = category;
    }

    // If type query is provided, filter by type (article, video, guide, tip)
    if (type && typeof type === "string") {
      query.type = type;
    }

    // Get total count for pagination
    const totalCount = await resourceSchema.countDocuments(query);
    
    // Calculate skip and total pages
    const skip = (pageNum - 1) * limitNum;
    const totalPages = Math.ceil(totalCount / limitNum);

    // Fetch paginated resources
    const resources = await resourceSchema
      .find(query)
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    const formatted = resources.map((r) => ({
      id: r._id,
      title: String(r.title || ""),
      description: String(r.description || ""),
      url: String(r.url || ""),
      category: String(r.category || ""),
      type: String(r.type || ""),
      reason: category ? `Related to: ${category}` : undefined,
    }));

    return res.json({
      success: true,
      data: formatted,
      count: formatted.length,
      totalCount,
      page: pageNum,
      limit: limitNum,
      totalPages,
      hasNextPage: pageNum < totalPages,
      hasPreviousPage: pageNum > 1,
      filter: category || type ? { ...(category && { category }), ...(type && { type }) } : null,
    });
  } catch {
    return res.status(500).json({ message: "Server error" });
  }
};

export const getResourceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validate if id is a valid MongoDB ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid resource ID format" });
    }

    const resource = await resourceSchema.findById(id);

    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    const formatted = {
      id: resource._id,
      title: String(resource.title || ""),
      description: String(resource.description || ""),
      url: String(resource.url || ""),
      category: String(resource.category || ""),
      type: String(resource.type || ""),
      createdAt: resource.createdAt,
      updatedAt: resource.updatedAt,
    };

    return res.json({
      success: true,
      data: formatted,
    });
  } catch {
    return res.status(500).json({ message: "Server error" });
  }
};
