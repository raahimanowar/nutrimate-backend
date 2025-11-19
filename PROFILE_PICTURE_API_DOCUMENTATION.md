# Profile Picture API

**Base URL:** `http://localhost:5000/api/upload`
**Authentication:** `Authorization: Bearer <jwt_token>`

---

## Upload Profile Picture
**POST** `/api/upload/profile-picture`

**Request:** `multipart/form-data`
```
image: File (JPEG, PNG, GIF, WebP - max 5MB)
```

**Success (200):**
```json
{
  "success": true,
  "message": "Profile picture uploaded successfully",
  "data": {
    "profilePic": "https://res.cloudinary.com/...",
    "imageId": "nutrimate_profile_pics/abc123"
  }
}
```

---

## Delete Profile Picture
**DELETE** `/api/upload/profile-picture`

**Success (200):**
```json
{
  "success": true,
  "message": "Profile picture deleted successfully",
  "data": {
    "profilePic": ""
  }
}
```

---

## Setup

**Environment Variables:**
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Image Specs:**
- Max size: 5MB
- Formats: JPEG, PNG, GIF, WebP
- Auto-resized to 300x300
- Stored in Cloudinary folder: `nutrimate_profile_pics`

---

## Usage

**Upload:**
```javascript
const formData = new FormData();
formData.append('image', fileInput.files[0]);

fetch('/api/upload/profile-picture', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer ' + token },
  body: formData
});
```

**Delete:**
```javascript
fetch('/api/upload/profile-picture', {
  method: 'DELETE',
  headers: { 'Authorization': 'Bearer ' + token }
});
```

**Profile picture URL available in user profile data.**