import mongoose, { Document, Schema } from "mongoose";

// Food image type for receipts and food labels
export type FoodImageType = "receipt" | "food_label" | "meal_photo" | "ingredient";

// Association type for linking images to other data
export type AssociationType = "inventory" | "daily_log" | "none";

// Food image document interface
export interface FoodImageDocument extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  imageUrl: string;
  cloudinaryPublicId: string;
  imageType: FoodImageType;
  tags: string[];
  associationType: AssociationType;
  associatedId?: mongoose.Types.ObjectId; // ID of inventory item or daily log
  scanStatus: "pending" | "processed" | "manual_only";
  extractedData?: {
    items?: string[];
    totalAmount?: number;
    currency?: string;
    date?: Date;
    merchant?: string;
    confidence?: number;
  };
  metadata: {
    originalFileName: string;
    fileSize: number;
    mimeType: string;
    uploadDate: Date;
    lastModified: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Food image schema
const FoodImageSchema: Schema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  imageUrl: {
    type: String,
    required: true,
    trim: true
  },
  cloudinaryPublicId: {
    type: String,
    required: true,
    trim: true
  },
  imageType: {
    type: String,
    required: true,
    enum: ["receipt", "food_label", "meal_photo", "ingredient"],
    default: "receipt"
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  associationType: {
    type: String,
    required: true,
    enum: ["inventory", "daily_log", "none"],
    default: "none"
  },
  associatedId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "associationType",
    default: null
  },
  scanStatus: {
    type: String,
    required: true,
    enum: ["pending", "processed", "manual_only"],
    default: "manual_only" // No processing required in Part 1
  },
  extractedData: {
    items: [String],
    totalAmount: Number,
    currency: {
      type: String,
      trim: true,
      maxlength: 3
    },
    date: Date,
    merchant: {
      type: String,
      trim: true,
      maxlength: 100
    },
    confidence: {
      type: Number,
      min: 0,
      max: 100
    }
  },
  metadata: {
    originalFileName: {
      type: String,
      required: true,
      trim: true
    },
    fileSize: {
      type: Number,
      required: true,
      min: 0
    },
    mimeType: {
      type: String,
      required: true,
      trim: true
    },
    uploadDate: {
      type: Date,
      default: Date.now
    },
    lastModified: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true,
  versionKey: false,
  // Compound indexes for efficient queries
  indexes: [
    { userId: 1, imageType: 1 },
    { userId: 1, associationType: 1 },
    { userId: 1, createdAt: -1 }
  ]
});

// Static method to find images by user and type
FoodImageSchema.statics.findByUserAndType = function(userId: string, imageType: FoodImageType) {
  return this.find({ userId, imageType }).sort({ createdAt: -1 });
};

// Static method to find unassociated images
FoodImageSchema.statics.findUnassociated = function(userId: string) {
  return this.find({ userId, associationType: "none" }).sort({ createdAt: -1 });
};

// Static method to find images associated with inventory
FoodImageSchema.statics.findAssociatedWithInventory = function(userId: string) {
  return this.find({ userId, associationType: "inventory" }).sort({ createdAt: -1 });
};

// Static method to find images associated with daily logs
FoodImageSchema.statics.findAssociatedWithLogs = function(userId: string) {
  return this.find({ userId, associationType: "daily_log" }).sort({ createdAt: -1 });
};

// Instance method to associate with inventory item
FoodImageSchema.methods.associateWithInventory = function(inventoryId: string) {
  this.associationType = "inventory";
  this.associatedId = inventoryId;
  this.lastModified = new Date();
  return this.save();
};

// Instance method to associate with daily log
FoodImageSchema.methods.associateWithLog = function(logId: string) {
  this.associationType = "daily_log";
  this.associatedId = logId;
  this.lastModified = new Date();
  return this.save();
};

// Instance method to remove association
FoodImageSchema.methods.removeAssociation = function() {
  this.associationType = "none";
  this.associatedId = undefined;
  this.lastModified = new Date();
  return this.save();
};

export default mongoose.model<FoodImageDocument>("FoodImage", FoodImageSchema);