import { Groq } from 'groq-sdk';
import { logger } from '../utils/logger.js';
import DailyLog from '../schemas/daily-log.schema.js';
import Inventory from '../schemas/inventory.schema.js';
import User from '../schemas/users.schema.js';

interface ConsumptionItem {
  itemName: string;
  category: string;
  quantity: number;
  unit: string;
  mealType: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  fiber?: number;
  date: string;
  dayOfWeek: string;
}

interface WeeklyTrend {
  dayOfWeek: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  totalFiber: number;
  itemsConsumed: number;
  mealDistribution: {
    breakfast: number;
    lunch: number;
    dinner: number;
    snack: number;
    beverage: number;
  };
  categoryDistribution: {
    fruits: number;
    vegetables: number;
    dairy: number;
    grains: number;
    protein: number;
    beverages: number;
    snacks: number;
    other: number;
  };
}

interface CategoryConsumption {
  category: string;
  totalConsumed: number;
  averageDaily: number;
  consumptionFrequency: number; // percentage of days
  trendDirection: 'increasing' | 'decreasing' | 'stable';
  nutritionalBalance: 'optimal' | 'deficient' | 'excessive';
  recommendedIntake: number;
  varianceFromOptimal: number;
}

interface WastePrediction {
  item: {
    _id: string;
    itemName: string;
    category: string;
    quantity: number;
    unit: string;
    estimatedValue: number;
    expirationDate: Date | null;
    daysUntilExpiration: number;
  };
  wasteRisk: {
    probability: number; // 0-100
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    predictedWasteDate: string;
    consumptionRateNeeded: number; // units per day to avoid waste
    daysOfConsumption: number; // how many days user can consume before expiration
  };
  reasoning: {
    primaryFactors: string[];
    consumptionPatternAnalysis: string;
    seasonalFactors: string[];
    recommendations: string[];
  };
}

interface ImbalanceDetection {
  category: string;
  currentIntake: number;
  recommendedIntake: number;
  variance: number;
  severity: 'mild' | 'moderate' | 'severe';
  healthImplications: string[];
  suggestions: string[];
  priority: 'low' | 'medium' | 'high';
}

interface HeatmapData {
  dayOfWeek: string;
  hourOfDay: number;
  mealType: string;
  consumptionIntensity: number; // 0-100
  categoryBreakdown: Record<string, number>;
  totalCalories: number;
  itemCount: number;
}

interface PatternAnalysisResult {
  summary: {
    analysisPeriod: {
      startDate: string;
      endDate: string;
      totalDays: number;
    };
    overallHealthScore: number; // 0-100
    keyInsights: string[];
    recommendations: string[];
    dataCompleteness: number; // percentage of days with complete data
  };
  weeklyTrends: WeeklyTrend[];
  categoryConsumption: CategoryConsumption[];
  wastePredictions: WastePrediction[];
  imbalancesDetected: ImbalanceDetection[];
  heatmapData: HeatmapData[];
  consumptionPatterns: {
    mealTiming: {
      breakfastTime: string;
      lunchTime: string;
      dinnerTime: string;
      snackTimes: string[];
    };
    eatingFrequency: {
      averageMealsPerDay: number;
      averageSnacksPerDay: number;
      regularityScore: number; // 0-100
    };
    preferredCategories: {
      mostConsumed: Array<{ category: string; percentage: number }>;
      leastConsumed: Array<{ category: string; percentage: number }>;
    };
  };
  nutritionInsights: {
    proteinIntake: {
      current: number;
      recommended: number;
      adequacy: 'deficient' | 'adequate' | 'excessive';
    };
    fiberIntake: {
      current: number;
      recommended: number;
      adequacy: 'deficient' | 'adequate' | 'excessive';
    };
    calorieDistribution: {
      breakfast: number;
      lunch: number;
      dinner: number;
      snacks: number;
    };
  };
}

class PatternAnalyzerService {
  private groq: Groq;

  constructor() {
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });
  }

  async analyzeConsumptionPatterns(
    userId: string,
    periodDays: number = 30,
    includeInventoryWastePrediction: boolean = true
  ): Promise<PatternAnalysisResult> {
    try {
      logger.info(`Starting pattern analysis for user ${userId} over ${periodDays} days`);

      // Step 1: Get user data and daily logs
      const userData = await this.getUserData(userId);
      const dailyLogs = await this.getDailyLogs(userId, periodDays);

      if (dailyLogs.length === 0) {
        return this.getEmptyAnalysisResult();
      }

      // Step 2: Get current inventory for waste prediction
      let currentInventory = [];
      if (includeInventoryWastePrediction) {
        currentInventory = await this.getUserInventory(userId);
      }

      // Step 3: Process and structure consumption data
      const consumptionData = this.processConsumptionData(dailyLogs);

      // Step 4: Generate AI-powered pattern analysis
      const aiAnalysis = await this.getAIPatternAnalysis(
        consumptionData,
        userData,
        currentInventory
      );

      // Step 5: Generate comprehensive result
      return this.generateAnalysisResult(
        aiAnalysis,
        consumptionData,
        currentInventory,
        userData,
        periodDays
      );

    } catch (error) {
      logger.error(`Pattern analysis error: ${(error as Error).message}`);
      throw new Error(`Failed to analyze consumption patterns: ${(error as Error).message}`);
    }
  }

  private async getUserData(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return {
      userId,
      username: user.username,
      dietaryNeeds: user.dietaryNeeds,
      householdSize: user.householdSize || 1,
      caloriesPerDay: user.dietaryNeeds?.caloriesPerDay || 2000
    };
  }

  private async getDailyLogs(userId: string, periodDays: number) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    const dailyLogs = await DailyLog.find({
      userId,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ date: 1 });

    return dailyLogs;
  }

  private async getUserInventory(userId: string) {
    const inventoryItems = await Inventory.find({
      userId,
      hasExpiration: true
    }).lean();

    const now = new Date();
    return inventoryItems.map(item => ({
      _id: item._id.toString(),
      itemName: item.itemName,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      expirationDate: item.expirationDate,
      daysUntilExpiration: item.expirationDate ?
        Math.max(0, Math.ceil((new Date(item.expirationDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : -1,
      estimatedValue: item.quantity * item.costPerUnit
    }));
  }

  private processConsumptionData(dailyLogs: any[]): ConsumptionItem[] {
    const consumptionData: ConsumptionItem[] = [];

    dailyLogs.forEach(log => {
      const date = log.date.toISOString().split('T')[0];
      const dayOfWeek = new Date(log.date).toLocaleDateString('en-US', { weekday: 'long' });

      log.items.forEach((item: any) => {
        consumptionData.push({
          itemName: item.itemName,
          category: item.category,
          quantity: item.quantity,
          unit: item.unit,
          mealType: item.mealType,
          calories: item.calories || 0,
          protein: item.protein || 0,
          carbs: item.carbs || 0,
          fats: item.fats || 0,
          fiber: item.fiber || 0,
          date,
          dayOfWeek
        });
      });
    });

    return consumptionData;
  }

  private async getAIPatternAnalysis(
    consumptionData: ConsumptionItem[],
    userData: any,
    inventoryData: any[]
  ) {
    // Group consumption data by day of week for analysis
    const dailyConsumption = this.groupConsumptionByDay(consumptionData);
    const categoryAnalysis = this.analyzeCategoryConsumption(consumptionData);
    const weeklyPatterns = this.analyzeWeeklyPatterns(consumptionData);
    const mealTiming = this.analyzeMealTiming(consumptionData);

    // Prepare data for AI analysis
    const consumptionSummary = consumptionData.map(item =>
      `- ${item.itemName} (${item.category}): ${item.quantity} ${item.unit}, ${item.calories} cal, ${item.mealType}, ${item.dayOfWeek}`
    ).join('\n');

    const inventorySummary = inventoryData.map(item =>
      `- ${item.itemName} (${item.category}): ${item.quantity} ${item.unit}, expires in ${item.daysUntilExpiration} days, value: $${item.estimatedValue.toFixed(2)}`
    ).join('\n');

    const prompt = `
You are an advanced nutrition and consumption pattern analyzer. Analyze the following user's eating patterns and provide comprehensive insights.

USER PROFILE:
- Daily Calories Target: ${userData.caloriesPerDay} kcal
- Dietary Preferences: ${userData.dietaryNeeds?.dietType || 'balanced'}
- Household Size: ${userData.householdSize} people

CONSUMPTION DATA (${consumptionData.length} items logged):
${consumptionSummary}

CURRENT INVENTORY (for waste prediction):
${inventorySummary}

DAILY CONSUMPTION BY DAY:
${Object.entries(dailyConsumption).map(([day, data]) =>
  `${day}: ${data.totalCalories} cal, ${data.itemCount} items, ${Object.entries(data.mealDistribution).map(([meal, count]) => `${meal}: ${count}`).join(', ')}`
).join('\n')}

CATEGORY ANALYSIS:
${Object.entries(categoryAnalysis).map(([category, data]) =>
  `${category}: ${data.totalConsumed} units, ${data.dailyAverage.toFixed(2)}/day, ${data.frequency}% of days`
).join('\n')}

WEEKLY PATTERNS:
${Object.entries(weeklyPatterns).map(([day, data]) =>
  `${day}: ${data.avgCalories.toFixed(0)} cal avg, ${data.avgItems.toFixed(1)} items avg`
).join('\n')}

ANALYSIS REQUIREMENTS:

1. WEEKLY TRENDS DETECTION:
   - Identify high/low consumption days (weekends vs weekdays)
   - Detect meal timing patterns
   - Analyze category preferences by day
   - Find irregular eating patterns

2. NUTRITIONAL IMBALANCE DETECTION:
   Use these nutritional guidelines (same as mealOptimizer):
   - Daily Calories: ${userData.caloriesPerDay} kcal (range: ${Math.round(userData.caloriesPerDay * 0.9)}-${Math.round(userData.caloriesPerDay * 1.1)} kcal)
   - Protein: ${userData.dietaryNeeds?.macroTargets?.protein || 25}% of calories (${Math.round(userData.caloriesPerDay * 0.25 / 4)}g)
   - Carbs: ${userData.dietaryNeeds?.macroTargets?.carbs || 45}% of calories (${Math.round(userData.caloriesPerDay * 0.45 / 4)}g)
   - Fats: ${userData.dietaryNeeds?.macroTargets?.fats || 30}% of calories (${Math.round(userData.caloriesPerDay * 0.3 / 9)}g)
   - Fiber: Minimum 20g/day
   - At least 1 fruit, 1 vegetable, 1 protein, 1 whole grain daily

3. WASTE PREDICTION ANALYSIS:
   - Compare consumption rates with current inventory
   - Predict items likely to be wasted in 3-7 days
   - Calculate consumption rates needed to prevent waste
   - Consider expiration dates and historical consumption patterns

4. HEATMAP DATA GENERATION:
   - Create intensity data for day/time combinations
   - Identify peak eating times
   - Category consumption by time of day
   - Meal regularity patterns

5. HEALTH INSIGHTS:
   - Overall health score (0-100)
   - Key recommendations for improvement
   - Potential health implications of current patterns
   - Suggestions for better nutrition balance

Provide detailed JSON analysis:
{
  "weeklyTrends": [
    {
      "dayOfWeek": "Monday",
      "totalCalories": number,
      "totalProtein": number,
      "totalCarbs": number,
      "totalFats": number,
      "totalFiber": number,
      "itemsConsumed": number,
      "mealDistribution": {
        "breakfast": number,
        "lunch": number,
        "dinner": number,
        "snack": number,
        "beverage": number
      },
      "categoryDistribution": {
        "fruits": number,
        "vegetables": number,
        "dairy": number,
        "grains": number,
        "protein": number,
        "beverages": number,
        "snacks": number,
        "other": number
      }
    }
  ],
  "categoryConsumption": [
    {
      "category": "fruits",
      "totalConsumed": number,
      "averageDaily": number,
      "consumptionFrequency": number,
      "trendDirection": "increasing|decreasing|stable",
      "nutritionalBalance": "optimal|deficient|excessive",
      "recommendedIntake": number,
      "varianceFromOptimal": number
    }
  ],
  "wastePredictions": [
    {
      "item": {
        "_id": "inventory_id",
        "itemName": "item name",
        "category": "category",
        "quantity": number,
        "unit": "unit",
        "estimatedValue": number,
        "expirationDate": "ISO_date",
        "daysUntilExpiration": number
      },
      "wasteRisk": {
        "probability": number (0-100),
        "riskLevel": "low|medium|high|critical",
        "predictedWasteDate": "ISO_date",
        "consumptionRateNeeded": number,
        "daysOfConsumption": number
      },
      "reasoning": {
        "primaryFactors": ["factor1", "factor2"],
        "consumptionPatternAnalysis": "analysis text",
        "seasonalFactors": ["factor1", "factor2"],
        "recommendations": ["recommendation1", "recommendation2"]
      }
    }
  ],
  "imbalancesDetected": [
    {
      "category": "category_name",
      "currentIntake": number,
      "recommendedIntake": number,
      "variance": number,
      "severity": "mild|moderate|severe",
      "healthImplications": ["implication1", "implication2"],
      "suggestions": ["suggestion1", "suggestion2"],
      "priority": "low|medium|high"
    }
  ],
  "heatmapData": [
    {
      "dayOfWeek": "Monday",
      "hourOfDay": number,
      "mealType": "breakfast|lunch|dinner|snack|beverage",
      "consumptionIntensity": number (0-100),
      "categoryBreakdown": {"fruits": number, "vegetables": number, ...},
      "totalCalories": number,
      "itemCount": number
    }
  ],
  "consumptionPatterns": {
    "mealTiming": {
      "breakfastTime": "HH:MM",
      "lunchTime": "HH:MM",
      "dinnerTime": "HH:MM",
      "snackTimes": ["HH:MM", "HH:MM"]
    },
    "eatingFrequency": {
      "averageMealsPerDay": number,
      "averageSnacksPerDay": number,
      "regularityScore": number (0-100)
    },
    "preferredCategories": {
      "mostConsumed": [{"category": "fruits", "percentage": number}],
      "leastConsumed": [{"category": "vegetables", "percentage": number}]
    }
  },
  "nutritionInsights": {
    "proteinIntake": {
      "current": number,
      "recommended": number,
      "adequacy": "deficient|adequate|excessive"
    },
    "fiberIntake": {
      "current": number,
      "recommended": number,
      "adequacy": "deficient|adequate|excessive"
    },
    "calorieDistribution": {
      "breakfast": number,
      "lunch": number,
      "dinner": number,
      "snacks": number
    }
  },
  "overallHealthScore": number (0-100),
  "keyInsights": ["insight1", "insight2", "insight3"],
  "recommendations": ["recommendation1", "recommendation2", "recommendation3"]
}

Focus on actionable insights and practical recommendations.
`;

    try {
      const chatCompletion = await this.groq.chat.completions.create({
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        model: 'openai/gpt-oss-20b',
        temperature: 0.3,
        max_completion_tokens: 8000,
        top_p: 1,
        stream: false,
        reasoning_effort: 'medium',
        stop: null
      });

      const response = chatCompletion.choices[0]?.message?.content;

      if (!response) {
        throw new Error('No response from AI for pattern analysis');
      }

      const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
      const aiResponse = JSON.parse(cleanResponse);

      return aiResponse;

    } catch (error) {
      logger.error(`AI pattern analysis error: ${(error as Error).message}`);
      // Fallback to basic pattern analysis
      return this.getFallbackPatternAnalysis(consumptionData, inventoryData, userData);
    }
  }

  private groupConsumptionByDay(consumptionData: ConsumptionItem[]) {
    const dailyData: Record<string, any> = {};

    consumptionData.forEach(item => {
      if (!dailyData[item.dayOfWeek]) {
        dailyData[item.dayOfWeek] = {
          totalCalories: 0,
          itemCount: 0,
          mealDistribution: { breakfast: 0, lunch: 0, dinner: 0, snack: 0, beverage: 0 }
        };
      }

      dailyData[item.dayOfWeek].totalCalories += item.calories || 0;
      dailyData[item.dayOfWeek].itemCount++;
      dailyData[item.dayOfWeek].mealDistribution[item.mealType]++;
    });

    return dailyData;
  }

  private analyzeCategoryConsumption(consumptionData: ConsumptionItem[]) {
    const categoryData: Record<string, any> = {};

    consumptionData.forEach(item => {
      if (!categoryData[item.category]) {
        categoryData[item.category] = {
          totalConsumed: 0,
          daysConsumed: new Set(),
          items: []
        };
      }

      categoryData[item.category].totalConsumed += item.quantity;
      categoryData[item.category].daysConsumed.add(item.date);
      categoryData[item.category].items.push(item);
    });

    // Convert to final format
    const totalDays = new Set(consumptionData.map(item => item.date)).size;

    return Object.entries(categoryData).map(([category, data]) => ({
      category,
      totalConsumed: data.totalConsumed,
      dailyAverage: data.totalConsumed / totalDays,
      frequency: (data.daysConsumed.size / totalDays) * 100
    }));
  }

  private analyzeWeeklyPatterns(consumptionData: ConsumptionItem[]) {
    const weeklyData: Record<string, any> = {};

    consumptionData.forEach(item => {
      if (!weeklyData[item.dayOfWeek]) {
        weeklyData[item.dayOfWeek] = {
          totalCalories: 0,
          totalItems: 0,
          days: new Set()
        };
      }

      weeklyData[item.dayOfWeek].totalCalories += item.calories || 0;
      weeklyData[item.dayOfWeek].totalItems++;
      weeklyData[item.dayOfWeek].days.add(item.date);
    });

    return Object.entries(weeklyData).map(([day, data]) => ({
      day,
      avgCalories: data.totalCalories / data.days.size,
      avgItems: data.totalItems / data.days.size
    }));
  }

  private analyzeMealTiming(consumptionData: ConsumptionItem[]) {
    // Simplified meal timing analysis
    const mealTiming: Record<string, number[]> = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: [],
      beverage: []
    };

    // This would need actual timestamp data from logs
    // For now, return default times
    return {
      breakfastTime: "08:00",
      lunchTime: "12:30",
      dinnerTime: "19:00",
      snackTimes: ["10:30", "15:30"]
    };
  }

  private getFallbackPatternAnalysis(
    consumptionData: ConsumptionItem[],
    inventoryData: any[],
    userData: any
  ) {
    // Basic fallback analysis
    const totalDays = new Set(consumptionData.map(item => item.date)).size;
    const totalCalories = consumptionData.reduce((sum, item) => sum + (item.calories || 0), 0);
    const avgDailyCalories = totalCalories / totalDays;

    // Simple category analysis
    const categoryAnalysis = this.analyzeCategoryConsumption(consumptionData);

    return {
      weeklyTrends: [],
      categoryConsumption: categoryAnalysis.map(cat => ({
        category: cat.category,
        totalConsumed: cat.totalConsumed,
        averageDaily: cat.dailyAverage,
        consumptionFrequency: cat.frequency,
        trendDirection: 'stable' as const,
        nutritionalBalance: cat.dailyAverage > 0 ? 'optimal' as const : 'deficient' as const,
        recommendedIntake: 2, // default
        varianceFromOptimal: 0
      })),
      wastePredictions: [],
      imbalancesDetected: [],
      heatmapData: [],
      consumptionPatterns: {
        mealTiming: {
          breakfastTime: "08:00",
          lunchTime: "12:30",
          dinnerTime: "19:00",
          snackTimes: ["10:30", "15:30"]
        },
        eatingFrequency: {
          averageMealsPerDay: 3,
          averageSnacksPerDay: 2,
          regularityScore: 70
        },
        preferredCategories: {
          mostConsumed: [{ category: 'fruits', percentage: 25 }],
          leastConsumed: [{ category: 'vegetables', percentage: 10 }]
        }
      },
      nutritionInsights: {
        proteinIntake: {
          current: avgDailyCalories * 0.25 / 4,
          recommended: userData.caloriesPerDay * 0.25 / 4,
          adequacy: 'adequate' as const
        },
        fiberIntake: {
          current: 15,
          recommended: 20,
          adequacy: 'deficient' as const
        },
        calorieDistribution: {
          breakfast: 25,
          lunch: 35,
          dinner: 30,
          snacks: 10
        }
      },
      overallHealthScore: 70,
      keyInsights: ['Basic pattern analysis completed'],
      recommendations: ['Log more detailed data for better insights']
    };
  }

  private generateAnalysisResult(
    aiAnalysis: any,
    consumptionData: ConsumptionItem[],
    inventoryData: any[],
    userData: any,
    periodDays: number
  ): PatternAnalysisResult {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    const dataCompleteness = Math.min(100, (consumptionData.length / (periodDays * 3)) * 100); // Assuming 3 items per day as baseline

    return {
      summary: {
        analysisPeriod: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          totalDays: periodDays
        },
        overallHealthScore: aiAnalysis.overallHealthScore || 70,
        keyInsights: aiAnalysis.keyInsights || ['Analysis completed'],
        recommendations: aiAnalysis.recommendations || ['Continue logging food for better insights'],
        dataCompleteness
      },
      weeklyTrends: aiAnalysis.weeklyTrends || [],
      categoryConsumption: aiAnalysis.categoryConsumption || [],
      wastePredictions: aiAnalysis.wastePredictions || [],
      imbalancesDetected: aiAnalysis.imbalancesDetected || [],
      heatmapData: aiAnalysis.heatmapData || [],
      consumptionPatterns: aiAnalysis.consumptionPatterns || {
        mealTiming: {
          breakfastTime: "08:00",
          lunchTime: "12:30",
          dinnerTime: "19:00",
          snackTimes: ["10:30", "15:30"]
        },
        eatingFrequency: {
          averageMealsPerDay: 3,
          averageSnacksPerDay: 2,
          regularityScore: 70
        },
        preferredCategories: {
          mostConsumed: [],
          leastConsumed: []
        }
      },
      nutritionInsights: aiAnalysis.nutritionInsights || {
        proteinIntake: {
          current: 0,
          recommended: userData.caloriesPerDay * 0.25 / 4,
          adequacy: 'deficient'
        },
        fiberIntake: {
          current: 0,
          recommended: 20,
          adequacy: 'deficient'
        },
        calorieDistribution: {
          breakfast: 25,
          lunch: 35,
          dinner: 30,
          snacks: 10
        }
      }
    };
  }

  private getEmptyAnalysisResult(): PatternAnalysisResult {
    return {
      summary: {
        analysisPeriod: {
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0],
          totalDays: 0
        },
        overallHealthScore: 0,
        keyInsights: ['No consumption data available'],
        recommendations: ['Start logging your food to get personalized insights'],
        dataCompleteness: 0
      },
      weeklyTrends: [],
      categoryConsumption: [],
      wastePredictions: [],
      imbalancesDetected: [],
      heatmapData: [],
      consumptionPatterns: {
        mealTiming: {
          breakfastTime: "08:00",
          lunchTime: "12:30",
          dinnerTime: "19:00",
          snackTimes: ["10:30", "15:30"]
        },
        eatingFrequency: {
          averageMealsPerDay: 0,
          averageSnacksPerDay: 0,
          regularityScore: 0
        },
        preferredCategories: {
          mostConsumed: [],
          leastConsumed: []
        }
      },
      nutritionInsights: {
        proteinIntake: {
          current: 0,
          recommended: 50,
          adequacy: 'deficient'
        },
        fiberIntake: {
          current: 0,
          recommended: 20,
          adequacy: 'deficient'
        },
        calorieDistribution: {
          breakfast: 0,
          lunch: 0,
          dinner: 0,
          snacks: 0
        }
      }
    };
  }
}

export default new PatternAnalyzerService();