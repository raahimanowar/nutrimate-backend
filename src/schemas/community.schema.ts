import mongoose, { Document, Schema } from "mongoose";

// Community document interface
export interface CommunityDocument extends Document {
  name: string;
  location: string;
  description: string;
  admin: mongoose.Types.ObjectId; // User who created the community
  members: mongoose.Types.ObjectId[]; // Users who joined the community
  createdAt: Date;
  updatedAt: Date;
}

// Community schema
const CommunitySchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  location: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }]
}, {
  timestamps: true,
  versionKey: false
});

// Index for faster queries
CommunitySchema.index({ admin: 1 });
CommunitySchema.index({ members: 1 });
CommunitySchema.index({ name: 1 });
CommunitySchema.index({ location: 1 });

export default mongoose.model<CommunityDocument>("Community", CommunitySchema);