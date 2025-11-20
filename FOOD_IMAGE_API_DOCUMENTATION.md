# NutriMate Food Image API

**Base URL:** `http://localhost:5000/api/food-images`

**Authentication:** `Authorization: Bearer <jwt_token>`

---

## Upload Food Image

**POST** `/api/food-images/upload`
**Content-Type:** `multipart/form-data`

**Form Data:**
```
image: File (required) - JPG/PNG, max 10MB
title: string (required)
description: string (optional)
imageType: string - receipt|food_label|meal_photo|ingredient (default: receipt)
tags: string|array (optional) - Comma separated
```

**Example:**
```bash
curl -X POST \
  -H "Authorization: Bearer TOKEN" \
  -F "image=@receipt.jpg" \
  -F "title=Grocery Receipt" \
  -F "imageType=receipt" \
  -F "tags=groceries,shopping" \
  http://localhost:5000/api/food-images/upload
```

---

## Get Images

**GET** `/api/food-images`

**Query Parameters:**
```
imageType: receipt|food_label|meal_photo|ingredient
associationType: inventory|daily_log|none
page: number (default: 1)
limit: number (default: 20)
sortBy: createdAt|title|imageType
sortOrder: asc|desc
```

**Example:**
```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:5000/api/food-images?page=1&limit=10"
```

---

## Get Single Image

**GET** `/api/food-images/:id`

**Example:**
```bash
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/food-images/IMAGE_ID
```

---

## Associate with Inventory

**POST** `/api/food-images/:id/associate/inventory`

**Body:**
```json
{
  "inventoryId": "INVENTORY_ITEM_ID"
}
```

---

## Associate with Daily Log

**POST** `/api/food-images/:id/associate/daily-log`

**Body:**
```json
{
  "dailyLogId": "DAILY_LOG_ID"
}
```

---

## Remove Association

**DELETE** `/api/food-images/:id/associate`

---

## Delete Image

**DELETE** `/api/food-images/:id`

---

## Image Types

| Type | Description |
|------|-------------|
| `receipt` | Store receipts |
| `food_label` | Product labels |
| `meal_photo` | Meal pictures |
| `ingredient` | Ingredient photos |

## Response Format

**Success (200/201):**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "id": "image_id",
    "title": "Image Title",
    "imageUrl": "https://cloudinary_url",
    "imageType": "receipt",
    "tags": ["tag1", "tag2"],
    "associationType": "none",
    "createdAt": "2024-01-20T15:30:00.000Z"
  }
}
```

**List Response:**
```json
{
  "success": true,
  "data": {
    "images": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 25
    }
  }
}
```

## Common Errors

**400 - Bad Request**
```json
{
  "success": false,
  "message": "No image file provided"
}
```

**401 - Unauthorized**
```json
{
  "success": false,
  "message": "Authentication required"
}
```

**404 - Not Found**
```json
{
  "success": false,
  "message": "Food image not found"
}
```

## Use Cases

**Upload receipt and link to inventory:**
```bash
# 1. Upload
POST /api/food-images/upload
image=@receipt.jpg&title=Grocery Receipt&imageType=receipt

# 2. Associate
POST /api/food-images/IMAGE_ID/associate/inventory
{ "inventoryId": "INVENTORY_ID" }
```

**View unassociated receipts:**
```bash
GET /api/food-images?imageType=receipt&associationType=none
```

**View all images with pagination:**
```bash
GET /api/food-images?page=1&limit=10&sortBy=createdAt&sortOrder=desc
```
