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
    quantity: { type: Number, required: true, default: 1, min: 0 }, // quantity of the item
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model("Inventory", InventorySchema);