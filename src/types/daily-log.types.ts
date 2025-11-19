import { Request } from "express";

export interface DailyLogItem {
  itemName: string;
  quantity: number;
  unit: string;
  category: "fruits" | "vegetables" | "dairy" | "grains" | "protein" | "beverages" | "snacks" | "other";
  calories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  mealType: "breakfast" | "lunch" | "dinner" | "snack" | "beverage";
  notes?: string;
}

export interface DailyLogItemCreate extends Omit<DailyLogItem, '_id'> {}

export interface DailyLogResponse {
  _id: string;
  userId: string;
  date: string;
  items: DailyLogItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  totalFiber: number;
  totalSugar: number;
  totalSodium: number;
  waterIntake: number;
  createdAt: string;
  updatedAt: string;
}

export interface DailyLogSummary {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  totalFiber: number;
  totalSugar: number;
  totalSodium: number;
  waterIntake: number;
  itemsCount: number;
  mealsByCategory: Record<string, number>;
}

export interface DailyLogQueryParams {
  date?: string; // YYYY-MM-DD format
  startDate?: string;
  endDate?: string;
  limit?: string;
  page?: string;
  sortBy?: 'date' | 'totalCalories' | 'totalProtein';
  sortOrder?: 'asc' | 'desc';
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'beverage';
  category?: 'fruits' | 'vegetables' | 'dairy' | 'grains' | 'protein' | 'beverages' | 'snacks' | 'other';
}

export interface WaterIntakeUpdate {
  waterIntake: number;
}

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    username: string;
    email: string;
  };
}

// Validation schemas
export interface CreateDailyLogItemRequest {
  date?: string; // Optional, defaults to today
  item: DailyLogItemCreate;
}

export interface UpdateDailyLogItemRequest {
  itemName?: string;
  quantity?: number;
  unit?: string;
  category?: "fruits" | "vegetables" | "dairy" | "grains" | "protein" | "beverages" | "snacks" | "other";
  calories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  mealType?: "breakfast" | "lunch" | "dinner" | "snack" | "beverage";
  notes?: string;
}