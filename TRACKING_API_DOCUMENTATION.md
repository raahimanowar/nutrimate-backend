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