# Community API

**Base URL:** `http://localhost:5000/api/communities`
**Authentication:** `Authorization: Bearer <jwt_token>`

---

## Create Community
**POST** `/api/communities`

**Request:**
```json
{
  "name": "Healthy Eaters Club",
  "location": "New York, USA",
  "description": "A community for health enthusiasts sharing nutrition tips and recipes."
}
```

**Success (201):**
```json
{
  "success": true,
  "message": "Community created successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "name": "Healthy Eaters Club",
    "location": "New York, USA",
    "description": "A community for health enthusiasts sharing nutrition tips and recipes.",
    "admin": "64f8a1b2c3d4e5f6a7b8c9d1",
    "membersCount": 1,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

## Get All Communities
**GET** `/api/communities`

**Success (200):**
```json
{
  "success": true,
  "message": "Communities retrieved successfully",
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "Healthy Eaters Club",
      "location": "New York, USA",
      "description": "A community for health enthusiasts sharing nutrition tips and recipes.",
      "membersCount": 15,
      "isMember": true,
      "isAdmin": false
    }
  ]
}
```

---

## Get User Communities
**GET** `/api/communities/my-communities`

**Success (200):**
```json
{
  "success": true,
  "message": "User communities retrieved successfully",
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "Healthy Eaters Club",
      "location": "New York, USA",
      "description": "A community for health enthusiasts sharing nutrition tips and recipes.",
      "membersCount": 15,
      "isAdmin": false
    }
  ]
}
```

---

## Join Community
**POST** `/api/communities/:communityId/join`

**Success (200):**
```json
{
  "success": true,
  "message": "Joined community successfully",
  "data": {
    "membersCount": 16
  }
}
```

---

## Leave Community
**POST** `/api/communities/:communityId/leave`

**Success (200):**
```json
{
  "success": true,
  "message": "Left community successfully"
}
```

---

## Community Schema

```typescript
{
  name: string;         // Required, max 100 chars
  location: string;     // Required, max 200 chars
  description: string;  // Required, max 1000 chars
  admin: ObjectId;      // User who created community
  members: ObjectId[];  // Community members
}
```

---

## Usage

**Create Community:**
```javascript
fetch('/api/communities', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: "Healthy Eaters Club",
    location: "New York, USA",
    description: "A community for health enthusiasts sharing nutrition tips and recipes."
  })
});
```

**Join Community:**
```javascript
fetch('/api/communities/64f8a1b2c3d4e5f6a7b8c9d0/join', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer ' + token }
});
```

**Leave Community:**
```javascript
fetch('/api/communities/64f8a1b2c3d4e5f6a7b8c9d0/leave', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer ' + token }
});
```

---

**Rules:**
- Admin cannot leave their own community
- Admin automatically becomes a member when creating community
- All endpoints require authentication