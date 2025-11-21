import { Groq } from 'groq-sdk';
import { logger } from '../utils/logger.js';
import Inventory from '../schemas/inventory.schema.js';
import User from '../schemas/users.schema.js';
import { convertFromBase } from '../utils/unitConverter.js';

interface ExpirationRiskItem {
  _id: string;
  itemName: string;
  category: string;
  quantity: number;
  unit: string;
  expirationDate: Date | null;
  hasExpiration: boolean;
  costPerUnit: number;
  daysUntilExpiration: number;
  ageInInventory: number;
}

interface ConsumptionPattern {
  category: string;
  averageDailyConsumption: number;
  consumptionFrequency: string;
  typicalShelfLife: number;
}

interface SeasonalFactors {
  currentSeason: string;
  temperature: 'warm' | 'moderate' | 'cold';
  humidityFactor: number;
  seasonalAdjustments: {
    [category: string]: {
      multiplier: number;
      reason: string;
    };
  };
}

interface RiskPrediction {
  item: {
    _id: string;
    itemName: string;
    category: string;
    quantity: number;
    unit: string;
    expirationDate: Date | null;
    daysUntilExpiration: number;
    estimatedValue: number;
  };
  riskAnalysis: {
    overallRiskScore: number; // 0-100
    expirationRisk: 'critical' | 'high' | 'medium' | 'low';
    consumptionUrgency: 'immediate' | 'soon' | 'moderate' | 'flexible';
    seasonalityRisk: 'increased' | 'normal' | 'decreased';
    aiRiskScore: number; // AI-calculated risk factor
  };
  recommendations: {
    consumeBy: string;
    consumptionPriority: number; // 1-10, where 1 is highest priority
    storageTips: string[];
    alternativeUses: string[];
    alertLevel: 'red' | 'orange' | 'yellow' | 'green';
  };
  reasoning: {
    primaryReason: string;
    contributingFactors: string[];
    seasonalityImpact: string;
    consumptionPatternAnalysis: string;
  };
}

interface ExpirationPredictionResult {
  summary: {
    totalItemsAtRisk: number;
    criticalItems: number;
    highRiskItems: number;
    estimatedPotentialLoss: number;
    userLocation: string;
    currentSeason: string;
    analysisDate: Date;
  };
  riskPredictions: RiskPrediction[];
  consumptionPriority: Array<{
    itemName: string;
    priority: number;
    reason: string;
    alertLevel: string;
  }>;
  insights: {
    overallRiskLevel: 'low' | 'moderate' | 'high' | 'critical';
    seasonalAlerts: string[];
    consumptionTips: string[];
    wastePreventionStrategies: string[];
  };
}

class ExpirationRiskService {
  private groq: Groq;

  constructor() {
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });
  }

  async predictExpirationRisks(userId: string): Promise<ExpirationPredictionResult> {
    try {
      logger.info(`Starting expiration risk prediction for user ${userId}`);

      // Step 1: Get user data and location
      const userData = await this.getUserData(userId);

      // Step 2: Get user's inventory items
      const inventoryItems = await this.getUserInventory(userId);

      // Step 3: Analyze consumption patterns
      const consumptionPatterns = await this.analyzeConsumptionPatterns(inventoryItems);

      // Step 4: Determine seasonal factors based on user location
      const seasonalFactors = this.calculateSeasonalFactors(userData);

      // Step 5: Get AI-powered risk predictions
      const aiPredictions = await this.getAIRiskPredictions(
        inventoryItems,
        consumptionPatterns,
        seasonalFactors,
        userData
      );

      // Step 6: Generate comprehensive result
      return this.generatePredictionResult(aiPredictions, inventoryItems, seasonalFactors, userData);

    } catch (error) {
      logger.error(`Expiration risk prediction error: ${(error as Error).message}`);
      throw new Error(`Failed to predict expiration risks: ${(error as Error).message}`);
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
      location: {
        country: user.address?.country || 'Unknown',
        city: user.address?.city || 'Unknown'
      },
      dietaryNeeds: user.dietaryNeeds,
      householdSize: user.householdSize || 1
    };
  }

  private async getUserInventory(userId: string): Promise<ExpirationRiskItem[]> {
    const inventoryItems = await Inventory.find({
      userId,
      hasExpiration: true
    }).lean();

    const now = new Date();

    return inventoryItems.map(item => ({
      _id: item._id.toString(),
      itemName: item.itemName,
      category: item.category,
      quantity: convertFromBase(item.baseQuantity || 1, item.unit || 'pieces'),
      unit: item.unit || 'pieces',
      expirationDate: item.expirationDate,
      hasExpiration: item.hasExpiration,
      costPerUnit: item.costPerUnit,
      daysUntilExpiration: item.expirationDate ?
        Math.max(0, Math.ceil((new Date(item.expirationDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : -1,
      ageInInventory: Math.ceil((now.getTime() - new Date(item.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    }));
  }

  private async analyzeConsumptionPatterns(items: ExpirationRiskItem[]): Promise<ConsumptionPattern[]> {
    // This is a simplified version - in a real implementation, you'd analyze historical data
    const categoryGroups = items.reduce((groups, item) => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
      return groups;
    }, {} as Record<string, ExpirationRiskItem[]>);

    return Object.entries(categoryGroups).map(([category, categoryItems]) => {
      // Estimate consumption based on age and quantity patterns
      const totalQuantity = categoryItems.reduce((sum, item) => sum + item.quantity, 0);
      const averageAge = categoryItems.reduce((sum, item) => sum + item.ageInInventory, 0) / categoryItems.length;

      // Estimate daily consumption based on typical usage patterns
      let averageDailyConsumption = 0;
      let consumptionFrequency = 'rare';

      switch (category) {
        case 'fruits':
          averageDailyConsumption = Math.max(0.5, totalQuantity / 7); // Assume fruits last 7 days
          consumptionFrequency = 'daily';
          break;
        case 'vegetables':
          averageDailyConsumption = Math.max(0.3, totalQuantity / 10); // Assume vegetables last 10 days
          consumptionFrequency = 'daily';
          break;
        case 'dairy':
          averageDailyConsumption = Math.max(0.2, totalQuantity / 14); // Assume dairy lasts 14 days
          consumptionFrequency = 'daily';
          break;
        case 'protein':
          averageDailyConsumption = Math.max(0.1, totalQuantity / 21); // Assume proteins last 21 days
          consumptionFrequency = 'weekly';
          break;
        case 'grains':
          averageDailyConsumption = Math.max(0.1, totalQuantity / 60); // Assume grains last 60 days
          consumptionFrequency = 'weekly';
          break;
        default:
          averageDailyConsumption = Math.max(0.05, totalQuantity / 30);
          consumptionFrequency = 'occasional';
      }

      return {
        category,
        averageDailyConsumption,
        consumptionFrequency,
        typicalShelfLife: this.getTypicalShelfLife(category)
      };
    });
  }

  private getTypicalShelfLife(category: string): number {
    const shelfLifeMap: Record<string, number> = {
      fruits: 7,
      vegetables: 10,
      dairy: 14,
      protein: 21,
      grains: 60,
      beverages: 30,
      snacks: 45,
      other: 30
    };
    return shelfLifeMap[category] || 30;
  }

  private calculateSeasonalFactors(userData: any): SeasonalFactors {
    const currentMonth = new Date().getMonth();
    const currentSeason = this.getSeason(currentMonth);

    // Determine temperature based on season and location (simplified)
    let temperature: 'warm' | 'moderate' | 'cold' = 'moderate';

    // Northern hemisphere seasons
    if (currentSeason === 'summer' || currentSeason === 'spring') {
      temperature = userData.location.country?.toLowerCase().includes('tropic') ? 'warm' : 'moderate';
    } else if (currentSeason === 'winter') {
      temperature = 'cold';
    }

    const humidityFactor = temperature === 'warm' ? 1.2 : temperature === 'cold' ? 0.8 : 1.0;

    // Seasonal adjustments for different food categories
    const seasonalAdjustments: { [category: string]: { multiplier: number; reason: string } } = {
      fruits: {
        multiplier: temperature === 'warm' ? 1.3 : 1.0,
        reason: temperature === 'warm' ? 'Fruits spoil faster in warm weather due to increased ripening' : 'Normal fruit spoilage rate'
      },
      vegetables: {
        multiplier: temperature === 'warm' ? 1.2 : 1.0,
        reason: temperature === 'warm' ? 'Vegetables wilt faster in warm conditions' : 'Normal vegetable spoilage rate'
      },
      dairy: {
        multiplier: temperature === 'warm' ? 1.4 : 0.9,
        reason: temperature === 'warm' ? 'Dairy products spoil faster in warm temperatures' : 'Dairy lasts longer in cooler conditions'
      },
      protein: {
        multiplier: temperature === 'warm' ? 1.5 : 0.8,
        reason: temperature === 'warm' ? 'Meat and fish spoil much faster in warm weather' : 'Protein stays fresh longer in cool conditions'
      }
    };

    return {
      currentSeason,
      temperature,
      humidityFactor,
      seasonalAdjustments
    };
  }

  private getSeason(month: number): string {
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  }

  private async getAIRiskPredictions(
    inventoryItems: ExpirationRiskItem[],
    consumptionPatterns: ConsumptionPattern[],
    seasonalFactors: SeasonalFactors,
    userData: any
  ): Promise<RiskPrediction[]> {

    const inventoryList = inventoryItems.map(item =>
      `- ${item.itemName} (${item.category}): ${item.quantity} ${item.unit}, expires in ${item.daysUntilExpiration} days, age: ${item.ageInInventory} days, value: $${(item.quantity * item.costPerUnit).toFixed(2)}`
    ).join('\n');

    const consumptionAnalysis = Object.entries(
      consumptionPatterns.reduce((patterns, pattern) => {
        patterns[pattern.category] = pattern;
        return patterns;
      }, {} as Record<string, ConsumptionPattern>)
    ).map(([category, pattern]) =>
      `- ${category}: ${pattern.averageDailyConsumption.toFixed(2)} units/day, ${pattern.consumptionFrequency} usage, typical shelf life: ${pattern.typicalShelfLife} days`
    ).join('\n');

    const prompt = `
You are an AI food expiration risk analyzer. Analyze the following inventory and predict expiration risks.

USER PROFILE:
- Location: ${userData.location.city}, ${userData.location.country}
- Household Size: ${userData.householdSize} people
- Current Season: ${seasonalFactors.currentSeason}
- Temperature: ${seasonalFactors.temperature}

CURRENT INVENTORY WITH EXPIRATION DATA:
${inventoryList}

CONSUMPTION PATTERNS BY CATEGORY:
${consumptionAnalysis}

SEASONAL FACTORS:
- Current Season: ${seasonalFactors.currentSeason}
- Temperature: ${seasonalFactors.temperature}
- Humidity Factor: ${seasonalFactors.humidityFactor}

SEASONAL ADJUSTMENTS:
${Object.entries(seasonalFactors.seasonalAdjustments).map(([category, adj]) =>
  `- ${category}: ${adj.multiplier}x risk multiplier - ${adj.reason}`
).join('\n')}

ANALYSIS RULES:
1. Items expiring in 0-3 days = CRITICAL risk
2. Items expiring in 4-7 days = HIGH risk
3. Items expiring in 8-14 days = MEDIUM risk
4. Items expiring in 15+ days = LOW risk

SEASONAL CONSIDERATIONS:
- Fruits expire 30% faster in warm seasons due to accelerated ripening
- Vegetables wilt faster in warm, humid conditions
- Dairy products are more sensitive to temperature fluctuations
- Protein items (meat, fish) spoil significantly faster in warm weather
- Grains and pantry items are less affected by season

PRIORITY FACTORS:
1. Days until expiration (primary factor)
2. Seasonal risk multipliers
3. Item value (cost to replace)
4. Consumption patterns (how quickly the user typically uses this item)
5. Household size (larger households consume faster)

Provide detailed JSON analysis:
{
  "riskPredictions": [
    {
      "item": {
        "_id": "item_id",
        "itemName": "item name",
        "category": "category",
        "quantity": number,
        "unit": "unit",
        "expirationDate": "ISO date or null",
        "daysUntilExpiration": number,
        "estimatedValue": number
      },
      "riskAnalysis": {
        "overallRiskScore": number (0-100),
        "expirationRisk": "critical|high|medium|low",
        "consumptionUrgency": "immediate|soon|moderate|flexible",
        "seasonalityRisk": "increased|normal|decreased",
        "aiRiskScore": number (0-100)
      },
      "recommendations": {
        "consumeBy": "specific date or timeframe",
        "consumptionPriority": number (1-10, 1=highest),
        "storageTips": ["tip1", "tip2"],
        "alternativeUses": ["use1", "use2"],
        "alertLevel": "red|orange|yellow|green"
      },
      "reasoning": {
        "primaryReason": "main reason for risk level",
        "contributingFactors": ["factor1", "factor2"],
        "seasonalityImpact": "how season affects this item",
        "consumptionPatternAnalysis": "based on user's typical usage"
      }
    }
  ]
}

Focus on practical, actionable recommendations that help prevent food waste.
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
        max_completion_tokens: 6000,
        top_p: 1,
        stream: false,
        reasoning_effort: 'medium',
        stop: null
      });

      const response = chatCompletion.choices[0]?.message?.content;

      if (!response) {
        throw new Error('No response from AI for expiration risk prediction');
      }

      const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
      const aiResponse = JSON.parse(cleanResponse);

      return aiResponse.riskPredictions || [];

    } catch (error) {
      logger.error(`AI risk prediction error: ${(error as Error).message}`);
      // Fallback to basic risk calculation
      return this.getFallbackRiskPredictions(inventoryItems, seasonalFactors);
    }
  }

  private getFallbackRiskPredictions(items: ExpirationRiskItem[], seasonalFactors: SeasonalFactors): RiskPrediction[] {
    return items.map(item => {
      const seasonalMultiplier = seasonalFactors.seasonalAdjustments[item.category]?.multiplier || 1.0;
      const baseRiskScore = Math.max(0, Math.min(100, (100 - item.daysUntilExpiration) * seasonalMultiplier));

      let expirationRisk: 'critical' | 'high' | 'medium' | 'low';
      let alertLevel: 'red' | 'orange' | 'yellow' | 'green';

      if (item.daysUntilExpiration <= 3) {
        expirationRisk = 'critical';
        alertLevel = 'red';
      } else if (item.daysUntilExpiration <= 7) {
        expirationRisk = 'high';
        alertLevel = 'orange';
      } else if (item.daysUntilExpiration <= 14) {
        expirationRisk = 'medium';
        alertLevel = 'yellow';
      } else {
        expirationRisk = 'low';
        alertLevel = 'green';
      }

      return {
        item: {
          _id: item._id,
          itemName: item.itemName,
          category: item.category,
          quantity: item.quantity,
          unit: item.unit,
          expirationDate: item.expirationDate,
          daysUntilExpiration: item.daysUntilExpiration,
          estimatedValue: item.quantity * item.costPerUnit
        },
        riskAnalysis: {
          overallRiskScore: baseRiskScore,
          expirationRisk,
          consumptionUrgency: expirationRisk === 'critical' ? 'immediate' :
                              expirationRisk === 'high' ? 'soon' :
                              expirationRisk === 'medium' ? 'moderate' : 'flexible',
          seasonalityRisk: seasonalMultiplier > 1 ? 'increased' :
                          seasonalMultiplier < 1 ? 'decreased' : 'normal',
          aiRiskScore: baseRiskScore
        },
        recommendations: {
          consumeBy: item.expirationDate ? new Date(item.expirationDate).toLocaleDateString() : 'ASAP',
          consumptionPriority: Math.ceil(baseRiskScore / 10),
          storageTips: this.getStorageTips(item.category),
          alternativeUses: this.getAlternativeUses(item.category, item.itemName),
          alertLevel
        },
        reasoning: {
          primaryReason: `Expires in ${item.daysUntilExpiration} days`,
          contributingFactors: [
            `Seasonal multiplier: ${seasonalMultiplier}x`,
            `Value at risk: $${(item.quantity * item.costPerUnit).toFixed(2)}`
          ],
          seasonalityImpact: seasonalFactors.seasonalAdjustments[item.category]?.reason || 'Normal seasonal conditions',
          consumptionPatternAnalysis: `Based on typical ${item.category} consumption patterns`
        }
      };
    });
  }

  private getStorageTips(category: string): string[] {
    const tips: Record<string, string[]> = {
      fruits: ['Store in refrigerator crisper drawer', 'Keep away from ethylene-producing foods', 'Check daily for spoilage'],
      vegetables: ['Store in high humidity drawer', 'Keep away from fruits that produce ethylene', 'Use within recommended timeframe'],
      dairy: ['Keep in coldest part of refrigerator', 'Store in original container', 'Check expiration dates regularly'],
      protein: ['Store in coldest part of refrigerator', 'Use within 2-3 days or freeze', 'Keep away from other foods to prevent cross-contamination'],
      grains: ['Store in airtight containers', 'Keep in cool, dry place', 'Protect from moisture and pests'],
      beverages: ['Store according to label instructions', 'Refrigerate after opening', 'Use clean utensils to prevent contamination'],
      snacks: ['Store in airtight containers', 'Keep in cool, dry place', 'Check for freshness dates'],
      other: ['Follow storage instructions on packaging', 'Keep in appropriate conditions', 'Monitor regularly']
    };
    return tips[category] || tips.other;
  }

  private getAlternativeUses(category: string, itemName: string): string[] {
    const uses: Record<string, string[]> = {
      fruits: ['Make smoothies', 'Create fruit salads', 'Use in baked goods', 'Freeze for later use'],
      vegetables: ['Make soups or stews', 'Create stir-fry dishes', 'Use in salads', 'Roast or grill'],
      dairy: ['Use in cooking or baking', 'Make sauces or dips', 'Add to beverages', 'Freeze if appropriate'],
      protein: ['Cook and freeze portions', 'Make casseroles or stews', 'Use in meal prep', 'Create different recipes'],
      grains: ['Make grain bowls', 'Use in soups', 'Create side dishes', 'Add to salads'],
      beverages: ['Use in cooking or baking', 'Create cocktails or mocktails', 'Freeze in ice cube trays'],
      snacks: ['Use as toppings', 'Create trail mixes', 'Add to baked goods', 'Serve with dips'],
      other: ['Check for alternative recipes', 'Use in meal planning', 'Share with others if appropriate']
    };
    return uses[category] || uses.other;
  }

  private generatePredictionResult(
    riskPredictions: RiskPrediction[],
    inventoryItems: ExpirationRiskItem[],
    seasonalFactors: SeasonalFactors,
    userData: any
  ): ExpirationPredictionResult {

    const criticalItems = riskPredictions.filter(p => p.riskAnalysis.expirationRisk === 'critical').length;
    const highRiskItems = riskPredictions.filter(p => p.riskAnalysis.expirationRisk === 'high').length;
    const estimatedPotentialLoss = riskPredictions
      .filter(p => p.riskAnalysis.expirationRisk === 'critical' || p.riskAnalysis.expirationRisk === 'high')
      .reduce((total, p) => total + p.item.estimatedValue, 0);

    // Sort by consumption priority
    const sortedPredictions = riskPredictions.sort((a, b) =>
      a.recommendations.consumptionPriority - b.recommendations.consumptionPriority
    );

    const consumptionPriority = sortedPredictions.slice(0, 10).map(p => ({
      itemName: p.item.itemName,
      priority: p.recommendations.consumptionPriority,
      reason: p.reasoning.primaryReason,
      alertLevel: p.recommendations.alertLevel
    }));

    // Determine overall risk level
    let overallRiskLevel: 'low' | 'moderate' | 'high' | 'critical' = 'low';
    if (criticalItems > 0) overallRiskLevel = 'critical';
    else if (highRiskItems > 0) overallRiskLevel = 'high';
    else if (riskPredictions.filter(p => p.riskAnalysis.expirationRisk === 'medium').length > 3) overallRiskLevel = 'moderate';

    const seasonalAlerts = this.generateSeasonalAlerts(seasonalFactors, riskPredictions);
    const consumptionTips = this.generateConsumptionTips(riskPredictions);
    const wastePreventionStrategies = this.generateWastePreventionStrategies(riskPredictions);

    return {
      summary: {
        totalItemsAtRisk: riskPredictions.length,
        criticalItems,
        highRiskItems,
        estimatedPotentialLoss,
        userLocation: `${userData.location.city}, ${userData.location.country}`,
        currentSeason: seasonalFactors.currentSeason,
        analysisDate: new Date()
      },
      riskPredictions,
      consumptionPriority,
      insights: {
        overallRiskLevel,
        seasonalAlerts,
        consumptionTips,
        wastePreventionStrategies
      }
    };
  }

  private generateSeasonalAlerts(seasonalFactors: SeasonalFactors, predictions: RiskPrediction[]): string[] {
    const alerts: string[] = [];

    if (seasonalFactors.temperature === 'warm') {
      alerts.push('🔥 Warm weather alert: Fruits and vegetables are spoiling 30% faster!');
      alerts.push('🥛 Dairy products need extra attention - ensure proper refrigeration');
      alerts.push('🥩 Meat and fish require immediate consumption or freezing');
    } else if (seasonalFactors.temperature === 'cold') {
      alerts.push('❄️ Cold weather benefits: Most foods will last longer');
      alerts.push('🍊 Citrus fruits are in season and will stay fresh longer');
    }

    const increasedRiskItems = predictions.filter(p => p.riskAnalysis.seasonalityRisk === 'increased');
    if (increasedRiskItems.length > 0) {
      alerts.push(`⚠️ ${increasedRiskItems.length} items at increased risk due to seasonal conditions`);
    }

    return alerts;
  }

  private generateConsumptionTips(predictions: RiskPrediction[]): string[] {
    const tips: string[] = [];

    const criticalItems = predictions.filter(p => p.riskAnalysis.expirationRisk === 'critical');
    if (criticalItems.length > 0) {
      tips.push(`🚨 IMMEDIATE: Consume ${criticalItems.length} items in the next 3 days`);
      tips.push('🍳 Consider batch cooking to use up ingredients quickly');
    }

    const highValueItems = predictions.filter(p => p.item.estimatedValue > 10 && p.riskAnalysis.overallRiskScore > 50);
    if (highValueItems.length > 0) {
      tips.push(`💰 High-value items at risk: Prioritize ${highValueItems.map(i => i.item.itemName).join(', ')}`);
    }

    tips.push('📅 Plan meals around expiration dates rather than preferences');
    tips.push('🔄 Implement "first in, first out" system for pantry management');

    return tips;
  }

  private generateWastePreventionStrategies(predictions: RiskPrediction[]): string[] {
    const strategies: string[] = [];

    strategies.push('🔄 Weekly inventory audit to identify at-risk items');
    strategies.push('🍎 Create "eat me first" box in refrigerator for high-risk items');
    strategies.push('❄️ Freeze items that won\'t be consumed in time');
    strategies.push('👥 Share excess food with family, friends, or neighbors');
    strategies.push('📱 Use food preservation apps or tools for better tracking');

    const categoriesAtRisk = [...new Set(predictions.filter(p => p.riskAnalysis.overallRiskScore > 60).map(p => p.item.category))];
    if (categoriesAtRisk.length > 0) {
      strategies.push(`🎯 Focus on ${categoriesAtRisk.join(', ')} categories this week`);
    }

    return strategies;
  }
}

export default new ExpirationRiskService();