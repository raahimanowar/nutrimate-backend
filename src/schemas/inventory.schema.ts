import mongoose from "mongoose";

const InventorySchema = new mongoose.Schema(
  {
    itemName: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ["fruits", "vegetables", "dairy", "grains", "protein", "beverages", "snacks", "other"]
    },
    expirationPeriod: { type: Number, required: true }, // days
    costPerUnit: { type: Number, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model("Inventory", InventorySchema);