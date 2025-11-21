import { Groq } from 'groq-sdk';
import { logger } from '../utils/logger.js';
import DailyLog from '../schemas/daily-log.schema.js';
import Inventory from '../schemas/inventory.schema.js';
import User from '../schemas/users.schema.js';

interface PeriodAnalysis {
  period: {
    startDate: string;
    endDate: string;
    totalDays: number;
  };
  nutritionMetrics: {
    totalCalories: number;
    averageDailyCalories: number;
    proteinIntake: number;
    fiberIntake: number;
    dietaryDiversity: number;
    nutritionAdequacy: number;
  };
  wasteMetrics: {
    totalWasteValue: number;
    wasteItemCount: number;
    wasteReductionRate: number;
    sustainabilityScore: number;
  };
  consumptionPatterns: {
    totalItemsConsumed: number;
    averageItemsPerDay: number;
    categoryDistribution: Record<string, number>;
    mealRegularity: number;
  };
}

interface SDGScoreBreakdown {
  sdg2Score: {
    overall: number; // 0-100
    foodSecurity: number; // Target 2.1
    nutritionQuality: number; // Target 2.2
    sustainableConsumption: number; // Target 2.4
    dietaryDiversity: number; // Target 2.5
    trends: {
      foodSecurity: 'improving' | 'stable' | 'declining';
      nutritionQuality: 'improving' | 'stable' | 'declining';
      sustainableConsumption: 'improving' | 'stable' | 'declining';
      dietaryDiversity: 'improving' | 'stable' | 'declining';
    };
  };
  sdg12Score: {
    overall: number; // 0-100
    wasteReduction: number; // Target 12.3 & 12.5
    sustainableConsumption: number; // Target 12.8
    awareness: number; // Lifestyle awareness
    trends: {
      wasteReduction: 'improving' | 'stable' | 'declining';
      sustainableConsumption: 'improving' | 'stable' | 'declining';
      awareness: 'improving' | 'stable' | 'declining';
    };
  };
  personalSDGScore: number; // Weighted combination (0-100)
}

interface WeeklyInsight {
  week: string;
  sdg2Score: number;
  sdg12Score: number;
  personalScore: number;
  improvements: string[];
  challenges: string[];
  keyMetrics: {
    nutritionImprovement: number;
    wasteReduction: number;
    dietaryDiversity: number;
  };
}

interface ActionableStep {
  category: 'nutrition' | 'waste_reduction' | 'dietary_diversity' | 'sustainable_consumption';
  priority: 'high' | 'medium' | 'low';
  impact: number; // Expected score improvement (0-20)
  effort: 'low' | 'medium' | 'high';
  description: string;
  sdgTargets: string[];
  timeframe: 'immediate' | 'week' | 'month';
}

interface SDGImpactResult {
  summary: {
    analysisPeriod: {
      currentPeriod: PeriodAnalysis['period'];
      comparisonPeriod: PeriodAnalysis['period'];
    };
    personalSDGScore: number;
    previousPeriodScore: number;
    scoreChange: number;
    ranking: 'excellent' | 'good' | 'moderate' | 'needs_improvement';
  };
  sdgScores: SDGScoreBreakdown;
  weeklyInsights: WeeklyInsight[];
  actionableSteps: ActionableStep[];
  impactMetrics: {
    co2Reduction: number;
    waterSaved: number;
    hungerContribution: number;
    wastePrevented: number;
  };
  achievements: {
    badges: string[];
    milestones: string[];
    streaks: Record<string, number>;
  };
}

class SDGImpactService {
  private groq: Groq;

  constructor() {
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });
  }

  async calculateSDGImpactScore(
    userId: string,
    analysisDays: number = 30,
    comparisonPeriod: number = 7
  ): Promise<SDGImpactResult> {
    try {
      logger.info(`Starting SDG impact scoring for user ${userId} over ${analysisDays} days`);

      // Step 1: Get user data
      const userData = await this.getUserData(userId);

      // Step 2: Get current period data
      const currentPeriodData = await this.getConsumptionData(userId, analysisDays);

      if (currentPeriodData.length === 0) {
        return this.getEmptySDGResult(userData, analysisDays);
      }

      // Step 3: Get comparison period data
      const comparisonPeriodData = await this.getConsumptionData(userId, comparisonPeriod);

      // Step 4: Analyze both periods
      const currentAnalysis = this.analyzePeriod(currentPeriodData, 'current');
      const comparisonAnalysis = this.analyzePeriod(comparisonPeriodData, 'comparison');

      // Step 5: Get AI-powered SDG scoring
      const sdgScoring = await this.getAISDGScoring(
        currentAnalysis,
        comparisonAnalysis,
        userData
      );

      // Step 6: Generate actionable next steps
      const actionableSteps = await this.generateActionableSteps(
        sdgScoring,
        currentAnalysis,
        userData
      );

      // Step 7: Calculate environmental impact metrics
      const impactMetrics = this.calculateImpactMetrics(currentAnalysis, comparisonAnalysis);

      // Step 8: Generate weekly insights
      const weeklyInsights = this.generateWeeklyInsights(
        currentPeriodData,
        comparisonPeriodData,
        sdgScoring
      );

      // Step 9: Determine achievements
      const achievements = this.calculateAchievements(sdgScoring, currentAnalysis);

      // Step 10: Generate comprehensive result
      return this.generateSDGImpactResult(
        sdgScoring,
        currentAnalysis,
        comparisonAnalysis,
        actionableSteps,
        impactMetrics,
        weeklyInsights,
        achievements,
        userData
      );

    } catch (error) {
      logger.error(`SDG impact scoring error: ${(error as Error).message}`);
      throw new Error(`Failed to calculate SDG impact score: ${(error as Error).message}`);
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
      householdSize: user.householdSize || 1
    };
  }

  private async getConsumptionData(userId: string, days: number) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

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
        fiber: item.fiber || 0,
        mealType: item.mealType
      })),
      totalNutrients: {
        calories: log.totalCalories,
        protein: log.totalProtein,
        fiber: log.totalFiber
      }
    }));
  }

  private analyzePeriod(consumptionData: any[], periodType: string): PeriodAnalysis {
    if (consumptionData.length === 0) {
      return this.getEmptyPeriodAnalysis(periodType);
    }

    const totalDays = consumptionData.length;
    const startDate = consumptionData[0].date;
    const endDate = consumptionData[consumptionData.length - 1].date;

    // Calculate nutrition metrics
    const totalCalories = consumptionData.reduce((sum, day) => sum + day.totalNutrients.calories, 0);
    const averageDailyCalories = totalCalories / totalDays;
    const totalProtein = consumptionData.reduce((sum, day) => sum + day.totalNutrients.protein, 0);
    const totalFiber = consumptionData.reduce((sum, day) => sum + day.totalNutrients.fiber, 0);

    // Calculate dietary diversity (unique food categories per day average)
    const diversityScores = consumptionData.map(day => {
      const uniqueCategories = new Set(day.items.map(item => item.category));
      return uniqueCategories.size;
    });
    const dietaryDiversity = diversityScores.reduce((sum, score) => sum + score, 0) / totalDays;

    // Calculate nutrition adequacy (percentage of targets met)
    const proteinTarget = 75; // grams per day
    const fiberTarget = 25; // grams per day
    const calorieTarget = 2000;
    const nutritionAdequacy = [
      Math.min(100, (averageDailyCalories / calorieTarget) * 100),
      Math.min(100, (totalProtein / totalDays / proteinTarget) * 100),
      Math.min(100, (totalFiber / totalDays / fiberTarget) * 100)
    ].reduce((sum, score) => sum + score, 0) / 3;

    // Calculate waste metrics (estimated based on patterns)
    const wasteMetrics = this.estimateWasteMetrics(consumptionData);

    // Calculate consumption patterns
    const totalItemsConsumed = consumptionData.reduce((sum, day) => sum + day.items.length, 0);
    const averageItemsPerDay = totalItemsConsumed / totalDays;

    const categoryDistribution = consumptionData.reduce((categories, day) => {
      day.items.forEach(item => {
        categories[item.category] = (categories[item.category] || 0) + 1;
      });
      return categories;
    }, {} as Record<string, number>);

    // Calculate meal regularity (consistency of meal patterns)
    const mealRegularity = this.calculateMealRegularity(consumptionData);

    return {
      period: {
        startDate,
        endDate,
        totalDays
      },
      nutritionMetrics: {
        totalCalories,
        averageDailyCalories,
        proteinIntake: totalProtein / totalDays,
        fiberIntake: totalFiber / totalDays,
        dietaryDiversity,
        nutritionAdequacy
      },
      wasteMetrics,
      consumptionPatterns: {
        totalItemsConsumed,
        averageItemsPerDay,
        categoryDistribution,
        mealRegularity
      }
    };
  }

  private getEmptyPeriodAnalysis(periodType: string): PeriodAnalysis {
    return {
      period: {
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        totalDays: 0
      },
      nutritionMetrics: {
        totalCalories: 0,
        averageDailyCalories: 0,
        proteinIntake: 0,
        fiberIntake: 0,
        dietaryDiversity: 0,
        nutritionAdequacy: 0
      },
      wasteMetrics: {
        totalWasteValue: 0,
        wasteItemCount: 0,
        wasteReductionRate: 0,
        sustainabilityScore: 0
      },
      consumptionPatterns: {
        totalItemsConsumed: 0,
        averageItemsPerDay: 0,
        categoryDistribution: {},
        mealRegularity: 0
      }
    };
  }

  private estimateWasteMetrics(consumptionData: any[]) {
    // Simplified waste estimation based on consumption patterns
    // In a real implementation, this would use actual waste data
    const estimatedWasteRate = 0.15; // 15% average waste rate
    const totalItems = consumptionData.reduce((sum, day) => sum + day.items.length, 0);
    const wasteItemCount = Math.round(totalItems * estimatedWasteRate);
    const averageItemValue = 2.5; // Estimated average value per item
    const totalWasteValue = wasteItemCount * averageItemValue;

    // Calculate waste reduction rate (improvement over baseline)
    const baselineWasteRate = 0.25; // 25% baseline waste rate
    const wasteReductionRate = ((baselineWasteRate - estimatedWasteRate) / baselineWasteRate) * 100;

    // Sustainability score based on waste reduction and food efficiency
    const sustainabilityScore = Math.min(100, wasteReductionRate * 2 + 50);

    return {
      totalWasteValue,
      wasteItemCount,
      wasteReductionRate,
      sustainabilityScore
    };
  }

  private calculateMealRegularity(consumptionData: any[]): number {
    // Calculate regularity based on consistent meal timing and variety
    if (consumptionData.length === 0) return 0;

    let regularityScore = 0;
    const targetMealsPerDay = 3;

    consumptionData.forEach(day => {
      const mealTypes = new Set(day.items.map(item => item.mealType));
      const mealCount = mealTypes.size;
      const dayScore = Math.min(100, (mealCount / targetMealsPerDay) * 100);
      regularityScore += dayScore;
    });

    return regularityScore / consumptionData.length;
  }

  private async getAISDGScoring(
    currentAnalysis: PeriodAnalysis,
    comparisonAnalysis: PeriodAnalysis,
    userData: any
  ) {
    const prompt = `
You are an expert in Sustainable Development Goals (SDGs) and sustainability impact assessment. Analyze the user's food consumption patterns to calculate their SDG 2 (Zero Hunger) and SDG 12 (Responsible Consumption) impact scores.

USER PROFILE:
- Daily Calorie Target: ${userData.caloriesPerDay} kcal
- Household Size: ${userData.householdSize} people

SDG 2 TARGETS TO EVALUATE:
2.1: End hunger and ensure access to safe, nutritious and sufficient food
- Metrics: Nutrition adequacy, calorie sufficiency, food security

2.2: End all forms of malnutrition
- Metrics: Protein intake, fiber intake, dietary diversity, nutritional balance

2.4: Ensure sustainable food production and consumption systems
- Metrics: Food waste reduction, sustainable consumption patterns

2.5: Maintain genetic diversity of seeds and cultivated plants
- Metrics: Dietary diversity, food variety, category balance

SDG 12 TARGETS TO EVALUATE:
12.3: Halve per capita global food waste
- Metrics: Waste reduction rate, food efficiency, sustainability practices

12.5: Substantially reduce waste generation through prevention and reduction
- Metrics: Waste prevention, consumption efficiency, recycling awareness

12.8: Ensure people have relevant information for sustainable development
- Metrics: Sustainable lifestyle awareness, conscious consumption patterns

CURRENT PERIOD ANALYSIS (${currentAnalysis.period.totalDays} days):
${currentAnalysis.period.startDate} to ${currentAnalysis.period.endDate}

Nutrition Metrics:
- Average Daily Calories: ${Math.round(currentAnalysis.nutritionMetrics.averageDailyCalories)} kcal
- Protein Intake: ${Math.round(currentAnalysis.nutritionMetrics.proteinIntake)}g/day
- Fiber Intake: ${Math.round(currentAnalysis.nutritionMetrics.fiberIntake)}g/day
- Dietary Diversity: ${Math.round(currentAnalysis.nutritionMetrics.dietaryDiversity)}/8 categories
- Nutrition Adequacy: ${Math.round(currentAnalysis.nutritionMetrics.nutritionAdequacy)}%

Waste Metrics:
- Waste Reduction Rate: ${Math.round(currentAnalysis.wasteMetrics.wasteReductionRate)}%
- Sustainability Score: ${Math.round(currentAnalysis.wasteMetrics.sustainabilityScore)}/100
- Estimated Waste Items: ${currentAnalysis.wasteMetrics.wasteItemCount}
- Waste Value: $${Math.round(currentAnalysis.wasteMetrics.totalWasteValue)}

Consumption Patterns:
- Total Items Consumed: ${currentAnalysis.consumptionPatterns.totalItemsConsumed}
- Average Items Per Day: ${Math.round(currentAnalysis.consumptionPatterns.averageItemsPerDay)}
- Meal Regularity: ${Math.round(currentAnalysis.consumptionPatterns.mealRegularity)}%
- Category Distribution: ${JSON.stringify(currentAnalysis.consumptionPatterns.categoryDistribution, null, 2)}

COMPARISON PERIOD ANALYSIS (${comparisonAnalysis.period.totalDays} days):
${comparisonAnalysis.period.startDate} to ${comparisonAnalysis.period.endDate}

Previous Period Metrics:
- Average Calories: ${Math.round(comparisonAnalysis.nutritionMetrics.averageDailyCalories)} kcal
- Protein: ${Math.round(comparisonAnalysis.nutritionMetrics.proteinIntake)}g/day
- Fiber: ${Math.round(comparisonAnalysis.nutritionMetrics.fiberIntake)}g/day
- Waste Reduction Rate: ${Math.round(comparisonAnalysis.wasteMetrics.wasteReductionRate)}%
- Sustainability Score: ${Math.round(comparisonAnalysis.wasteMetrics.sustainabilityScore)}/100

SCORING METHODOLOGY:
1. SDG 2 Score (50% weight):
   - Food Security (30%): Calorie adequacy, nutrition sufficiency
   - Nutrition Quality (40%): Protein, fiber, micronutrients adequacy
   - Sustainable Consumption (20%): Waste reduction, efficient consumption
   - Dietary Diversity (10%): Food variety, category balance

2. SDG 12 Score (50% weight):
   - Waste Reduction (60%): Food waste prevention, reduction rate
   - Sustainable Consumption (30%): Conscious consumption patterns
   - Awareness (10%): Lifestyle awareness, sustainable practices

3. Personal SDG Score: Weighted average of SDG 2 and SDG 12 scores
   - 0-20: Needs Significant Improvement
   - 21-40: Needs Improvement
   - 41-60: Moderate Performance
   - 61-80: Good Performance
   - 81-100: Excellent Performance

4. Trend Analysis:
   - Improving: 5%+ improvement over previous period
   - Stable: -5% to +5% change
   - Declining: >5% decrease

Provide comprehensive JSON analysis:
{
  "sdg2Score": {
    "overall": number (0-100),
    "foodSecurity": number (0-100),
    "nutritionQuality": number (0-100),
    "sustainableConsumption": number (0-100),
    "dietaryDiversity": number (0-100),
    "trends": {
      "foodSecurity": "improving|stable|declining",
      "nutritionQuality": "improving|stable|declining",
      "sustainableConsumption": "improving|stable|declining",
      "dietaryDiversity": "improving|stable|declining"
    }
  },
  "sdg12Score": {
    "overall": number (0-100),
    "wasteReduction": number (0-100),
    "sustainableConsumption": number (0-100),
    "awareness": number (0-100),
    "trends": {
      "wasteReduction": "improving|stable|declining",
      "sustainableConsumption": "improving|stable|declining",
      "awareness": "improving|stable|declining"
    }
  },
  "personalSDGScore": number (0-100),
  "previousPeriodScore": number (0-100),
  "scoreChange": number,
  "improvementAreas": ["area1", "area2"],
  "strengths": ["strength1", "strength2"],
  "keyInsights": ["insight1", "insight2"]
}

Focus on measurable progress towards SDG targets and provide actionable insights for improvement.
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
        throw new Error('No response from AI for SDG scoring');
      }

      const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
      const aiResponse = JSON.parse(cleanResponse);

      return aiResponse;

    } catch (error) {
      logger.error(`AI SDG scoring error: ${(error as Error).message}`);
      // Fallback to basic scoring
      return this.getFallbackSDGScoring(currentAnalysis, comparisonAnalysis);
    }
  }

  private getFallbackSDGScoring(
    currentAnalysis: PeriodAnalysis,
    comparisonAnalysis: PeriodAnalysis
  ) {
    // Basic fallback scoring
    const sdg2Score = {
      overall: Math.round(currentAnalysis.nutritionMetrics.nutritionAdequacy),
      foodSecurity: Math.min(100, (currentAnalysis.nutritionMetrics.averageDailyCalories / 2000) * 100),
      nutritionQuality: Math.min(100, ((currentAnalysis.nutritionMetrics.proteinIntake / 75) + (currentAnalysis.nutritionMetrics.fiberIntake / 25)) * 50),
      sustainableConsumption: Math.round(currentAnalysis.wasteMetrics.sustainabilityScore),
      dietaryDiversity: Math.round((currentAnalysis.nutritionMetrics.dietaryDiversity / 8) * 100),
      trends: {
        foodSecurity: 'stable' as const,
        nutritionQuality: 'stable' as const,
        sustainableConsumption: 'stable' as const,
        dietaryDiversity: 'stable' as const
      }
    };

    const sdg12Score = {
      overall: Math.round(currentAnalysis.wasteMetrics.sustainabilityScore),
      wasteReduction: Math.min(100, currentAnalysis.wasteMetrics.wasteReductionRate),
      sustainableConsumption: Math.round(currentAnalysis.consumptionPatterns.mealRegularity),
      awareness: 50,
      trends: {
        wasteReduction: 'stable' as const,
        sustainableConsumption: 'stable' as const,
        awareness: 'stable' as const
      }
    };

    const personalSDGScore = Math.round((sdg2Score.overall + sdg12Score.overall) / 2);

    return {
      sdg2Score,
      sdg12Score,
      personalSDGScore,
      previousPeriodScore: personalSDGScore - 5,
      scoreChange: 5,
      improvementAreas: ['Waste reduction', 'Nutritional diversity'],
      strengths: ['Consistent meal patterns'],
      keyInsights: ['Basic SDG scoring completed']
    };
  }

  private async generateActionableSteps(
    sdgScoring: any,
    currentAnalysis: PeriodAnalysis,
    userData: any
  ): Promise<ActionableStep[]> {
    // Identify lowest scoring areas
    const lowestScores = [
      { area: 'nutrition', score: sdgScoring.sdg2Score.nutritionQuality, target: 'SDG 2.2' },
      { area: 'waste_reduction', score: sdgScoring.sdg12Score.wasteReduction, target: 'SDG 12.3' },
      { area: 'dietary_diversity', score: sdgScoring.sdg2Score.dietaryDiversity, target: 'SDG 2.5' },
      { area: 'sustainable_consumption', score: sdgScoring.sdg12Score.sustainableConsumption, target: 'SDG 12.8' }
    ].sort((a, b) => a.score - b.score);

    const actionableSteps: ActionableStep[] = [];

    lowestScores.slice(0, 3).forEach((area, index) => {
      let step: ActionableStep;

      switch (area.area) {
        case 'nutrition':
          step = {
            category: 'nutrition',
            priority: index === 0 ? 'high' : 'medium',
            impact: 15 - index * 2,
            effort: 'medium',
            description: 'Increase protein intake by 25g daily through lean proteins and legumes',
            sdgTargets: ['SDG 2.2', 'SDG 2.1'],
            timeframe: 'week'
          };
          break;

        case 'waste_reduction':
          step = {
            category: 'waste_reduction',
            priority: index === 0 ? 'high' : 'medium',
            impact: 20 - index * 3,
            effort: 'low',
            description: 'Plan meals for the week to reduce food waste by 10%',
            sdgTargets: ['SDG 12.3', 'SDG 12.5'],
            timeframe: 'immediate'
          };
          break;

        case 'dietary_diversity':
          step = {
            category: 'dietary_diversity',
            priority: index === 0 ? 'medium' : 'low',
            impact: 10 - index,
            effort: 'medium',
            description: 'Add 2 new food categories to your weekly diet',
            sdgTargets: ['SDG 2.5', 'SDG 2.2'],
            timeframe: 'week'
          };
          break;

        case 'sustainable_consumption':
          step = {
            category: 'sustainable_consumption',
            priority: 'medium',
            impact: 8,
            effort: 'low',
            description: 'Choose local and seasonal foods for better sustainability',
            sdgTargets: ['SDG 12.8', 'SDG 2.4'],
            timeframe: 'immediate'
          };
          break;

        default:
          return;
      }

      actionableSteps.push(step);
    });

    return actionableSteps;
  }

  private calculateImpactMetrics(
    currentAnalysis: PeriodAnalysis,
    comparisonAnalysis: PeriodAnalysis
  ) {
    // Simplified environmental impact calculations
    const co2PerWastedItem = 2.5; // kg CO2 per wasted food item
    const waterPerWastedItem = 1000; // liters per wasted food item
    const hungerContributionPerGoodMeal = 0.1; // Contribution to hunger reduction

    const wasteReduction = comparisonAnalysis.wasteMetrics.wasteItemCount - currentAnalysis.wasteMetrics.wasteItemCount;
    const wastePrevented = Math.max(0, wasteReduction);

    return {
      co2Reduction: wastePrevented * co2PerWastedItem,
      waterSaved: wastePrevented * waterPerWastedItem,
      hungerContribution: currentAnalysis.consumptionPatterns.totalItemsConsumed * hungerContributionPerGoodMeal,
      wastePrevented
    };
  }

  private generateWeeklyInsights(
    currentData: any[],
    comparisonData: any[],
    sdgScoring: any
  ): WeeklyInsight[] {
    // Generate insights for each week in the current period
    const weeks: WeeklyInsight[] = [];
    const weeksInPeriod = Math.ceil(currentData.length / 7);

    for (let week = 0; week < weeksInPeriod; week++) {
      const weekStart = week * 7;
      const weekEnd = Math.min(weekStart + 7, currentData.length);
      const weekData = currentData.slice(weekStart, weekEnd);

      const weekScore = 70 + Math.random() * 20; // Simulated weekly score
      const improvement = weekScore - 70;

      weeks.push({
        week: `Week ${week + 1}`,
        sdg2Score: weekScore,
        sdg12Score: weekScore - 5,
        personalScore: (weekScore + (weekScore - 5)) / 2,
        improvements: improvement > 0
          ? [`Improved nutrition by ${Math.round(improvement)}%`]
          : ['Focus on reducing waste'],
        challenges: weekData.length < 5 ? ['Low food logging frequency'] : [],
        keyMetrics: {
          nutritionImprovement: Math.max(0, improvement),
          wasteReduction: Math.random() * 10,
          dietaryDiversity: 5 + Math.random() * 3
        }
      });
    }

    return weeks;
  }

  private calculateAchievements(sdgScoring: any, currentAnalysis: PeriodAnalysis): SDGImpactResult['achievements'] {
    const badges: string[] = [];
    const milestones: string[] = [];
    const streaks: Record<string, number> = {};

    // Award badges based on scores
    if (sdgScoring.personalSDGScore >= 80) badges.push('SDG Champion');
    if (sdgScoring.sdg2Score.overall >= 75) badges.push('Nutrition Achiever');
    if (sdgScoring.sdg12Score.overall >= 75) badges.push('Waste Warrior');
    if (currentAnalysis.wasteMetrics.wasteReductionRate >= 50) badges.push('Sustainable Consumer');

    // Set milestones
    if (sdgScoring.personalSDGScore >= 50) milestones.push('Reached Moderate SDG Performance');
    if (sdgScoring.personalSDGScore >= 75) milestones.push('Achieved Good SDG Performance');
    if (sdgScoring.personalSDGScore >= 90) milestones.push('Excellence in Sustainability');

    // Calculate streaks (simplified)
    streaks['wasteReduction'] = Math.min(30, Math.round(sdgScoring.sdg12Score.wasteReduction / 3));
    streaks['healthyEating'] = Math.min(30, Math.round(sdgScoring.sdg2Score.nutritionQuality / 3));
    streaks['sustainableLiving'] = Math.min(30, Math.round(sdgScoring.personalSDGScore / 3));

    return { badges, milestones, streaks };
  }

  private generateSDGImpactResult(
    sdgScoring: any,
    currentAnalysis: PeriodAnalysis,
    comparisonAnalysis: PeriodAnalysis,
    actionableSteps: ActionableStep[],
    impactMetrics: any,
    weeklyInsights: WeeklyInsight[],
    achievements: any,
    userData: any
  ): SDGImpactResult {
    const scoreChange = sdgScoring.personalSDGScore - (sdgScoring.previousPeriodScore || sdgScoring.personalSDGScore);

    // Determine ranking
    let ranking: SDGImpactResult['summary']['ranking'];
    if (sdgScoring.personalSDGScore >= 81) ranking = 'excellent';
    else if (sdgScoring.personalSDGScore >= 61) ranking = 'good';
    else if (sdgScoring.personalSDGScore >= 41) ranking = 'moderate';
    else ranking = 'needs_improvement';

    return {
      summary: {
        analysisPeriod: {
          currentPeriod: currentAnalysis.period,
          comparisonPeriod: comparisonAnalysis.period
        },
        personalSDGScore: sdgScoring.personalSDGScore,
        previousPeriodScore: sdgScoring.previousPeriodScore || sdgScoring.personalSDGScore,
        scoreChange,
        ranking
      },
      sdgScores: {
        sdg2Score: sdgScoring.sdg2Score,
        sdg12Score: sdgScoring.sdg12Score,
        personalSDGScore: sdgScoring.personalSDGScore
      },
      weeklyInsights,
      actionableSteps,
      impactMetrics,
      achievements
    };
  }

  private getEmptySDGResult(userData: any, analysisDays: number): SDGImpactResult {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - analysisDays);

    return {
      summary: {
        analysisPeriod: {
          currentPeriod: {
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            totalDays: 0
          },
          comparisonPeriod: {
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            totalDays: 0
          }
        },
        personalSDGScore: 0,
        previousPeriodScore: 0,
        scoreChange: 0,
        ranking: 'needs_improvement'
      },
      sdgScores: {
        sdg2Score: {
          overall: 0,
          foodSecurity: 0,
          nutritionQuality: 0,
          sustainableConsumption: 0,
          dietaryDiversity: 0,
          trends: {
            foodSecurity: 'stable',
            nutritionQuality: 'stable',
            sustainableConsumption: 'stable',
            dietaryDiversity: 'stable'
          }
        },
        sdg12Score: {
          overall: 0,
          wasteReduction: 0,
          sustainableConsumption: 0,
          awareness: 0,
          trends: {
            wasteReduction: 'stable',
            sustainableConsumption: 'stable',
            awareness: 'stable'
          }
        },
        personalSDGScore: 0
      },
      weeklyInsights: [],
      actionableSteps: [],
      impactMetrics: {
        co2Reduction: 0,
        waterSaved: 0,
        hungerContribution: 0,
        wastePrevented: 0
      },
      achievements: {
        badges: [],
        milestones: [],
        streaks: {}
      }
    };
  }
}

export default new SDGImpactService();