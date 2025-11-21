import mongoose from "mongoose";

// Food schema
const FoodSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    costPerUnit: { type: Number, required: true },
    expirationDays: { type: Number, required: true },
    quantity: { type: Number, default: 0 },
  },
  { timestamps: true, versionKey: false }
);

// Nutrient schema
const NutrientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    dailyRecommended: { type: Number, required: true }, // e.g., grams/mg
  },
  { timestamps: true, versionKey: false }
);

// Category schema
const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
  },
  { timestamps: true, versionKey: false }
);

export const Food = mongoose.model("Food", FoodSchema);
export const Nutrient = mongoose.model("Nutrient", NutrientSchema);
export const Category = mongoose.model("Category", CategorySchema);
