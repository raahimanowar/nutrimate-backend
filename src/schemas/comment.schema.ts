import mongoose, { Document, Schema } from "mongoose";

// Comment document interface
export interface CommentDocument extends Document {
  post: mongoose.Types.ObjectId;       // Reference to CommunityPost
  author: mongoose.Types.ObjectId;     // Reference to User who created the comment
  content: string;                     // Comment content
  upvotes: mongoose.Types.ObjectId[];  // Users who upvoted
  downvotes: mongoose.Types.ObjectId[]; // Users who downvoted
  createdAt: Date;
  updatedAt: Date;
}

// Comment schema
const CommentSchema: Schema = new Schema({
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CommunityPost",
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
    maxlength: 500
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
CommentSchema.index({ post: 1, createdAt: 1 });
CommentSchema.index({ author: 1 });
CommentSchema.index({ upvotes: 1 });
CommentSchema.index({ downvotes: 1 });

export default mongoose.model<CommentDocument>("Comment", CommentSchema);