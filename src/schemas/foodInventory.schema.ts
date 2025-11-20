import mongoose from "mongoose";

const FoodInventorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    expirationDates: { type: Number, required: true, min: 0 },
    costPerUnit: { type: Number, required: true, min: 0 },
    quantity: { type: Number, default: 0, min: 0 },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model(
  "FoodInventory",
  FoodInventorySchema,
  "food_inventory"
);
