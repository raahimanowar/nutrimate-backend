import { Groq } from 'groq-sdk';
import { logger } from '../utils/logger.js';
import FoodInventory from '../schemas/foodInventory.schema.js';
import Inventory from '../schemas/inventory.schema.js';
import { convertToBase, convertFromBase, formatQuantity } from '../utils/unitConverter.js';
import localPriceSearchService from './localPriceSearch.service.js';

interface UserProfile {
  budget: number;
  dietaryRestrictions?: string[];
  preferences?: string[];
  familySize?: number;
  weeklyBudget?: boolean;
  userLocation?: string;
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

interface LocalPriceInfo {
  itemName: string;
  localPrice?: {
    price: number;
    store: string;
    location: string;
    savings: number; // amount saved compared to FoodInventory
    isCheaper: boolean;
  };
  alternatives: Array<{
    name: string;
    category: string;
    price: number;
    unit: string;
    store: string;
    savings: number;
    nutritionalInfo: string;
  }>;
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
    inventoryStatus: 'in_inventory' | 'not_in_inventory' | 'low_stock' | 'needs_restock';
  };
  budgetImpact: {
    cost: number;
    remainingBudget: number;
    percentageUsed: number;
  };
  urgency: 'high' | 'medium' | 'low';
  localPriceInfo?: LocalPriceInfo;
}

interface OptimizationResult {
  summary: {
    totalBudget: number;
    allocatedBudget: number;
    remainingBudget: number;
    itemsRecommended: number;
    priorityCategories: string[];
    localSavings?: number; // total potential savings from local alternatives
  };
  recommendations: ShoppingRecommendation[];
  insights: {
    budgetOptimization: string;
    nutritionalFocus: string;
    costSavingTips: string[];
    mealPlanningSuggestions: string[];
    localPriceInsights?: string; // insights about local price advantages
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
      const aiRecommendations = await this.getAIRecommendations(analysis, userProfile, userInventory);

      // Step 5: Calculate budget allocation
      const optimizedRecommendations = this.optimizeForBudget(aiRecommendations, userProfile);

      // Step 6: Compare with local prices and find alternatives
      const recommendationsWithLocalPrices = await this.enhanceWithLocalPriceComparison(
        optimizedRecommendations,
        userProfile.userLocation
      );

      // Step 7: Generate final result
      return this.generateOptimizationResult(recommendationsWithLocalPrices, userProfile, userInventory, foodCatalog);

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

    // Create detailed inventory list with quantities
    const detailedInventoryList = userInventory.map(item =>
      `- ${item.name} (${item.quantity} ${item.unit}) - ${item.category} - $${(item.quantity * item.costPerUnit).toFixed(2)} total`
    ).join('\n');

    // Check what categories need restocking
    const categoryNeeds = this.analyzeCategoryNeeds(userInventory, foodCatalog);

    const familySize = userProfile.familySize || 1;
    const analysisPrompt = `
    User Profile Analysis:
    - Budget: $${totalBudget} (${userProfile.weeklyBudget ? 'monthly' : 'per shopping trip'})
    - Family Size: ${familySize} people
    - Dietary Restrictions: ${userProfile.dietaryRestrictions?.join(', ') || 'None'}
    - Current Inventory Value: $${inventoryValue.toFixed(2)}

    NUTRITIONAL REQUIREMENTS FOR ${familySize} PERSON(S):
    Daily Targets (multiply by ${familySize} for family):
    - Calories: 2000 kcal (range: 1800-2200 kcal)
    - Carbohydrates: 225-325g
    - Protein: 75-125g (minimum: 60g)
    - Fat: 45-80g
    - Fiber: 20g minimum
    - Unsaturated Fats: 15g minimum

    Required Daily Categories:
    - At least 1 fruit item
    - At least 1 vegetable item
    - At least 1 whole grain/complex carb
    - At least 1 protein source
    - At least 1 iron-rich item
    - At least 1 calcium-rich item

    Meal Structure Rules:
    - Max 3 servings of same food per day
    - At least 2 different meal types per day
    - No meal below 250 kcal

    CURRENT INVENTORY (Do NOT recommend these items):
    ${detailedInventoryList}

    INVENTORY ANALYSIS:
    ${categoryNeeds}

    Available Food Categories in Catalog:
    ${Object.entries(this.groupCatalogByCategory(foodCatalog)).map(([category, items]) =>
      `- ${category}: ${items.length} different options, avg cost: $${(items.reduce((sum, item) => sum + item.costPerUnit, 0) / items.length).toFixed(2)} per unit`
    ).join('\n')}

    CRITICAL INSTRUCTIONS:
    1. ONLY recommend food items the user does NOT already have in their inventory
    2. Focus on categories where the user has low quantities or missing items
    3. Consider expiration dates - recommend buying fresh items that will last
    4. Analyze what they need for balanced meals based on current inventory gaps
    5. If they have sufficient quantity of an item, DO NOT recommend buying more
    6. Ensure recommendations help achieve ALL nutritional targets listed above

    Analyze the nutritional gaps and provide insights about what this user needs to purchase for balanced meals that meet all nutritional requirements, avoiding items they already have.
    `;

    return analysisPrompt;
  }

  private analyzeCategoryNeeds(userInventory: FoodItem[], foodCatalog: FoodItem[]): string {
    const inventoryByCategory = this.groupInventoryByCategory(userInventory);
    const needs: string[] = [];

    // Analyze each category
    Object.entries(inventoryByCategory).forEach(([category, items]) => {
      const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
      const uniqueItems = items.length;

      if (category === 'protein' && totalQuantity < 5) {
        needs.push(`- PROTEINS: Low stock (${totalQuantity.toFixed(1)} total units, ${uniqueItems} different items). Need to restock.`);
      } else if (category === 'vegetables' && totalQuantity < 10) {
        needs.push(`- VEGETABLES: Insufficient fresh produce (${totalQuantity.toFixed(1)} total units). Recommend buying more.`);
      } else if (category === 'fruits' && totalQuantity < 8) {
        needs.push(`- FRUITS: Low quantity (${totalQuantity.toFixed(1)} total units). Add variety for vitamins.`);
      } else if (category === 'grains' && totalQuantity < 5) {
        needs.push(`- GRAINS: Running low (${totalQuantity.toFixed(1)} total units). Staples needed.`);
      } else if (category === 'dairy' && totalQuantity < 3) {
        needs.push(`- DAIRY: Limited supply (${totalQuantity.toFixed(1)} total units). Consider restocking.`);
      } else if (uniqueItems <= 1 && category !== 'snacks') {
        needs.push(`- ${category.toUpperCase()}: Low variety (${uniqueItems} item${uniqueItems !== 1 ? 's' : ''}). Add more variety for nutrition.`);
      } else {
        needs.push(`- ${category.toUpperCase()}: Well stocked (${totalQuantity.toFixed(1)} total units, ${uniqueItems} different items).`);
      }
    });

    // Check for missing categories
    const allCategories = ['protein', 'vegetables', 'fruits', 'grains', 'dairy'];
    const presentCategories = Object.keys(inventoryByCategory);

    allCategories.forEach(category => {
      if (!presentCategories.includes(category)) {
        needs.push(`- ${category.toUpperCase()}: COMPLETELY MISSING. This is a priority category.`);
      }
    });

    return needs.join('\n');
  }

  private isInInventory(userInventory: FoodItem[], itemName: string): boolean {
    return userInventory.some(item =>
      item.name.toLowerCase() === itemName.toLowerCase() ||
      item.name.toLowerCase().includes(itemName.toLowerCase()) ||
      itemName.toLowerCase().includes(item.name.toLowerCase())
    );
  }

  private async getAIRecommendations(analysis: string, userProfile: UserProfile, userInventory: FoodItem[]): Promise<ShoppingRecommendation[]> {
    const totalBudget = userProfile.weeklyBudget ? userProfile.budget * 4 : userProfile.budget;
    const familySize = userProfile.familySize || 1;

    const prompt = `
    You are a nutritionist and budget advisor who considers local price advantages. Based on this analysis, recommend specific food items to purchase:

    ${analysis}

    LOCAL PRICE ADVISORY:
    When recommending items, consider that local market prices may be more favorable for certain items.
    Be flexible with brand and type recommendations to allow for better local deals.
    Prioritize items that typically have good local availability and competitive pricing.

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
          "alternativeOptions": ["alternative 1", "alternative 2"],
          "inventoryStatus": "not_in_inventory"
        }
      ]
    }

    STRICT NUTRITION REQUIREMENTS (Must Be Satisfied):

    Daily Calorie Target: 2000 kcal (Acceptable range: 1800–2200 kcal)

    Macronutrient Rules:
    - Total Carbohydrates: must be between 225–325g
    - Total Protein: must be between 75–125g (Hard minimum: 60g/day - never lower)
    - Total Fat: must be between 45–80g
    - Fiber: must be at least 20g/day
    - Healthy Unsaturated Fats: must be at least 15g/day

    Micronutrient Presence Rules (Each day must contain at least one item from each category):
    - At least 1 fruit item
    - At least 1 vegetable item
    - At least 1 whole grain or complex carbohydrate (e.g., brown rice, oats, quinoa, whole-wheat bread)
    - At least 1 protein source (e.g., chicken, eggs, lentils, fish, tofu)
    - At least 1 iron-rich item (e.g., spinach, lentils, chickpeas, beef)
    - At least 1 calcium-rich item (e.g., milk, yogurt, tofu, cheese)

    Meal Structure Rules:
    - Maximum 3 servings of the same food item per day
    - Must include at least 2 different meal types per day (breakfast + lunch, or lunch + dinner)
    - No meal may be below 250 kcal

    Strict Compliance:
    - If any condition is not met, revise the meal plan until all rules are satisfied
    - Never ignore or relax a rule
    - The rules apply whether you are generating, optimizing, or adjusting the plan

    CRITICAL INVENTORY RULES:
    1. NEVER recommend items that are already in the user's inventory (listed under "CURRENT INVENTORY")
    2. Focus on categories with "LOW STOCK", "INSUFFICIENT", or "COMPLETELY MISSING"
    3. If a category is "WELL STOCKED", do not recommend items from that category unless variety is needed
    4. Avoid recommending the same item names as those in inventory (exact matching or very similar)
    5. Always set "inventoryStatus": "not_in_inventory" since we only recommend what they need to buy

    Additional Guidelines:
    - Stay within the $${totalBudget} budget
    - Consider family size of ${familySize} (multiply nutrition requirements by family size)
    - Account for dietary restrictions: ${userProfile.dietaryRestrictions?.join(', ') || 'None'}
    - Focus on cost-effective, nutrient-dense options
    - Include staple items and versatile ingredients that complement existing inventory
    - Consider shelf life and storage
    - Ensure nutritional completeness by filling gaps in existing inventory
    - Be flexible with specific brands/types to allow for better local pricing
    - Consider items that typically have seasonal or local market advantages

    NUTRITIONAL ANALYSIS REQUIREMENT:
    For each recommendation, explain how it contributes to meeting the specific nutrition requirements above.
    Consider the nutritional gaps in the user's current inventory and recommend items that help achieve ALL nutritional targets.

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

      // Filter out recommendations that conflict with user's inventory
      const filteredRecommendations = aiResponse.recommendations.filter((rec: any) =>
        !this.isInInventory(userInventory, rec.name)
      ).map((rec: any) => ({
        item: {
          name: rec.name,
          category: rec.category,
          quantity: rec.quantity,
          unit: rec.unit,
          costPerUnit: rec.costPerUnit,
          totalCost: rec.totalCost,
          reason: rec.reason,
          nutritionalValue: rec.nutritionalValue,
          alternativeOptions: rec.alternativeOptions || [],
          inventoryStatus: 'not_in_inventory'
        },
        budgetImpact: {
          cost: rec.totalCost,
          remainingBudget: 0, // Will be calculated later
          percentageUsed: 0    // Will be calculated later
        },
        urgency: rec.urgency || 'medium'
      }));

      return filteredRecommendations;

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
        alternativeOptions: [],
        inventoryStatus: 'not_in_inventory' as const
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

  private async enhanceWithLocalPriceComparison(
  recommendations: ShoppingRecommendation[],
  userLocation?: string
): Promise<ShoppingRecommendation[]> {
    try {
      const enhancedRecommendations = await Promise.all(
        recommendations.map(async (rec) => {
          try {
            // Search for local prices
            const localPriceResult = await localPriceSearchService.searchLocalPrices(
              rec.item.name,
              rec.item.costPerUnit,
              userLocation
            );

            // Find alternatives if local price is cheaper or if no local price found
            const alternatives = localPriceResult?.priceComparison.isCheaper ?
              await localPriceSearchService.findCheaperAlternatives(
                rec.item.category,
                rec.item.costPerUnit,
                userLocation
              ) : [];

            const localPriceInfo: LocalPriceInfo = {
              itemName: rec.item.name,
              localPrice: localPriceResult ? {
                price: localPriceResult.localPrice,
                store: localPriceResult.localStore,
                location: localPriceResult.location,
                savings: rec.item.costPerUnit - localPriceResult.localPrice,
                isCheaper: localPriceResult.priceComparison.isCheaper
              } : undefined,
              alternatives: alternatives.map(alt => ({
                name: alt.name,
                category: alt.category,
                price: alt.localPrice,
                unit: alt.unit,
                store: alt.store,
                savings: alt.savings,
                nutritionalInfo: alt.nutritionalInfo || 'Nutritious alternative'
              }))
            };

            return {
              ...rec,
              localPriceInfo
            };

          } catch (error) {
            logger.warn(`Local price comparison failed for ${rec.item.name}: ${(error as Error).message}`);
            return rec; // Return original recommendation if local search fails
          }
        })
      );

      return enhancedRecommendations;

    } catch (error) {
      logger.error(`Local price enhancement error: ${(error as Error).message}`);
      return recommendations; // Return original recommendations if enhancement fails
    }
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

    // Calculate local savings
    const localSavings = recommendations.reduce((total, rec) => {
      if (rec.localPriceInfo?.localPrice?.isCheaper) {
        return total + rec.localPriceInfo.localPrice.savings * rec.item.quantity;
      }
      return total;
    }, 0);

    // Count recommendations with local price advantages
    const itemsWithLocalAdvantages = recommendations.filter(rec =>
      rec.localPriceInfo?.localPrice?.isCheaper ||
      (rec.localPriceInfo?.alternatives && rec.localPriceInfo.alternatives.length > 0)
    ).length;

    return {
      summary: {
        totalBudget,
        allocatedBudget,
        remainingBudget,
        itemsRecommended: recommendations.length,
        priorityCategories: this.getPriorityCategories(recommendations),
        localSavings: localSavings > 0 ? localSavings : undefined
      },
      recommendations,
      insights: {
        budgetOptimization: this.generateBudgetInsights(allocatedBudget, totalBudget, recommendations),
        nutritionalFocus: this.generateNutritionalInsights(recommendations, inventoryCategories),
        costSavingTips: this.generateCostSavingTips(recommendations, userProfile),
        mealPlanningSuggestions: this.generateMealPlanningSuggestions(recommendations, userInventory),
        localPriceInsights: this.generateLocalPriceInsights(recommendations, itemsWithLocalAdvantages)
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

  private generateLocalPriceInsights(recommendations: ShoppingRecommendation[], itemsWithAdvantages: number): string {
    if (itemsWithAdvantages === 0) {
      return 'Current FoodInventory prices appear competitive with local market rates. Consider online shopping convenience benefits.';
    }

    const itemsWithCheaperLocal = recommendations.filter(rec =>
      rec.localPriceInfo?.localPrice?.isCheaper
    ).length;

    const totalPotentialSavings = recommendations.reduce((total, rec) => {
      if (rec.localPriceInfo?.localPrice?.isCheaper) {
        return total + (rec.localPriceInfo.localPrice.savings * rec.item.quantity);
      }
      return total;
    }, 0);

    let insight = `${itemsWithAdvantages} of ${recommendations.length} recommended items have potential local savings advantages.`;

    if (itemsWithCheaperLocal > 0) {
      insight += ` ${itemsWithCheaperLocal} items are available at lower local prices, potentially saving you $${totalPotentialSavings.toFixed(2)}.`;
    }

    const itemsWithAlternatives = recommendations.filter(rec =>
      rec.localPriceInfo?.alternatives && rec.localPriceInfo.alternatives.length > 0
    ).length;

    if (itemsWithAlternatives > 0) {
      insight += ` ${itemsWithAlternatives} items have cheaper local alternatives available. Consider budget-friendly substitutes to maximize savings.`;
    }

    insight += ' Check local stores for seasonal promotions and bulk discounts to optimize your grocery budget further.';

    return insight;
  }
}

export default new MealOptimizerService();