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

## Create Post in Community
**POST** `/api/communities/:communityId/posts`

**Request:**
```json
{
  "content": "Just finished a great workout session! Who else is active today?"
}
```

**Success (201):**
```json
{
  "success": true,
  "message": "Post created successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d5",
    "community": "64f8a1b2c3d4e5f6a7b8c9d0",
    "author": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "username": "john_doe",
      "email": "john@example.com",
      "profilePic": "https://example.com/profile.jpg"
    },
    "content": "Just finished a great workout session! Who else is active today?",
    "upvotesCount": 0,
    "downvotesCount": 0,
    "userVote": null,
    "createdAt": "2024-01-15T14:30:00.000Z"
  }
}
```

---

## Get Community Posts
**GET** `/api/communities/:communityId/posts`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Posts per page (default: 10)

**Success (200):**
```json
{
  "success": true,
  "message": "Posts retrieved successfully",
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d5",
      "author": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
        "username": "john_doe",
        "email": "john@example.com",
        "profilePic": "https://example.com/profile.jpg"
      },
      "content": "Just finished a great workout session! Who else is active today?",
      "upvotesCount": 5,
      "downvotesCount": 1,
      "userVote": null,
      "createdAt": "2024-01-15T14:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

---

## Vote on Post
**POST** `/api/communities/:communityId/posts/:postId/vote`

**Request:**
```json
{
  "voteType": "upvote"
}
```

**Success (200):**
```json
{
  "success": true,
  "message": "Post upvoted successfully",
  "data": {
    "upvotesCount": 6,
    "downvotesCount": 1,
    "userVote": "upvote"
  }
}
```

---

## Create Comment
**POST** `/api/communities/:communityId/posts/:postId/comments`

**Request:**
```json
{
  "content": "Great workout! What exercises did you do?"
}
```

**Success (201):**
```json
{
  "success": true,
  "message": "Comment created successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d6",
    "post": "64f8a1b2c3d4e5f6a7b8c9d5",
    "author": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "username": "john_doe",
      "email": "john@example.com",
      "profilePic": "https://example.com/profile.jpg"
    },
    "content": "Great workout! What exercises did you do?",
    "upvotesCount": 0,
    "downvotesCount": 0,
    "userVote": null,
    "createdAt": "2024-01-15T15:00:00.000Z"
  }
}
```

---

## Get Comments
**GET** `/api/communities/:communityId/posts/:postId/comments`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Comments per page (default: 20)

**Success (200):**
```json
{
  "success": true,
  "message": "Comments retrieved successfully",
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d6",
      "author": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
        "username": "john_doe",
        "email": "john@example.com",
        "profilePic": "https://example.com/profile.jpg"
      },
      "content": "Great workout! What exercises did you do?",
      "upvotesCount": 3,
      "downvotesCount": 0,
      "userVote": "upvote",
      "createdAt": "2024-01-15T15:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 8,
    "totalPages": 1
  }
}
```

---

## Vote on Comment
**POST** `/api/communities/:communityId/posts/:postId/comments/:commentId/vote`

**Request:**
```json
{
  "voteType": "upvote"
}
```

**Success (200):**
```json
{
  "success": true,
  "message": "Comment upvoted successfully",
  "data": {
    "upvotesCount": 4,
    "downvotesCount": 0,
    "userVote": "upvote"
  }
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

**Post Schema:**
```typescript
{
  community: ObjectId;   // Community reference
  author: ObjectId;      // User who created post
  content: string;       // Required, max 1000 chars
  upvotes: ObjectId[];   // Users who upvoted
  downvotes: ObjectId[]; // Users who downvoted
}
```

**Comment Schema:**
```typescript
{
  post: ObjectId;        // Post reference
  author: ObjectId;      // User who created comment
  content: string;       // Required, max 500 chars
  upvotes: ObjectId[];   // Users who upvoted
  downvotes: ObjectId[]; // Users who downvoted
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

**Create Post:**
```javascript
fetch('/api/communities/64f8a1b2c3d4e5f6a7b8c9d0/posts', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    content: "Just finished a great workout session! Who else is active today?"
  })
});
```

**Get Posts:**
```javascript
fetch('/api/communities/64f8a1b2c3d4e5f6a7b8c9d0/posts?page=1&limit=10', {
  method: 'GET',
  headers: { 'Authorization': 'Bearer ' + token }
});
```

**Vote on Post:**
```javascript
fetch('/api/communities/64f8a1b2c3d4e5f6a7b8c9d0/posts/64f8a1b2c3d4e5f6a7b8c9d5/vote', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    voteType: 'upvote'
  })
});
```

**Create Comment:**
```javascript
fetch('/api/communities/64f8a1b2c3d4e5f6a7b8c9d0/posts/64f8a1b2c3d4e5f6a7b8c9d5/comments', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    content: 'Great workout! What exercises did you do?'
  })
});
```

**Get Comments:**
```javascript
fetch('/api/communities/64f8a1b2c3d4e5f6a7b8c9d0/posts/64f8a1b2c3d4e5f6a7b8c9d5/comments', {
  method: 'GET',
  headers: { 'Authorization': 'Bearer ' + token }
});
```

**Vote on Comment:**
```javascript
fetch('/api/communities/64f8a1b2c3d4e5f6a7b8c9d0/posts/64f8a1b2c3d4e5f6a7b8c9d5/comments/64f8a1b2c3d4e5f6a7b8c9d6/vote', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    voteType: 'upvote'
  })
});
```

---

**Rules:**
- Admin cannot leave their own community
- Admin automatically becomes a member when creating community
- Only community members can post, comment, and vote
- Users can change their vote (upvote/downvote) - previous vote is replaced
- All endpoints require authentication
- Posts sorted by newest, comments by oldest
- Posts: max 1000 chars, Comments: max 500 chars