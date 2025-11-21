import { Groq } from 'groq-sdk';
import { logger } from '../utils/logger.js';
import FoodInventory from '../schemas/foodInventory.schema.js';
import Inventory from '../schemas/inventory.schema.js';
import { convertToBase, convertFromBase, formatQuantity } from '../utils/unitConverter.js';

interface UserProfile {
  budget: number;
  dietaryRestrictions?: string[];
  preferences?: string[];
  familySize?: number;
  weeklyBudget?: boolean;
}

interface FoodItem {
  _id: string;
  name: string;
  category: string;
  expirationDays: number;
  costPerUnit: number;
  quantity: number;
  unit: string;
}

interface ShoppingRecommendation {
  item: {
    name: string;
    category: string;
    quantity: number;
    unit: string;
    costPerUnit: number;
    totalCost: number;
    reason: string;
    nutritionalValue: string;
    alternativeOptions?: string[];
  };
  budgetImpact: {
    cost: number;
    remainingBudget: number;
    percentageUsed: number;
  };
  urgency: 'high' | 'medium' | 'low';
}

interface OptimizationResult {
  summary: {
    totalBudget: number;
    allocatedBudget: number;
    remainingBudget: number;
    itemsRecommended: number;
    priorityCategories: string[];
  };
  recommendations: ShoppingRecommendation[];
  insights: {
    budgetOptimization: string;
    nutritionalFocus: string;
    costSavingTips: string[];
    mealPlanningSuggestions: string[];
  };
  currentInventory: {
    totalItems: number;
    totalValue: number;
    categories: Record<string, number>;
  };
}

class MealOptimizerService {
  private groq: Groq;

  constructor() {
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });
  }

  async optimizeMeals(userId: string, userProfile: UserProfile): Promise<OptimizationResult> {
    try {
      logger.info(`Starting meal optimization for user ${userId}`);

      // Step 1: Get user's current inventory
      const userInventory = await this.getUserInventory(userId);

      // Step 2: Get available food catalog
      const foodCatalog = await this.getFoodCatalog();

      // Step 3: Analyze gaps and opportunities
      const analysis = await this.analyzeNutritionalNeeds(userInventory, foodCatalog, userProfile);

      // Step 4: Get AI-powered recommendations
      const aiRecommendations = await this.getAIRecommendations(analysis, userProfile);

      // Step 5: Calculate budget allocation
      const optimizedRecommendations = this.optimizeForBudget(aiRecommendations, userProfile);

      // Step 6: Generate final result
      return this.generateOptimizationResult(optimizedRecommendations, userProfile, userInventory, foodCatalog);

    } catch (error) {
      logger.error(`Meal optimization error: ${(error as Error).message}`);
      throw new Error(`Failed to optimize meals: ${(error as Error).message}`);
    }
  }

  private async getUserInventory(userId: string): Promise<FoodItem[]> {
    const inventoryItems = await Inventory.find({ userId }).lean();

    return inventoryItems.map(item => ({
      _id: item._id.toString(),
      name: item.itemName,
      category: item.category,
      expirationDays: item.expirationDate ?
        Math.max(1, Math.ceil((new Date(item.expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 30,
      costPerUnit: item.costPerUnit,
      quantity: convertFromBase(item.baseQuantity || 1, item.unit || 'pieces'),
      unit: item.unit || 'pieces'
    }));
  }

  private async getFoodCatalog(): Promise<FoodItem[]> {
    const catalogItems = await FoodInventory.find({}).lean();

    return catalogItems.map(item => ({
      _id: item._id.toString(),
      name: item.name,
      category: item.category,
      expirationDays: item.expirationDays,
      costPerUnit: item.costPerUnit,
      quantity: item.quantity,
      unit: 'pieces' // Default unit for catalog items
    }));
  }

  private async analyzeNutritionalNeeds(
    userInventory: FoodItem[],
    foodCatalog: FoodItem[],
    userProfile: UserProfile
  ): Promise<string> {
    const currentInventoryByCategory = this.groupInventoryByCategory(userInventory);
    const totalBudget = userProfile.weeklyBudget ? userProfile.budget * 4 : userProfile.budget;
    const inventoryValue = userInventory.reduce((total, item) => total + (item.quantity * item.costPerUnit), 0);

    const analysisPrompt = `
    User Profile Analysis:
    - Budget: $${totalBudget} (${userProfile.weeklyBudget ? 'monthly' : 'per shopping trip'})
    - Family Size: ${userProfile.familySize || 1} people
    - Dietary Restrictions: ${userProfile.dietaryRestrictions?.join(', ') || 'None'}
    - Current Inventory Value: $${inventoryValue.toFixed(2)}

    Current Inventory by Category:
    ${Object.entries(currentInventoryByCategory).map(([category, items]) =>
      `- ${category}: ${items.length} items, total value: $${items.reduce((sum, item) => sum + (item.quantity * item.costPerUnit), 0).toFixed(2)}`
    ).join('\n')}

    Available Food Categories in Catalog:
    ${Object.entries(this.groupCatalogByCategory(foodCatalog)).map(([category, items]) =>
      `- ${category}: ${items.length} different options, avg cost: $${(items.reduce((sum, item) => sum + item.costPerUnit, 0) / items.length).toFixed(2)} per unit`
    ).join('\n')}

    Analyze the nutritional gaps and provide insights about what this user needs to prioritize for balanced meals based on their inventory and budget.
    `;

    return analysisPrompt;
  }

  private async getAIRecommendations(analysis: string, userProfile: UserProfile): Promise<ShoppingRecommendation[]> {
    const totalBudget = userProfile.weeklyBudget ? userProfile.budget * 4 : userProfile.budget;
    const familySize = userProfile.familySize || 1;

    const prompt = `
    You are a nutritionist and budget advisor. Based on this analysis, recommend specific food items to purchase:

    ${analysis}

    Please provide exactly 8-10 specific food recommendations in JSON format:
    {
      "recommendations": [
        {
          "name": "specific food item name",
          "category": "category",
          "quantity": number,
          "unit": "kg/g/pieces/etc",
          "costPerUnit": estimated price per unit,
          "totalCost": estimated total cost,
          "reason": "why this is recommended",
          "nutritionalValue": "key nutritional benefits",
          "urgency": "high/medium/low",
          "alternativeOptions": ["alternative 1", "alternative 2"]
        }
      ]
    }

    Guidelines:
    - Stay within the $${totalBudget} budget
    - Consider family size of ${familySize}
    - Prioritize nutritional completeness
    - Include variety across food groups
    - Consider shelf life and storage
    - Account for dietary restrictions: ${userProfile.dietaryRestrictions?.join(', ') || 'None'}
    - Focus on cost-effective, nutrient-dense options
    - Include staple items and versatile ingredients

    Return ONLY valid JSON, no additional text.
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
        temperature: 0.7,
        max_completion_tokens: 4000,
        top_p: 1,
        stream: false,
        reasoning_effort: 'medium',
        stop: null
      });

      const response = chatCompletion.choices[0]?.message?.content;

      if (!response) {
        throw new Error('No response from AI');
      }

      // Clean and parse the response
      const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
      const aiResponse = JSON.parse(cleanResponse);

      return aiResponse.recommendations.map((rec: any) => ({
        item: {
          name: rec.name,
          category: rec.category,
          quantity: rec.quantity,
          unit: rec.unit,
          costPerUnit: rec.costPerUnit,
          totalCost: rec.totalCost,
          reason: rec.reason,
          nutritionalValue: rec.nutritionalValue,
          alternativeOptions: rec.alternativeOptions || []
        },
        budgetImpact: {
          cost: rec.totalCost,
          remainingBudget: 0, // Will be calculated later
          percentageUsed: 0    // Will be calculated later
        },
        urgency: rec.urgency || 'medium'
      }));

    } catch (error) {
      logger.error(`AI recommendation error: ${(error as Error).message}`);
      // Fallback to basic recommendations
      return this.getFallbackRecommendations(totalBudget);
    }
  }

  private getFallbackRecommendations(budget: number): ShoppingRecommendation[] {
    const fallbackItems = [
      {
        name: 'Rice',
        category: 'grains',
        quantity: 5,
        unit: 'kg',
        costPerUnit: 2.5,
        totalCost: 12.50,
        reason: 'Essential staple, versatile for many meals',
        nutritionalValue: 'Carbohydrates for energy',
        urgency: 'high' as const
      },
      {
        name: 'Chicken Breast',
        category: 'protein',
        quantity: 2,
        unit: 'kg',
        costPerUnit: 6.0,
        totalCost: 12.00,
        reason: 'Lean protein source, versatile',
        nutritionalValue: 'High protein, low fat',
        urgency: 'high' as const
      },
      {
        name: 'Mixed Vegetables',
        category: 'vegetables',
        quantity: 3,
        unit: 'kg',
        costPerUnit: 3.0,
        totalCost: 9.00,
        reason: 'Essential vitamins and minerals',
        nutritionalValue: 'Vitamins, fiber, minerals',
        urgency: 'high' as const
      }
    ];

    return fallbackItems.map(item => ({
      item: {
        ...item,
        alternativeOptions: []
      },
      budgetImpact: {
        cost: item.totalCost,
        remainingBudget: 0,
        percentageUsed: 0
      },
      urgency: item.urgency
    })).filter(item => item.item.totalCost <= budget);
  }

  private optimizeForBudget(
    recommendations: ShoppingRecommendation[],
    userProfile: UserProfile
  ): ShoppingRecommendation[] {
    const totalBudget = userProfile.weeklyBudget ? userProfile.budget * 4 : userProfile.budget;
    let remainingBudget = totalBudget;

    // Sort by urgency (high first) then by cost-effectiveness
    const sortedRecommendations = recommendations.sort((a, b) => {
      const urgencyOrder = { high: 3, medium: 2, low: 1 };
      const urgencyDiff = urgencyOrder[b.urgency] - urgencyOrder[a.urgency];

      if (urgencyDiff !== 0) return urgencyDiff;

      // If same urgency, prioritize better value
      const valueA = a.item.totalCost / a.item.quantity;
      const valueB = b.item.totalCost / b.item.quantity;
      return valueA - valueB;
    });

    // Allocate budget
    const optimizedRecommendations: ShoppingRecommendation[] = [];

    for (const rec of sortedRecommendations) {
      if (remainingBudget >= rec.item.totalCost) {
        const budgetImpact = {
          cost: rec.item.totalCost,
          remainingBudget: remainingBudget - rec.item.totalCost,
          percentageUsed: (rec.item.totalCost / totalBudget) * 100
        };

        optimizedRecommendations.push({
          ...rec,
          budgetImpact
        });

        remainingBudget -= rec.item.totalCost;
      } else if (remainingBudget > 0) {
        // Try to get a smaller quantity if possible
        const adjustedQuantity = Math.floor((remainingBudget / rec.item.costPerUnit) * 10) / 10;
        if (adjustedQuantity >= 0.5) { // Minimum purchase quantity
          const adjustedCost = adjustedQuantity * rec.item.costPerUnit;
          const budgetImpact = {
            cost: adjustedCost,
            remainingBudget: remainingBudget - adjustedCost,
            percentageUsed: (adjustedCost / totalBudget) * 100
          };

          optimizedRecommendations.push({
            ...rec,
            item: {
              ...rec.item,
              quantity: adjustedQuantity,
              totalCost: adjustedCost,
              reason: `${rec.item.reason} (adjusted for budget)`
            },
            budgetImpact
          });

          remainingBudget = 0;
        }
      }
    }

    return optimizedRecommendations;
  }

  private generateOptimizationResult(
    recommendations: ShoppingRecommendation[],
    userProfile: UserProfile,
    userInventory: FoodItem[],
    foodCatalog: FoodItem[]
  ): OptimizationResult {
    const totalBudget = userProfile.weeklyBudget ? userProfile.budget * 4 : userProfile.budget;
    const allocatedBudget = recommendations.reduce((sum, rec) => sum + rec.budgetImpact.cost, 0);
    const remainingBudget = totalBudget - allocatedBudget;

    const inventoryCategories = this.groupInventoryByCategory(userInventory);
    const totalInventoryValue = userInventory.reduce((sum, item) => sum + (item.quantity * item.costPerUnit), 0);

    return {
      summary: {
        totalBudget,
        allocatedBudget,
        remainingBudget,
        itemsRecommended: recommendations.length,
        priorityCategories: this.getPriorityCategories(recommendations)
      },
      recommendations,
      insights: {
        budgetOptimization: this.generateBudgetInsights(allocatedBudget, totalBudget, recommendations),
        nutritionalFocus: this.generateNutritionalInsights(recommendations, inventoryCategories),
        costSavingTips: this.generateCostSavingTips(recommendations, userProfile),
        mealPlanningSuggestions: this.generateMealPlanningSuggestions(recommendations, userInventory)
      },
      currentInventory: {
        totalItems: userInventory.length,
        totalValue: totalInventoryValue,
        categories: Object.fromEntries(
          Object.entries(inventoryCategories).map(([cat, items]) => [cat, items.length])
        )
      }
    };
  }

  private groupInventoryByCategory(inventory: FoodItem[]): Record<string, FoodItem[]> {
    return inventory.reduce((groups, item) => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
      return groups;
    }, {} as Record<string, FoodItem[]>);
  }

  private groupCatalogByCategory(catalog: FoodItem[]): Record<string, FoodItem[]> {
    return catalog.reduce((groups, item) => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
      return groups;
    }, {} as Record<string, FoodItem[]>);
  }

  private getPriorityCategories(recommendations: ShoppingRecommendation[]): string[] {
    const categoryCount = recommendations.reduce((counts, rec) => {
      counts[rec.item.category] = (counts[rec.item.category] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    return Object.entries(categoryCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([category]) => category);
  }

  private generateBudgetInsights(allocated: number, total: number, recommendations: ShoppingRecommendation[]): string {
    const percentageUsed = (allocated / total) * 100;
    const avgItemCost = allocated / recommendations.length;

    return `You're utilizing ${percentageUsed.toFixed(1)}% of your $${total.toFixed(2)} budget.
    The average cost per recommended item is $${avgItemCost.toFixed(2)}.
    ${percentageUsed > 80 ? 'Budget is well utilized with strategic selections.' :
      'There\'s room to add more items or increase quantities.'}`;
  }

  private generateNutritionalInsights(recommendations: ShoppingRecommendation[], inventory: Record<string, FoodItem[]>): string {
    const recCategories = new Set(recommendations.map(r => r.item.category));
    const invCategories = Object.keys(inventory);

    const gaps = this.getCategoryGaps(invCategories, Array.from(recCategories));

    return `Your shopping plan focuses on ${Array.from(recCategories).join(', ')}.
    ${gaps.length > 0 ? `Consider adding ${gaps.join(', ')} for complete nutrition.` :
      'Good balance across food groups for optimal nutrition.'}`;
  }

  private getCategoryGaps(inventory: string[], recommended: string[]): string[] {
    const allCategories = ['fruits', 'vegetables', 'grains', 'protein', 'dairy', 'beverages', 'snacks'];
    const combined = [...inventory, ...recommended];
    return allCategories.filter(cat => !combined.includes(cat));
  }

  private generateCostSavingTips(recommendations: ShoppingRecommendation[], userProfile: UserProfile): string[] {
    const tips = [
      'Buy in bulk for non-perishable items to save 15-30%',
      'Consider seasonal produce for better prices and freshness',
      'Compare unit prices to find best value',
      'Store brands often offer same quality at 20-30% less cost'
    ];

    if (userProfile.familySize && userProfile.familySize > 2) {
      tips.push('Family packs offer better value for larger households');
    }

    const highUrgencyItems = recommendations.filter(r => r.urgency === 'high').length;
    if (highUrgencyItems > 3) {
      tips.push('Focus on high-priority items first, spread other purchases across multiple shopping trips');
    }

    return tips;
  }

  private generateMealPlanningSuggestions(recommendations: ShoppingRecommendation[], inventory: FoodItem[]): string[] {
    const suggestions = [
      'Plan 3-4 days worth of meals to reduce food waste',
      'Prep ingredients in batches for efficient cooking',
      'Use similar ingredients across multiple meals'
    ];

    const proteinItems = recommendations.filter(r => r.item.category === 'protein');
    const grainItems = recommendations.filter(r => r.item.category === 'grains');

    if (proteinItems.length > 0 && grainItems.length > 0) {
      suggestions.push('Combine grains with proteins for balanced, filling meals');
    }

    const inventoryCount = inventory.length;
    if (inventoryCount > 15) {
      suggestions.push('Use existing inventory first to minimize waste and save money');
    }

    return suggestions;
  }
}

export default new MealOptimizerService();