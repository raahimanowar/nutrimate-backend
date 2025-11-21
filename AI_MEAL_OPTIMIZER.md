# 🤖 AI Meal Optimizer API Documentation

## Overview

The AI Meal Optimizer uses Groq AI to analyze user budget, current inventory, and food catalog to provide personalized shopping recommendations. It helps users make optimal food purchasing decisions based on their dietary preferences, budget constraints, and family needs.

## Base URL
```
http://localhost:5000/api
```

## Authentication
All requests require a valid JWT token in the Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 🚀 Get AI-Powered Meal Optimization

**Endpoint:** `POST /meal-optimizer/optimize`

**Description:** Get personalized food shopping recommendations based on budget and dietary preferences using AI analysis.

**Request Body:**
```json
{
  "budget": 200, // Monthly or per-shopping budget
  "familySize": 3, // Optional, defaults to 1
  "weeklyBudget": false, // Optional, true if budget is weekly
  "dietaryRestrictions": ["vegetarian", "gluten-free"], // Optional
  "preferences": ["organic", "local"] // Optional
}
```

**Parameters:**
- `budget` (required): Budget amount in USD
- `familySize` (optional): Number of family members, defaults to 1
- `weeklyBudget` (optional): Set to `true` if budget is weekly, defaults to `false`
- `dietaryRestrictions` (optional): Array of dietary restrictions
- `preferences` (optional): Array of food preferences (organic, local, etc.)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Meal optimization completed successfully",
  "data": {
    "summary": {
      "totalBudget": 200,
      "allocatedBudget": 185.50,
      "remainingBudget": 14.50,
      "itemsRecommended": 8,
      "priorityCategories": ["protein", "vegetables", "grains"]
    },
    "recommendations": [
      {
        "item": {
          "name": "Chicken Breast",
          "category": "protein",
          "quantity": 2,
          "unit": "kg",
          "costPerUnit": 6.00,
          "totalCost": 12.00,
          "reason": "High-quality lean protein, versatile for multiple meals",
          "nutritionalValue": "High protein, low fat",
          "alternativeOptions": ["Turkey breast", "Tofu"]
        },
        "budgetImpact": {
          "cost": 12.00,
          "remainingBudget": 188.00,
          "percentageUsed": 6.0
        },
        "urgency": "high"
      }
    ],
    "insights": {
      "budgetOptimization": "You're utilizing 92.8% of your $200 budget. The average cost per recommended item is $23.19. Budget is well utilized with strategic selections.",
      "nutritionalFocus": "Your shopping plan focuses on protein, vegetables, grains. Consider adding fruits, dairy for complete nutrition.",
      "costSavingTips": [
        "Buy in bulk for non-perishable items to save 15-30%",
        "Consider seasonal produce for better prices and freshness",
        "Compare unit prices to find best value",
        "Store brands often offer same quality at 20-30% less cost"
      ],
      "mealPlanningSuggestions": [
        "Plan 3-4 days worth of meals to reduce food waste",
        "Prep ingredients in batches for efficient cooking",
        "Use similar ingredients across multiple meals"
      ]
    },
    "currentInventory": {
      "totalItems": 12,
      "totalValue": 45.30,
      "categories": {
        "protein": 3,
        "vegetables": 4,
        "grains": 2,
        "dairy": 2,
        "fruits": 1
      }
    }
  }
}
```

---

## 📊 Get Budget Analysis

**Endpoint:** `POST /meal-optimizer/budget-analysis`

**Description:** Get quick budget analysis without AI (faster response). Useful for UI previews or when AI service is slow.

**Request Body:**
```json
{
  "budget": 150,
  "familySize": 2,
  "weeklyBudget": true
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Budget analysis completed",
  "data": {
    "budget": {
      "total": 600, // Monthly budget
      "weekly": 150,
      "allocated": 0,
      "remaining": 600
    },
    "currentInventory": {
      "totalItems": 8,
      "totalValue": 85.20,
      "categories": {
        "protein": 2,
        "vegetables": 3,
        "grains": 2,
        "fruits": 1
      }
    },
    "availableOptions": {
      "totalItems": 50,
      "averageCost": 4.25,
      "categories": {
        "fruits": 8,
        "vegetables": 12,
        "protein": 10,
        "grains": 8,
        "dairy": 6,
        "beverages": 4,
        "snacks": 2
      }
    },
    "recommendations": {
      "budgetUtilization": "Your current inventory represents 14.2% of your budget",
      "suggestedAllocation": {
        "proteins": 210,
        "grains": 150,
        "vegetables": 120,
        "fruits": 60,
        "dairy": 30,
        "other": 30
      }
    }
  }
}
```

---

## 🥗 Get Nutritional Recommendations

**Endpoint:** `GET /meal-optimizer/recommendations`

**Description:** Get simple nutritional recommendations based on food catalog. No AI analysis, just catalog filtering.

**Query Parameters:**
- `categories` (optional): Filter by categories (comma-separated)
  - Example: `categories=protein,vegetables`
- `budget` (optional): Maximum budget for recommendations

**Example Request:**
```
GET /meal-optimizer/recommendations?categories=protein,vegetables&budget=50
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Nutritional recommendations generated",
  "data": {
    "recommendations": [
      {
        "name": "Chicken",
        "category": "protein",
        "costPerUnit": 0.50,
        "expirationDays": 7,
        "nutritionalScore": 9
      },
      {
        "name": "Broccoli",
        "category": "vegetables",
        "costPerUnit": 0.30,
        "expirationDays": 14,
        "nutritionalScore": 10
      }
    ],
    "summary": {
      "totalItems": 15,
      "totalCost": 42.50,
      "averageCost": 2.83,
      "categories": ["protein", "vegetables"]
    }
  }
}
```

---

## 🤖 AI Model Details

### Technology Stack
- **Provider:** Groq AI
- **Model:** `openai/gpt-oss-20b`
- **Features:** Advanced reasoning, nutritional analysis, budget optimization
- **Response Time:** 3-8 seconds for full optimization
- **Fallback:** Basic recommendations if AI service is unavailable

### AI Analysis Process
1. **User Profile Analysis**: Reviews budget, family size, dietary restrictions
2. **Inventory Assessment**: Analyzes current inventory and nutritional gaps
3. **Food Catalog Analysis**: Examines available options and pricing
4. **AI Recommendations**: Generates personalized shopping list
5. **Budget Optimization**: Allocates budget efficiently
6. **Insights Generation**: Provides actionable tips and suggestions

---

## 📋 API Endpoint Summary

| Method | Endpoint | Purpose | AI Required |
|--------|----------|---------|-------------|
| `POST` | `/meal-optimizer/optimize` | Full AI meal optimization | ✅ Yes |
| `POST` | `/meal-optimizer/budget-analysis` | Quick budget analysis | ❌ No |
| `GET` | `/meal-optimizer/recommendations` | Simple catalog recommendations | ❌ No |

---

## ⚠️ Error Handling

### AI Service Unavailable (503)
```json
{
  "success": false,
  "message": "AI service temporarily unavailable. Please try again later.",
  "error": "AI_SERVICE_ERROR"
}
```

### Invalid Budget (400)
```json
{
  "success": false,
  "message": "Invalid budget configuration provided.",
  "error": "INVALID_BUDGET"
}
```

### Validation Errors (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "location": "body",
      "param": "budget",
      "msg": "Budget must be a positive number"
    }
  ]
}
```

### Authentication Error (401)
```json
{
  "success": false,
  "message": "Authentication required"
}
```

---

## 🎯 Use Cases & Examples

### 1. Weekly Meal Planning
```bash
POST /api/meal-optimizer/optimize
{
  "budget": 150,
  "weeklyBudget": true,
  "familySize": 4,
  "dietaryRestrictions": ["nut-free"]
}
```

### 2. Budget-Conscious Shopping
```bash
POST /api/meal-optimizer/optimize
{
  "budget": 100,
  "familySize": 2,
  "preferences": ["sale-items", "seasonal"]
}
```

### 3. Health-Focused Diet
```bash
POST /api/meal-optimizer/optimize
{
  "budget": 250,
  "dietaryRestrictions": ["vegetarian"],
  "preferences": ["organic", "high-protein"]
}
```

### 4. Quick Budget Check
```bash
POST /api/meal-optimizer/budget-analysis
{
  "budget": 200,
  "familySize": 3
}
```

### 5. Category-Specific Shopping
```bash
GET /api/meal-optimizer/recommendations?categories=protein,dairy&budget=75
```

---

## 🔧 Frontend Integration Tips

### 1. Progressive Loading
```javascript
// First show quick budget analysis
const budgetAnalysis = await fetchBudgetAnalysis(budget);
showQuickSummary(budgetAnalysis);

// Then load full AI optimization
const fullOptimization = await fetchMealOptimization(fullParams);
showDetailedRecommendations(fullOptimization);
```

### 2. Error Handling
```javascript
const optimizeMeals = async (params) => {
  try {
    const response = await fetch('/api/meal-optimizer/optimize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(params)
    });

    const data = await response.json();

    if (data.success) {
      showRecommendations(data.data);
    } else if (data.error === 'AI_SERVICE_ERROR') {
      showFallbackOptions();
      scheduleRetry();
    } else {
      showValidationError(data.message);
    }
  } catch (error) {
    handleNetworkError(error);
  }
};
```

### 3. Budget Input Component
```jsx
const BudgetForm = ({ onOptimize }) => {
  const [budget, setBudget] = useState(200);
  const [familySize, setFamilySize] = useState(1);
  const [weeklyBudget, setWeeklyBudget] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onOptimize({ budget, familySize, weeklyBudget });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Budget ($)</label>
        <input
          type="number"
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
          min="0"
          step="0.01"
          required
        />
      </div>

      <div>
        <label>Family Size</label>
        <input
          type="number"
          value={familySize}
          onChange={(e) => setFamilySize(Number(e.target.value))}
          min="1"
          max="20"
        />
      </div>

      <div>
        <label>
          <input
            type="checkbox"
            checked={weeklyBudget}
            onChange={(e) => setWeeklyBudget(e.target.checked)}
          />
          Weekly Budget
        </label>
      </div>

      <button type="submit">Optimize Meals</button>
    </form>
  );
};
```

### 4. Recommendation Display
```jsx
const RecommendationCard = ({ recommendation }) => {
  const { item, budgetImpact, urgency } = recommendation;

  return (
    <div className={`recommendation-card urgency-${urgency}`}>
      <div className="item-header">
        <h3>{item.name}</h3>
        <span className="category">{item.category}</span>
        <span className="urgency">{urgency}</span>
      </div>

      <div className="item-details">
        <p>Quantity: {item.quantity} {item.unit}</p>
        <p>Cost: ${item.costPerUnit}/{item.unit}</p>
        <p className="total-cost">Total: ${item.totalCost}</p>
      </div>

      <div className="item-reason">
        <strong>Why recommended:</strong>
        <p>{item.reason}</p>
        <p><em>Nutritional value: {item.nutritionalValue}</em></p>
      </div>

      <div className="budget-impact">
        <p>Budget impact: {budgetImpact.percentageUsed.toFixed(1)}%</p>
        <p>Remaining: ${budgetImpact.remainingBudget}</p>
      </div>

      {item.alternativeOptions && item.alternativeOptions.length > 0 && (
        <div className="alternatives">
          <p><strong>Alternatives:</strong></p>
          <ul>
            {item.alternativeOptions.map((alt, i) => (
              <li key={i}>{alt}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
```

---

## 📈 Performance Considerations

- **AI Optimization**: 3-8 seconds response time
- **Budget Analysis**: < 1 second response time
- **Recommendations**: < 500ms response time
- **Rate Limiting**: Consider implementing client-side rate limiting for AI calls
- **Caching**: Cache results for identical budget/family combinations
- **Fallback**: Always have basic recommendations ready if AI service fails

---

## 🔒 Security Notes

- All endpoints require authentication
- Budget amounts are validated server-side
- Family size limited to 1-20 people
- Input sanitization for dietary restrictions and preferences
- API key is stored securely in environment variables

The AI Meal Optimizer provides intelligent, personalized food shopping recommendations while maintaining user privacy and data security!