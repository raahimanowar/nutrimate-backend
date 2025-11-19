# NutriMate Daily Log API

**Base URL:** `http://localhost:5000/api/daily-log`

All endpoints require authentication: `Authorization: Bearer <jwt_token>`

---

## 1. Get Daily Log (Single Day)
**GET** `/api/daily-log/log`
**Headers:** `Authorization: Bearer <jwt_token>`

**Query Parameters:**
```
date: string (YYYY-MM-DD, optional - defaults to today)
```

**Success (200):**
```json
{
  "success": true,
  "message": "Daily log retrieved successfully",
  "data": {
    "_id": "log_id",
    "userId": "user_id",
    "date": "2024-01-20",
    "items": [
      {
        "_id": "item_id",
        "itemName": "Apple",
        "quantity": 1,
        "unit": "pieces",
        "category": "fruits",
        "calories": 95,
        "protein": 0.5,
        "carbs": 25,
        "fats": 0.3,
        "fiber": 4,
        "sugar": 19,
        "sodium": 1,
        "mealType": "snack",
        "notes": "Fresh red apple"
      }
    ],
    "totalCalories": 95,
    "totalProtein": 0.5,
    "totalCarbs": 25,
    "totalFats": 0.3,
    "totalFiber": 4,
    "totalSugar": 19,
    "totalSodium": 1,
    "waterIntake": 6
  }
}
```

---

## 2. Get Multiple Daily Logs
**GET** `/api/daily-log`
**Headers:** `Authorization: Bearer <jwt_token>`

**Query Parameters:**
```
date: string (YYYY-MM-DD) - Get specific date
startDate: string (YYYY-MM-DD) - Start date for range
endDate: string (YYYY-MM-DD) - End date for range
limit: number (1-100, default: 30)
page: number (default: 1)
sortBy: date|totalCalories|totalProtein (default: date)
sortOrder: asc|desc (default: desc)
```

**Success (200):**
```json
{
  "success": true,
  "message": "Daily logs retrieved successfully",
  "data": [
    {
      "_id": "log_id",
      "userId": "user_id",
      "date": "2024-01-20",
      "items": [...],
      "totalCalories": 1850,
      "totalProtein": 75,
      "totalCarbs": 220,
      "totalFats": 65,
      "totalFiber": 25,
      "totalSugar": 80,
      "totalSodium": 2300,
      "waterIntake": 8,
      "itemsCount": 5
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 30,
    "total": 15,
    "totalPages": 1
  }
}
```

---

## 3. Add Food Item to Daily Log
**POST** `/api/daily-log/item`
**Headers:** `Authorization: Bearer <jwt_token>`

**Body:**
```json
{
  "date": "2024-01-20", // optional, defaults to today
  "item": {
    "itemName": "Chicken Breast",
    "quantity": 150,
    "unit": "grams",
    "category": "protein",
    "calories": 248,
    "protein": 46,
    "carbs": 0,
    "fats": 5.4,
    "fiber": 0,
    "sugar": 0,
    "sodium": 74,
    "mealType": "dinner",
    "notes": "Grilled chicken breast"
  }
}
```

**Categories:**
- `fruits` - Fruits and berries
- `vegetables` - Vegetables and greens
- `dairy` - Milk, cheese, yogurt
- `grains` - Bread, rice, pasta, cereal
- `protein` - Meat, fish, eggs, beans
- `beverages` - Drinks and liquids
- `snacks` - Chips, candy, nuts
- `other` - Everything else

**Meal Types:**
- `breakfast` - Morning meal
- `lunch` - Midday meal
- `dinner` - Evening meal
- `snack` - Between meals
- `beverage` - Liquid consumption

**Success (201):**
```json
{
  "success": true,
  "message": "Item added to daily log successfully",
  "data": {
    "_id": "log_id",
    "userId": "user_id",
    "date": "2024-01-20",
    "items": [
      // ... previous items
      {
        "_id": "new_item_id",
        "itemName": "Chicken Breast",
        "quantity": 150,
        "unit": "grams",
        "category": "protein",
        "calories": 248,
        "protein": 46,
        "carbs": 0,
        "fats": 5.4,
        "fiber": 0,
        "sugar": 0,
        "sodium": 74,
        "mealType": "dinner",
        "notes": "Grilled chicken breast"
      }
    ],
    "totalCalories": 2098,
    "totalProtein": 121.5,
    "totalCarbs": 220,
    "totalFats": 70.4,
    "totalFiber": 25,
    "totalSugar": 80,
    "totalSodium": 2374,
    "waterIntake": 8
  }
}
```

**Validation Errors (400):**
- Item name required
- Quantity must be between 0.1 and 10000
- Category invalid
- Meal type invalid
- Nutritional values out of range

---

## 4. Update Food Item
**PUT** `/api/daily-log/item/:logId/:itemId`
**Headers:** `Authorization: Bearer <jwt_token>`

**Body:**
```json
{
  "itemName": "Updated Chicken Breast",
  "quantity": 200,
  "unit": "grams",
  "calories": 330,
  "protein": 62,
  "carbs": 0,
  "fats": 7.2,
  "notes": "Updated portion size"
}
```

**Success (200):**
```json
{
  "success": true,
  "message": "Item updated successfully",
  "data": {
    // Updated daily log with recalculated totals
  }
}
```

---

## 5. Delete Food Item
**DELETE** `/api/daily-log/item/:logId/:itemId`
**Headers:** `Authorization: Bearer <jwt_token>`

**Success (200):**
```json
{
  "success": true,
  "message": "Item deleted successfully",
  "data": {
    // Updated daily log with item removed and totals recalculated
  }
}
```

---

## 6. Update Water Intake
**PUT** `/api/daily-log/water`
**Headers:** `Authorization: Bearer <jwt_token>`

**Query Parameters:**
```
date: string (YYYY-MM-DD, optional - defaults to today)
```

**Body:**
```json
{
  "waterIntake": 8
}
```

**Success (200):**
```json
{
  "success": true,
  "message": "Water intake updated successfully",
  "data": {
    "_id": "log_id",
    "userId": "user_id",
    "date": "2024-01-20",
    "waterIntake": 8
  }
}
```

---

## 7. Get Daily Log Summary
**GET** `/api/daily-log/summary`
**Headers:** `Authorization: Bearer <jwt_token>`

**Query Parameters:**
```
startDate: string (YYYY-MM-DD, optional - defaults to 7 days ago)
endDate: string (YYYY-MM-DD, optional - defaults to today)
```

**Success (200):**
```json
{
  "success": true,
  "message": "Daily log summary retrieved successfully",
  "data": {
    "summaries": [
      {
        "date": "2024-01-20",
        "totalCalories": 1850,
        "totalProtein": 75,
        "totalCarbs": 220,
        "totalFats": 65,
        "totalFiber": 25,
        "totalSugar": 80,
        "totalSodium": 2300,
        "waterIntake": 8,
        "itemsCount": 5,
        "mealsByCategory": {
          "protein": 2,
          "vegetables": 1,
          "grains": 1,
          "fruits": 1
        }
      }
    ],
    "period": {
      "startDate": "2024-01-14",
      "endDate": "2024-01-20"
    },
    "totals": {
      "avgCalories": 1950,
      "avgProtein": 82,
      "avgCarbs": 215,
      "avgFats": 68,
      "avgWaterIntake": 7.5
    }
  }
}
```

---

## Error Responses

**Authentication Required (401):**
```json
{
  "success": false,
  "message": "Authentication required"
}
```

**Invalid Token (403):**
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

**Not Found (404):**
```json
{
  "success": false,
  "message": "Daily log not found"
}
```

**Validation Error (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "itemName",
      "message": "Item name is required"
    }
  ]
}
```

**Server Error (500):**
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Example Usage

### **Daily Workflow:**
1. Get today's log: `GET /api/daily-log/log`
2. Log breakfast: `POST /api/daily-log/item` with `mealType: "breakfast"`
3. Log lunch: `POST /api/daily-log/item` with `mealType: "lunch"`
4. Update water intake: `PUT /api/daily-log/water`
5. Log dinner: `POST /api/daily-log/item` with `mealType: "dinner"`
6. Get daily summary: `GET /api/daily-log/summary`

---

## 8. Get All-Time Consumption History
**GET** `/api/daily-log/history`
**Headers:** `Authorization: Bearer <jwt_token>`

**Query Parameters:**
```
limit: number (1-5000, default: 1000)
page: number (default: 1)
sortBy: date|totalCalories|totalProtein (default: date)
sortOrder: asc|desc (default: desc)
includeTotals: true|false (default: true)
```

**Success (200):**
```json
{
  "success": true,
  "message": "All-time consumption history retrieved successfully",
  "data": {
    "history": [
      {
        "_id": "log_id",
        "date": "2024-01-20",
        "items": [
          {
            "_id": "item_id",
            "itemName": "Grilled Chicken Breast",
            "quantity": 150,
            "unit": "grams",
            "category": "protein",
            "calories": 248,
            "protein": 46,
            "carbs": 0,
            "fats": 5.4,
            "mealType": "dinner",
            "notes": "Seasoned with herbs"
          }
        ],
        "totalCalories": 1850,
        "totalProtein": 75,
        "totalCarbs": 220,
        "totalFats": 65,
        "totalFiber": 25,
        "totalSugar": 80,
        "totalSodium": 2300,
        "waterIntake": 8,
        "itemsCount": 5,
        "createdAt": "2024-01-20T23:59:59.999Z"
      }
    ],
    "summary": {
      "totalDays": 365,
      "firstLogDate": "2023-01-20",
      "lastLogDate": "2024-01-20",
      "overallTotals": {
        "totalCalories": 685750,
        "totalProtein": 27375,
        "totalCarbs": 80300,
        "totalFats": 23725,
        "totalFiber": 9125,
        "totalSugar": 29200,
        "totalSodium": 839500,
        "totalWaterIntake": 2920,
        "totalItems": 1825,
        "totalDaysLogged": 365
      },
      "dailyAverages": {
        "avgCalories": 1880,
        "avgProtein": 75,
        "avgCarbs": 220,
        "avgFats": 65,
        "avgFiber": 25,
        "avgSugar": 80,
        "avgSodium": 2300,
        "avgWaterIntake": 8.0,
        "avgItemsPerDay": 5.0
      },
      "foodFrequency": {
        "grilled chicken breast|protein": 48,
        "oatmeal|grains": 36,
        "salad|vegetables": 32,
        "apple|fruits": 28
      },
      "mealFrequency": {
        "breakfast": 365,
        "lunch": 365,
        "dinner": 365,
        "snack": 730,
        "beverage": 365
      },
      "categoryFrequency": {
        "protein": 480,
        "vegetables": 320,
        "grains": 280,
        "fruits": 240,
        "dairy": 180,
        "snacks": 160,
        "beverages": 120,
        "other": 45
      },
      "topFoods": [
        {
          "itemName": "grilled chicken breast",
          "category": "protein",
          "count": 48,
          "percentage": 2.6
        },
        {
          "itemName": "oatmeal",
          "category": "grains",
          "count": 36,
          "percentage": 2.0
        }
      ],
      "monthlyTrends": [
        {
          "month": "2023-01",
          "avgCalories": 1850,
          "avgProtein": 72,
          "totalDays": 31
        },
        {
          "month": "2023-02",
          "avgCalories": 1920,
          "avgProtein": 78,
          "totalDays": 28
        }
      ],
      "yearlyTrends": [
        {
          "year": "2023",
          "avgCalories": 1885,
          "avgProtein": 76,
          "totalDays": 365
        }
      ]
    },
    "pagination": {
      "page": 1,
      "limit": 1000,
      "total": 365,
      "totalPages": 1
    }
  }
}
```

### **Summary Data Analysis:**

#### **Overall Totals:**
- **Total consumption**: All calories, protein, carbs, fats consumed across entire history
- **Total items**: Number of food items logged
- **Total water intake**: All glasses of water consumed

#### **Daily Averages:**
- **Mean daily intake**: Average nutritional values per day
- **Consumption patterns**: Average items consumed per day
- **Hydration habits**: Average water intake per day

#### **Food Frequency:**
- **Most consumed foods**: Track frequently eaten items
- **Count and percentage**: How often each food appears
- **Category cross-reference**: Food with category mapping

#### **Meal Patterns:**
- **Breakfast frequency**: How often breakfast is logged
- **Meal distribution**: Distribution across meal types
- **Snacking habits**: Frequency of snacks vs meals

#### **Category Analysis:**
- **Protein intake**: How often protein foods consumed
- **Balanced diet**: Distribution across food categories
- **Preference patterns**: Most/least consumed categories

#### **Top Foods:**
- **Frequent items**: Top 20 most consumed foods
- **Percentage breakdown**: Each food as % of total items
- **Popularity ranking**: Most liked/common foods

#### **Monthly Trends:**
- **Seasonal patterns**: Nutritional changes by month
- **Progress tracking**: Monthly average comparisons
- **Habit evolution**: Changes over time

#### **Yearly Trends:**
- **Long-term patterns**: Year-over-year comparisons
- **Goal tracking**: Annual nutritional averages
- **Progress measurement**: Multi-year trends

### **Weekly Review:**
1. Get week summary: `GET /api/daily-log/summary?startDate=2024-01-14&endDate=2024-01-20`
2. Review averages and trends
3. Adjust dietary goals as needed

### **All-Time Analysis:**
1. Get comprehensive history: `GET /api/daily-log/history?includeTotals=true`
2. Analyze food frequency patterns
3. Review nutritional trends over months/years
4. Export data for AI training or external analysis
5. Generate personalized insights and recommendations