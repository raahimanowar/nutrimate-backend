# NutriMate Tracking API

**Base URL:** `http://localhost:5000/api/tracking`

**Authentication:** `Authorization: Bearer <jwt_token>`

---

## Get Tracking Summary

**GET** `/api/tracking/summary`

**Query Parameters:**
```
range: daily | weekly | monthly | custom (default: weekly)
startDate: YYYY-MM-DD (for custom range)
endDate: YYYY-MM-DD (for custom range)
limit: number (max days to return, default: 365)
```

**Examples:**
```bash
# Last 7 days (default)
GET /api/tracking/summary

# Today only
GET /api/tracking/summary?range=daily

# Last 30 days
GET /api/tracking/summary?range=monthly

# Custom date range
GET /api/tracking/summary?startDate=2024-01-01&endDate=2024-01-31
```

---

## Get Calorie Graph Data

**GET** `/api/tracking/calories`
**Headers:** `Authorization: Bearer <jwt_token>`

**Query Parameters:**
```
range: daily | weekly | monthly | custom (default: weekly)
startDate: YYYY-MM-DD (for custom range)
endDate: YYYY-MM-DD (for custom range)
```

**Response:**
```json
{
  "success": true,
  "message": "Calorie graph data retrieved for weekly view (7 days)",
  "data": {
    "chartData": {
      "calories": [
        {
          "date": "2024-01-20",
          "value": 1850,
          "movingAverage": 1900
        }
      ],
      "protein": [
        {
          "date": "2024-01-20",
          "value": 75
        }
      ],
      "carbs": [
        {
          "date": "2024-01-20",
          "value": 220
        }
      ],
      "fats": [
        {
          "date": "2024-01-20",
          "value": 65
        }
      ]
    },
    "summary": {
      "calories": {
        "average": 1900,
        "min": 1200,
        "max": 2500
      }
    }
  }
}
```

**Examples:**
```bash
# Last 7 days
GET /api/tracking/calories

# Last 30 days
GET /api/tracking/calories?range=monthly

# Custom date range
GET /api/tracking/calories?startDate=2024-01-01&endDate=2024-01-31
```

---

## Get Water Intake Graph Data

**GET** `/api/tracking/water`
**Headers:** `Authorization: Bearer <jwt_token>`

**Query Parameters:**
```
range: daily | weekly | monthly | custom (default: weekly)
startDate: YYYY-MM-DD (for custom range)
endDate: YYYY-MM-DD (for custom range)
```

**Response:**
```json
{
  "success": true,
  "message": "Water intake graph data retrieved for weekly view (7 days)",
  "data": {
    "chartData": {
      "waterIntake": [
        {
          "date": "2024-01-20",
          "value": 8,
          "movingAverage": 7.5,
          "goalMet": true
        }
      ]
    },
    "summary": {
      "waterIntake": {
        "average": 7.5,
        "min": 4,
        "max": 10
      },
      "hydrationGoal": {
        "daily": 8,
        "totalMet": 5,
        "percentageMet": 71
      }
    }
  }
}
```

**Examples:**
```bash
# Last 7 days
GET /api/tracking/water

# Last 30 days
GET /api/tracking/water?range=monthly

# Custom date range
GET /api/tracking/water?startDate=2024-01-01&endDate=2024-01-31
```

---

## Response

```json
{
  "success": true,
  "message": "Enhanced tracking data retrieved for weekly view (7 days)",
  "data": {
    "inventory": {
      "totalCount": 15,
      "categoryBreakdown": {
        "fruits": 3,
        "vegetables": 5,
        "dairy": 2,
        "grains": 2,
        "protein": 2,
        "beverages": 1,
        "snacks": 0,
        "other": 0
      },
      "expiringSoon": 2,
      "averageCostPerUnit": 2.45
    },
    "recentLogs": [
      {
        "date": "2024-01-20",
        "totalCalories": 1850,
        "totalProtein": 68,
        "totalItems": 6
      }
    ],
    "recommendedResources": [
      {
        "title": "Dairy Storage Tips",
        "url": "https://example.com",
        "relatedTo": "Dairy category",
        "reason": "Because you consumed dairy products",
        "category": "dairy"
      }
    ]
  },
  "timeRange": {
    "type": "weekly",
    "startDate": "2024-01-14",
    "endDate": "2024-01-20",
    "dayCount": 7
  }
}
```

---

## What You Get

### 📊 **Inventory Summary**
- Total items in your pantry
- Items per food category
- Items expiring in 3 days
- Average cost per item

### 📈 **Recent Logs**
- Daily nutrition data
- Calories and protein totals
- Number of items logged per day

### 🎯 **Smart Recommendations**
- **Priority 5**: Items expiring soon → Recipe ideas
- **Priority 4**: Low protein intake → Protein guides
- **Priority 3**: Category consumed → Storage tips
- **Priority 1**: General → Category matches

### ⏰ **Time Range Info**
- Range type used
- Start/end dates
- Number of days included

---

## Food Categories

| Category | Examples |
|----------|----------|
| `fruits` | Apples, bananas, berries |
| `vegetables` | Carrots, spinach, broccoli |
| `dairy` | Milk, cheese, yogurt |
| `grains` | Bread, rice, pasta |
| `protein` | Meat, fish, eggs |
| `beverages` | Water, juice, coffee |
| `snacks` | Chips, nuts, candy |
| `other` | Everything else |

---

## Use Cases

```bash
# Daily check - today's nutrition and inventory
GET /api/tracking/summary?range=daily

# Weekly planning - last 7 days trends
GET /api/tracking/summary?range=weekly

# Monthly review - 30 day analysis
GET /api/tracking/summary?range=monthly

# Custom period - specific date range
GET /api/tracking/summary?startDate=2024-01-01&endDate=2024-01-31

# Get calorie graph data
GET /api/tracking/calories?range=weekly

# Get water intake graph data
GET /api/tracking/water?range=weekly
```

**Graph Data Usage:**
```bash
# Get calorie data for charts
GET /api/tracking/calories?range=monthly

# Get water intake data for charts
GET /api/tracking/water?range=monthly

# Custom date ranges
GET /api/tracking/calories?startDate=2024-01-01&endDate=2024-01-31
GET /api/tracking/water?startDate=2024-01-01&endDate=2024-01-31
```

---

## Errors

**401 - Authentication Required**
```json
{
  "success": false,
  "message": "Authentication required"
}
```

**500 - Server Error**
```json
{
  "success": false,
  "message": "Internal server error while fetching tracking summary"
}
```

Here are the complete outputs from the separate graph endpoints:

  🔥 Calorie Graph Output (/api/tracking/calories)

  {
    "success": true,
    "message": "Calorie graph data retrieved for weekly view (7 days)",
    "data": {
      "graphData": [
        {
          "date": "2024-01-14",
          "calories": 1850,
          "protein": 75,
          "carbs": 220,
          "fats": 65,
          "itemsCount": 5
        },
        {
          "date": "2024-01-15",
          "calories": 2100,
          "protein": 85,
          "carbs": 250,
          "fats": 75,
          "itemsCount": 6
        }
        // ... more days
      ],
      "movingAverages": [
        {
          "date": "2024-01-14",
          "caloriesMovingAvg": 1850
        },
        {
          "date": "2024-01-15",
          "caloriesMovingAvg": 1975
        }
        // ... more moving averages
      ],
      "summary": {
        "calories": {
          "total": 13300,
          "average": 1900,
          "min": 1200,
          "max": 2500
        },
        "protein": {
          "total": 525,
          "average": 75.0
        },
        "carbs": {
          "total": 1540,
          "average": 220.0
        },
        "fats": {
          "total": 455,
          "average": 65.0
        }
      },
      "timeRange": {
        "type": "weekly",
        "startDate": "2024-01-14",
        "endDate": "2024-01-20",
        "dayCount": 7
      },
      "chartData": {
        "calories": [
          {
            "date": "2024-01-14",
            "value": 1850,
            "movingAverage": 1850
          }
        ],
        "protein": [
          {
            "date": "2024-01-14",
            "value": 75
          }
        ],
        "carbs": [
          {
            "date": "2024-01-14",
            "value": 220
          }
        ],
        "fats": [
          {
            "date": "2024-01-14",
            "value": 65
          }
        ]
      }
    }
  }

  💧 Water Intake Graph Output (/api/tracking/water)

  {
    "success": true,
    "message": "Water intake graph data retrieved for weekly view (7 days)",
    "data": {
      "graphData": [
        {
          "date": "2024-01-14",
          "waterIntake": 8,
          "itemsCount": 5
        },
        {
          "date": "2024-01-15",
          "waterIntake": 6,
          "itemsCount": 6
        }
        // ... more days
      ],
      "movingAverages": [
        {
          "date": "2024-01-14",
          "waterMovingAvg": 8.0
        },
        {
          "date": "2024-01-15",
          "waterMovingAvg": 7.0
        }
        // ... more moving averages
      ],
      "summary": {
        "waterIntake": {
          "total": 56,
          "average": 8.0,
          "min": 4,
          "max": 10
        },
        "hydrationGoal": {
          "daily": 8,
          "totalMet": 5,
          "percentageMet": 71
        }
      },
      "timeRange": {
        "type": "weekly",
        "startDate": "2024-01-14",
        "endDate": "2024-01-20",
        "dayCount": 7
      },
      "chartData": {
        "waterIntake": [
          {
            "date": "2024-01-14",
            "value": 8,
            "movingAverage": 8.0,
            "goalMet": true
          },
          {
            "date": "2024-01-15",
            "value": 6,
            "movingAverage": 7.0,
            "goalMet": false
          }
        ]
      }
    }
  }

  📊 Key Differences:

  Calorie Endpoint (/api/tracking/calories):

  - Metrics: Calories, protein, carbs, fats
  - Moving Averages: Smooths calorie trends
  - No Goals: No target/goal functionality
  - Focus: Nutritional intake visualization

  Water Endpoint (/api/tracking/water):

  - Metrics: Water intake only
  - Moving Averages: Smooths hydration trends
  - Goals: Built-in 8-glasses daily goal tracking
  - Goal Met: Boolean showing if daily goal achieved
  - Hydration Stats: Percentage of days goal was met

  🎯 For Chart Implementation:

  Calorie Charts:
  // Perfect for line/bar charts showing calories over time
  const caloriesChart = response.data.chartData.calories.map(day => ({
    x: day.date,
    y: day.value,
    movingAvg: day.movingAverage
  }));

  Water Charts:
  // Perfect for showing hydration progress and goal achievement
  const waterChart = response.data.chartData.waterIntake.map(day => ({
    x: day.date,
    y: day.value,
    goalMet: day.goalMet,
    movingAvg: day.movingAverage
  }));

  // Goal line at y=8
  const hydrationGoal = response.data.summary.hydrationGoal.daily;

  The data is chart-ready and works perfectly with libraries like Chart.js, D3.js, or Recharts!