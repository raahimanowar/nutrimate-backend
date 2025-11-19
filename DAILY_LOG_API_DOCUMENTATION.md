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

### **Weekly Review:**
1. Get week summary: `GET /api/daily-log/summary?startDate=2024-01-14&endDate=2024-01-20`
2. Review averages and trends
3. Adjust dietary goals as needed