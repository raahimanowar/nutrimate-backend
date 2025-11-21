# AI SDG Impact Scoring Engine API Documentation

## Overview
The AI SDG Impact Scoring Engine evaluates user progress towards Sustainable Development Goals 2 (Zero Hunger) and 12 (Responsible Consumption and Production) by analyzing waste reduction and nutrition improvement patterns. It provides a "Personal SDG Score" (0-100 scale) and generates actionable insights for improvement.

## Base URL
```
https://nutrimate-backend-url.onrender.com/api/sdg-impact
```

## Authentication
All endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## SDG Targets Analyzed

### SDG 2: Zero Hunger
- **Target 2.1**: End hunger and ensure access to safe, nutritious and sufficient food
- **Target 2.2**: End all forms of malnutrition
- **Target 2.4**: Ensure sustainable food production and consumption systems
- **Target 2.5**: Maintain genetic diversity of seeds and cultivated plants

### SDG 12: Responsible Consumption and Production
- **Target 12.3**: Halve per capita global food waste at retail and consumer levels
- **Target 12.5**: Substantially reduce waste generation through prevention
- **Target 12.8**: Ensure people have relevant information for sustainable development

## Endpoints

### 1. Get Comprehensive SDG Impact Score
**GET** `/score?analysisDays=30&comparisonPeriod=7`

Get complete AI-powered SDG impact score analysis including detailed scoring breakdowns and personalized insights.

#### Query Parameters
- `analysisDays` (optional): Number of days to analyze (default: 30, min: 7, max: 90)
- `comparisonPeriod` (optional): Days for previous period comparison (default: 7, min: 3, max: 30)

#### Response Structure
```json
{
  "success": true,
  "message": "SDG impact score calculated successfully",
  "data": {
    "summary": {
      "analysisPeriod": {
        "currentPeriod": {
          "startDate": "2024-06-21",
          "endDate": "2024-07-21",
          "totalDays": 30
        },
        "comparisonPeriod": {
          "startDate": "2024-06-14",
          "endDate": "2024-06-21",
          "totalDays": 7
        }
      },
      "personalSDGScore": 72,
      "previousPeriodScore": 68,
      "scoreChange": +4,
      "ranking": "good"
    },
    "sdgScores": {
      "sdg2Score": {
        "overall": 75,
        "foodSecurity": 80,
        "nutritionQuality": 70,
        "sustainableConsumption": 65,
        "dietaryDiversity": 78,
        "trends": {
          "foodSecurity": "improving",
          "nutritionQuality": "stable",
          "sustainableConsumption": "improving",
          "dietaryDiversity": "declining"
        }
      },
      "sdg12Score": {
        "overall": 69,
        "wasteReduction": 65,
        "sustainableConsumption": 72,
        "awareness": 70,
        "trends": {
          "wasteReduction": "improving",
          "sustainableConsumption": "stable",
          "awareness": "improving"
        }
      },
      "personalSDGScore": 72
    },
    "weeklyInsights": [
      {
        "week": "Week 1",
        "sdg2Score": 70,
        "sdg12Score": 68,
        "personalScore": 69,
        "improvements": ["Reduced food waste by 15%"],
        "challenges": ["Low dietary diversity"],
        "keyMetrics": {
          "nutritionImprovement": 5,
          "wasteReduction": 15,
          "dietaryDiversity": -3
        }
      }
    ],
    "actionableSteps": [
      {
        "category": "nutrition",
        "priority": "high",
        "impact": 15,
        "effort": "medium",
        "description": "Increase protein intake by 25g daily through lean proteins and legumes",
        "sdgTargets": ["SDG 2.2", "SDG 2.1"],
        "timeframe": "week"
      }
    ],
    "impactMetrics": {
      "co2Reduction": 25.5,
      "waterSaved": 10200,
      "hungerContribution": 3.2,
      "wastePrevented": 5
    },
    "achievements": {
      "badges": ["Sustainable Consumer", "Nutrition Achiever"],
      "milestones": ["Reached Moderate SDG Performance"],
      "streaks": {
        "wasteReduction": 14,
        "healthyEating": 8,
        "sustainableLiving": 10
      }
    }
  }
}
```

#### Score Rankings
- **0-20**: Needs Significant Improvement
- **21-40**: Needs Improvement
- **41-60**: Moderate Performance
- **61-80**: Good Performance
- **81-100**: Excellent Performance

---

### 2. Get SDG Score Trends
**GET** `/trends?analysisDays=30&comparisonPeriod=7`

Focus on SDG score trends, weekly improvements, and progression patterns over time.

#### Response Structure
```json
{
  "success": true,
  "message": "SDG trends retrieved successfully",
  "data": {
    "summary": {
      "personalSDGScore": 72,
      "scoreChange": +4,
      "ranking": "good",
      "analysisPeriod": {
        "startDate": "2024-06-21",
        "endDate": "2024-07-21"
      }
    },
    "sdgScores": {
      "sdg2Score": {
        "overall": 75,
        "trends": {
          "foodSecurity": "improving",
          "nutritionQuality": "stable",
          "sustainableConsumption": "improving",
          "dietaryDiversity": "declining"
        }
      },
      "sdg12Score": {
        "overall": 69,
        "trends": {
          "wasteReduction": "improving",
          "sustainableConsumption": "stable",
          "awareness": "improving"
        }
      }
    },
    "weeklyInsights": [
      {
        "week": "Week 4",
        "sdg2Score": 78,
        "sdg12Score": 71,
        "personalScore": 74.5,
        "improvements": ["Improved nutrition by 8%", "Reduced waste by 20%"],
        "keyMetrics": {
          "nutritionImprovement": 8,
          "wasteReduction": 20,
          "dietaryDiversity": 5
        }
      }
    ],
    "trends": {
      "sdg2Trends": {
        "foodSecurity": "improving",
        "nutritionQuality": "stable",
        "sustainableConsumption": "improving",
        "dietaryDiversity": "declining"
      },
      "sdg12Trends": {
        "wasteReduction": "improving",
        "sustainableConsumption": "stable",
        "awareness": "improving"
      },
      "overallTrend": "improving"
    },
    "achievements": {
      "badges": ["SDG Champion"],
      "streaks": {
        "sustainableLiving": 10,
        "wasteReduction": 14
      }
    }
  }
}
```

---

### 3. Get Actionable Steps
**GET** `/action-steps?analysisDays=30&comparisonPeriod=7&priority=all`

Get personalized actionable steps to improve SDG score based on lowest scoring areas with impact estimates.

#### Query Parameters
- `analysisDays` (optional): Number of days to analyze (default: 30, min: 7, max: 90)
- `comparisonPeriod` (optional): Days for comparison (default: 7, min: 3, max: 30)
- `priority` (optional): Filter by priority (all|high|medium|low, default: all)

#### Response Structure
```json
{
  "success": true,
  "message": "SDG action steps retrieved successfully",
  "data": {
    "summary": {
      "personalSDGScore": 72,
      "totalActionSteps": 6,
      "filteredSteps": 6,
      "totalPotentialImpact": 48,
      "lowestScoringAreas": [
        "Waste Reduction (SDG 12.3)",
        "Nutrition Quality (SDG 2.2)",
        "Sustainable Consumption (SDG 12.8)"
      ]
    },
    "actionableSteps": [
      {
        "category": "waste_reduction",
        "priority": "high",
        "impact": 18,
        "effort": "low",
        "description": "Plan meals for the week to reduce food waste by 10%",
        "sdgTargets": ["SDG 12.3", "SDG 12.5"],
        "timeframe": "immediate"
      },
      {
        "category": "nutrition",
        "priority": "high",
        "impact": 15,
        "effort": "medium",
        "description": "Increase protein intake by 25g daily through lean proteins and legumes",
        "sdgTargets": ["SDG 2.2", "SDG 2.1"],
        "timeframe": "week"
      }
    ],
    "stepsByCategory": {
      "waste_reduction": [
        {
          "category": "waste_reduction",
          "priority": "high",
          "impact": 18,
          "description": "Plan meals for the week to reduce food waste by 10%"
        }
      ],
      "nutrition": [
        {
          "category": "nutrition",
          "priority": "high",
          "impact": 15,
          "description": "Increase protein intake by 25g daily"
        }
      ]
    },
    "highImpactSteps": [
      {
        "category": "waste_reduction",
        "impact": 18,
        "description": "Plan meals for the week to reduce food waste by 10%"
      }
    ],
    "immediateActions": [
      {
        "category": "waste_reduction",
        "timeframe": "immediate",
        "description": "Plan meals for the week to reduce food waste by 10%"
      }
    ],
    "weeklyGoals": [
      {
        "category": "nutrition",
        "timeframe": "week",
        "description": "Increase protein intake by 25g daily"
      }
    ]
  }
}
```

#### Impact Categories
- **Nutrition**: Improve dietary quality and food security (SDG 2)
- **Waste Reduction**: Reduce food waste and consumption efficiency (SDG 12.3 & 12.5)
- **Dietary Diversity**: Increase food variety and nutritional balance (SDG 2.5)
- **Sustainable Consumption**: Adopt sustainable lifestyle practices (SDG 12.8)

---

### 4. Get Environmental Impact
**GET** `/environmental-impact?analysisDays=30&comparisonPeriod=7`

Get environmental impact metrics including CO2 reduction, water savings, and sustainability contributions.

#### Response Structure
```json
{
  "success": true,
  "message": "Environmental impact metrics retrieved successfully",
  "data": {
    "summary": {
      "personalSDGScore": 72,
      "sdg12Score": 69,
      "wasteReductionScore": 65,
      "sustainabilityScore": 72,
      "analysisPeriod": {
        "startDate": "2024-06-21",
        "endDate": "2024-07-21"
      }
    },
    "impactMetrics": {
      "co2Reduction": 25.5,
      "waterSaved": 10200,
      "hungerContribution": 3.2,
      "wastePrevented": 5,
      "sustainabilityScore": 72
    },
    "comparisons": {
      "co2EquivalentCars": 0.01,
      "waterShowers": 128,
      "mealsProvided": 32
    },
    "trends": {
      "wasteReductionTrend": "improving",
      "sustainableConsumptionTrend": "stable",
      "awarenessTrend": "improving"
    },
    "achievements": [
      "Waste Warrior",
      "Sustainable Consumer"
    ]
  }
}
```

#### Environmental Metrics Explained
- **CO2 Reduction**: Carbon dioxide emissions prevented through waste reduction
- **Water Saved**: Water conservation through efficient food consumption
- **Hunger Contribution**: Estimated contribution to hunger alleviation
- **Waste Prevented**: Number of food items saved from waste

---

### 5. Get SDG Achievements
**GET** `/achievements?analysisDays=30&comparisonPeriod=7`

Get SDG achievements, badges earned, milestones reached, and progress tracking toward next objectives.

#### Response Structure
```json
{
  "success": true,
  "message": "SDG achievements retrieved successfully",
  "data": {
    "summary": {
      "personalSDGScore": 72,
      "ranking": "good",
      "totalBadges": 3,
      "totalMilestones": 2,
      "analysisPeriod": {
        "startDate": "2024-06-21",
        "endDate": "2024-07-21"
      }
    },
    "achievements": {
      "badges": [
        "SDG Champion",
        "Nutrition Achiever",
        "Waste Warrior"
      ],
      "milestones": [
        "Reached Moderate SDG Performance",
        "Achieved Good SDG Performance"
      ],
      "streaks": {
        "wasteReduction": 14,
        "healthyEating": 8,
        "sustainableLiving": 10
      }
    },
    "nextMilestones": [
      {
        "title": "SDG Excellence",
        "description": "Achieve excellent overall SDG performance",
        "target": 85,
        "current": 72,
        "progress": 85,
        "sdgTarget": "SDG 2 & 12 Combined"
      },
      {
        "title": "SDG 12 Champion",
        "description": "Achieve good performance in Responsible Consumption",
        "target": 75,
        "current": 69,
        "progress": 92,
        "sdgTarget": "SDG 12.3, 12.5, 12.8"
      }
    ],
    "progressToNextBadge": {
      "currentBadge": "Champion",
      "nextBadge": "Master",
      "progress": 28,
      "pointsNeeded": 13
    },
    "sdgContributions": {
      "sdg2Contribution": 75,
      "sdg12Contribution": 69,
      "overallContribution": 72
    },
    "comparison": {
      "topPerformers": "Top 10%",
      "average": "Average user",
      "improvement": "+4 points from last period"
    }
  }
}
```

#### Badge System
- **Beginner** (0-24 points): Starting your SDG journey
- **Novice** (25-49 points): Learning sustainable practices
- **Apprentice** (50-74 points): Consistent SDG contributor
- **Champion** (75-89 points): SDG impact leader
- **Master** (90-100 points): SDG excellence achiever

## Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Authentication required. Please log in to access SDG impact scoring.",
  "error": "USER_NOT_AUTHENTICATED"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "User profile not found. Please ensure your account is properly set up.",
  "error": "USER_NOT_FOUND"
}
```

### 503 Service Unavailable
```json
{
  "success": false,
  "message": "AI service temporarily unavailable. Please try again in a few moments.",
  "error": "AI_SERVICE_UNAVAILABLE",
  "retryAfter": 30
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "An error occurred during SDG impact scoring. Please try again later.",
  "error": "INTERNAL_SERVER_ERROR"
}
```

## Features

### AI-Powered Scoring Engine
- **Groq AI Integration**: Uses `openai/gpt-oss-20b` model for intelligent SDG impact assessment
- **Multi-Factor Analysis**: Analyzes nutrition, waste, diversity, and consumption patterns
- **Trend Detection**: Identifies improving, stable, or declining patterns over time
- **Personalized Insights**: Generates recommendations based on individual user patterns

### SDG 2 (Zero Hunger) Scoring
- **Food Security (30%)**: Calorie adequacy and nutrition sufficiency
- **Nutrition Quality (40%)**: Protein, fiber, and micronutrient adequacy
- **Sustainable Consumption (20%)**: Waste reduction and efficient consumption
- **Dietary Diversity (10%)**: Food variety and category balance

### SDG 12 (Responsible Consumption) Scoring
- **Waste Reduction (60%)**: Food waste prevention and reduction rates
- **Sustainable Consumption (30%)**: Conscious consumption patterns
- **Awareness (10%)**: Sustainable lifestyle awareness and practices

### Personal SDG Score (0-100)
- **Weighted Average**: 50% SDG 2 + 50% SDG 12
- **Benchmarking**: Personal progress against global sustainability goals
- **Actionability**: Identifies lowest scoring areas for improvement

### Environmental Impact Tracking
- **CO2 Emissions**: Calculates carbon footprint reduction from waste prevention
- **Water Conservation**: Measures water savings through efficient consumption
- **Hunger Contribution**: Estimates impact on global food security
- **Comparative Metrics**: Provides relatable comparisons (cars, showers, meals)

### Achievement and Gamification System
- **Badges**: Reward specific sustainability achievements
- **Milestones**: Recognize major progress toward SDG targets
- **Streaks**: Track consistent sustainable practices
- **Progress Tracking**: Monitor advancement toward next objectives

## Usage Examples

### Frontend Implementation - SDG Dashboard
```javascript
// Get comprehensive SDG impact score
const fetchSDGImpactScore = async (analysisDays = 30) => {
  try {
    const response = await fetch(`/api/sdg-impact/score?analysisDays=${analysisDays}`, {
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    });
    const data = await response.json();

    if (data.success) {
      updateSDGScore(data.data.summary.personalSDGScore);
      displaySDG2Breakdown(data.data.sdgScores.sdg2Score);
      displaySDG12Breakdown(data.data.sdgScores.sdg12Score);
      showActionSteps(data.data.actionableSteps);
    }
  } catch (error) {
    console.error('Failed to fetch SDG impact score:', error);
  }
};
```

### React Component - SDG Score Card
```jsx
const SDGScoreCard = ({ sdgData }) => {
  const getScoreColor = (score) => {
    if (score >= 81) return 'bg-green-100 border-green-500 text-green-900';
    if (score >= 61) return 'bg-blue-100 border-blue-500 text-blue-900';
    if (score >= 41) return 'bg-yellow-100 border-yellow-500 text-yellow-900';
    return 'bg-red-100 border-red-500 text-red-900';
  };

  const getRankingIcon = (ranking) => {
    switch(ranking) {
      case 'excellent': return '🌟';
      case 'good': return '✨';
      case 'moderate': return '📈';
      default: return '⚠️';
    }
  };

  return (
    <div className={`p-6 border-l-4 ${getScoreColor(sdgData.summary.personalSDGScore)} rounded-lg shadow-md`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">Personal SDG Score</h3>
        <span className="text-3xl">{getRankingIcon(sdgData.summary.ranking)}</span>
      </div>

      <div className="text-center mb-4">
        <div className="text-5xl font-bold">{sdgData.summary.personalSDGScore}</div>
        <div className="text-sm text-gray-600">out of 100</div>
        <div className="text-xs text-green-600 mt-1">
          {sdgData.summary.scoreChange > 0 ? '+' : ''}{sdgData.summary.scoreChange} points
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <h4 className="font-semibold mb-1">SDG 2 (Zero Hunger)</h4>
          <div className="text-2xl font-bold">{sdgData.sdgScores.sdg2Score.overall}</div>
        </div>
        <div>
          <h4 className="font-semibold mb-1">SDG 12 (Responsible Consumption)</h4>
          <div className="text-2xl font-bold">{sdgData.sdgScores.sdg12Score.overall}</div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <h4 className="font-semibold mb-2">Next Steps</h4>
        <ul className="text-sm space-y-1">
          {sdgData.actionableSteps.slice(0, 2).map((step, index) => (
            <li key={index} className="flex items-start">
              <span className="mr-2">•</span>
              <span>{step.description}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
```

### Environmental Impact Visualization
```javascript
// Create environmental impact chart
const createEnvironmentalImpactChart = (impactData) => {
  const ctx = document.getElementById('environmentalImpactChart').getContext('2d');

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['CO2 Reduction (kg)', 'Water Saved (L)', 'Waste Prevented (items)'],
      datasets: [{
        label: 'Environmental Impact',
        data: [
          impactData.impactMetrics.co2Reduction,
          impactData.impactMetrics.waterSaved / 100, // Convert to hundreds for better visualization
          impactData.impactMetrics.wastePrevented
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(251, 146, 60, 0.8)'
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(251, 146, 60, 1)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Your Environmental Impact'
        },
        tooltip: {
          callbacks: {
            afterLabel: function(context) {
              if (context.dataIndex === 1) {
                return '× 100L';
              }
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Amount'
          }
        }
      }
    }
  });
};
```

## Rate Limiting
- **Comprehensive Analysis**: 1 request per minute
- **Score Trends**: 1 request per 30 seconds
- **Action Steps**: 1 request per 30 seconds
- **Environmental Impact**: 1 request per 30 seconds
- **Achievements**: 1 request per minute

## Performance Considerations
- **AI Processing**: Full analysis may take 7-10 seconds due to complex SDG scoring
- **Period Analysis**: Can analyze up to 90 days of consumption data
- **Comparison Logic**: Requires both current and previous period data
- **Result Caching**: Consider caching results for 1-2 hours for performance

## Integration Tips

### Dashboard Components
1. **Score Meters**: Circular progress bars for SDG scores
2. **Trend Charts**: Line graphs showing improvement over time
3. **Achievement Displays**: Badge showcases and progress bars
4. **Action Steps**: Prioritized recommendation cards

### User Engagement
1. **Progress Tracking**: Show visual improvement trends
2. **Gamification**: Display badges, streaks, and milestones
3. **Environmental Impact**: Show real-world impact comparisons
4. **Social Sharing**: Allow users to share SDG achievements

### Data Visualization
1. **SDG Score Breakdown**: Pie charts for SDG 2 & 12 contribution
2. **Weekly Trends**: Area charts for progress patterns
3. **Environmental Metrics**: Bar charts for CO2, water, waste impact
4. **Achievement Progress**: Progress bars for next milestones

## Testing Scenarios
1. **New User**: Test with minimal data (7 days)
2. **High Performer**: Test with excellent SDG scores (>80)
3. **Struggling User**: Test with low scores (<40)
4. **Trend Analysis**: Test with improving/declining patterns
5. **Empty Data**: Test with insufficient consumption data
6. **Maximum Period**: Test with 90-day analysis

## Social Impact Features

### Community Integration
- **Leaderboards**: Compare SDG scores with friends/family
- **Group Challenges**: Team sustainability challenges
- **Impact Sharing**: Share environmental impact achievements
- **Collaborative Goals**: Work towards community SDG targets

### Educational Components
- **SDG Information**: Educational content about each target
- **Impact Awareness**: Show connection between actions and global goals
- **Progress Insights**: Explain how personal actions contribute to global sustainability
- **Success Stories**: Showcase real-world SDG achievements

## Social Responsibility

### Ethical Considerations
- **Data Privacy**: Protect user consumption data appropriately
- **Accurate Scoring**: Ensure fair and transparent SDG impact calculation
- **Avoid Competition**: Focus on personal improvement rather than ranking
- **Inclusive Design**: Make achievements accessible to all user types

### Positive Reinforcement
- **Achievement Recognition**: Celebrate progress and milestones
- **Constructive Feedback**: Provide actionable, positive recommendations
- **Community Building**: Foster supportive sustainability communities
- **Real Impact**: Connect actions to tangible environmental benefits

## Global Context
- **UN Alignment**: Align scoring with official UN SDG frameworks
- **Target Relevance**: Focus on achievable personal contributions
- **Transparency**: Clear methodology for score calculation
- **Accountability**: Track real environmental and social impact

## API Versioning
- Current version: v1
- Based on UN SDG targets (2024 framework)
- Regular updates to reflect new sustainability research
- Backward compatibility maintained within major versions

This SDG Impact Scoring API provides a comprehensive solution for tracking personal contributions to global sustainability goals while engaging users through gamification and real-world impact measurement.