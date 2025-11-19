import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    height: { type: Number },
    weight: { type: Number },
    address: {
      country: { type: String },
      city: { type: String },
    },
    profilePic: { type: String },
    dateOfBirth: { type: Date },
    role: { type: String, default: "user" },
    budgetPreferences: {
      monthlyBudget: { type: Number },
      spendingCategories: {
        groceries: { type: Number, default: 0 },
        diningOut: { type: Number, default: 0 },
        supplements: { type: Number, default: 0 },
        other: { type: Number, default: 0 }
      }
    },
    dietaryNeeds: {
      dietType: {
        type: String,
        enum: ["balanced", "plantBased", "lowCarb", "highProtein"],
        default: "balanced"
      },
      allergies: [String], // Free text allergies that users can specify
      caloriesPerDay: { type: Number, min: 800, max: 5000 },
      macroTargets: {
        protein: { type: Number, min: 0, max: 100 }, // percentage
        carbs: { type: Number, min: 0, max: 100 },   // percentage
        fats: { type: Number, min: 0, max: 100 }     // percentage
      },
      waterIntakeGoal: { type: Number, default: 8 }, // glasses per day
      avoidIngredients: [String] // custom ingredients to avoid
    }
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model("User", UserSchema);
