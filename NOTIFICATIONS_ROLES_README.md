# Notifications and Role Management System

## Overview
A comprehensive notification and role-based access control (RBAC) system for Smart Campus Hub.

## Features

### 🔐 Role Management
- **4 Built-in Roles**: CUSTOMER, STAFF, MANAGER, ADMIN
- **Granular Permissions**: 8 different permission types
- **User Management**: View, edit, activate/deactivate users
- **Role Assignment**: Admins can assign roles to users
- **Permission Control**: Fine-grained access control

### 🔔 Notification System
- **Multiple Notification Types**: INFO, SUCCESS, WARNING, ERROR, SYSTEM
- **Priority Levels**: LOW, MEDIUM, HIGH, URGENT
- **Categories**: GENERAL, ACCOUNT, SECURITY, SYSTEM, ANNOUNCEMENT, REMINDER
- **Read/Unread Tracking**: Mark notifications as read
- **Bulk Operations**: Mark all as read, delete all read
- **Expiration Support**: Auto-delete expired notifications
- **Targeted Delivery**: Send to specific users, roles, or all users

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment Variables
Already configured in `.env`:
```env
PORT=5000
MONGO_URI=mongodb+srv://...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
SESSION_SECRET=mysecret
FRONTEND_URL=http://localhost:5173
```

### 3. Seed Default Roles
```bash
npm run seed:roles
```

### 4. Create Admin User
```bash
npm run create:admin admin@campus.com Admin@123 "System Admin"
```

### 5. Start the Server
```bash
npm start
```
or for development:
```bash
npm run dev
```

## API Endpoints

### Role Management
- `GET /api/roles/me` - Get current user profile
- `GET /api/roles/users` - Get all users (Admin/Manager)
- `GET /api/roles/users/:id` - Get user by ID (Admin/Manager)
- `PUT /api/roles/users/:id/role` - Update user role (Admin)
- `PUT /api/roles/users/:id/permissions` - Update permissions (Admin)
- `PATCH /api/roles/users/:id/toggle-status` - Toggle user status (Admin)
- `GET /api/roles/statistics` - Get role statistics (Admin)

### Notifications
- `GET /api/notifications` - Get user notifications
- `GET /api/notifications/unread-count` - Get unread count
- `PATCH /api/notifications/:id/read` - Mark as read
- `PATCH /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification
- `DELETE /api/notifications/read/all` - Delete all read
- `POST /api/notifications` - Create notification (Admin/Staff/Manager)

## User Roles

### CUSTOMER (Default)
- Basic user access
- Can view own notifications
- Standard permissions

### STAFF
- Can view users
- Can create and send notifications
- Limited user management

### MANAGER
- Can view and edit users
- Full notification management
- Can view system statistics

### ADMIN
- Full system access
- Can manage all roles and permissions
- Can activate/deactivate users
- Complete control over the system

## Permissions

| Permission | Description |
|------------|-------------|
| READ_USERS | View user information |
| WRITE_USERS | Edit user information |
| DELETE_USERS | Delete users |
| MANAGE_ROLES | Assign and modify roles |
| READ_NOTIFICATIONS | View notifications |
| WRITE_NOTIFICATIONS | Create notifications |
| DELETE_NOTIFICATIONS | Delete notifications |
| MANAGE_SYSTEM | System-level operations |

## Notification Types

### Types
- **INFO**: General information
- **SUCCESS**: Success messages
- **WARNING**: Warning messages
- **ERROR**: Error notifications
- **SYSTEM**: System-level notifications

### Priority Levels
- **LOW**: Non-urgent information
- **MEDIUM**: Standard notifications
- **HIGH**: Important notifications
- **URGENT**: Critical notifications requiring immediate attention

### Categories
- **GENERAL**: General notifications
- **ACCOUNT**: Account-related notifications
- **SECURITY**: Security alerts
- **SYSTEM**: System notifications
- **ANNOUNCEMENT**: Public announcements
- **REMINDER**: Reminder notifications

## Usage Examples

### Creating Notifications

#### Send to Single User
```javascript
POST /api/notifications
{
  "userId": "user_id",
  "title": "Welcome!",
  "message": "Welcome to Smart Campus Hub",
  "type": "SUCCESS",
  "priority": "MEDIUM",
  "category": "ACCOUNT"
}
```

#### Send to Multiple Users
```javascript
POST /api/notifications
{
  "userIds": ["user1_id", "user2_id"],
  "title": "Team Update",
  "message": "New project assigned"
}
```

#### Send to All Users
```javascript
POST /api/notifications
{
  "sendToAll": true,
  "title": "System Maintenance",
  "message": "Scheduled maintenance on Sunday",
  "type": "SYSTEM",
  "priority": "HIGH"
}
```

### Managing User Roles

#### Update User Role
```javascript
PUT /api/roles/users/:id/role
{
  "role": "STAFF"
}
```

#### Update User Permissions
```javascript
PUT /api/roles/users/:id/permissions
{
  "permissions": ["READ_USERS", "WRITE_NOTIFICATIONS"]
}
```

## Notification Service Utilities

Use the notification service for common operations:

```javascript
const notificationService = require('./services/notificationService');

// Welcome new user
await notificationService.sendWelcomeNotification(userId);

// Security alert
await notificationService.sendSecurityNotification(
  userId, 
  "Unusual login detected from new location"
);

// System announcement
await notificationService.sendSystemAnnouncement(
  "New Features Available",
  "Check out our latest updates!",
  "MEDIUM"
);

// Send to specific roles
await notificationService.sendNotificationByRole(
  ["ADMIN", "MANAGER"],
  {
    title: "Admin Alert",
    message: "Review pending approvals",
    type: "INFO",
    priority: "HIGH"
  }
);
```

## Middleware Usage

Protect routes with authentication and authorization:

```javascript
const { isAuthenticated, hasRole, hasPermission, isActive } = require('./middleware/auth');

// Require authentication
app.get('/protected', isAuthenticated, (req, res) => {
  // Only authenticated users
});

// Require specific role
app.get('/admin', isAuthenticated, hasRole('ADMIN'), (req, res) => {
  // Only admins
});

// Require specific permission
app.get('/users', isAuthenticated, hasPermission('READ_USERS'), (req, res) => {
  // Only users with READ_USERS permission
});

// Check if user is active
app.get('/dashboard', isAuthenticated, isActive, (req, res) => {
  // Only active users
});
```

## Database Models

### User Model
```javascript
{
  googleId: String,
  name: String,
  email: String (unique, required),
  profilePic: String,
  passwordHash: String,
  role: String (enum: CUSTOMER, ADMIN, STAFF, MANAGER),
  permissions: [String],
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Notification Model
```javascript
{
  userId: ObjectId (ref: User),
  title: String (required),
  message: String (required),
  type: String (enum: INFO, SUCCESS, WARNING, ERROR, SYSTEM),
  priority: String (enum: LOW, MEDIUM, HIGH, URGENT),
  category: String (enum: GENERAL, ACCOUNT, SECURITY, SYSTEM, ANNOUNCEMENT, REMINDER),
  isRead: Boolean,
  readAt: Date,
  link: String,
  metadata: Map,
  expiresAt: Date,
  createdBy: ObjectId (ref: User),
  createdAt: Date
}
```

## Testing

### Test with cURL

#### Get Current User
```bash
curl -X GET http://localhost:5000/api/roles/me \
  --cookie "connect.sid=your_session_cookie"
```

#### Create Notification
```bash
curl -X POST http://localhost:5000/api/notifications \
  -H "Content-Type: application/json" \
  --cookie "connect.sid=your_session_cookie" \
  -d '{
    "userId": "user_id",
    "title": "Test Notification",
    "message": "This is a test",
    "type": "INFO"
  }'
```

## Maintenance

### Cleanup Old Notifications
Run periodically to maintain database performance:

```javascript
const notificationService = require('./services/notificationService');

// Clean expired notifications
await notificationService.cleanupExpiredNotifications();

// Clean old read notifications (30 days)
await notificationService.cleanupOldReadNotifications(30);
```

## Security Considerations

1. **Session Management**: Uses express-session with secure cookies
2. **Role Validation**: All role changes validated server-side
3. **Permission Checks**: Middleware enforces permissions on every request
4. **Self-Protection**: Users cannot modify their own role or deactivate themselves
5. **Active Status**: Inactive users are blocked from accessing the system

## Troubleshooting

### Server won't start
- Check MongoDB connection string in `.env`
- Ensure all dependencies are installed: `npm install`

### Notifications not appearing
- Verify user is authenticated
- Check notification filters (isRead, type, category)
- Ensure notifications were created for the correct userId

### Permission denied errors
- Verify user role and permissions
- Check if user account is active
- Ensure middleware is applied correctly

## File Structure

```
├── models/
│   ├── User.js              # User model with roles
│   ├── Notification.js      # Notification model
│   └── Role.js              # Role definition model
├── controllers/
│   ├── roleController.js    # Role management logic
│   └── notificationController.js  # Notification logic
├── routes/
│   ├── roleRoutes.js        # Role API routes
│   └── notificationRoutes.js      # Notification API routes
├── middleware/
│   └── auth.js              # Authentication & authorization
├── services/
│   └── notificationService.js     # Notification utilities
├── scripts/
│   ├── seedRoles.js         # Seed default roles
│   └── createAdminUser.js   # Create admin user
└── API_DOCUMENTATION.md     # Complete API docs
```

## Next Steps

1. ✅ Seed default roles: `npm run seed:roles`
2. ✅ Create admin user: `npm run create:admin`
3. 🔄 Test API endpoints with Postman or cURL
4. 🔄 Integrate with frontend
5. 🔄 Set up notification cleanup cron job
6. 🔄 Add email notifications (optional)
7. 🔄 Add push notifications (optional)

## Support

For detailed API documentation, see `API_DOCUMENTATION.md`

## Current Status

✅ **Server Running**: http://localhost:5000  
✅ **MongoDB Connected**  
✅ **All Routes Active**  
✅ **Ready for Testing**
