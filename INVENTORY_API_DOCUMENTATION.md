# NutriMate Inventory API

**Base URL:** `http://localhost:5000/api/inventory`

---

## 1. Add Item to Inventory
**POST** `/api/inventory`
**Headers:** `Authorization: Bearer <jwt_token>`

**Body:**
```json
{
  "itemName": "string",
  "category": "fruits|vegetables|dairy|grains|protein|beverages|snacks|other",
  "expirationDate": "string (YYYY-MM-DD, optional)",
  "hasExpiration": "boolean (default: true)",
  "costPerUnit": "number"
}
```

**Success (201):**
```json
{
  "success": true,
  "message": "Item added successfully",
  "data": {
    "itemName": "Apple",
    "category": "fruits",
    "expirationDate": "2024-01-24T00:00:00.000Z",
    "hasExpiration": true,
    "costPerUnit": 0.50,
    "userId": "user_id",
    "_id": "item_id",
    "createdAt": "2024-01-17T12:00:00.000Z",
    "updatedAt": "2024-01-17T12:00:00.000Z"
  }
}
```

**Example - Item without expiration:**
```json
{
  "success": true,
  "message": "Item added successfully",
  "data": {
    "itemName": "Rice",
    "category": "grains",
    "expirationDate": null,
    "hasExpiration": false,
    "costPerUnit": 2.50,
    "userId": "user_id",
    "_id": "item_id_2",
    "createdAt": "2024-01-17T12:00:00.000Z",
    "updatedAt": "2024-01-17T12:00:00.000Z"
  }
}
```

---

## 2. Get User's Inventory
**GET** `/api/inventory`
**Headers:** `Authorization: Bearer <jwt_token>`

**Success (200):**
```json
{
  "success": true,
  "message": "Inventory retrieved successfully",
  "data": [
    {
      "itemName": "Apple",
      "category": "fruits",
      "expirationDate": "2024-01-24T00:00:00.000Z",
      "hasExpiration": true,
      "costPerUnit": 0.50,
      "userId": "user_id",
      "_id": "item_id",
      "createdAt": "2024-01-17T12:00:00.000Z",
      "updatedAt": "2024-01-17T12:00:00.000Z"
    },
    {
      "itemName": "Rice",
      "category": "grains",
      "expirationDate": null,
      "hasExpiration": false,
      "costPerUnit": 2.99,
      "userId": "user_id",
      "_id": "item_id_2",
      "createdAt": "2024-01-17T11:30:00.000Z",
      "updatedAt": "2024-01-17T11:30:00.000Z"
    }
  ]
}
```

---

## 3. Update Inventory Item
**PUT** `/api/inventory/:id`
**Headers:** `Authorization: Bearer <jwt_token>`

**Body:**
```json
{
  "itemName": "string (optional)",
  "category": "string (optional)",
  "expirationDate": "string (YYYY-MM-DD, optional)",
  "hasExpiration": "boolean (optional)",
  "costPerUnit": "number (optional)"
}
```

**Success (200):**
```json
{
  "success": true,
  "message": "Item updated successfully",
  "data": {
    "itemName": "Green Apple",
    "category": "fruits",
    "expirationDate": "2024-01-27T00:00:00.000Z",
    "hasExpiration": true,
    "costPerUnit": 0.75,
    "userId": "user_id",
    "_id": "item_id",
    "createdAt": "2024-01-17T12:00:00.000Z",
    "updatedAt": "2024-01-17T13:00:00.000Z"
  }
}
```

---

## 4. Delete Inventory Item
**DELETE** `/api/inventory/:id`
**Headers:** `Authorization: Bearer <jwt_token>`

**Success (200):**
```json
{
  "success": true,
  "message": "Item deleted successfully"
}
```

---

## Categories
- `fruits` - Fruits and berries
- `vegetables` - Vegetables and greens
- `dairy` - Milk, cheese, yogurt
- `grains` - Bread, rice, pasta, cereal
- `protein` - Meat, fish, eggs, beans
- `beverages` - Drinks and liquids
- `snacks` - Chips, candy, nuts
- `other` - Everything else

---

## Error Responses

**Authentication Required (401):**
```json
{
  "success": false,
  "message": "Access token is required"
}
```

**Invalid Token (403):**
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

**Item Not Found (404):**
```json
{
  "success": false,
  "message": "Item not found"
}
```

**Server Error (500):**
```json
{
  "success": false,
  "message": "Internal server error"
}
```
