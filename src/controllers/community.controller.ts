import { Response } from "express";
import { logger } from "../utils/logger.js";
import Community from "../schemas/community.schema.js";
import User from "../schemas/user.schema.js";
import { AuthRequest } from "../types/auth.types.js";

// Create a new community
export const createCommunity = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const { name, location, description } = req.body;

    if (!name || !location || !description) {
      return res.status(400).json({
        success: false,
        message: "Community name, location, and description are required"
      });
    }

    
    // Create new community
    const community = new Community({
      name: name.trim(),
      location: location.trim(),
      description: description.trim(),
      admin: req.user.userId,
      members: [req.user.userId] // Admin is automatically a member
    });

    await community.save();

    res.status(201).json({
      success: true,
      message: "Community created successfully",
      data: {
        _id: community._id,
        name: community.name,
        location: community.location,
        description: community.description,
        admin: community.admin,
        members: community.members,
        membersCount: community.members.length,
        createdAt: community.createdAt
      }
    });

  } catch (error) {
    logger.error(`Create community error: ${(error as Error).message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error while creating community"
    });
  }
};

// Join a community
export const joinCommunity = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const { communityId } = req.params;

    if (!communityId) {
      return res.status(400).json({
        success: false,
        message: "Community ID is required"
      });
    }

    // Find community
    const community = await Community.findById(communityId);

    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found"
      });
    }

    // Check if user is already a member
    if (community.members.includes(req.user.userId as any)) {
      return res.status(400).json({
        success: false,
        message: "You are already a member of this community"
      });
    }

    // Add user to community members
    community.members.push(req.user.userId as any);
    await community.save();

    res.status(200).json({
      success: true,
      message: "Joined community successfully",
      data: {
        _id: community._id,
        name: community.name,
        location: community.location,
        description: community.description,
        membersCount: community.members.length
      }
    });

  } catch (error) {
    logger.error(`Join community error: ${(error as Error).message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error while joining community"
    });
  }
};

// Get all communities
export const getAllCommunities = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const communities = await Community.find()
      .populate('admin', 'username email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Communities retrieved successfully",
      data: communities.map(community => ({
        _id: community._id,
        name: community.name,
        location: community.location,
        description: community.description,
        admin: community.admin,
        membersCount: community.members.length,
        isMember: community.members.includes(req.user.userId as any),
        isAdmin: community.admin.toString() === req.user.userId.toString(),
        createdAt: community.createdAt
      }))
    });

  } catch (error) {
    logger.error(`Get all communities error: ${(error as Error).message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching communities"
    });
  }
};

// Get communities user is a member of
export const getUserCommunities = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const communities = await Community.find({
      $or: [
        { admin: req.user.userId },
        { members: req.user.userId }
      ]
    })
    .populate('admin', 'username email')
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "User communities retrieved successfully",
      data: communities.map(community => ({
        _id: community._id,
        name: community.name,
        location: community.location,
        description: community.description,
        admin: community.admin,
        membersCount: community.members.length,
        isAdmin: community.admin.toString() === req.user.userId.toString(),
        createdAt: community.createdAt
      }))
    });

  } catch (error) {
    logger.error(`Get user communities error: ${(error as Error).message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching user communities"
    });
  }
};

// Leave a community
export const leaveCommunity = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const { communityId } = req.params;

    if (!communityId) {
      return res.status(400).json({
        success: false,
        message: "Community ID is required"
      });
    }

    // Find community
    const community = await Community.findById(communityId);

    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found"
      });
    }

    // Check if user is the admin
    if (community.admin.toString() === req.user.userId.toString()) {
      return res.status(400).json({
        success: false,
        message: "Admin cannot leave the community"
      });
    }

    // Check if user is a member
    const memberIndex = community.members.indexOf(req.user.userId as any);
    if (memberIndex === -1) {
      return res.status(400).json({
        success: false,
        message: "You are not a member of this community"
      });
    }

    // Remove user from community members
    community.members.splice(memberIndex, 1);
    await community.save();

    res.status(200).json({
      success: true,
      message: "Left community successfully"
    });

  } catch (error) {
    logger.error(`Leave community error: ${(error as Error).message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error while leaving community"
    });
  }
};