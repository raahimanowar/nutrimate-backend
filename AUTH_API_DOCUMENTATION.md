# NutriMate Auth API

**Base URL:** `http://localhost:5000/api/auth`

---

## 1. Sign Up
**POST** `/api/auth/signup`

**Body:**
```json
{
  "username": "string (min 3 chars)",
  "email": "valid email",
  "password": "string (min 6 chars)"
}
```

**Success (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "user_id",
    "username": "username",
    "email": "email",
    "createdAt": "timestamp"
  }
}
```

**Validation Errors (400):**
- Username: "Username must be at least 3 characters"
- Email: "Invalid email format"
- Password: "Password must be at least 6 characters"
- Duplicate: "User with this email or username already exists"

---

## 2. Sign In
**POST** `/api/auth/signin`

**Body:**
```json
{
  "identifier": "username or email",
  "password": "password"
}
```

**Success (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "username": "username",
      "email": "email",
      "role": "user"
    }
  }
}
```

**Errors (400/401):**
- Missing fields: "Username or email is required" / "Password is required"
- Invalid credentials: "Invalid credentials"

---

## Using the Token

For protected routes, include:
```
Authorization: Bearer <jwt_token>
```

JWT token expires in 7 days and contains: userId, username, email

---

## 3. Protected User Routes

### Get Profile
**GET** `/api/users/profile`
**Headers:** `Authorization: Bearer <jwt_token>`

**Success (200):**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": "user_id",
    "username": "username",
    "email": "email",
    "height": number,
    "weight": number,
    "address": {
      "country": "string",
      "city": "string"
    },
    "profilePic": "string",
    "dateOfBirth": "date",
    "role": "user",
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
}
```

### Update Profile
**PUT** `/api/users/profile`
**Headers:** `Authorization: Bearer <jwt_token>`

**Body:**
```json
{
  "height": number,
  "weight": number,
  "address": {
    "country": "string",
    "city": "string"
  },
  "profilePic": "string",
  "dateOfBirth": "date"
}
```

**Success (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "user_id",
    "username": "username",
    "email": "email",
    "height": number,
    "weight": number,
    "address": {
      "country": "string",
      "city": "string"
    },
    "profilePic": "string",
    "dateOfBirth": "date",
    "role": "user",
    "updatedAt": "timestamp"
  }
}
```

---

## 4. Health Check
**GET** `/api`

**Success (200):**
```json
{
  "status": "ok",
  "uptime": 123.456,
  "timestamp": "2024-01-17T12:00:00.000Z",
  "message": "Server is running!!!",
  "version": "1.0.0"
}
```

---

## Environment Setup
```env
DB_URL=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000
```