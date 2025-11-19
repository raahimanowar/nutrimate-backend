import { Request, Response } from "express";
import resourceSchema from "../schemas/resource.schema";

export const getResources = async (req: Request, res: Response) => {
  try {
    const { category } = req.query;

    const query: Record<string, string> = {};
    if (category && typeof category === "string") query.category = category;

    const resources = await resourceSchema.find(query);

    const formatted = resources.map((r) => ({
      id: r._id,
      title: r.title,
      description: r.description,
      category: r.category,
      type: r.type,
      reason: category ? `Related to: ${category}` : undefined,
    }));

    return res.json(formatted);
  } catch {
    return res.status(500).json({ message: "Server error" });
  }
};
