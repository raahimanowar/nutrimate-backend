import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    fullname: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    height: { type: Number },
    weight: { type: Number },
    address: {
      country: { type: String },
      city: { type: String },
    },
    householdSize: { type: Number, default: 1 },
    profilePic: { type: String },
    dateOfBirth: { type: Date },
    role: { type: String, default: "user" },
    budgetPreferences: {
      monthlyBudget: { type: Number },
      spendingCategories: {
        groceries: { type: Number, default: 0 },
        diningOut: { type: Number, default: 0 },
        supplements: { type: Number, default: 0 },
        other: { type: Number, default: 0 },
      },
    },
    dietaryNeeds: {
      dietType: {
        type: String,
        enum: ["balanced", "plantBased", "lowCarb", "highProtein"],
        default: "balanced",
      },
      allergies: [String],
      caloriesPerDay: { type: Number, min: 800, max: 5000 },
      macroTargets: {
        protein: { type: Number, min: 0, max: 100 },
        carbs: { type: Number, min: 0, max: 100 },
        fats: { type: Number, min: 0, max: 100 },
      },
      waterIntakeGoal: { type: Number, default: 8 },
      avoidIngredients: [String],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model("User", UserSchema);
