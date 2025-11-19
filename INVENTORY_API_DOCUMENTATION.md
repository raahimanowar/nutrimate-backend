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

## 2. Get User's Inventory (With Advanced Filtering)
**GET** `/api/inventory`
**Headers:** `Authorization: Bearer <jwt_token>`

### **Available Filters:**
```
Category Filter:
category=fruits
category=fruits,vegetables,dairy  # Multiple categories

Expiration Filter:
hasExpiration=true    # Items with expiration dates
hasExpiration=false   # Items without expiration (rice, pasta)

Expiration Status:
expiring_soon=true    # Items expiring within 3 days

Price Range Filter:
min_cost=1.50
max_cost=25.00

Search Filter:
search=apple          # Case-insensitive name search

Sorting Options:
sort_by=createdAt|itemName|category|costPerUnit|expirationDate
sort_order=asc|desc   # Default: createdAt desc
```

### **Usage Examples:**
```bash
# Get all inventory items
GET /api/inventory

# E-commerce style filtering - Category specific
GET /api/inventory?category=fruits

# Multiple categories like e-commerce sidebar
GET /api/inventory?category=fruits,vegetables,dairy

# Price range filtering (common in e-commerce)
GET /api/inventory?min_cost=1&max_cost=10

# Search functionality (like e-commerce search bar)
GET /api/inventory?search=apple

# Non-perishable items filter (like pantry items)
GET /api/inventory?hasExpiration=false

# Items about to expire (waste reduction)
GET /api/inventory?expiring_soon=true

# Sort by name (A-Z like e-commerce products)
GET /api/inventory?sort_by=itemName&sort_order=asc

# Combined filtering (advanced e-commerce style)
GET /api/inventory?category=fruits,vegetables&min_cost=1&max_cost=15&expiring_soon=true&sort_by=expirationDate&sort_order=asc

# Sort by price (low to high)
GET /api/inventory?sort_by=costPerUnit&sort_order=asc
```

### **Response Format:**
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
    }
  ],
  "filters": {
    "category": "fruits",
    "hasExpiration": true,
    "expiring_soon": false,
    "min_cost": 1,
    "max_cost": 10,
    "search": null,
    "sort_by": "itemName",
    "sort_order": "asc"
  }
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
