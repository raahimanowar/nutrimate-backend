/* eslint-disable @typescript-eslint/no-explicit-any */
import { Response } from "express";
import { logger } from "../utils/logger.js";
import Community from "../schemas/community.schema.js";
import CommunityPost from "../schemas/community-post.schema.js";
import Comment from "../schemas/comment.schema.js";
import { AuthRequest } from "../types/auth.types.js";

export const createCommunity = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { name, location, description } = req.body;

    if (!name || !location || !description) {
      return res.status(400).json({
        success: false,
        message: "Community name, location, and description are required",
      });
    }

    const community = new Community({
      name: name.trim(),
      location: location.trim(),
      description: description.trim(),
      admin: req.user.userId,
      members: [req.user.userId],
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
        createdAt: community.createdAt,
      },
    });
  } catch (error) {
    logger.error(`Create community error: ${(error as Error).message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error while creating community",
    });
  }
};

export const joinCommunity = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { communityId } = req.params;

    if (!communityId) {
      return res.status(400).json({
        success: false,
        message: "Community ID is required",
      });
    }

    const community = await Community.findById(communityId);

    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found",
      });
    }

    if (community.members.includes(req.user.userId as any)) {
      return res.status(400).json({
        success: false,
        message: "You are already a member of this community",
      });
    }

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
        membersCount: community.members.length,
      },
    });
  } catch (error) {
    logger.error(`Join community error: ${(error as Error).message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error while joining community",
    });
  }
};

export const getCommunityDetails = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { communityId } = req.params;

    if (!communityId) {
      return res.status(400).json({
        success: false,
        message: "Community ID is required",
      });
    }

    const community = await Community.findById(communityId)
      .populate("admin", "username email profilePic")
      .populate("members", "username email profilePic");

    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Community details retrieved successfully",
      data: {
        _id: community._id,
        name: community.name,
        location: community.location,
        description: community.description,
        admin: community.admin,
        members: community.members,
        membersCount: community.members.length,
        isMember: community.members.some(
          (member: any) => member._id.toString() === req.user?.userId
        ),
        isAdmin: community.admin._id.toString() === req.user?.userId,
        createdAt: community.createdAt,
      },
    });
  } catch (error) {
    logger.error(`Get community details error: ${(error as Error).message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching community details",
    });
  }
};

export const getAllCommunities = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const communities = await Community.find()
      .populate("admin", "username email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Communities retrieved successfully",
      data: communities.map((community) => ({
        _id: community._id,
        name: community.name,
        location: community.location,
        description: community.description,
        admin: community.admin,
        membersCount: community.members.length,
        isMember: req.user
          ? community.members.includes(req.user.userId as any)
          : false,
        isAdmin: req.user
          ? community.admin.toString() === req.user.userId.toString()
          : false,
        createdAt: community.createdAt,
      })),
    });
  } catch (error) {
    logger.error(`Get all communities error: ${(error as Error).message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching communities",
    });
  }
};

export const getUserCommunities = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const communities = await Community.find({
      $or: [{ admin: req.user.userId }, { members: req.user.userId }],
    })
      .populate("admin", "username email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "User communities retrieved successfully",
      data: communities.map((community) => ({
        _id: community._id,
        name: community.name,
        location: community.location,
        description: community.description,
        admin: community.admin,
        membersCount: community.members.length,
        isAdmin: req.user
          ? community.admin.toString() === req.user.userId.toString()
          : false,
        createdAt: community.createdAt,
      })),
    });
  } catch (error) {
    logger.error(`Get user communities error: ${(error as Error).message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching user communities",
    });
  }
};

export const leaveCommunity = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { communityId } = req.params;

    if (!communityId) {
      return res.status(400).json({
        success: false,
        message: "Community ID is required",
      });
    }

    const community = await Community.findById(communityId);

    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found",
      });
    }

    if (community.admin.toString() === req.user.userId.toString()) {
      return res.status(400).json({
        success: false,
        message: "Admin cannot leave the community",
      });
    }

    const memberIndex = community.members.indexOf(req.user.userId as any);
    if (memberIndex === -1) {
      return res.status(400).json({
        success: false,
        message: "You are not a member of this community",
      });
    }

    community.members.splice(memberIndex, 1);
    await community.save();

    res.status(200).json({
      success: true,
      message: "Left community successfully",
    });
  } catch (error) {
    logger.error(`Leave community error: ${(error as Error).message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error while leaving community",
    });
  }
};

export const createCommunityPost = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { communityId } = req.params;
    const { content, category } = req.body;

    if (!communityId) {
      return res.status(400).json({
        success: false,
        message: "Community ID is required",
      });
    }

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Post content is required",
      });
    }

    const community = await Community.findById(communityId);

    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found",
      });
    }

    if (!community.members.includes(req.user.userId as any)) {
      return res.status(403).json({
        success: false,
        message: "You must be a member of this community to post",
      });
    }

    const post = new CommunityPost({
      community: communityId,
      author: req.user.userId,
      content: content.trim(),
      category: category || "general",
    });

    await post.save();

    await post.populate("author", "username email profilePic");

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      data: {
        _id: post._id,
        community: post.community,
        author: post.author,
        content: post.content,
        category: post.category,
        upvotesCount: post.upvotes.length,
        downvotesCount: post.downvotes.length,
        userVote: null,
        createdAt: post.createdAt,
      },
    });
  } catch (error) {
    logger.error(`Create community post error: ${(error as Error).message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error while creating post",
    });
  }
};

export const getCommunityPosts = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { communityId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const category = req.query.category as string;
    const skip = (page - 1) * limit;

    if (!communityId) {
      return res.status(400).json({
        success: false,
        message: "Community ID is required",
      });
    }

    const community = await Community.findById(communityId);

    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found",
      });
    }

    if (!community.members.includes(req.user.userId as any)) {
      return res.status(403).json({
        success: false,
        message: "You must be a member of this community to view posts",
      });
    }

    const query: any = { community: communityId };
    if (category && ["general", "tips", "food-sharing"].includes(category)) {
      query.category = category;
    }

    const [posts, total] = await Promise.all([
      CommunityPost.find(query)
        .populate("author", "username email profilePic")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      CommunityPost.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      message: "Posts retrieved successfully",
      data: posts.map((post) => {
        let userVote = null;
        if (req.user && post.upvotes.includes(req.user.userId as any)) {
          userVote = "upvote";
        } else if (
          req.user &&
          post.downvotes.includes(req.user.userId as any)
        ) {
          userVote = "downvote";
        }

        return {
          _id: post._id,
          author: post.author,
          content: post.content,
          category: post.category,
          upvotesCount: post.upvotes.length,
          downvotesCount: post.downvotes.length,
          userVote,
          createdAt: post.createdAt,
        };
      }),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error(`Get community posts error: ${(error as Error).message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching posts",
    });
  }
};

export const votePost = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { communityId, postId } = req.params;
    const { voteType } = req.body;

    if (!communityId || !postId) {
      return res.status(400).json({
        success: false,
        message: "Community ID and Post ID are required",
      });
    }

    if (!["upvote", "downvote"].includes(voteType)) {
      return res.status(400).json({
        success: false,
        message: "Vote type must be 'upvote' or 'downvote'",
      });
    }

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found",
      });
    }

    if (!community.members.includes(req.user.userId as any)) {
      return res.status(403).json({
        success: false,
        message: "You must be a member of this community to vote",
      });
    }

    const post = await CommunityPost.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    post.upvotes = post.upvotes.filter((id) =>
      req.user ? id.toString() !== req.user.userId?.toString() : true
    );
    post.downvotes = post.downvotes.filter((id) =>
      req.user ? id.toString() !== req.user.userId?.toString() : true
    );

    if (voteType === "upvote") {
      post.upvotes.push(req.user.userId as any);
    } else {
      post.downvotes.push(req.user.userId as any);
    }

    await post.save();

    res.status(200).json({
      success: true,
      message: `Post ${voteType}d successfully`,
      data: {
        upvotesCount: post.upvotes.length,
        downvotesCount: post.downvotes.length,
        userVote: voteType,
      },
    });
  } catch (error) {
    logger.error(`Vote post error: ${(error as Error).message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error while voting on post",
    });
  }
};

export const createComment = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { communityId, postId } = req.params;
    const { content } = req.body;

    if (!communityId || !postId) {
      return res.status(400).json({
        success: false,
        message: "Community ID and Post ID are required",
      });
    }

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Comment content is required",
      });
    }

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found",
      });
    }

    if (!community.members.includes(req.user.userId as any)) {
      return res.status(403).json({
        success: false,
        message: "You must be a member of this community to comment",
      });
    }

    const post = await CommunityPost.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const comment = new Comment({
      post: postId,
      author: req.user.userId,
      content: content.trim(),
    });

    await comment.save();
    await comment.populate("author", "username email profilePic");

    res.status(201).json({
      success: true,
      message: "Comment created successfully",
      data: {
        _id: comment._id,
        post: comment.post,
        author: comment.author,
        content: comment.content,
        upvotesCount: comment.upvotes.length,
        downvotesCount: comment.downvotes.length,
        userVote: null,
        createdAt: comment.createdAt,
      },
    });
  } catch (error) {
    logger.error(`Create comment error: ${(error as Error).message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error while creating comment",
    });
  }
};

export const getComments = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { communityId, postId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    if (!communityId || !postId) {
      return res.status(400).json({
        success: false,
        message: "Community ID and Post ID are required",
      });
    }

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found",
      });
    }

    if (!community.members.includes(req.user.userId as any)) {
      return res.status(403).json({
        success: false,
        message: "You must be a member of this community to view comments",
      });
    }

    const post = await CommunityPost.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const [comments, total] = await Promise.all([
      Comment.find({ post: postId })
        .populate("author", "username email profilePic")
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit),
      Comment.countDocuments({ post: postId }),
    ]);

    res.status(200).json({
      success: true,
      message: "Comments retrieved successfully",
      data: comments.map((comment) => {
        let userVote = null;
        if (req.user && comment.upvotes.includes(req.user.userId as any)) {
          userVote = "upvote";
        } else if (
          req.user &&
          comment.downvotes.includes(req.user.userId as any)
        ) {
          userVote = "downvote";
        }

        return {
          _id: comment._id,
          author: comment.author,
          content: comment.content,
          upvotesCount: comment.upvotes.length,
          downvotesCount: comment.downvotes.length,
          userVote,
          createdAt: comment.createdAt,
        };
      }),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error(`Get comments error: ${(error as Error).message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching comments",
    });
  }
};

export const voteComment = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { communityId, postId, commentId } = req.params;
    const { voteType } = req.body; // 'upvote' or 'downvote'

    if (!communityId || !postId || !commentId) {
      return res.status(400).json({
        success: false,
        message: "Community ID, Post ID, and Comment ID are required",
      });
    }

    if (!["upvote", "downvote"].includes(voteType)) {
      return res.status(400).json({
        success: false,
        message: "Vote type must be 'upvote' or 'downvote'",
      });
    }

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found",
      });
    }

    if (!community.members.includes(req.user.userId as any)) {
      return res.status(403).json({
        success: false,
        message: "You must be a member of this community to vote",
      });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    comment.upvotes = comment.upvotes.filter((id) =>
      req.user ? id.toString() !== req.user.userId?.toString() : true
    );
    comment.downvotes = comment.downvotes.filter((id) =>
      req.user ? id.toString() !== req.user.userId?.toString() : true
    );

    if (voteType === "upvote") {
      comment.upvotes.push(req.user.userId as any);
    } else {
      comment.downvotes.push(req.user.userId as any);
    }

    await comment.save();

    res.status(200).json({
      success: true,
      message: `Comment ${voteType}d successfully`,
      data: {
        upvotesCount: comment.upvotes.length,
        downvotesCount: comment.downvotes.length,
        userVote: voteType,
      },
    });
  } catch (error) {
    logger.error(`Vote comment error: ${(error as Error).message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error while voting on comment",
    });
  }
};

export const removeUserFromCommunity = async (
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

    const { communityId, userId } = req.params;

    if (!communityId || !userId) {
      return res.status(400).json({
        success: false,
        message: "Community ID and User ID are required",
      });
    }

    const community = await Community.findById(communityId);

    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found",
      });
    }

    if (community.admin.toString() !== req.user.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only admin can remove members",
      });
    }

    if (userId === req.user.userId.toString()) {
      return res.status(400).json({
        success: false,
        message: "Admin cannot remove themselves",
      });
    }

    if (!community.members.includes(userId as any)) {
      return res.status(404).json({
        success: false,
        message: "User is not a member of this community",
      });
    }

    community.members = community.members.filter(
      (memberId: any) => memberId.toString() !== userId
    );

    await community.save();

    res.status(200).json({
      success: true,
      message: "User removed from community successfully",
      data: {
        _id: community._id,
        membersCount: community.members.length,
      },
    });
  } catch (error) {
    logger.error(
      `Remove user from community error: ${(error as Error).message}`
    );
    res.status(500).json({
      success: false,
      message: "Internal server error while removing user",
    });
  }
};
