# NutriMate API Documentation - Inventory & Daily Log Integration

## Overview

This documentation covers the integrated inventory and daily log system. When users log food consumption, the system automatically checks their inventory and reduces quantities accordingly.

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

## 📦 Inventory Management

### Add Item to Inventory

**Endpoint:** `POST /inventory`

**Description:** Add a new item to the user's personal inventory.

**Request Body:**
```json
{
  "itemName": "Apple",
  "category": "fruits",
  "quantity": 10,
  "costPerUnit": 0.50,
  "hasExpiration": true,
  "expirationDate": "2025-01-30" // Optional
}
```

**Valid Categories:** `"fruits"`, `"vegetables"`, `"dairy"`, `"grains"`, `"protein"`, `"beverages"`, `"snacks"`, `"other"`

**Success Response (201):**
```json
{
  "success": true,
  "message": "Item added successfully",
  "data": {
    "_id": "64a7b8c9d1e2f3g4h5i6j7k8",
    "itemName": "Apple",
    "category": "fruits",
    "quantity": 10,
    "costPerUnit": 0.50,
    "hasExpiration": true,
    "expirationDate": "2025-01-30T00:00:00.000Z",
    "userId": "64a7b8c9d1e2f3g4h5i6j7k9",
    "createdAt": "2025-01-21T10:30:00.000Z",
    "updatedAt": "2025-01-21T10:30:00.000Z"
  }
}
```

### Get User's Inventory

**Endpoint:** `GET /inventory`

**Description:** Get all items in the user's inventory with filtering options.

**Query Parameters:**
- `category` (optional): Filter by category (comma-separated for multiple)
- `search` (optional): Search item names
- `min_cost`, `max_cost` (optional): Price range filter
- `expiring_soon` (optional): Set to "true" for items expiring within 3 days
- `sort_by` (optional): Sort field (`createdAt`, `itemName`, `category`, `costPerUnit`, `expirationDate`)
- `sort_order` (optional): Sort order (`asc`, `desc`)

**Example Request:**
```
GET /inventory?category=fruits,vegetables&search=apple&sort_by=quantity&sort_order=desc
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Inventory retrieved successfully",
  "data": [
    {
      "_id": "64a7b8c9d1e2f3g4h5i6j7k8",
      "itemName": "Apple",
      "category": "fruits",
      "quantity": 10,
      "costPerUnit": 0.50,
      "hasExpiration": true,
      "expirationDate": "2025-01-30T00:00:00.000Z"
    }
  ],
  "filters": {
    "category": "fruits,vegetables",
    "search": "apple",
    "sort_by": "quantity",
    "sort_order": "desc"
  }
}
```

### Update Inventory Item

**Endpoint:** `PUT /inventory/:id`

**Description:** Update an existing inventory item.

**Request Body:**
```json
{
  "itemName": "Apple",
  "category": "fruits",
  "quantity": 15,
  "costPerUnit": 0.45,
  "hasExpiration": true,
  "expirationDate": "2025-02-15"
}
```

### Delete Inventory Item

**Endpoint:** `DELETE /inventory/:id`

**Description:** Remove an item from inventory.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Item deleted successfully"
}
```

---

## 🍽️ Daily Log Management

### Add Item to Daily Log (WITH INTEGRATION)

**Endpoint:** `POST /daily-log`

**Description:** Add food consumption to daily log. **This automatically checks and reduces inventory.**

**Request Body:**
```json
{
  "date": "2025-01-21", // Optional, defaults to today
  "item": {
    "itemName": "Apple",
    "quantity": 2,
    "category": "fruits",
    "mealType": "snack",
    "unit": "pieces", // Optional, defaults to "servings"
    "calories": 100, // Optional nutritional info
    "protein": 0.5,
    "carbs": 25,
    "fats": 0.2,
    "fiber": 4,
    "sugar": 19,
    "sodium": 1
  }
}
```

**Valid Meal Types:** `"breakfast"`, `"lunch"`, `"dinner"`, `"snack"`, `"beverage"`

#### Success Response (201) - Inventory Available
```json
{
  "success": true,
  "message": "Item added to daily log successfully and inventory updated",
  "data": {
    "_id": "64a7b8c9d1e2f3g4h5i6j7k8",
    "userId": "64a7b8c9d1e2f3g4h5i6j7k9",
    "date": "2025-01-21",
    "items": [
      {
        "_id": "64a7b8c9d1e2f3g4h5i6j7ka",
        "itemName": "Apple",
        "quantity": 2,
        "category": "fruits",
        "mealType": "snack",
        "unit": "pieces"
      }
    ],
    "totalCalories": 200,
    "totalProtein": 1.0,
    "totalCarbs": 50,
    "totalFats": 0.4,
    "inventoryUpdate": {
      "success": true,
      "message": "Successfully reduced 2 Apple(s) from inventory",
      "previousQuantity": 10,
      "newQuantity": 8,
      "inventoryStatus": "updated"
    },
    "waterIntake": 0,
    "updatedAt": "2025-01-21T10:30:00.000Z"
  }
}
```

#### Error Response (400) - Item Not Found in Inventory
```json
{
  "success": false,
  "message": "Item \"Orange\" not found in your inventory",
  "inventoryStatus": "not_found"
}
```

#### Error Response (400) - Insufficient Quantity
```json
{
  "success": false,
  "message": "Insufficient quantity. You have 3 Apple(s) but tried to consume 5",
  "inventoryStatus": "insufficient",
  "currentQuantity": 3
}
```

### Add Item to Daily Log (SKIP INVENTORY CHECK)

**Endpoint:** `POST /daily-log`

**Description:** Add food to daily log without checking inventory.

**Request Body:**
```json
{
  "date": "2025-01-21",
  "skipInventoryCheck": true,
  "item": {
    "itemName": "Restaurant Meal",
    "quantity": 1,
    "category": "other",
    "mealType": "dinner"
  }
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Item added to daily log successfully",
  "data": {
    // Same structure as above, but NO inventoryUpdate field
  }
}
```

### Get Daily Log

**Endpoint:** `GET /daily-log`

**Description:** Get daily log for a specific date.

**Query Parameters:**
- `date` (optional): Date in YYYY-MM-DD format, defaults to today

**Success Response (200):**
```json
{
  "success": true,
  "message": "Daily log retrieved successfully",
  "data": {
    "_id": "64a7b8c9d1e2f3g4h5i6j7k8",
    "userId": "64a7b8c9d1e2f3g4h5i6j7k9",
    "date": "2025-01-21",
    "items": [...],
    "totalCalories": 2000,
    "totalProtein": 80,
    "totalCarbs": 250,
    "totalFats": 65,
    "waterIntake": 8
  }
}
```

---

## 🔄 Global Food Catalog

### Get Food Items

**Endpoint:** `GET /food-inventory`

**Description:** Get global food catalog for reference.

**Query Parameters:**
- `category` (optional): Filter by category

**Success Response (200):**
```json
{
  "success": true,
  "items": [
    {
      "_id": "64a7b8c9d1e2f3g4h5i6j7k8",
      "name": "Apple",
      "category": "fruit",
      "expirationDays": 7,
      "costPerUnit": 0.5,
      "quantity": 10
    }
  ]
}
```

---

## 🎯 Frontend Implementation Guide

### 1. **Smart Error Handling**

```javascript
const addFoodToDailyLog = async (foodItem) => {
  try {
    const response = await fetch('/api/daily-log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ item: foodItem })
    });

    const data = await response.json();

    if (data.success) {
      // Success case
      if (data.data.inventoryUpdate) {
        showSuccessNotification(
          `${data.data.inventoryUpdate.message}\n` +
          `Remaining: ${data.data.inventoryUpdate.newQuantity} items`
        );
        // Refresh inventory display
        await fetchInventory();
      } else {
        showSuccessNotification('Food logged successfully');
      }
      // Refresh daily log display
      await fetchDailyLog();
    } else {
      // Handle inventory-specific errors
      handleInventoryError(data);
    }
  } catch (error) {
    showErrorNotification('Network error. Please try again.');
  }
};

const handleInventoryError = (errorData) => {
  switch (errorData.inventoryStatus) {
    case 'not_found':
      showWarningNotification(
        `${errorData.message}\n` +
        'Would you like to add it to your inventory?'
      );
      // Show "Add to Inventory" button
      showAddToInventoryOption(errorData.itemName);
      break;

    case 'insufficient':
      showErrorNotification(
        `${errorData.message}\n` +
        `You only have ${errorData.currentQuantity} available.\n` +
        'Would you like to add more to your inventory?'
      );
      // Show "Restock" button
      showRestockOption(errorData.itemName, errorData.currentQuantity);
      break;

    default:
      showErrorNotification(errorData.message);
  }
};
```

### 2. **Real-time Inventory Updates**

```javascript
const FoodLogger = () => {
  const [inventory, setInventory] = useState([]);
  const [dailyLog, setDailyLog] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);

  // Fetch inventory on component mount
  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    const response = await fetch('/api/inventory', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    if (data.success) {
      setInventory(data.data);
    }
  };

  const handleFoodSelection = (food) => {
    // Auto-populate form with inventory item details
    const inventoryItem = inventory.find(item =>
      item.itemName.toLowerCase() === food.name.toLowerCase()
    );

    if (inventoryItem) {
      setSelectedFood({
        itemName: inventoryItem.itemName,
        category: inventoryItem.category,
        availableQuantity: inventoryItem.quantity,
        maxQuantity: inventoryItem.quantity
      });
    }
  };

  const handleSubmit = async (logData) => {
    // Validate against available quantity
    if (logData.quantity > selectedFood.maxQuantity) {
      showErrorNotification(
        `Only ${selectedFood.maxQuantity} ${selectedFood.itemName}(s) available in inventory`
      );
      return;
    }

    await addFoodToDailyLog(logData);
  };
};
```

### 3. **Inventory Status Indicators**

```javascript
const InventoryStatus = ({ itemName, category }) => {
  const [status, setStatus] = useState('loading');
  const [quantity, setQuantity] = useState(null);

  useEffect(() => {
    checkInventoryStatus();
  }, [itemName, category]);

  const checkInventoryStatus = async () => {
    const response = await fetch(`/api/inventory?search=${itemName}&category=${category}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();

    if (data.success && data.data.length > 0) {
      setQuantity(data.data[0].quantity);
      setStatus(data.data[0].quantity > 0 ? 'available' : 'empty');
    } else {
      setStatus('not_found');
    }
  };

  const renderStatus = () => {
    switch (status) {
      case 'available':
        return <span className="text-green-600">✓ {quantity} in stock</span>;
      case 'empty':
        return <span className="text-red-600">✗ Out of stock</span>;
      case 'not_found':
        return <span className="text-yellow-600">+ Add to inventory</span>;
      default:
        return <span className="text-gray-400">Loading...</span>;
    }
  };

  return <div className="inventory-status">{renderStatus()}</div>;
};
```

### 4. **Smart Food Suggestions**

```javascript
const FoodSuggestion = () => {
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    // Get food suggestions based on available inventory
    const fetchSuggestions = async () => {
      const response = await fetch('/api/inventory?sort_by=quantity&sort_order=desc', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (data.success) {
        // Show items with available quantity
        const availableItems = data.data.filter(item => item.quantity > 0);
        setSuggestions(availableItems.slice(0, 5)); // Top 5 suggestions
      }
    };

    fetchSuggestions();
  }, []);

  return (
    <div className="food-suggestions">
      <h3>Quick Add from Inventory</h3>
      {suggestions.map(item => (
        <button
          key={item._id}
          onClick={() => quickAddItem(item)}
          className="suggestion-item"
        >
          {item.itemName} ({item.quantity} available)
        </button>
      ))}
    </div>
  );
};
```

### 5. **Bulk Operations**

```javascript
const BulkFoodLogger = () => {
  const logMultipleItems = async (items) => {
    const results = await Promise.allSettled(
      items.map(item => addFoodToDailyLog(item))
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    showNotification(
      `Logged ${successful} items successfully${failed > 0 ? `, ${failed} failed` : ''}`
    );

    // Refresh data
    await Promise.all([fetchInventory(), fetchDailyLog()]);
  };
};
```

---

## 🚨 Common Error Scenarios & Solutions

### 1. **Item Not in Inventory**
- **Error**: `"Item \"X\" not found in your inventory"`
- **Solution**: Show option to add item to inventory or allow skipping inventory check

### 2. **Insufficient Quantity**
- **Error**: `"Insufficient quantity. You have 3 Apple(s) but tried to consume 5"`
- **Solution**: Show current quantity and offer to restock or adjust quantity

### 3. **Network Issues**
- **Solution**: Implement retry logic and offline support for logging

### 4. **Invalid Categories**
- **Solution**: Validate categories against allowed enum values before API calls

---

## 🎨 UI/UX Best Practices

1. **Show Inventory Status**: Display available quantities prominently
2. **Real-time Updates**: Refresh inventory after successful logging
3. **Smart Defaults**: Auto-populate form fields from inventory data
4. **Error Recovery**: Provide clear paths to resolve inventory issues
5. **Bulk Operations**: Allow logging multiple items efficiently
6. **Quick Actions**: Enable fast adding of frequently consumed items

---

## 📱 Example Component Structure

```jsx
const DailyLogPage = () => {
  return (
    <div className="daily-log-page">
      <InventoryOverview />
      <QuickAddFromInventory />
      <FoodLogger />
      <DailyLogSummary />
      <InventorySuggestions />
    </div>
  );
};
```