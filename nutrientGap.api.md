# AI Nutrient Gap Prediction API Documentation

## Overview
The AI Nutrient Gap Prediction service analyzes user consumption history to predict potential nutritional deficiencies and provides personalized food and meal suggestions to fill identified gaps using Groq AI with the same nutritional standards as the mealOptimizer service.

## Base URL
```
https://nutrimate-backend-url.onrender.com/api/nutrient-gap
```

## Authentication
All endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### 1. Get Comprehensive Nutrient Gap Prediction
**GET** `/prediction?analysisDays=30`

Get complete AI-powered nutrient gap analysis including deficiencies, food suggestions, meal plans, and health insights.

#### Query Parameters
- `analysisDays` (optional): Number of days to analyze (default: 30, min: 7, max: 90)

#### Response Structure
```json
{
  "success": true,
  "message": "Nutrient gap prediction completed successfully",
  "data": {
    "summary": {
      "analysisPeriod": {
        "startDate": "2024-06-21",
        "endDate": "2024-07-21",
        "totalDays": 30
      },
      "overallNutritionScore": 72,
      "totalDeficiencies": 4,
      "severeDeficiencies": 1,
      "dataCompleteness": 85,
      "userProfile": {
        "caloriesPerDay": 2000,
        "dietaryRestrictions": ["lactose-intolerant"],
        "preferences": ["low-sodium"]
      }
    },
    "nutrientAnalysis": [
      {
        "nutrient": "Protein",
        "currentIntake": 58,
        "recommendedIntake": 75,
        "deficiencyPercentage": 23,
        "deficiencyLevel": "moderate",
        "trendDirection": "stable",
        "daysDeficient": 18,
        "healthImplications": [
          "Reduced muscle maintenance",
          "Lower satiety levels",
          "Potential recovery issues"
        ]
      },
      {
        "nutrient": "Fiber",
        "currentIntake": 16,
        "recommendedIntake": 25,
        "deficiencyPercentage": 36,
        "deficiencyLevel": "moderate",
        "trendDirection": "decreasing",
        "daysDeficient": 22,
        "healthImplications": [
          "Digestive health concerns",
          "Reduced blood sugar control",
          "Lower cholesterol management"
        ]
      },
      {
        "nutrient": "Iron",
        "currentIntake": 8,
        "recommendedIntake": 18,
        "deficiencyPercentage": 56,
        "deficiencyLevel": "severe",
        "trendDirection": "decreasing",
        "daysDeficient": 25,
        "healthImplications": [
          "Fatigue and weakness",
          "Anemia risk",
          "Reduced cognitive function"
        ]
      }
    ],
    "foodSuggestions": [
      {
        "itemName": "Chicken Breast",
        "category": "protein",
        "quantity": 150,
        "unit": "grams",
        "nutrients": {
          "protein": 35,
          "iron": 1.2,
          "vitaminB12": 0.4
        },
        "availability": "in_inventory",
        "reason": "High-quality protein source rich in iron and B12 to address protein and iron deficiencies",
        "priority": "high",
        "estimatedCost": 4.50
      },
      {
        "itemName": "Lentils",
        "category": "protein",
        "quantity": 100,
        "unit": "grams",
        "nutrients": {
          "protein": 18,
          "fiber": 8,
          "iron": 3.3,
          "folate": 180
        },
        "availability": "in_catalog",
        "reason": "Excellent plant-based protein and fiber source, high in iron and folate",
        "priority": "high",
        "estimatedCost": 1.20
      }
    ],
    "mealSuggestions": [
      {
        "mealType": "lunch",
        "name": "Iron-Rich Protein Bowl",
        "ingredients": [
          {
            "itemName": "Chicken Breast",
            "quantity": 120,
            "unit": "grams",
            "category": "protein",
            "nutrients": {
              "protein": 28,
              "iron": 1.0,
              "vitaminB12": 0.3
            }
          },
          {
            "itemName": "Spinach",
            "quantity": 100,
            "unit": "grams",
            "category": "vegetables",
            "nutrients": {
              "iron": 2.7,
              "vitaminA": 469,
              "vitaminC": 28
            }
          }
        ],
        "totalNutrients": {
          "protein": 28,
          "iron": 3.7,
          "vitaminA": 469,
          "vitaminC": 28,
          "vitaminB12": 0.3
        },
        "targetNutrients": ["protein", "iron", "vitaminA", "vitaminC"],
        "preparationNotes": "Grill chicken breast, serve over fresh spinach with olive oil dressing",
        "estimatedCost": 5.20
      }
    ],
    "insights": {
      "keyFindings": [
        "Protein intake consistently below target",
        "Fiber consumption trending downward",
        "Iron deficiency requires immediate attention"
      ],
      "recommendations": [
        "Increase protein intake by 25g daily",
        "Add fiber-rich foods to each meal",
        "Include iron-rich foods in lunch and dinner"
      ],
      "priorityActions": [
        "Address severe iron deficiency immediately",
        "Consume high-protein foods within 2 days",
        "Increase vegetable intake for better iron absorption"
      ],
      "preventiveMeasures": [
        "Track daily nutrient intake",
        "Include iron absorption enhancers (vitamin C)",
        "Maintain balanced meal planning"
      ]
    }
  }
}
```

---

### 2. Get Nutrient Deficiencies
**GET** `/deficiencies?analysisDays=30&severity=moderate`

Focus specifically on identified nutrient deficiencies with health implications and severity levels.

#### Query Parameters
- `analysisDays` (optional): Number of days to analyze (default: 30, min: 7, max: 90)
- `severity` (optional): Filter by deficiency level (mild|moderate|severe, default: moderate)

#### Response Structure
```json
{
  "success": true,
  "message": "Nutrient deficiencies retrieved successfully",
  "data": {
    "summary": {
      "totalDeficiencies": 6,
      "filteredDeficiencies": 3,
      "priorityDeficiencies": 2,
      "overallNutritionScore": 68,
      "analysisPeriod": {
        "startDate": "2024-06-21",
        "endDate": "2024-07-21"
      }
    },
    "nutrientAnalysis": [
      {
        "nutrient": "Iron",
        "currentIntake": 8,
        "recommendedIntake": 18,
        "deficiencyPercentage": 56,
        "deficiencyLevel": "severe",
        "trendDirection": "decreasing",
        "daysDeficient": 25,
        "healthImplications": [
          "Fatigue and weakness",
          "Anemia risk",
          "Reduced cognitive function"
        ]
      },
      {
        "nutrient": "Fiber",
        "currentIntake": 16,
        "recommendedIntake": 25,
        "deficiencyPercentage": 36,
        "deficiencyLevel": "moderate",
        "trendDirection": "stable",
        "daysDeficient": 20,
        "healthImplications": [
          "Digestive health concerns",
          "Reduced blood sugar control"
        ]
      }
    ],
    "priorityActions": [
      "Address iron deficiency immediately",
      "Increase fiber intake for digestive health",
      "Monitor cognitive symptoms"
    ],
    "insights": {
      "keyFindings": [
        "Iron deficiency requires immediate medical attention",
        "Fiber intake consistently below optimal levels"
      ],
      "recommendations": [
        "Include iron-rich foods in every meal",
        "Add fiber supplements if dietary changes insufficient"
      ]
    }
  }
}
```

---

### 3. Get Food Suggestions
**GET** `/food-suggestions?analysisDays=30&priority=high&availability=all`

Get specific food items with quantities to fill identified nutrient gaps, prioritized by availability and user preferences.

#### Query Parameters
- `analysisDays` (optional): Number of days to analyze (default: 30, min: 7, max: 90)
- `priority` (optional): Filter by suggestion priority (low|medium|high, default: high)
- `availability` (optional): Filter by food availability (all|inventory|catalog, default: all)

#### Response Structure
```json
{
  "success": true,
  "message": "Food suggestions retrieved successfully",
  "data": {
    "summary": {
      "totalSuggestions": 12,
      "filteredSuggestions": 8,
      "inventoryItems": 3,
      "catalogItems": 5,
      "totalEstimatedCost": 18.75,
      "analysisPeriod": {
        "startDate": "2024-06-21",
        "endDate": "2024-07-21"
      }
    },
    "foodSuggestions": [
      {
        "itemName": "Spinach",
        "category": "vegetables",
        "quantity": 200,
        "unit": "grams",
        "nutrients": {
          "iron": 6.4,
          "vitaminA": 938,
          "vitaminC": 56,
          "folate": 194
        },
        "availability": "in_inventory",
        "reason": "Excellent iron source with vitamin C for enhanced absorption, high in folate",
        "priority": "high",
        "estimatedCost": 2.50
      },
      {
        "itemName": "Quinoa",
        "category": "grains",
        "quantity": 150,
        "unit": "grams",
        "nutrients": {
          "protein": 8,
          "fiber": 5,
          "iron": 2.8,
          "magnesium": 64
        },
        "availability": "in_catalog",
        "reason": "Complete protein source with high fiber and iron content",
        "priority": "high",
        "estimatedCost": 2.00
      }
    ],
    "suggestionsByCategory": {
      "vegetables": [
        {
          "itemName": "Spinach",
          "quantity": 200,
          "unit": "grams",
          "priority": "high"
        }
      ],
      "protein": [
        {
          "itemName": "Lentils",
          "quantity": 100,
          "unit": "grams",
          "priority": "high"
        }
      ]
    },
    "priorityItems": [
      {
        "itemName": "Spinach",
        "priority": "high",
        "reason": "Severe iron deficiency requires immediate attention"
      }
    ],
    "inventoryAvailable": [
      {
        "itemName": "Spinach",
        "quantity": 200,
        "estimatedCost": 0
      }
    ],
    "needPurchase": [
      {
        "itemName": "Lentils",
        "estimatedCost": 1.20
      }
    ]
  }
}
```

---

### 4. Get Meal Suggestions
**GET** `/meal-suggestions?analysisDays=30&mealType=lunch`

Get complete meal plans that target multiple nutrient deficiencies simultaneously with ingredients and preparation instructions.

#### Query Parameters
- `analysisDays` (optional): Number of days to analyze (default: 30, min: 7, max: 90)
- `mealType` (optional): Filter by meal type (breakfast|lunch|dinner|snack)

#### Response Structure
```json
{
  "success": true,
  "message": "Meal suggestions retrieved successfully",
  "data": {
    "summary": {
      "totalMeals": 8,
      "filteredMeals": 3,
      "totalEstimatedCost": 15.60,
      "analysisPeriod": {
        "startDate": "2024-06-21",
        "endDate": "2024-07-21"
      },
      "mealTypesAvailable": ["breakfast", "lunch", "dinner", "snack"]
    },
    "mealSuggestions": [
      {
        "mealType": "lunch",
        "name": "Iron-Boost Power Bowl",
        "ingredients": [
          {
            "itemName": "Spinach",
            "quantity": 150,
            "unit": "grams",
            "category": "vegetables",
            "nutrients": {
              "iron": 4.8,
              "vitaminA": 704,
              "vitaminC": 42
            }
          },
          {
            "itemName": "Chicken Breast",
            "quantity": 100,
            "unit": "grams",
            "category": "protein",
            "nutrients": {
              "protein": 31,
              "iron": 0.9,
              "vitaminB12": 0.3
            }
          },
          {
            "itemName": "Quinoa",
            "quantity": 80,
            "unit": "grams",
            "category": "grains",
            "nutrients": {
              "protein": 4,
              "fiber": 3,
              "iron": 1.5
            }
          }
        ],
        "totalNutrients": {
          "protein": 35,
          "iron": 7.2,
          "fiber": 3,
          "vitaminA": 704,
          "vitaminC": 42,
          "vitaminB12": 0.3
        },
        "targetNutrients": ["protein", "iron", "fiber"],
        "preparationNotes": "Cook quinoa and let cool. Grill chicken breast and slice. Mix fresh spinach with quinoa, top with chicken and olive oil dressing",
        "estimatedCost": 6.80
      }
    ],
    "mealsByType": {
      "breakfast": [
        {
          "name": "Protein-Packed Smoothie",
          "estimatedCost": 4.20
        }
      ],
      "lunch": [
        {
          "name": "Iron-Boost Power Bowl",
          "estimatedCost": 6.80
        }
      ]
    },
    "breakfastOptions": [],
    "lunchOptions": [
      {
        "name": "Iron-Boost Power Bowl",
        "ingredients": [...],
        "estimatedCost": 6.80
      }
    ],
    "dinnerOptions": [],
    "snackOptions": []
  }
}
```

---

### 5. Get Nutrition Insights
**GET** `/nutrition-insights?analysisDays=30`

Get personalized nutrition insights, health recommendations, and action plans based on deficiency analysis.

#### Query Parameters
- `analysisDays` (optional): Number of days to analyze (default: 30, min: 7, max: 90)

#### Response Structure
```json
{
  "success": true,
  "message": "Nutrition insights retrieved successfully",
  "data": {
    "summary": {
      "overallNutritionScore": 68,
      "totalDeficiencies": 4,
      "severeDeficiencies": 1,
      "dataCompleteness": 85,
      "analysisPeriod": {
        "startDate": "2024-06-21",
        "endDate": "2024-07-21"
      },
      "userProfile": {
        "caloriesPerDay": 2000,
        "dietaryRestrictions": ["lactose-intolerant"],
        "preferences": ["low-sodium"]
      }
    },
    "nutrientAnalysis": [
      {
        "nutrient": "Iron",
        "currentIntake": 8,
        "recommendedIntake": 18,
        "deficiencyLevel": "severe",
        "healthImplications": ["Fatigue", "Anemia risk"]
      }
    ],
    "priorityNutrients": [
      {
        "nutrient": "Iron",
        "deficiencyPercentage": 56,
        "healthImplications": ["Fatigue and weakness", "Anemia risk", "Reduced cognitive function"]
      }
    ],
    "insights": {
      "immediate": [
        "Address iron deficiency immediately",
        "Increase protein intake by 25g daily"
      ],
      "shortTerm": [
        "Include iron-rich foods in every meal",
        "Add fiber-rich foods to each meal"
      ],
      "informational": [
        "Protein intake consistently below target",
        "Fiber consumption trending downward"
      ],
      "preventive": [
        "Track daily nutrient intake",
        "Include iron absorption enhancers (vitamin C)"
      ]
    },
    "actionPlan": {
      "immediateActions": [
        "Address iron deficiency immediately",
        "Increase protein intake by 25g daily",
        "Consult healthcare provider about iron supplements"
      ],
      "weeklyGoals": [
        "Include iron-rich foods in every meal",
        "Add fiber-rich foods to each meal",
        "Monitor energy levels and symptoms"
      ],
      "longTermHealth": [
        "Track daily nutrient intake",
        "Include iron absorption enhancers (vitamin C)",
        "Maintain balanced meal planning"
      ]
    },
    "healthImpact": {
      "currentRisks": [
        "Fatigue and weakness",
        "Anemia risk",
        "Reduced cognitive function",
        "Digestive health concerns"
      ],
      "preventionTips": [
        "Pair iron-rich foods with vitamin C sources",
        "Avoid calcium supplements with iron-rich meals",
        "Include regular blood tests to monitor iron levels"
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
  "message": "Authentication required. Please log in to access nutrient gap analysis.",
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
  "message": "An error occurred during nutrient gap analysis. Please try again later.",
  "error": "INTERNAL_SERVER_ERROR"
}
```

## Features

### AI-Powered Deficiency Analysis
- **Groq AI Integration**: Uses `openai/gpt-oss-20b` model for intelligent nutrient analysis
- **Nutritional Standards**: Same comprehensive standards as mealOptimizer service
- **Comprehensive Nutrients**: Analyzes macronutrients and key micronutrients
- **Trend Detection**: Identifies improving, worsening, or stable nutrient patterns

### Smart Food Suggestions
- **Inventory Integration**: Prioritizes foods currently available in user's inventory
- **Catalog Integration**: Suggests additional foods from the food inventory catalog
- **User Preferences**: Considers dietary restrictions and avoid ingredients
- **Multi-Nutrient Targeting**: Suggests foods that address multiple deficiencies simultaneously

### Personalized Meal Planning
- **Complete Meals**: Provides full meal plans with ingredients and preparation instructions
- **Targeted Nutrition**: Each meal designed to address specific nutrient gaps
- **Practical Recipes**: Includes cooking instructions and preparation notes
- **Cost Estimation**: Provides estimated costs for meal planning

### Health Impact Analysis
- **Risk Assessment**: Identifies potential health implications of deficiencies
- **Severity Classification**: Categorizes deficiencies by severity level
- **Action Prioritization**: Provides immediate, short-term, and long-term action plans
- **Preventive Measures**: Suggests strategies to prevent future deficiencies

## Usage Examples

### Frontend Implementation - Nutrient Dashboard
```javascript
// Get comprehensive nutrient gap analysis
const fetchNutrientAnalysis = async (analysisDays = 30) => {
  try {
    const response = await fetch(`/api/nutrient-gap/prediction?analysisDays=${analysisDays}`, {
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    });
    const data = await response.json();

    if (data.success) {
      updateNutritionScore(data.data.summary.overallNutritionScore);
      displayDeficiencies(data.data.nutrientAnalysis);
      showFoodSuggestions(data.data.foodSuggestions);
      highlightMealPlans(data.data.mealSuggestions);
    }
  } catch (error) {
    console.error('Failed to fetch nutrient analysis:', error);
  }
};
```

### React Component - Nutrient Deficiency Card
```jsx
const DeficiencyCard = ({ deficiency }) => {
  const severityColors = {
    mild: 'bg-yellow-100 border-yellow-500 text-yellow-900',
    moderate: 'bg-orange-100 border-orange-500 text-orange-900',
    severe: 'bg-red-100 border-red-500 text-red-900'
  };

  const severityIcons = {
    mild: '⚠️',
    moderate: '🟠',
    severe: '🔴'
  };

  return (
    <div className={`p-4 border-l-4 ${severityColors[deficiency.deficiencyLevel]} rounded-md`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">{deficiency.nutrient}</h3>
        <span className="text-2xl">{severityIcons[deficiency.deficiencyLevel]}</span>
      </div>
      <div className="text-sm mb-2">
        <span className="font-medium">Current:</span> {deficiency.currentIntake}g
        <span className="ml-2 font-medium">Recommended:</span> {deficiency.recommendedIntake}g
      </div>
      <div className="text-xs mb-2">
        <span className="font-medium">Deficiency:</span> {deficiency.deficiencyPercentage}% ({deficiency.deficiencyLevel})
      </div>
      <div className="text-xs text-gray-600 mb-2">
        <span className="font-medium">Trend:</span> {deficiency.trendDirection} • {deficiency.daysDeficient} days deficient
      </div>
    </div>
  );
};
```

### Meal Planner Integration
```javascript
// Get meal suggestions for specific meal type
const fetchMealSuggestions = async (mealType) => {
  try {
    const response = await fetch(`/api/nutrient-gap/meal-suggestions?mealType=${mealType}`, {
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    });
    const data = await response.json();

    if (data.success) {
      displayMealSuggestions(data.data.mealSuggestions);
      updateShoppingList(data.data.mealSuggestions);
      calculateMealCosts(data.data.mealSuggestions);
    }
  } catch (error) {
    console.error('Failed to fetch meal suggestions:', error);
  }
};
```

## Rate Limiting
- **Comprehensive Analysis**: 1 request per minute
- **Deficiency Analysis**: 1 request per 30 seconds
- **Food Suggestions**: 1 request per 30 seconds
- **Meal Suggestions**: 1 request per 30 seconds
- **Nutrition Insights**: 1 request per minute

## Performance Considerations
- **AI Processing**: Full analysis may take 6-10 seconds due to complex nutritional analysis
- **Data Processing**: Analyzes up to 90 days of consumption history
- **Inventory Integration**: Cross-references with current inventory and food catalog
- **Result Caching**: Consider caching results for 2-4 hours for performance

## Integration Tips

### Nutrient Tracking
1. **Daily Logging**: Encourage users to log food consistently for better accuracy
2. **Data Quality**: Show data completeness scores to users
3. **Progress Tracking**: Display improvement trends over time
4. **Visual Indicators**: Use progress bars and color-coded deficiency levels

### Meal Planning Integration
1. **Shopping Lists**: Generate shopping lists from food suggestions
2. **Recipe Integration**: Link to recipe databases for meal suggestions
3. **Calendar Integration**: Schedule meals in user calendars
4. **Cost Tracking**: Track and display meal costs and savings

### Health Monitoring
1. **Symptom Tracking**: Allow users to log symptoms related to deficiencies
2. **Health Alerts**: Send notifications for severe deficiencies
3. **Progress Reports**: Generate weekly/monthly nutrition reports
4. **Professional Integration**: Provide reports for healthcare providers

### Personalization Features
1. **Preference Learning**: Adapt suggestions based on user choices
2. **Seasonal Adjustments**: Modify suggestions based on seasonal availability
3. **Allergy Management**: Strict filtering based on dietary restrictions
4. **Budget Awareness**: Consider user budget constraints in suggestions

## Testing Scenarios
1. **New User**: Test with minimal data (7 days)
2. **Deficient User**: Test with multiple nutrient deficiencies
3. **Balanced User**: Test with optimal nutrition levels
4. **Restricted Diet**: Test with dietary restrictions and allergies
5. **Empty Inventory**: Test with no current inventory items
6. **Large History**: Test with maximum 90 days of data

## Health Disclaimer
- **Medical Advice**: Provide disclaimer that recommendations are not medical advice
- **Professional Consultation**: Recommend consulting healthcare professionals for severe deficiencies
- **Monitoring**: Advise users to monitor symptoms and seek medical attention when needed
- **Supplements**: Clarify when supplements might be necessary vs. dietary changes

## API Versioning
- Current version: v1
- Nutritional standards based on latest dietary guidelines
- Regular updates to reflect new nutritional research
- Backward compatibility maintained within major versions