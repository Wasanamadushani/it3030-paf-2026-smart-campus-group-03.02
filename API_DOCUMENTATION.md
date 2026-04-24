# Smart Campus Hub - API Documentation

## Base URL
```
http://localhost:5000
```

## Authentication
Most endpoints require authentication via Passport.js session. Users must be logged in via Google OAuth or have an active session.

---

## Role Management API

### Get Current User Profile
```http
GET /api/roles/me
```
**Auth Required:** Yes  
**Returns:** Current user's profile information

**Response:**
```json
{
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "CUSTOMER",
    "permissions": ["READ_NOTIFICATIONS"],
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### Get All Users (Admin/Manager)
```http
GET /api/roles/users?page=1&limit=20&role=CUSTOMER&isActive=true&search=john
```
**Auth Required:** Yes (ADMIN or MANAGER role)  
**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `role` (optional): Filter by role (CUSTOMER, ADMIN, STAFF, MANAGER)
- `isActive` (optional): Filter by active status (true/false)
- `search` (optional): Search by name or email

**Response:**
```json
{
  "users": [...],
  "totalPages": 5,
  "currentPage": 1,
  "totalUsers": 100
}
```

---

### Get User by ID (Admin/Manager)
```http
GET /api/roles/users/:id
```
**Auth Required:** Yes (ADMIN or MANAGER role)  
**Returns:** Specific user details

---

### Update User Role (Admin Only)
```http
PUT /api/roles/users/:id/role
```
**Auth Required:** Yes (ADMIN role)  
**Body:**
```json
{
  "role": "STAFF"
}
```
**Valid Roles:** CUSTOMER, ADMIN, STAFF, MANAGER

---

### Update User Permissions (Admin Only)
```http
PUT /api/roles/users/:id/permissions
```
**Auth Required:** Yes (ADMIN role)  
**Body:**
```json
{
  "permissions": ["READ_USERS", "WRITE_NOTIFICATIONS"]
}
```
**Valid Permissions:**
- READ_USERS
- WRITE_USERS
- DELETE_USERS
- MANAGE_ROLES
- READ_NOTIFICATIONS
- WRITE_NOTIFICATIONS
- DELETE_NOTIFICATIONS
- MANAGE_SYSTEM

---

### Toggle User Active Status (Admin Only)
```http
PATCH /api/roles/users/:id/toggle-status
```
**Auth Required:** Yes (ADMIN role)  
**Action:** Activates or deactivates a user account

---

### Get Role Statistics (Admin Only)
```http
GET /api/roles/statistics
```
**Auth Required:** Yes (ADMIN role)  
**Returns:** User distribution by role and activity status

**Response:**
```json
{
  "roleDistribution": [
    { "role": "CUSTOMER", "count": 150 },
    { "role": "STAFF", "count": 10 },
    { "role": "ADMIN", "count": 2 }
  ],
  "totalUsers": 162,
  "activeUsers": 155,
  "inactiveUsers": 7
}
```

---

## Notification API

### Get User Notifications
```http
GET /api/notifications?page=1&limit=20&isRead=false&type=INFO&category=GENERAL&priority=HIGH
```
**Auth Required:** Yes  
**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `isRead` (optional): Filter by read status (true/false)
- `type` (optional): Filter by type (INFO, SUCCESS, WARNING, ERROR, SYSTEM)
- `category` (optional): Filter by category (GENERAL, ACCOUNT, SECURITY, SYSTEM, ANNOUNCEMENT, REMINDER)
- `priority` (optional): Filter by priority (LOW, MEDIUM, HIGH, URGENT)

**Response:**
```json
{
  "notifications": [...],
  "totalPages": 3,
  "currentPage": 1,
  "totalNotifications": 45,
  "unreadCount": 12
}
```

---

### Get Unread Count
```http
GET /api/notifications/unread-count
```
**Auth Required:** Yes  
**Returns:** Number of unread notifications

**Response:**
```json
{
  "unreadCount": 12
}
```

---

### Mark Notification as Read
```http
PATCH /api/notifications/:id/read
```
**Auth Required:** Yes  
**Action:** Marks a specific notification as read

---

### Mark All Notifications as Read
```http
PATCH /api/notifications/read-all
```
**Auth Required:** Yes  
**Action:** Marks all user's notifications as read

**Response:**
```json
{
  "message": "All notifications marked as read",
  "modifiedCount": 12
}
```

---

### Delete Notification
```http
DELETE /api/notifications/:id
```
**Auth Required:** Yes  
**Action:** Deletes a specific notification

---

### Delete All Read Notifications
```http
DELETE /api/notifications/read/all
```
**Auth Required:** Yes  
**Action:** Deletes all read notifications for the user

**Response:**
```json
{
  "message": "All read notifications deleted",
  "deletedCount": 25
}
```

---

### Create Notification (Admin/Staff/Manager)
```http
POST /api/notifications
```
**Auth Required:** Yes (ADMIN, STAFF, or MANAGER role)  
**Body:**
```json
{
  "userId": "user_id",
  "title": "Important Update",
  "message": "Your account has been updated successfully.",
  "type": "SUCCESS",
  "priority": "MEDIUM",
  "category": "ACCOUNT",
  "link": "/profile",
  "metadata": {
    "key": "value"
  },
  "expiresAt": "2024-12-31T23:59:59.000Z"
}
```

**Send to Multiple Users:**
```json
{
  "userIds": ["user_id_1", "user_id_2"],
  "title": "Announcement",
  "message": "System maintenance scheduled."
}
```

**Send to All Users:**
```json
{
  "sendToAll": true,
  "title": "System Announcement",
  "message": "New features available!"
}
```

**Notification Types:**
- INFO (default)
- SUCCESS
- WARNING
- ERROR
- SYSTEM

**Priority Levels:**
- LOW
- MEDIUM (default)
- HIGH
- URGENT

**Categories:**
- GENERAL (default)
- ACCOUNT
- SECURITY
- SYSTEM
- ANNOUNCEMENT
- REMINDER

---

## Authentication Endpoints

### Google Login
```http
GET /auth/google
```
Initiates Google OAuth flow

### Google Callback
```http
GET /auth/google/callback
```
Handles Google OAuth callback

### Logout
```http
GET /logout
```
Logs out the current user

---

## User Roles & Permissions

### Roles
1. **CUSTOMER** (Default)
   - Basic user access
   - Can view own notifications

2. **STAFF**
   - Can view users
   - Can create and manage notifications

3. **MANAGER**
   - Can view and edit users
   - Can manage notifications
   - Can view system statistics

4. **ADMIN**
   - Full system access
   - Can manage roles and permissions
   - Can activate/deactivate users
   - Can access all features

### Permission System
Permissions provide granular access control:
- **READ_USERS**: View user information
- **WRITE_USERS**: Edit user information
- **DELETE_USERS**: Delete users
- **MANAGE_ROLES**: Assign and modify user roles
- **READ_NOTIFICATIONS**: View notifications
- **WRITE_NOTIFICATIONS**: Create notifications
- **DELETE_NOTIFICATIONS**: Delete notifications
- **MANAGE_SYSTEM**: System-level operations

---

## Setup Scripts

### Seed Default Roles
```bash
npm run seed:roles
```
Creates default system roles (ADMIN, MANAGER, STAFF, CUSTOMER)

### Create Admin User
```bash
npm run create:admin [email] [password] [name]
```
Creates an admin user with full permissions

**Example:**
```bash
npm run create:admin admin@campus.com SecurePass123 "Admin User"
```

---

## Error Responses

### 401 Unauthorized
```json
{
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "message": "Access denied. Insufficient permissions.",
  "requiredRole": ["ADMIN"],
  "userRole": "CUSTOMER"
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Internal server error"
}
```

---

## Notification Service Utilities

The notification service provides helper functions for common notification scenarios:

```javascript
const notificationService = require('./services/notificationService');

// Send welcome notification to new user
await notificationService.sendWelcomeNotification(userId);

// Send security alert
await notificationService.sendSecurityNotification(userId, "Unusual login detected");

// Send system announcement to all users
await notificationService.sendSystemAnnouncement(
  "Maintenance Notice",
  "System will be down for maintenance on Sunday",
  "HIGH"
);

// Send notification to specific roles
await notificationService.sendNotificationByRole(
  ["ADMIN", "MANAGER"],
  {
    title: "Admin Alert",
    message: "New security update available",
    type: "WARNING",
    priority: "HIGH"
  }
);

// Cleanup old notifications
await notificationService.cleanupExpiredNotifications();
await notificationService.cleanupOldReadNotifications(30); // 30 days old
```

---

## Best Practices

1. **Always check authentication** before accessing protected routes
2. **Use appropriate roles** for different user types
3. **Set notification priorities** based on importance
4. **Clean up old notifications** regularly to maintain performance
5. **Use expiration dates** for time-sensitive notifications
6. **Provide meaningful notification messages** for better user experience
7. **Test role-based access** thoroughly before deployment

---

## Testing the API

You can test the API using tools like:
- Postman
- cURL
- Thunder Client (VS Code extension)
- Insomnia

Make sure to include session cookies for authenticated requests.
