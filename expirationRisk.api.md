# AI Expiration Risk Prediction API Documentation

## Overview
The AI Expiration Risk Prediction API provides intelligent analysis of food inventory items to predict expiration risks, prioritize consumption, and generate alerts based on seasonality and consumption patterns.

## Base URL
```
https://nutrimate-backend-url.onrender.com/api/expiration-risk
```

## Authentication
All endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### 1. Get Comprehensive Risk Predictions
**GET** `/predictions`

Get detailed AI-powered expiration risk analysis for all items in the user's inventory.

#### Response Structure
```json
{
  "success": true,
  "message": "Expiration risk predictions generated successfully",
  "data": {
    "summary": {
      "totalItemsAnalyzed": 15,
      "criticalAlerts": 3,
      "highRiskItems": 5,
      "potentialLoss": 45.75,
      "userLocation": "New York, US",
      "currentSeason": "summer",
      "analysisDate": "2024-07-21T10:30:00.000Z",
      "overallRiskLevel": "high"
    },
    "riskPredictions": [
      {
        "item": {
          "id": "60f7b3b3b3b3b3b3b3b3b3b3",
          "name": "Fresh Strawberries",
          "category": "fruits",
          "quantity": 2,
          "unit": "cups",
          "expirationDate": "2024-07-24T00:00:00.000Z",
          "daysUntilExpiration": 3,
          "estimatedValue": 8.50
        },
        "riskAnalysis": {
          "overallRiskScore": 85,
          "expirationRisk": "critical",
          "consumptionUrgency": "immediate",
          "seasonalityRisk": "increased",
          "aiRiskScore": 90
        },
        "recommendations": {
          "consumeBy": "2024-07-24",
          "consumptionPriority": 1,
          "storageTips": [
            "Store in refrigerator crisper drawer",
            "Keep away from ethylene-producing foods",
            "Check daily for spoilage"
          ],
          "alternativeUses": [
            "Make smoothies",
            "Create fruit salads",
            "Use in baked goods",
            "Freeze for later use"
          ],
          "alertLevel": "red"
        },
        "reasoning": {
          "primaryReason": "Expires in 3 days during warm season",
          "contributingFactors": [
            "Seasonal multiplier: 1.3x",
            "Value at risk: $8.50",
            "High temperature sensitivity"
          ],
          "seasonalityImpact": "Fruits spoil faster in warm weather due to increased ripening",
          "consumptionPatternAnalysis": "Based on typical fruits consumption patterns"
        }
      }
    ],
    "consumptionPriority": [
      {
        "itemName": "Fresh Strawberries",
        "priority": 1,
        "reason": "Expires in 3 days during warm season",
        "alertLevel": "red"
      }
    ],
    "insights": {
      "seasonalAlerts": [
        "🔥 Warm weather alert: Fruits and vegetables are spoiling 30% faster!",
        "🥛 Dairy products need extra attention - ensure proper refrigeration"
      ],
      "consumptionTips": [
        "🚨 IMMEDIATE: Consume 3 items in the next 3 days",
        "🍳 Consider batch cooking to use up ingredients quickly"
      ],
      "wastePreventionStrategies": [
        "🔄 Weekly inventory audit to identify at-risk items",
        "🍎 Create 'eat me first' box in refrigerator for high-risk items"
      ]
    }
  }
}
```

#### Risk Levels Explained
- **critical**: Expires in 0-3 days (Red Alert)
- **high**: Expires in 4-7 days (Orange Alert)
- **medium**: Expires in 8-14 days (Yellow Alert)
- **low**: Expires in 15+ days (Green Alert)

#### Alert Levels
- **red**: Immediate attention required
- **orange**: High priority
- **yellow**: Moderate priority
- **green**: Monitor regularly

---

### 2. Get High-Risk Items Only
**GET** `/high-risk`

Retrieve only critical and high-risk items that need immediate attention. Perfect for dashboard widgets and notifications.

#### Response Structure
```json
{
  "success": true,
  "message": "High-risk items retrieved successfully",
  "data": {
    "summary": {
      "totalHighRiskItems": 8,
      "criticalItems": 3,
      "totalValueAtRisk": 45.75
    },
    "highRiskItems": [
      {
        "id": "60f7b3b3b3b3b3b3b3b3b3b3",
        "name": "Fresh Strawberries",
        "category": "fruits",
        "quantity": 2,
        "unit": "cups",
        "expirationDate": "2024-07-24T00:00:00.000Z",
        "daysUntilExpiration": 3,
        "alertLevel": "red",
        "consumeBy": "2024-07-24",
        "primaryReason": "Expires in 3 days during warm season",
        "storageTips": [
          "Store in refrigerator crisper drawer",
          "Keep away from ethylene-producing foods"
        ],
        "estimatedValue": 8.50
      }
    ],
    "urgentActions": [
      {
        "itemName": "Fresh Strawberries",
        "priority": 1,
        "reason": "Expires in 3 days during warm season",
        "alertLevel": "red"
      }
    ],
    "seasonalAlerts": [
      "🔥 Warm weather alert: Fruits and vegetables are spoiling 30% faster!"
    ]
  }
}
```

---

### 3. Get Seasonal Alerts
**GET** `/seasonal-alerts`

Get weather-related expiration warnings and seasonal recommendations based on user location.

#### Response Structure
```json
{
  "success": true,
  "message": "Seasonal alerts retrieved successfully",
  "data": {
    "currentSeason": "summer",
    "userLocation": "New York, US",
    "seasonalAlerts": [
      "🔥 Warm weather alert: Fruits and vegetables are spoiling 30% faster!",
      "🥛 Dairy products need extra attention - ensure proper refrigeration",
      "⚠️ 5 items at increased risk due to seasonal conditions"
    ],
    "affectedCategories": ["fruits", "vegetables", "dairy", "protein"],
    "seasonalTips": [
      "Store items in the coolest part of your refrigerator",
      "Consider freezing items that won't be consumed quickly"
    ],
    "highRiskSeasonalItems": [
      {
        "id": "60f7b3b3b3b3b3b3b3b3b3b3",
        "name": "Fresh Strawberries",
        "category": "fruits",
        "seasonalityImpact": "Fruits spoil 30% faster in warm weather due to accelerated ripening",
        "alertLevel": "red"
      }
    ]
  }
}
```

## Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Authentication required. Please log in to access expiration risk predictions.",
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
  "message": "An error occurred while generating expiration risk predictions. Please try again later.",
  "error": "INTERNAL_SERVER_ERROR"
}
```

## Features

### AI-Powered Analysis
- Uses Groq's AI model with food-specific knowledge
- Analyzes consumption patterns based on user data
- Considers seasonal factors and temperature effects
- Provides actionable recommendations

### Seasonal Intelligence
- Automatic season detection based on user location
- Temperature and humidity factor calculations
- Category-specific seasonal risk multipliers
- Weather-appropriate storage recommendations

### Risk Prioritization
- FIFO (First In, First Out) combined with AI ranking
- Risk scores from 0-100 for precise prioritization
- Multi-factor risk assessment (expiration, season, value, usage)
- Color-coded alert system for quick visual reference

### Waste Prevention
- Alternative usage suggestions for at-risk items
- Storage optimization tips
- Batch cooking recommendations
- Comprehensive waste prevention strategies

## Usage Examples

### Frontend Implementation - Dashboard Widget
```javascript
// Get high-risk items for dashboard
const fetchHighRiskItems = async () => {
  try {
    const response = await fetch('/api/expiration-risk/high-risk', {
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    });
    const data = await response.json();

    if (data.success) {
      displayHighRiskAlerts(data.data.highRiskItems);
      updateDashboardSummary(data.data.summary);
    }
  } catch (error) {
    console.error('Failed to fetch high-risk items:', error);
  }
};
```

### React Component - Risk Alert Card
```jsx
const RiskAlertCard = ({ item }) => {
  const alertColors = {
    red: 'bg-red-100 border-red-500 text-red-900',
    orange: 'bg-orange-100 border-orange-500 text-orange-900',
    yellow: 'bg-yellow-100 border-yellow-500 text-yellow-900',
    green: 'bg-green-100 border-green-500 text-green-900'
  };

  return (
    <div className={`p-4 border-l-4 ${alertColors[item.alertLevel]} rounded-md`}>
      <h3 className="font-semibold">{item.name}</h3>
      <p className="text-sm">Expires in {item.daysUntilExpiration} days</p>
      <p className="text-xs mt-1">{item.primaryReason}</p>
      <div className="mt-2">
        <span className="text-xs font-medium">
          Consume by: {item.consumeBy}
        </span>
      </div>
    </div>
  );
};
```

## Rate Limiting
- Recommended: 1 request per minute for full predictions
- High-risk endpoint: 1 request per 30 seconds
- Seasonal alerts: 1 request per 5 minutes

## Performance Considerations
- Full predictions may take 3-5 seconds due to AI processing
- Consider caching results for short periods (5-10 minutes)
- Use high-risk endpoint for frequent updates
- Seasonal alerts change slowly, cache for longer periods

## Integration Tips
1. **User Experience**: Show loading states during AI processing
2. **Progressive Enhancement**: Display basic expiration info while AI loads
3. **Real-time Updates**: Implement periodic refresh for critical items
4. **Mobile Optimization**: Prioritize alert visibility on small screens
5. **Accessibility**: Ensure color-coded alerts have text alternatives

## Testing
Use the following test scenarios:
- Items expiring today (should show critical)
- Items with seasonal risk multipliers
- Empty inventory (should return appropriate message)
- Various user locations (different seasons)
- Large inventory sets (performance testing)