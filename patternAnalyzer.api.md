# AI Consumption Pattern Analyzer API Documentation

## Overview
The AI Consumption Pattern Analyzer provides intelligent analysis of user eating habits, nutritional patterns, and waste prediction using Groq AI with the same nutritional standards as the mealOptimizer service.

## Base URL
```
https://nutrimate-backend-url.onrender.com/api/pattern-analyzer
```

## Authentication
All endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### 1. Get Comprehensive Pattern Analysis
**GET** `/analysis?periodDays=30&includeInventoryWastePrediction=true`

Get complete AI-powered consumption pattern analysis including trends, insights, and waste predictions.

#### Query Parameters
- `periodDays` (optional): Number of days to analyze (default: 30, min: 7, max: 365)
- `includeInventoryWastePrediction` (optional): Include waste prediction analysis (default: true)

#### Response Structure
```json
{
  "success": true,
  "message": "Consumption pattern analysis completed successfully",
  "data": {
    "summary": {
      "analysisPeriod": {
        "startDate": "2024-06-21",
        "endDate": "2024-07-21",
        "totalDays": 30
      },
      "overallHealthScore": 75,
      "keyInsights": [
        "High fruit consumption on weekends",
        "Low vegetable intake during weekdays",
        "Irregular meal timing patterns detected"
      ],
      "recommendations": [
        "Increase vegetable consumption by 20%",
        "Establish consistent meal times",
        "Include more protein in breakfast"
      ],
      "dataCompleteness": 85
    },
    "weeklyTrends": [
      {
        "dayOfWeek": "Monday",
        "totalCalories": 1850,
        "totalProtein": 65,
        "totalCarbs": 220,
        "totalFats": 58,
        "totalFiber": 18,
        "itemsConsumed": 8,
        "mealDistribution": {
          "breakfast": 2,
          "lunch": 3,
          "dinner": 2,
          "snack": 1,
          "beverage": 0
        },
        "categoryDistribution": {
          "fruits": 1,
          "vegetables": 2,
          "dairy": 1,
          "grains": 2,
          "protein": 1,
          "beverages": 0,
          "snacks": 1,
          "other": 0
        }
      }
    ],
    "categoryConsumption": [
      {
        "category": "fruits",
        "totalConsumed": 25.5,
        "averageDaily": 0.85,
        "consumptionFrequency": 85,
        "trendDirection": "increasing",
        "nutritionalBalance": "optimal",
        "recommendedIntake": 2.0,
        "varianceFromOptimal": -15.5
      }
    ],
    "wastePredictions": [
      {
        "item": {
          "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
          "itemName": "Fresh Spinach",
          "category": "vegetables",
          "quantity": 2,
          "unit": "bunches",
          "estimatedValue": 4.50,
          "expirationDate": "2024-07-24T00:00:00.000Z",
          "daysUntilExpiration": 3
        },
        "wasteRisk": {
          "probability": 85,
          "riskLevel": "high",
          "predictedWasteDate": "2024-07-24",
          "consumptionRateNeeded": 0.67,
          "daysOfConsumption": 3
        },
        "reasoning": {
          "primaryFactors": [
            "Low historical vegetable consumption",
            "Expiring in 3 days",
            "Current consumption rate: 0.3 bunches/day"
          ],
          "consumptionPatternAnalysis": "User consumes vegetables 40% less than recommended",
          "seasonalFactors": [
            "Summer season increases spoilage rate by 20%"
          ],
          "recommendations": [
            "Add spinach to smoothies",
            "Use in salads and stir-fries",
            "Consider freezing if not consumed"
          ]
        }
      }
    ],
    "imbalancesDetected": [
      {
        "category": "vegetables",
        "currentIntake": 1.2,
        "recommendedIntake": 2.0,
        "variance": -40,
        "severity": "moderate",
        "healthImplications": [
          "Reduced fiber intake",
          "Lower vitamin and mineral consumption",
          "Potential digestive health impact"
        ],
        "suggestions": [
          "Add vegetables to every meal",
          "Try vegetable-rich snacks",
          "Explore new vegetable recipes"
        ],
        "priority": "medium"
      }
    ],
    "heatmapData": [
      {
        "dayOfWeek": "Monday",
        "hourOfDay": 8,
        "mealType": "breakfast",
        "consumptionIntensity": 65,
        "categoryBreakdown": {
          "fruits": 25,
          "grains": 30,
          "dairy": 20,
          "protein": 15,
          "vegetables": 5,
          "beverages": 5
        },
        "totalCalories": 420,
        "itemCount": 3
      }
    ],
    "consumptionPatterns": {
      "mealTiming": {
        "breakfastTime": "08:00",
        "lunchTime": "12:30",
        "dinnerTime": "19:00",
        "snackTimes": ["10:30", "15:30"]
      },
      "eatingFrequency": {
        "averageMealsPerDay": 2.8,
        "averageSnacksPerDay": 2.1,
        "regularityScore": 72
      },
      "preferredCategories": {
        "mostConsumed": [
          {"category": "fruits", "percentage": 28},
          {"category": "grains", "percentage": 22}
        ],
        "leastConsumed": [
          {"category": "vegetables", "percentage": 12},
          {"category": "protein", "percentage": 15}
        ]
      }
    },
    "nutritionInsights": {
      "proteinIntake": {
        "current": 58,
        "recommended": 75,
        "adequacy": "deficient"
      },
      "fiberIntake": {
        "current": 16,
        "recommended": 20,
        "adequacy": "deficient"
      },
      "calorieDistribution": {
        "breakfast": 23,
        "lunch": 38,
        "dinner": 32,
        "snacks": 7
      }
    }
  }
}
```

---

### 2. Get Weekly Trends
**GET** `/weekly-trends?periodDays=30`

Focus on weekly consumption patterns, meal timing, and eating frequency analysis.

#### Response Structure
```json
{
  "success": true,
  "message": "Weekly trends retrieved successfully",
  "data": {
    "summary": {
      "analysisPeriod": {
        "startDate": "2024-06-21",
        "endDate": "2024-07-21",
        "totalDays": 30
      },
      "overallHealthScore": 75,
      "dataCompleteness": 85
    },
    "weeklyTrends": [
      {
        "dayOfWeek": "Saturday",
        "totalCalories": 2250,
        "totalProtein": 85,
        "itemsConsumed": 12,
        "mealDistribution": {
          "breakfast": 3,
          "lunch": 4,
          "dinner": 3,
          "snack": 2,
          "beverage": 0
        }
      }
    ],
    "consumptionPatterns": {
      "mealTiming": {
        "breakfastTime": "08:15",
        "lunchTime": "12:45",
        "dinnerTime": "19:30",
        "snackTimes": ["10:30", "15:45", "21:00"]
      },
      "eatingFrequency": {
        "averageMealsPerDay": 2.9,
        "averageSnacksPerDay": 2.3,
        "regularityScore": 78
      },
      "preferredCategories": {
        "mostConsumed": [
          {"category": "fruits", "percentage": 32}
        ],
        "leastConsumed": [
          {"category": "vegetables", "percentage": 10}
        ]
      }
    }
  }
}
```

---

### 3. Get Category Analysis
**GET** `/category-analysis?periodDays=30`

Detailed analysis of food category consumption and nutritional imbalances.

#### Response Structure
```json
{
  "success": true,
  "message": "Category consumption analysis retrieved successfully",
  "data": {
    "summary": {
      "analysisPeriod": {
        "startDate": "2024-06-21",
        "endDate": "2024-07-21"
      },
      "dataCompleteness": 85
    },
    "categoryConsumption": [
      {
        "category": "vegetables",
        "totalConsumed": 18.5,
        "averageDaily": 0.62,
        "consumptionFrequency": 65,
        "trendDirection": "stable",
        "nutritionalBalance": "deficient",
        "recommendedIntake": 2.0,
        "varianceFromOptimal": -69
      }
    ],
    "imbalancesDetected": [
      {
        "category": "vegetables",
        "currentIntake": 0.62,
        "recommendedIntake": 2.0,
        "variance": -69,
        "severity": "moderate",
        "healthImplications": [
          "Insufficient fiber intake",
          "Reduced micronutrient consumption"
        ],
        "suggestions": [
          "Add vegetables to breakfast smoothies",
          "Include salad with lunch",
          "Try vegetable-rich dinner recipes"
        ],
        "priority": "high"
      }
    ],
    "nutritionInsights": {
      "proteinIntake": {
        "current": 58,
        "recommended": 75,
        "adequacy": "deficient"
      },
      "fiberIntake": {
        "current": 16,
        "recommended": 20,
        "adequacy": "deficient"
      }
    }
  }
}
```

---

### 4. Get Waste Predictions
**GET** `/waste-predictions?periodDays=14`

AI-powered waste prediction analysis for current inventory items based on consumption patterns.

#### Response Structure
```json
{
  "success": true,
  "message": "Waste predictions generated successfully",
  "data": {
    "summary": {
      "totalInventoryItems": 15,
      "highRiskItems": 4,
      "totalPotentialLoss": 23.75,
      "analysisDate": "2024-07-21T10:30:00.000Z"
    },
    "wastePredictions": [
      {
        "item": {
          "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
          "itemName": "Fresh Strawberries",
          "category": "fruits",
          "quantity": 3,
          "unit": "cups",
          "estimatedValue": 8.50,
          "expirationDate": "2024-07-23T00:00:00.000Z",
          "daysUntilExpiration": 2
        },
        "wasteRisk": {
          "probability": 90,
          "riskLevel": "critical",
          "predictedWasteDate": "2024-07-23",
          "consumptionRateNeeded": 1.5,
          "daysOfConsumption": 2
        },
        "reasoning": {
          "primaryFactors": [
            "Expires in 2 days",
            "Low fruit consumption rate (0.5 cups/day)",
            "High value at risk: $8.50"
          ],
          "consumptionPatternAnalysis": "Historical consumption shows 50% lower fruit intake than needed",
          "seasonalFactors": [
            "Warm weather accelerates spoilage by 30%"
          ],
          "recommendations": [
            "Make smoothies with strawberries",
            "Add to breakfast cereal",
            "Use as dessert toppings",
            "Share with family if excess"
          ]
        }
      }
    ],
    "highRiskItems": [
      {
        "item": {
          "itemName": "Fresh Strawberries",
          "estimatedValue": 8.50,
          "daysUntilExpiration": 2
        },
        "wasteRisk": {
          "probability": 90,
          "riskLevel": "critical"
        }
      }
    ],
    "recommendations": [
      "Consume strawberries within 2 days",
      "Increase spinach consumption to 0.67 bunches/day",
      "Create meal plans around expiring items"
    ]
  }
}
```

---

### 5. Get Heatmap Data
**GET** `/heatmap-data?periodDays=30`

Formatted data for heatmap visualization showing consumption intensity by day, time, and category.

#### Response Structure
```json
{
  "success": true,
  "message": "Heatmap data generated successfully",
  "data": {
    "summary": {
      "analysisPeriod": {
        "startDate": "2024-06-21",
        "endDate": "2024-07-21"
      },
      "dataCompleteness": 85,
      "totalDataPoints": 210,
      "maxIntensity": 95
    },
    "heatmapData": [
      {
        "dayOfWeek": "Monday",
        "hourOfDay": 8,
        "mealType": "breakfast",
        "consumptionIntensity": 75,
        "colorIntensity": 8,
        "mealGroup": "meal",
        "categoryBreakdown": {
          "fruits": 30,
          "grains": 35,
          "dairy": 20,
          "protein": 10,
          "vegetables": 5
        },
        "totalCalories": 450,
        "itemCount": 4
      }
    ],
    "dayOfWeekOrder": [
      "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
    ],
    "mealTypes": [
      "breakfast", "lunch", "dinner", "snack", "beverage"
    ],
    "categories": [
      "fruits", "vegetables", "dairy", "grains", "protein", "beverages", "snacks", "other"
    ]
  }
}
```

---

### 6. Get Nutritional Imbalances
**GET** `/nutritional-imbalances?periodDays=30`

Detailed analysis of nutritional deficiencies, excesses, and health implications.

#### Response Structure
```json
{
  "success": true,
  "message": "Nutritional imbalance analysis completed",
  "data": {
    "summary": {
      "overallHealthScore": 72,
      "totalImbalances": 4,
      "severeImbalances": 1,
      "moderateImbalances": 2,
      "analysisPeriod": {
        "startDate": "2024-06-21",
        "endDate": "2024-07-21"
      }
    },
    "imbalancesDetected": [
      {
        "category": "protein",
        "currentIntake": 58,
        "recommendedIntake": 75,
        "variance": -23,
        "severity": "moderate",
        "healthImplications": [
          "Reduced muscle maintenance",
          "Lower satiety levels",
          "Potential recovery issues"
        ],
        "suggestions": [
          "Add eggs to breakfast",
          "Include lean protein in lunch",
          "Consider protein-rich snacks"
        ],
        "priority": "high"
      }
    ],
    "nutritionInsights": {
      "proteinIntake": {
        "current": 58,
        "recommended": 75,
        "adequacy": "deficient"
      },
      "fiberIntake": {
        "current": 16,
        "recommended": 20,
        "adequacy": "deficient"
      },
      "calorieDistribution": {
        "breakfast": 22,
        "lunch": 35,
        "dinner": 33,
        "snacks": 10
      }
    },
    "recommendations": {
      "immediate": [
        "Increase protein intake by 25g daily",
        "Add vegetables to each meal"
      ],
      "shortTerm": [
        "Try new protein sources",
        "Experiment with vegetable recipes"
      ],
      "general": [
        "Maintain consistent meal timing",
        "Track portions for better accuracy"
      ]
    }
  }
}
```

## Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Authentication required. Please log in to access pattern analysis.",
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
  "message": "An error occurred during pattern analysis. Please try again later.",
  "error": "INTERNAL_SERVER_ERROR"
}
```

## Features

### AI-Powered Analysis
- **Groq AI Integration**: Uses `openai/gpt-oss-20b` model for intelligent pattern recognition
- **Nutritional Standards**: Same standards as mealOptimizer service for consistency
- **Consumption Pattern Recognition**: Identifies eating habits, preferences, and trends
- **Waste Prediction**: AI-powered forecasting based on historical consumption

### Weekly Trend Analysis
- **Day-by-Day Breakdown**: Detailed consumption patterns by day of week
- **Meal Timing Analysis**: Identifies optimal meal times and irregularities
- **Category Preferences**: Shows most and least consumed food categories
- **Eating Frequency**: Analyzes regularity and patterns in meal schedules

### Nutritional Imbalance Detection
- **Protein Analysis**: Tracks protein intake against recommended levels
- **Fiber Intake**: Monitors fiber consumption adequacy
- **Calorie Distribution**: Analyzes meal balance throughout the day
- **Category Balance**: Identifies deficient or excessive food categories

### Waste Prediction Engine
- **Consumption Rate Analysis**: Calculates actual vs. needed consumption rates
- **Expiration Integration**: Cross-references with inventory expiration dates
- **Seasonal Factors**: Considers seasonal spoilage rates
- **Financial Impact**: Calculates potential monetary waste

### Heatmap Visualization Data
- **Time-Based Intensity**: Consumption patterns by hour and day
- **Category Heatmaps**: Shows category preferences by time
- **Meal Group Analysis**: Distinguishes meals vs. snacks
- **Visual Mapping**: Pre-formatted for frontend chart libraries

## Usage Examples

### Frontend Implementation - Pattern Analysis Dashboard
```javascript
// Get comprehensive pattern analysis
const fetchPatternAnalysis = async (periodDays = 30) => {
  try {
    const response = await fetch(`/api/pattern-analyzer/analysis?periodDays=${periodDays}&includeInventoryWastePrediction=true`, {
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    });
    const data = await response.json();

    if (data.success) {
      updateHealthScore(data.data.summary.overallHealthScore);
      displayWeeklyTrends(data.data.weeklyTrends);
      showNutritionalInsights(data.data.nutritionInsights);
      highlightWastePredictions(data.data.wastePredictions);
    }
  } catch (error) {
    console.error('Failed to fetch pattern analysis:', error);
  }
};
```

### React Component - Nutritional Imbalance Card
```jsx
const ImbalanceCard = ({ imbalance }) => {
  const severityColors = {
    mild: 'bg-yellow-100 border-yellow-500 text-yellow-900',
    moderate: 'bg-orange-100 border-orange-500 text-orange-900',
    severe: 'bg-red-100 border-red-500 text-red-900'
  };

  const priorityIcons = {
    low: '⚪',
    medium: '🟡',
    high: '🔴'
  };

  return (
    <div className={`p-4 border-l-4 ${severityColors[imbalance.severity]} rounded-md`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold capitalize">{imbalance.category}</h3>
        <span className="text-2xl">{priorityIcons[imbalance.priority]}</span>
      </div>
      <div className="text-sm mb-2">
        <span className="font-medium">Current:</span> {imbalance.currentIntake}g
        <span className="ml-2 font-medium">Recommended:</span> {imbalance.recommendedIntake}g
      </div>
      <div className="text-xs">
        <span className="font-medium">Variance:</span> {imbalance.variance > 0 ? '+' : ''}{imbalance.variance}%
      </div>
      <div className="mt-3">
        <h4 className="font-medium text-sm mb-1">Suggestions:</h4>
        <ul className="text-xs space-y-1">
          {imbalance.suggestions.slice(0, 2).map((suggestion, index) => (
            <li key={index} className="flex items-start">
              <span className="mr-1">•</span>
              <span>{suggestion}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
```

### Chart.js Integration - Weekly Trends Visualization
```javascript
// Create weekly calories chart
const createWeeklyTrendsChart = (weeklyTrends) => {
  const ctx = document.getElementById('weeklyTrendsChart').getContext('2d');

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: weeklyTrends.map(day => day.dayOfWeek),
      datasets: [
        {
          label: 'Calories',
          data: weeklyTrends.map(day => day.totalCalories),
          backgroundColor: 'rgba(54, 162, 235, 0.8)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        },
        {
          label: 'Protein (g)',
          data: weeklyTrends.map(day => day.totalProtein * 10), // Scale for visibility
          backgroundColor: 'rgba(255, 99, 132, 0.8)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Amount'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Day of Week'
          }
        }
      },
      plugins: {
        title: {
          display: true,
          text: 'Weekly Consumption Trends'
        }
      }
    }
  });
};
```

## Rate Limiting
- **Comprehensive Analysis**: 1 request per minute
- **Weekly Trends**: 1 request per 30 seconds
- **Category Analysis**: 1 request per 30 seconds
- **Waste Predictions**: 1 request per minute
- **Heatmap Data**: 1 request per 30 seconds
- **Nutritional Imbalances**: 1 request per minute

## Performance Considerations
- **AI Processing**: Full analysis may take 5-8 seconds due to complex AI reasoning
- **Data Caching**: Consider caching results for 1-2 hours
- **Incremental Updates**: Use smaller period updates for frequent refreshing
- **Background Processing**: Consider running comprehensive analysis in background jobs

## Integration Tips

### Data Visualization
1. **Heatmaps**: Use Chart.js, D3.js, or Recharts for time-based heatmaps
2. **Trend Lines**: Implement moving averages for trend visualization
3. **Category Breakdowns**: Use pie charts or donut charts for category distribution
4. **Progress Indicators**: Show nutritional balance with circular progress bars

### User Experience
1. **Loading States**: Show detailed loading messages during AI processing
2. **Progressive Loading**: Load summary first, then detailed data
3. **Interactive Elements**: Make charts clickable for detailed views
4. **Mobile Optimization**: Ensure responsive design for all visualizations

### Data Accuracy
1. **Logging Reminders**: Prompt users to log food consistently
2. **Data Quality Indicators**: Show data completeness scores
3. **Validation**: Highlight days with incomplete data
4. **Feedback Loop**: Allow users to confirm or correct AI insights

### Real-Time Updates
1. **Dashboard Widgets**: Use WebSocket for real-time updates
2. **Notification System**: Alert users to detected imbalances
3. **Waste Alerts**: Send notifications for high-risk waste predictions
4. **Progress Tracking**: Show improvement over time with trend lines

## Testing Scenarios
1. **New User**: Test with minimal data (7 days)
2. **Power User**: Test with extensive data (365 days)
3. **Irregular Logging**: Test with inconsistent data patterns
4. **Empty Inventory**: Test waste predictions with no current inventory
5. **Seasonal Variations**: Test across different time periods
6. **Edge Cases**: Test with extreme consumption patterns

## API Versioning
- Current version: v1
- Backward compatibility maintained
- Breaking changes will increment version number
- Response format stability guaranteed within versions