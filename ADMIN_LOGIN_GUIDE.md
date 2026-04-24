# 🔐 Admin Login Guide

## Admin Account Credentials

```
Email: admin@smartcampus.com
Password: Admin@123456
```

⚠️ **Important**: Change this password after first login!

---

## How to Login

### Option 1: Using API (Recommended for Testing)

#### Login Request
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin@smartcampus.com",
  "password": "Admin@123456"
}
```

#### Success Response
```json
{
  "message": "Login successful",
  "user": {
    "_id": "user_id",
    "name": "System Administrator",
    "email": "admin@smartcampus.com",
    "role": "ADMIN",
    "permissions": [
      "READ_USERS",
      "WRITE_USERS",
      "DELETE_USERS",
      "MANAGE_ROLES",
      "READ_NOTIFICATIONS",
      "WRITE_NOTIFICATIONS",
      "DELETE_NOTIFICATIONS",
      "MANAGE_SYSTEM"
    ],
    "isActive": true
  }
}
```

### Option 2: Using cURL

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@smartcampus.com",
    "password": "Admin@123456"
  }' \
  -c cookies.txt
```

The `-c cookies.txt` flag saves the session cookie for subsequent requests.

### Option 3: Using Postman

1. Create a new POST request
2. URL: `http://localhost:5000/api/auth/login`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):
```json
{
  "email": "admin@smartcampus.com",
  "password": "Admin@123456"
}
```
5. Send the request
6. The session cookie will be automatically saved

---

## Authentication Endpoints

### 1. Login (Email/Password)
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response (200)**:
```json
{
  "message": "Login successful",
  "user": { ... }
}
```

**Error Responses**:
- `400` - Invalid email format or missing password
- `401` - Invalid credentials
- `403` - Account inactive
- `500` - Server error

---

### 2. Register New User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123"
}
```

**Success Response (201)**:
```json
{
  "message": "Registration successful",
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "CUSTOMER",
    "permissions": ["READ_NOTIFICATIONS"],
    "isActive": true
  }
}
```

**Error Responses**:
- `400` - Missing fields or invalid data
- `409` - User already exists
- `500` - Server error

---

### 3. Check Authentication Status
```http
GET /api/auth/status
```

**Authenticated Response (200)**:
```json
{
  "authenticated": true,
  "user": { ... }
}
```

**Not Authenticated Response (200)**:
```json
{
  "authenticated": false,
  "user": null
}
```

---

### 4. Logout
```http
POST /api/auth/logout
```

**Success Response (200)**:
```json
{
  "message": "Logout successful"
}
```

---

### 5. Google OAuth Login
```http
GET /auth/google
```
Opens Google OAuth flow in browser.

---

## Testing the Admin Account

### Step 1: Login
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin@smartcampus.com",
  "password": "Admin@123456"
}
```

### Step 2: Check Auth Status
```bash
GET http://localhost:5000/api/auth/status
```

### Step 3: Get Current User Profile
```bash
GET http://localhost:5000/api/roles/me
```

### Step 4: Get All Users (Admin Only)
```bash
GET http://localhost:5000/api/roles/users
```

### Step 5: Create a Test Notification
```bash
POST http://localhost:5000/api/notifications
Content-Type: application/json

{
  "sendToAll": true,
  "title": "Test Notification",
  "message": "Testing admin notification system",
  "type": "INFO",
  "priority": "MEDIUM"
}
```

---

## Using Sessions with Subsequent Requests

After logging in, the session cookie is automatically set. For subsequent requests:

### With cURL
```bash
# Login and save cookie
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@smartcampus.com","password":"Admin@123456"}' \
  -c cookies.txt

# Use cookie in subsequent requests
curl -X GET http://localhost:5000/api/roles/me \
  -b cookies.txt
```

### With Postman
Postman automatically manages cookies. Just login once and all subsequent requests in the same session will be authenticated.

### With JavaScript (Frontend)
```javascript
// Login
const response = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // Important: Include cookies
  body: JSON.stringify({
    email: 'admin@smartcampus.com',
    password: 'Admin@123456'
  })
});

const data = await response.json();
console.log(data);

// Subsequent requests
const userResponse = await fetch('http://localhost:5000/api/roles/me', {
  credentials: 'include' // Include cookies
});

const userData = await userResponse.json();
console.log(userData);
```

---

## Creating Additional Admin Users

### Using the Script
```bash
npm run create:admin email@example.com SecurePassword "Admin Name"
```

### Using the API (Existing Admin Required)
1. Login as admin
2. Register a new user
3. Update their role to ADMIN:
```bash
PUT http://localhost:5000/api/roles/users/:userId/role
Content-Type: application/json

{
  "role": "ADMIN"
}
```

---

## Troubleshooting

### "Invalid email or password"
- Check email is correct: `admin@smartcampus.com`
- Check password is correct: `Admin@123456`
- Ensure no extra spaces

### "Account is inactive"
- Contact another admin to activate your account
- Or use the script to create a new admin

### "This account uses Google login"
- The account was created via Google OAuth
- Use Google login instead: `http://localhost:5000/auth/google`

### Session not persisting
- Ensure cookies are enabled
- Check CORS settings allow credentials
- Use `credentials: 'include'` in fetch requests

### "Authentication required"
- You need to login first
- Check if session cookie is being sent
- Verify you're logged in: `GET /api/auth/status`

---

## Security Best Practices

1. **Change Default Password**
   - Login with default credentials
   - Use password reset or update user endpoint
   - Set a strong, unique password

2. **Secure Session Secret**
   - Update `SESSION_SECRET` in `.env`
   - Use a long, random string
   - Never commit to version control

3. **HTTPS in Production**
   - Always use HTTPS in production
   - Set secure cookie flags
   - Enable HSTS headers

4. **Rate Limiting**
   - Add rate limiting to login endpoint
   - Prevent brute force attacks
   - Use packages like `express-rate-limit`

5. **Password Requirements**
   - Minimum 8 characters (configurable)
   - Consider adding complexity requirements
   - Implement password strength meter

---

## Complete Login Flow Example

```javascript
// 1. Login
const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    email: 'admin@smartcampus.com',
    password: 'Admin@123456'
  })
});

if (loginResponse.ok) {
  const loginData = await loginResponse.json();
  console.log('Logged in as:', loginData.user.name);
  console.log('Role:', loginData.user.role);
  
  // 2. Get user profile
  const profileResponse = await fetch('http://localhost:5000/api/roles/me', {
    credentials: 'include'
  });
  const profile = await profileResponse.json();
  console.log('Profile:', profile);
  
  // 3. Get all users (admin only)
  const usersResponse = await fetch('http://localhost:5000/api/roles/users', {
    credentials: 'include'
  });
  const users = await usersResponse.json();
  console.log('Users:', users);
  
  // 4. Create notification
  const notifResponse = await fetch('http://localhost:5000/api/notifications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      sendToAll: true,
      title: 'Welcome',
      message: 'System is ready!',
      type: 'SUCCESS'
    })
  });
  const notif = await notifResponse.json();
  console.log('Notification created:', notif);
  
  // 5. Logout
  const logoutResponse = await fetch('http://localhost:5000/api/auth/logout', {
    method: 'POST',
    credentials: 'include'
  });
  const logoutData = await logoutResponse.json();
  console.log(logoutData.message);
}
```

---

## Quick Test Commands

### Test Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@smartcampus.com","password":"Admin@123456"}' \
  -v
```

### Test Auth Status
```bash
curl -X GET http://localhost:5000/api/auth/status \
  -b cookies.txt
```

### Test Admin Access
```bash
curl -X GET http://localhost:5000/api/roles/statistics \
  -b cookies.txt
```

---

## Summary

✅ **Admin Email**: `admin@smartcampus.com`  
✅ **Admin Password**: `Admin@123456`  
✅ **Login Endpoint**: `POST /api/auth/login`  
✅ **Auth Check**: `GET /api/auth/status`  
✅ **Logout**: `POST /api/auth/logout`  

**The admin account is now fully functional!** 🎉
