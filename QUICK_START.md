# 🚀 Quick Start Guide

## ✅ System Status

### Running Services
```
✅ Node.js Backend (Auth & Notifications): http://localhost:5000
✅ Spring Boot Backend: http://localhost:8081  
✅ React Frontend: http://localhost:5173
✅ MongoDB: Connected
```

### Database
```
✅ 4 Roles Seeded (ADMIN, MANAGER, STAFF, CUSTOMER)
✅ Admin User Created
```

## 🔑 Admin Credentials

```
Email: admin@smartcampus.com
Password: Admin@123456
```
⚠️ **Change this password after first login!**

## 🎯 Test the System

### 1. Login with Google
Open in browser:
```
http://localhost:5000/auth/google
```

### 2. Get Current User Profile
```bash
GET http://localhost:5000/api/roles/me
```

### 3. Create a Test Notification
```bash
POST http://localhost:5000/api/notifications
Content-Type: application/json

{
  "userId": "YOUR_USER_ID",
  "title": "Test Notification",
  "message": "This is a test notification",
  "type": "INFO",
  "priority": "MEDIUM"
}
```

### 4. Get All Notifications
```bash
GET http://localhost:5000/api/notifications
```

## 📁 Key Files

| File | Purpose |
|------|---------|
| `API_DOCUMENTATION.md` | Complete API reference |
| `NOTIFICATIONS_ROLES_README.md` | Detailed setup guide |
| `test-api-examples.http` | Ready-to-use API tests |
| `SETUP_COMPLETE.md` | Full feature overview |

## 🎨 Available Roles

| Role | Permissions | Use Case |
|------|-------------|----------|
| **CUSTOMER** | Basic access | Regular users |
| **STAFF** | Create notifications, view users | Support team |
| **MANAGER** | Manage users, full notifications | Team leads |
| **ADMIN** | Full system access | System administrators |

## 🔔 Notification Types

| Type | Use For |
|------|---------|
| **INFO** | General information |
| **SUCCESS** | Success messages |
| **WARNING** | Warnings and alerts |
| **ERROR** | Error notifications |
| **SYSTEM** | System announcements |

## 🎯 Priority Levels

- **LOW** - Non-urgent information
- **MEDIUM** - Standard notifications (default)
- **HIGH** - Important notifications
- **URGENT** - Critical, immediate attention required

## 📊 Quick API Reference

### Role Management
```
GET    /api/roles/me                          # Current user
GET    /api/roles/users                       # All users (Admin/Manager)
PUT    /api/roles/users/:id/role              # Update role (Admin)
PATCH  /api/roles/users/:id/toggle-status     # Toggle status (Admin)
GET    /api/roles/statistics                  # Statistics (Admin)
```

### Notifications
```
GET    /api/notifications                     # Get notifications
GET    /api/notifications/unread-count        # Unread count
PATCH  /api/notifications/:id/read            # Mark as read
PATCH  /api/notifications/read-all            # Mark all as read
DELETE /api/notifications/:id                 # Delete notification
POST   /api/notifications                     # Create (Admin/Staff/Manager)
```

## 🛠️ Useful Commands

```bash
# Start server
npm start

# Seed roles
npm run seed:roles

# Create admin user
npm run create:admin email@example.com Password123 "Admin Name"
```

## 💡 Common Use Cases

### Send Welcome Notification
```javascript
const notificationService = require('./services/notificationService');
await notificationService.sendWelcomeNotification(userId);
```

### Send System Announcement
```javascript
await notificationService.sendSystemAnnouncement(
  "Maintenance Notice",
  "System will be down Sunday 2-4 AM",
  "HIGH"
);
```

### Send to Specific Roles
```javascript
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

## 🎓 Next Steps

1. ✅ Test API endpoints using `test-api-examples.http`
2. ✅ Integrate with your frontend
3. ✅ Customize roles and permissions as needed
4. ✅ Set up notification cleanup cron job
5. ✅ Change default admin password

## 📞 Need Help?

- Check `API_DOCUMENTATION.md` for detailed API info
- See `NOTIFICATIONS_ROLES_README.md` for setup details
- Review `SETUP_COMPLETE.md` for complete feature list

---

**Everything is ready! Start building! 🎉**
