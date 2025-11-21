import mongoose from "mongoose";

const InventorySchema = new mongoose.Schema(
  {
    itemName: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ["fruits", "vegetables", "dairy", "grains", "protein", "beverages", "snacks", "other"]
    },
    expirationDate: { type: Date, required: false }, // optional expiration date
    hasExpiration: { type: Boolean, required: true, default: true }, // flag for items without expiration
    costPerUnit: { type: Number, required: true },

    // Enhanced quantity tracking
    quantity: { type: Number, required: true, default: 1, min: 0 }, // quantity in base unit
    unit: {
      type: String,
      required: true,
      default: 'pieces',
      enum: [
        // Weight units
        'kg', 'g', 'lb', 'oz',
        // Volume units
        'l', 'ml', 'gal', 'qt', 'pt', 'cup', 'fl oz',
        // Count units
        'pieces', 'items', 'servings', 'units',
        // Other
        'dozen', 'pair', 'pack', 'box', 'bottle', 'jar', 'can'
      ]
    },
    // Store as base unit (smallest unit) for accurate tracking
    baseQuantity: { type: Number, required: true, default: 1, min: 0 },
    baseUnit: {
      type: String,
      required: true,
      enum: ['g', 'ml', 'pieces'] // Only these 3 base units
    },

    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model("Inventory", InventorySchema);