import mongoose, { Document, Schema } from "mongoose";

// Community post document interface
export interface CommunityPostDocument extends Document {
  community: mongoose.Types.ObjectId; // Reference to Community
  author: mongoose.Types.ObjectId;    // Reference to User who created the post
  content: string;                    // Post content
  upvotes: mongoose.Types.ObjectId[]; // Users who upvoted
  downvotes: mongoose.Types.ObjectId[]; // Users who downvoted
  createdAt: Date;
  updatedAt: Date;
}

// Community post schema
const CommunityPostSchema: Schema = new Schema({
  community: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Community",
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  downvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }]
}, {
  timestamps: true,
  versionKey: false
});

// Index for faster queries
CommunityPostSchema.index({ community: 1, createdAt: -1 });
CommunityPostSchema.index({ author: 1 });
CommunityPostSchema.index({ upvotes: 1 });
CommunityPostSchema.index({ downvotes: 1 });

export default mongoose.model<CommunityPostDocument>("CommunityPost", CommunityPostSchema);