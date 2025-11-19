import { z } from "zod";

export const UserSchema = z.object({
  username: z.string(),
  email: z.email(),
  password: z.string(),
  height: z.number().optional(),
  weight: z.number().optional(),
  address: z.object({
    country: z.string().optional(),
    city: z.string().optional(),
  }).optional(),
  profilePic: z.string().optional(),
  dateOfBirth: z.date().optional(),
  role: z.enum(["user", "admin"]).default("user"),
  createdAt: z.date(),
  updatedAt: z.date(),
  budgetPreferences: z.object({
    monthlyBudget: z.number().positive().optional(),
    spendingCategories: z.object({
      groceries: z.number().min(0).default(0),
      diningOut: z.number().min(0).default(0),
      supplements: z.number().min(0).default(0),
      other: z.number().min(0).default(0)
    }).optional()
  }).optional(),
  dietaryNeeds: z.object({
    dietType: z.enum(["balanced", "plantBased", "lowCarb", "highProtein"]).default("balanced"),
    allergies: z.array(z.string()).default([]), // Free text allergies
    caloriesPerDay: z.number().min(800).max(5000).optional(),
    macroTargets: z.object({
      protein: z.number().min(0).max(100),
      carbs: z.number().min(0).max(100),
      fats: z.number().min(0).max(100)
    }).optional(),
    waterIntakeGoal: z.number().positive().default(8),
    avoidIngredients: z.array(z.string()).default([])
  }).optional()
});

export type User = z.infer<typeof UserSchema>;
