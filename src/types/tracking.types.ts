// Category types matching the schemas
export type FoodCategory = "fruits" | "vegetables" | "dairy" | "grains" | "protein" | "beverages" | "snacks" | "other";

// Tracking response interfaces
export interface TrackingLog {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalItems: number;
}

export interface InventorySummary {
  totalCount: number;
  categoryBreakdown: Record<FoodCategory, number>;
  expiringSoon: number; // items expiring within 3 days
  averageCostPerUnit: number;
}

export interface RecommendedResource {
  title: string;
  url: string;
  relatedTo: string;
  reason: string;
  category: string;
}

export interface TrackingSummary {
  inventory: InventorySummary;
  recentLogs: TrackingLog[];
  recommendedResources: RecommendedResource[];
}

// Rule-based recommendation types
export interface RecommendationRule {
  id: string;
  name: string;
  condition: (data: RecommendationData) => boolean;
  resourceFilter: {
    category?: string;
    type?: string;
    keywords?: string[];
  };
  explanation: string;
  priority: number; // higher number = higher priority
}

export interface RecommendationData {
  recentLogs: DailyLogItem[];
  inventory: InventoryItem[];
  consumedCategories: FoodCategory[];
  nutritionAverages: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
}

// Data interfaces from schemas
export interface DailyLogItem {
  itemName: string;
  quantity: number;
  unit: string;
  category: FoodCategory;
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

export interface InventoryItem {
  itemName: string;
  category: FoodCategory;
  expirationDate?: Date | null;
  hasExpiration: boolean;
  costPerUnit: number;
  createdAt: Date;
}

export interface ResourceItem {
  title: string;
  description: string;
  url: string;
  category: string;
  type: string;
}

// Time range options
export type TimeRange = "daily" | "weekly" | "monthly" | "custom";

// API Query Parameters
export interface TrackingQueryParams {
  range?: TimeRange;
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  limit?: number;
}

// API Response interfaces
export interface TrackingResponse {
  success: boolean;
  message: string;
  data: TrackingSummary;
  timeRange?: {
    type: TimeRange;
    startDate: string;
    endDate: string;
    dayCount: number;
  };
}