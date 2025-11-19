import mongoose, { Document, Schema } from "mongoose";

// Daily log item interface
interface DailyLogItem {
  itemName: string;
  quantity: number;
  unit: string; // e.g., "pieces", "grams", "cups", "servings"
  category: "fruits" | "vegetables" | "dairy" | "grains" | "protein" | "beverages" | "snacks" | "other";
  calories?: number;
  protein?: number; // grams
  carbs?: number; // grams
  fats?: number; // grams
  fiber?: number; // grams
  sugar?: number; // grams
  sodium?: number; // mg
  mealType: "breakfast" | "lunch" | "dinner" | "snack" | "beverage";
  notes?: string;
}

// Daily log document interface
export interface DailyLogDocument extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date; // Date of the log
  items: DailyLogItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  totalFiber: number;
  totalSugar: number;
  totalSodium: number;
  waterIntake: number; // glasses of water
  createdAt: Date;
  updatedAt: Date;
}

// Daily log item schema
const DailyLogItemSchema: Schema = new Schema({
  itemName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  quantity: {
    type: Number,
    required: true,
    min: 0.1,
    max: 10000
  },
  unit: {
    type: String,
    required: true,
    trim: true,
    maxlength: 20,
    default: "servings"
  },
  category: {
    type: String,
    required: true,
    enum: ["fruits", "vegetables", "dairy", "grains", "protein", "beverages", "snacks", "other"]
  },
  calories: {
    type: Number,
    min: 0,
    max: 10000
  },
  protein: {
    type: Number,
    min: 0,
    max: 1000
  },
  carbs: {
    type: Number,
    min: 0,
    max: 1000
  },
  fats: {
    type: Number,
    min: 0,
    max: 1000
  },
  fiber: {
    type: Number,
    min: 0,
    max: 500
  },
  sugar: {
    type: Number,
    min: 0,
    max: 500
  },
  sodium: {
    type: Number,
    min: 0,
    max: 5000
  },
  mealType: {
    type: String,
    required: true,
    enum: ["breakfast", "lunch", "dinner", "snack", "beverage"],
    default: "snack"
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  }
}, { _id: true });

// Main daily log schema
const DailyLogSchema: Schema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  items: [DailyLogItemSchema],
  totalCalories: {
    type: Number,
    default: 0,
    min: 0
  },
  totalProtein: {
    type: Number,
    default: 0,
    min: 0
  },
  totalCarbs: {
    type: Number,
    default: 0,
    min: 0
  },
  totalFats: {
    type: Number,
    default: 0,
    min: 0
  },
  totalFiber: {
    type: Number,
    default: 0,
    min: 0
  },
  totalSugar: {
    type: Number,
    default: 0,
    min: 0
  },
  totalSodium: {
    type: Number,
    default: 0,
    min: 0
  },
  waterIntake: {
    type: Number,
    default: 0,
    min: 0,
    max: 50
  }
}, {
  timestamps: true,
  versionKey: false,
  // Ensure one log per user per date
  index: { userId: 1, date: 1 }, unique: true
});

// Pre-save middleware to calculate totals
DailyLogSchema.pre("save", function(next) {
  if (this.isModified("items")) {
    this.calculateTotals();
  }
  next();
});

// Method to calculate nutritional totals
DailyLogSchema.methods.calculateTotals = function() {
  const totals = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0
  };

  this.items.forEach((item: DailyLogItem) => {
    totals.calories += item.calories || 0;
    totals.protein += item.protein || 0;
    totals.carbs += item.carbs || 0;
    totals.fats += item.fats || 0;
    totals.fiber += item.fiber || 0;
    totals.sugar += item.sugar || 0;
    totals.sodium += item.sodium || 0;
  });

  this.totalCalories = totals.calories;
  this.totalProtein = totals.protein;
  this.totalCarbs = totals.carbs;
  this.totalFats = totals.fats;
  this.totalFiber = totals.fiber;
  this.totalSugar = totals.sugar;
  this.totalSodium = totals.sodium;
};

// Static method to find or create daily log
DailyLogSchema.statics.findOrCreate = async function(userId: string, date: Date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  let dailyLog = await this.findOne({
    userId,
    date: {
      $gte: startOfDay,
      $lte: endOfDay
    }
  });

  if (!dailyLog) {
    dailyLog = await this.create({
      userId,
      date: startOfDay,
      items: [],
      waterIntake: 0
    });
  }

  return dailyLog;
};

export default mongoose.model<DailyLogDocument>("DailyLog", DailyLogSchema);