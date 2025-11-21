import mongoose from "mongoose";

const FoodInventorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    expirationDays: { type: Number, required: true },
    costPerUnit: { type: Number, required: true },
    quantity: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model("FoodInventory", FoodInventorySchema);
