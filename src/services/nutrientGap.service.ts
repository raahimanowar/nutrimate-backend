import { Groq } from 'groq-sdk';
import { logger } from '../utils/logger.js';
import DailyLog from '../schemas/daily-log.schema.js';
import Inventory from '../schemas/inventory.schema.js';
import User from '../schemas/users.schema.js';
import FoodInventory from '../schemas/foodInventory.schema.js';

interface NutrientAnalysis {
  nutrient: string;
  currentIntake: number;
  recommendedIntake: number;
  deficiencyPercentage: number;
  deficiencyLevel: 'optimal' | 'mild' | 'moderate' | 'severe';
  trendDirection: 'increasing' | 'decreasing' | 'stable';
  daysDeficient: number;
  healthImplications: string[];
}

interface FoodSuggestion {
  itemName: string;
  category: string;
  quantity: number;
  unit: string;
  nutrients: Record<string, number>;
  availability: 'in_inventory' | 'in_catalog' | 'suggested_purchase';
  reason: string;
  priority: 'high' | 'medium' | 'low';
  estimatedCost?: number;
}

interface MealSuggestion {
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string;
  ingredients: Array<{
    itemName: string;
    quantity: number;
    unit: string;
    category: string;
    nutrients: Record<string, number>;
  }>;
  totalNutrients: Record<string, number>;
  targetNutrients: string[];
  preparationNotes: string;
  estimatedCost?: number;
}

interface NutrientGapResult {
  summary: {
    analysisPeriod: {
      startDate: string;
      endDate: string;
      totalDays: number;
    };
    overallNutritionScore: number; // 0-100
    totalDeficiencies: number;
    severeDeficiencies: number;
    dataCompleteness: number;
    userProfile: {
      caloriesPerDay: number;
      dietaryRestrictions: string[];
      preferences: string[];
    };
  };
  nutrientAnalysis: NutrientAnalysis[];
  foodSuggestions: FoodSuggestion[];
  mealSuggestions: MealSuggestion[];
  insights: {
    keyFindings: string[];
    recommendations: string[];
    priorityActions: string[];
    preventiveMeasures: string[];
  };
}

class NutrientGapService {
  private groq: Groq;

  constructor() {
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });
  }

  async predictNutrientGaps(
    userId: string,
    analysisDays: number = 30
  ): Promise<NutrientGapResult> {
    try {
      logger.info(`Starting nutrient gap prediction for user ${userId} over ${analysisDays} days`);

      // Step 1: Get user data and preferences
      const userData = await this.getUserData(userId);

      // Step 2: Get consumption history from daily logs
      const consumptionHistory = await this.getConsumptionHistory(userId, analysisDays);

      if (consumptionHistory.length === 0) {
        return this.getEmptyNutrientGapResult(userData, analysisDays);
      }

      // Step 3: Get current inventory and food catalog
      const [currentInventory, foodCatalog] = await Promise.all([
        this.getUserInventory(userId),
        this.getFoodCatalog()
      ]);

      // Step 4: Get AI-powered nutrient gap analysis
      const aiAnalysis = await this.getAINutrientGapAnalysis(
        consumptionHistory,
        userData,
        currentInventory,
        foodCatalog
      );

      // Step 5: Generate comprehensive result
      return this.generateNutrientGapResult(
        aiAnalysis,
        consumptionHistory,
        userData,
        currentInventory,
        analysisDays
      );

    } catch (error) {
      logger.error(`Nutrient gap prediction error: ${(error as Error).message}`);
      throw new Error(`Failed to predict nutrient gaps: ${(error as Error).message}`);
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
      caloriesPerDay: user.dietaryNeeds?.caloriesPerDay || 2000,
      dietaryRestrictions: user.dietaryNeeds?.allergies || [],
      preferences: user.dietaryNeeds?.avoidIngredients || [],
      macroTargets: user.dietaryNeeds?.macroTargets || {
        protein: 25,
        carbs: 45,
        fats: 30
      }
    };
  }

  private async getConsumptionHistory(userId: string, analysisDays: number) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - analysisDays);

    const dailyLogs = await DailyLog.find({
      userId,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ date: 1 });

    return dailyLogs.map(log => ({
      date: log.date.toISOString().split('T')[0],
      items: log.items.map(item => ({
        itemName: item.itemName,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
        calories: item.calories || 0,
        protein: item.protein || 0,
        carbs: item.carbs || 0,
        fats: item.fats || 0,
        fiber: item.fiber || 0,
        sugar: item.sugar || 0,
        sodium: item.sodium || 0,
        mealType: item.mealType
      })),
      totalNutrients: {
        calories: log.totalCalories,
        protein: log.totalProtein,
        carbs: log.totalCarbs,
        fats: log.totalFats,
        fiber: log.totalFiber,
        sugar: log.totalSugar,
        sodium: log.totalSodium
      }
    }));
  }

  private async getUserInventory(userId: string) {
    const inventoryItems = await Inventory.find({ userId }).lean();

    return inventoryItems.map(item => ({
      _id: item._id.toString(),
      itemName: item.itemName,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      expirationDate: item.expirationDate,
      daysUntilExpiration: item.expirationDate ?
        Math.max(0, Math.ceil((new Date(item.expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : -1,
      costPerUnit: item.costPerUnit
    }));
  }

  private async getFoodCatalog() {
    const catalogItems = await FoodInventory.find({}).lean();

    return catalogItems.map(item => ({
      _id: item._id.toString(),
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      costPerUnit: item.costPerUnit,
      nutritionalInfo: item.nutritionalInfo || {}
    }));
  }

  private async getAINutrientGapAnalysis(
    consumptionHistory: any[],
    userData: any,
    currentInventory: any[],
    foodCatalog: any[]
  ) {
    // Calculate daily averages
    const totalDays = consumptionHistory.length;
    const dailyAverages = consumptionHistory.reduce((acc, day) => {
      acc.calories += day.totalNutrients.calories;
      acc.protein += day.totalNutrients.protein;
      acc.carbs += day.totalNutrients.carbs;
      acc.fats += day.totalNutrients.fats;
      acc.fiber += day.totalNutrients.fiber;
      acc.sugar += day.totalNutrients.sugar;
      acc.sodium += day.totalNutrients.sodium;
      return acc;
    }, { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0, sugar: 0, sodium: 0 });

    Object.keys(dailyAverages).forEach(key => {
      dailyAverages[key] = dailyAverages[key] / totalDays;
    });

    // Format consumption data for AI
    const consumptionData = consumptionHistory.map(day => ({
      date: day.date,
      totalCalories: day.totalNutrients.calories,
      protein: day.totalNutrients.protein,
      carbs: day.totalNutrients.carbs,
      fats: day.totalNutrients.fats,
      fiber: day.totalNutrients.fiber,
      items: day.items.map(item =>
        `${item.itemName} (${item.category}): ${item.quantity} ${item.unit}, ${item.protein || 0}g protein, ${item.fiber || 0}g fiber`
      ).join(', ')
    }));

    const inventoryData = currentInventory.map(item =>
      `- ${item.itemName} (${item.category}): ${item.quantity} ${item.unit}, expires in ${item.daysUntilExpiration} days`
    ).join('\n');

    const catalogData = foodCatalog.slice(0, 50).map(item =>
      `- ${item.name} (${item.category}): $${item.costPerUnit.toFixed(2)}/unit, available`
    ).join('\n');

    const prompt = `
You are an advanced nutritionist and dietitian specializing in nutrient gap analysis. Analyze the user's consumption history and predict potential nutritional deficiencies.

USER PROFILE:
- Daily Calories Target: ${userData.caloriesPerDay} kcal
- Macro Targets: Protein ${userData.macroTargets.protein}%, Carbs ${userData.macroTargets.carbs}%, Fats ${userData.macroTargets.fats}%
- Dietary Restrictions: ${userData.dietaryRestrictions.length > 0 ? userData.dietaryRestrictions.join(', ') : 'None'}
- Preferences: ${userData.preferences.length > 0 ? userData.preferences.join(', ') : 'None'}

NUTRITIONAL REQUIREMENTS (Based on mealOptimizer standards):
Daily Targets for ${userData.caloriesPerDay} kcal diet:
- Calories: ${userData.caloriesPerDay} kcal (range: ${Math.round(userData.caloriesPerDay * 0.9)}-${Math.round(userData.caloriesPerDay * 1.1)} kcal)
- Protein: ${userData.macroTargets.protein}% of calories = ${Math.round(userData.caloriesPerDay * userData.macroTargets.protein / 100 / 4)}g (minimum: ${Math.round(userData.caloriesPerDay * 0.6 / 100 / 4)}g)
- Carbs: ${userData.macroTargets.carbs}% of calories = ${Math.round(userData.caloriesPerDay * userData.macroTargets.carbs / 100 / 4)}g (range: ${Math.round(userData.caloriesPerDay * (userData.macroTargets.carbs - 10) / 100 / 4)}-${Math.round(userData.caloriesPerDay * (userData.macroTargets.carbs + 10) / 100 / 4)}g)
- Fats: ${userData.macroTargets.fats}% of calories = ${Math.round(userData.caloriesPerDay * userData.macroTargets.fats / 100 / 9)}g (range: ${Math.round(userData.caloriesPerDay * (userData.macroTargets.fats - 5) / 100 / 9)}-${Math.round(userData.caloriesPerDay * (userData.macroTargets.fats + 5) / 100 / 9)}g)
- Fiber: Minimum 20g/day (optimal: 25-30g)
- Sodium: Maximum 2300mg/day
- Sugar: Maximum 50g/day (added sugars)
- Micronutrients focus: Iron (8mg men, 18mg women), Calcium (1000mg), Vitamin D (600IU), Vitamin C (90mg men, 75mg women)

MEAL STRUCTURE REQUIREMENTS:
- At least 1 fruit item daily
- At least 1 vegetable item daily
- At least 1 whole grain/complex carb daily
- At least 1 protein source daily
- At least 1 iron-rich item daily
- At least 1 calcium-rich item daily
- Maximum 3 servings of same food per day
- Include at least 2 different meal types per day

CONSUMPTION HISTORY (${totalDays} days):
Daily Averages: ${Math.round(dailyAverages.calories)} kcal, ${Math.round(dailyAverages.protein)}g protein, ${Math.round(dailyAverages.carbs)}g carbs, ${Math.round(dailyAverages.fats)}g fats, ${Math.round(dailyAverages.fiber)}g fiber

Detailed daily data:
${consumptionData.map(day => `${day.date}: ${day.totalCalories} kcal, ${day.items}`).join('\n')}

CURRENT INVENTORY:
${inventoryData}

AVAILABLE FOODS (Sample from catalog):
${catalogData}

ANALYSIS REQUIREMENTS:

1. NUTRIENT DEFICIENCY ANALYSIS:
   - Compare actual intake against recommended targets
   - Identify consistent deficiencies (>20% below target for 3+ days)
   - Calculate deficiency severity: mild (20-40% below), moderate (41-60% below), severe (>60% below)
   - Analyze trends: improving, worsening, or stable
   - Consider micronutrients (Iron, Calcium, Vitamin D, C, B-complex)

2. FOOD SUGGESTIONS STRATEGY:
   - Priority 1: Items from current inventory that can fill gaps
   - Priority 2: Items from food catalog matching preferences
   - Suggest specific quantities needed to meet targets
   - Consider dietary restrictions and avoid allergens
   - Prioritize items that address multiple deficiencies

3. MEAL SUGGESTIONS:
   - Create specific meal ideas combining available foods
   - Target identified deficiencies with ingredient combinations
   - Include preparation notes and nutrient focus
   - Consider meal timing and user preferences

4. HEALTH IMPLICATIONS:
   - Identify potential health risks from deficiencies
   - Focus on common deficiency-related issues
   - Provide practical, actionable advice
   - Consider prevention strategies

Return comprehensive JSON analysis:
{
  "nutrientAnalysis": [
    {
      "nutrient": "Protein",
      "currentIntake": number,
      "recommendedIntake": number,
      "deficiencyPercentage": number,
      "deficiencyLevel": "optimal|mild|moderate|severe",
      "trendDirection": "increasing|decreasing|stable",
      "daysDeficient": number,
      "healthImplications": ["implication1", "implication2"]
    }
  ],
  "foodSuggestions": [
    {
      "itemName": "specific food name",
      "category": "category",
      "quantity": number,
      "unit": "unit",
      "nutrients": {"protein": number, "fiber": number, "iron": number},
      "availability": "in_inventory|in_catalog|suggested_purchase",
      "reason": "why this food helps",
      "priority": "high|medium|low",
      "estimatedCost": number
    }
  ],
  "mealSuggestions": [
    {
      "mealType": "breakfast|lunch|dinner|snack",
      "name": "meal name",
      "ingredients": [
        {
          "itemName": "ingredient name",
          "quantity": number,
          "unit": "unit",
          "category": "category",
          "nutrients": {"protein": number, "fiber": number}
        }
      ],
      "totalNutrients": {"protein": number, "fiber": number},
      "targetNutrients": ["protein", "fiber"],
      "preparationNotes": "cooking instructions",
      "estimatedCost": number
    }
  ],
  "overallNutritionScore": number (0-100),
  "keyFindings": ["finding1", "finding2"],
  "recommendations": ["recommendation1", "recommendation2"],
  "priorityActions": ["action1", "action2"],
  "preventiveMeasures": ["measure1", "measure2"]
}

Focus on practical, actionable solutions that use available inventory first, then suggest additional purchases if needed.
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
        throw new Error('No response from AI for nutrient gap analysis');
      }

      const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
      const aiResponse = JSON.parse(cleanResponse);

      return aiResponse;

    } catch (error) {
      logger.error(`AI nutrient gap analysis error: ${(error as Error).message}`);
      // Fallback to basic analysis
      return this.getFallbackNutrientAnalysis(dailyAverages, userData, currentInventory, foodCatalog);
    }
  }

  private getFallbackNutrientAnalysis(
    dailyAverages: any,
    userData: any,
    currentInventory: any[],
    foodCatalog: any[]
  ) {
    // Basic fallback analysis
    const nutrientAnalysis = [
      {
        nutrient: 'Protein',
        currentIntake: dailyAverages.protein,
        recommendedIntake: userData.caloriesPerDay * userData.macroTargets.protein / 100 / 4,
        deficiencyPercentage: Math.max(0, (userData.caloriesPerDay * userData.macroTargets.protein / 100 / 4 - dailyAverages.protein) / (userData.caloriesPerDay * userData.macroTargets.protein / 100 / 4) * 100),
        deficiencyLevel: 'moderate' as const,
        trendDirection: 'stable' as const,
        daysDeficient: 15,
        healthImplications: ['Reduced muscle maintenance', 'Lower satiety levels']
      }
    ];

    const foodSuggestions = currentInventory.slice(0, 5).map(item => ({
      itemName: item.itemName,
      category: item.category,
      quantity: 1,
      unit: item.unit,
      nutrients: { protein: 10, fiber: 5 },
      availability: 'in_inventory' as const,
      reason: 'Available in inventory and provides essential nutrients',
      priority: 'medium' as const,
      estimatedCost: item.costPerUnit
    }));

    return {
      nutrientAnalysis,
      foodSuggestions,
      mealSuggestions: [],
      overallNutritionScore: 70,
      keyFindings: ['Basic analysis completed'],
      recommendations: ['Increase variety in diet', 'Track consumption more consistently'],
      priorityActions: ['Review daily protein intake'],
      preventiveMeasures: ['Maintain balanced diet']
    };
  }

  private generateNutrientGapResult(
    aiAnalysis: any,
    consumptionHistory: any[],
    userData: any,
    currentInventory: any[],
    analysisDays: number
  ): NutrientGapResult {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - analysisDays);

    const severeDeficiencies = aiAnalysis.nutrientAnalysis?.filter(
      (n: any) => n.deficiencyLevel === 'severe'
    ).length || 0;

    const dataCompleteness = Math.min(100, (consumptionHistory.length / analysisDays) * 100);

    return {
      summary: {
        analysisPeriod: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          totalDays: analysisDays
        },
        overallNutritionScore: aiAnalysis.overallNutritionScore || 70,
        totalDeficiencies: aiAnalysis.nutrientAnalysis?.length || 0,
        severeDeficiencies,
        dataCompleteness,
        userProfile: {
          caloriesPerDay: userData.caloriesPerDay,
          dietaryRestrictions: userData.dietaryRestrictions,
          preferences: userData.preferences
        }
      },
      nutrientAnalysis: aiAnalysis.nutrientAnalysis || [],
      foodSuggestions: aiAnalysis.foodSuggestions || [],
      mealSuggestions: aiAnalysis.mealSuggestions || [],
      insights: {
        keyFindings: aiAnalysis.keyFindings || ['Analysis completed'],
        recommendations: aiAnalysis.recommendations || ['Continue balanced diet'],
        priorityActions: aiAnalysis.priorityActions || ['Monitor nutrient intake'],
        preventiveMeasures: aiAnalysis.preventiveMeasures || ['Maintain variety in diet']
      }
    };
  }

  private getEmptyNutrientGapResult(userData: any, analysisDays: number): NutrientGapResult {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - analysisDays);

    return {
      summary: {
        analysisPeriod: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          totalDays: analysisDays
        },
        overallNutritionScore: 0,
        totalDeficiencies: 0,
        severeDeficiencies: 0,
        dataCompleteness: 0,
        userProfile: {
          caloriesPerDay: userData.caloriesPerDay,
          dietaryRestrictions: userData.dietaryRestrictions,
          preferences: userData.preferences
        }
      },
      nutrientAnalysis: [],
      foodSuggestions: [],
      mealSuggestions: [],
      insights: {
        keyFindings: ['No consumption data available for analysis'],
        recommendations: ['Start logging your food to get personalized nutrient recommendations'],
        priorityActions: ['Begin tracking daily food intake'],
        preventiveMeasures: ['Maintain balanced diet once tracking starts']
      }
    };
  }
}

export default new NutrientGapService();