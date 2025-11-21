# Meal Optimizer API Documentation

## Overview

The Meal Optimizer service provides intelligent meal planning, nutritional analysis, and shopping list generation with local price comparisons. It helps users optimize their grocery shopping while meeting nutritional requirements and budget constraints.

## Base URL
```
POST /api/meal-optimizer
```

## Authentication
All requests require a valid user authentication token in the `Authorization` header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Basic Meal Optimization

Generates food recommendations based on user profile, budget, and nutritional needs without creating a detailed meal plan.

#### Request
```http
POST /api/meal-optimizer/optimize
Content-Type: application/json

{
  "userId": "string",
  "userProfile": {
    "budget": 150,
    "dietaryRestrictions": ["vegetarian", "gluten-free"],
    "preferences": ["organic", "low-sodium"],
    "familySize": 4,
    "weeklyBudget": true,
    "userLocation": "New York, NY"
  }
}
```

#### Response
```json
{
  "summary": {
    "totalBudget": 600,
    "allocatedBudget": 450.75,
    "remainingBudget": 149.25,
    "itemsRecommended": 9,
    "priorityCategories": ["protein", "vegetables", "grains"],
    "localSavings": 23.50
  },
  "recommendations": [
    {
      "item": {
        "name": "Organic Chicken Breast",
        "category": "protein",
        "quantity": 3,
        "unit": "lbs",
        "costPerUnit": 6.99,
        "totalCost": 20.97,
        "reason": "Lean protein source for muscle maintenance",
        "nutritionalValue": "High protein, low fat, vitamin B6",
        "alternativeOptions": ["Tofu", "Lentils"],
        "inventoryStatus": "not_in_inventory"
      },
      "budgetImpact": {
        "cost": 20.97,
        "remainingBudget": 579.03,
        "percentageUsed": 3.5
      },
      "urgency": "high",
      "localPriceInfo": {
        "itemName": "Organic Chicken Breast",
        "localPrice": {
          "price": 5.49,
          "store": "Trader Joe's",
          "location": "New York, NY",
          "savings": 1.50,
          "isCheaper": true
        },
        "alternatives": [
          {
            "name": "Chicken Thighs",
            "category": "protein",
            "price": 3.99,
            "unit": "lb",
            "store": "Walmart",
            "savings": 3.00,
            "nutritionalInfo": "Higher fat content but more budget-friendly"
          }
        ]
      }
    }
  ],
  "insights": {
    "budgetOptimization": "You're utilizing 75.1% of your $600.00 budget.",
    "nutritionalFocus": "Your shopping plan focuses on protein, vegetables, grains.",
    "costSavingTips": [
      "Buy in bulk for non-perishable items to save 15-30%",
      "Consider seasonal produce for better prices and freshness"
    ],
    "mealPlanningSuggestions": [
      "Plan 3-4 days worth of meals to reduce food waste",
      "Prep ingredients in batches for efficient cooking"
    ],
    "localPriceInsights": "3 of 9 recommended items have potential local savings advantages. 2 items are available at lower local prices, potentially saving you $23.50."
  },
  "currentInventory": {
    "totalItems": 12,
    "totalValue": 87.43,
    "categories": {
      "protein": 3,
      "vegetables": 2,
      "grains": 4,
      "dairy": 3
    }
  }
}
```

### 2. Weekly Meal Plan with Shopping List

Generates a complete 7-day meal plan with detailed shopping list organized by store sections.

#### Request
```http
POST /api/meal-optimizer/meal-plan
Content-Type: application/json

{
  "userId": "string",
  "userProfile": {
    "budget": 200,
    "dietaryRestrictions": ["vegetarian"],
    "preferences": ["organic"],
    "familySize": 2,
    "weeklyBudget": false,
    "userLocation": "San Francisco, CA"
  },
  "includeMealPlan": true
}
```

#### Response
```json
{
  "summary": {
    "totalBudget": 200,
    "allocatedBudget": 145.80,
    "remainingBudget": 54.20,
    "itemsRecommended": 8,
    "priorityCategories": ["protein", "vegetables", "grains"],
    "localSavings": 18.75
  },
  "recommendations": [...],
  "insights": {
    "budgetOptimization": "You're utilizing 72.9% of your $200.00 budget.",
    "nutritionalFocus": "Your shopping plan focuses on protein, vegetables, grains.",
    "costSavingTips": [...],
    "mealPlanningSuggestions": [...],
    "localPriceInsights": "4 of 8 recommended items have potential local savings advantages."
  },
  "currentInventory": {...},
  "mealPlan": {
    "mealPlan": {
      "weeklyPlan": [
        {
          "day": "Monday",
          "breakfast": [
            {
              "name": "Overnight Oats with Berries",
              "category": "grains",
              "quantity": 2,
              "unit": "servings",
              "calories": 480,
              "protein": 18,
              "carbs": 72,
              "fat": 14,
              "fiber": 12,
              "cost": 4.50,
              "preparationNotes": "Prepare night before with rolled oats, almond milk, mixed berries"
            }
          ],
          "lunch": [
            {
              "name": "Quinoa Buddha Bowl",
              "category": "grains",
              "quantity": 2,
              "unit": "servings",
              "calories": 520,
              "protein": 22,
              "carbs": 68,
              "fat": 18,
              "fiber": 16,
              "cost": 7.25,
              "preparationNotes": "Cook quinoa, roast vegetables, add tahini dressing"
            }
          ],
          "dinner": [
            {
              "name": "Lentil Curry with Brown Rice",
              "category": "protein",
              "quantity": 2,
              "unit": "servings",
              "calories": 580,
              "protein": 28,
              "carbs": 82,
              "fat": 12,
              "fiber": 24,
              "cost": 8.75,
              "preparationNotes": "Simmer lentils with spices, serve over brown rice"
            }
          ],
          "totalNutrition": {
            "calories": 1580,
            "protein": 68,
            "carbs": 222,
            "fat": 44,
            "fiber": 52
          },
          "totalCost": 20.50
        }
      ],
      "weeklyNutrition": {
        "totalCalories": 11060,
        "totalProtein": 476,
        "totalCarbs": 1554,
        "totalFat": 308,
        "totalFiber": 364,
        "dailyAverages": {
          "calories": 1580,
          "protein": 68,
          "carbs": 222,
          "fat": 44,
          "fiber": 52
        }
      },
      "weeklyCost": 143.50
    },
    "shoppingList": {
      "recommendedItems": [
        {
          "section": "Fresh Produce",
          "items": [
            {
              "name": "Spinach",
              "category": "vegetables",
              "quantityNeeded": 2.5,
              "unit": "lbs",
              "estimatedCost": 7.50,
              "source": "food_inventory",
              "notes": ""
            },
            {
              "name": "Berries (mixed)",
              "category": "fruits",
              "quantityNeeded": 3,
              "unit": "cups",
              "estimatedCost": 9.00,
              "source": "local_alternative",
              "notes": "Available at Trader Joe's for $3.00/cup - seasonal"
            }
          ],
          "totalCost": 16.50
        },
        {
          "section": "Grains & Pasta",
          "items": [
            {
              "name": "Quinoa",
              "category": "grains",
              "quantityNeeded": 2,
              "unit": "lbs",
              "estimatedCost": 12.00,
              "source": "food_inventory",
              "notes": "High protein complete grain"
            }
          ],
          "totalCost": 12.00
        }
      ],
      "alternativeItems": [
        {
          "section": "Fresh Produce",
          "items": [
            {
              "name": "Kale",
              "category": "vegetables",
              "quantityNeeded": 2.5,
              "unit": "lbs",
              "estimatedCost": 5.00,
              "source": "local_alternative",
              "notes": "Nutrient-dense alternative to spinach. Available at Safeway"
            }
          ],
          "totalCost": 5.00
        }
      ],
      "totalEstimatedCost": 127.05,
      "totalPotentialSavings": 18.75,
      "shoppingNotes": [
        "Shop with a list to avoid impulse purchases",
        "Check expiration dates and plan accordingly",
        "Consider buying in bulk for non-perishable items to save money",
        "Weekly meal plan estimated cost: $143.50",
        "You have $45.20 worth of food in inventory - use items nearing expiration first",
        "Meal plan meets daily calorie targets",
        "Adequate protein intake planned for muscle maintenance"
      ]
    },
    "insights": {
      "nutritionalCompliance": "✅ Meal plan meets daily calorie requirements\n✅ Adequate protein for nutritional needs\n✅ Meets fiber requirements for digestive health",
      "budgetEfficiency": "Weekly meal cost: $143.50 ($20.50 per day)\n💰 Save $18.75 by choosing local alternatives",
      "mealPrepTips": [
        "Batch cook grains and proteins on weekends",
        "Prep vegetables in advance for quick meal assembly",
        "Use similar ingredients across multiple meals to reduce waste",
        "Store prepped ingredients in airtight containers"
      ],
      "shoppingTips": [
        "Shop perimeter of store first for fresh items",
        "Buy seasonal produce for better prices and flavor",
        "Check store flyers for sales on planned items",
        "Consider frozen alternatives for out-of-season produce"
      ]
    }
  }
}
```

## Request Parameters

### UserProfile Object

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `budget` | number | Yes | Total budget for shopping (weekly if weeklyBudget is true, per trip if false) | 150 |
| `dietaryRestrictions` | string[] | No | User dietary restrictions | ["vegetarian", "gluten-free", "dairy-free"] |
| `preferences` | string[] | No | Food preferences | ["organic", "low-sodium", "non-gmo"] |
| `familySize` | number | No | Number of people in household | 4 |
| `weeklyBudget` | boolean | No | Whether budget is weekly (multiplied by 4) | true |
| `userLocation` | string | No | User location for local price comparisons | "New York, NY" |

## Response Objects

### Recommendation Item

| Field | Type | Description |
|-------|------|-------------|
| `item` | object | Food item details |
| `budgetImpact` | object | Cost information |
| `urgency` | string | Priority level: "high", "medium", "low" |
| `localPriceInfo` | object | Local price comparison data |

### Meal Item

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Meal/food item name |
| `category` | string | Food category |
| `quantity` | number | Quantity needed |
| `unit` | string | Unit of measurement |
| `calories` | number | Calorie content |
| `protein` | number | Protein content in grams |
| `carbs` | number | Carbohydrate content in grams |
| `fat` | number | Fat content in grams |
| `fiber` | number | Fiber content in grams |
| `cost` | number | Estimated cost |
| `preparationNotes` | string | Cooking/preparation instructions |

### Shopping List Section

| Field | Type | Description |
|-------|------|-------------|
| `section` | string | Store section name |
| `items` | array | List of items in this section |
| `totalCost` | number | Total cost for this section |

## Nutritional Requirements

The AI ensures meal plans meet these daily nutritional targets (per person):

| Nutrient | Target | Range/Minimum |
|----------|--------|---------------|
| Calories | 2000 kcal | 1800-2200 kcal |
| Protein | 75g | Minimum 60g |
| Carbohydrates | 275g | 225-325g |
| Fat | 62g | 45-80g |
| Fiber | 20g | Minimum 20g |

Additional Requirements:
- Each meal ≥ 250 kcal
- Maximum 3 servings of same food per day
- Daily inclusion: 1 fruit, 1 vegetable, 1 protein, 1 whole grain, 1 iron-rich, 1 calcium-rich item
- At least 2 different meal types per day

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid input parameters",
  "message": "Budget must be a positive number",
  "code": "INVALID_BUDGET"
}
```

### 401 Unauthorized
```json
{
  "error": "Authentication required",
  "message": "Please provide valid authentication token",
  "code": "AUTH_REQUIRED"
}
```

### 500 Internal Server Error
```json
{
  "error": "Meal optimization failed",
  "message": "Unable to process request at this time",
  "code": "PROCESSING_ERROR"
}
```

## Rate Limits

- **Basic Optimization**: 10 requests per minute per user
- **Meal Plan Generation**: 5 requests per minute per user
- **Local Price Search**: 3 requests per minute per item

## Integration Examples

### JavaScript/TypeScript

```typescript
const optimizeMeals = async (userId: string, userProfile: UserProfile) => {
  try {
    const response = await fetch('/api/meal-optimizer/optimize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        userId,
        userProfile
      })
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Meal optimization failed:', error);
    throw error;
  }
};

const generateMealPlan = async (userId: string, userProfile: UserProfile) => {
  try {
    const response = await fetch('/api/meal-optimizer/meal-plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        userId,
        userProfile,
        includeMealPlan: true
      })
    });

    const result = await response.json();

    // Access meal plan data
    const { mealPlan } = result;
    console.log('Weekly meal plan:', mealPlan.mealPlan.weeklyPlan);
    console.log('Shopping list:', mealPlan.shoppingList.recommendedItems);

    return result;
  } catch (error) {
    console.error('Meal plan generation failed:', error);
    throw error;
  }
};
```

### cURL

```bash
# Basic Optimization
curl -X POST https://your-api.com/api/meal-optimizer/optimize \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "userId": "user123",
    "userProfile": {
      "budget": 200,
      "familySize": 2,
      "dietaryRestrictions": ["vegetarian"],
      "weeklyBudget": true,
      "userLocation": "New York, NY"
    }
  }'

# Full Meal Plan with Shopping List
curl -X POST https://your-api.com/api/meal-optimizer/meal-plan \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "userId": "user123",
    "userProfile": {
      "budget": 200,
      "familySize": 2,
      "dietaryRestrictions": ["vegetarian"],
      "weeklyBudget": true,
      "userLocation": "New York, NY"
    },
    "includeMealPlan": true
  }'
```

## Best Practices

### For Users
1. **Provide complete profile data** - Include dietary restrictions and family size for accurate recommendations
2. **Set realistic budgets** - Account for family size and local food costs
3. **Enable location services** - For local price comparisons and savings
4. **Update inventory regularly** - For more accurate shopping lists

### For Developers
1. **Implement retry logic** - For API timeouts and temporary failures
2. **Cache results** - Store optimization results for 24 hours
3. **Handle partial failures** - Gracefully fall back to basic recommendations if local search fails
4. **Validate input** - Check budget and profile parameters before sending requests

## Support

For API support and questions:
- Documentation: [API Docs](https://your-docs-site.com)
- Issues: [GitHub Issues](https://github.com/your-repo/issues)
- Email: support@yourapp.com

---

*Last updated: November 2024*
*Version: 2.0.0*