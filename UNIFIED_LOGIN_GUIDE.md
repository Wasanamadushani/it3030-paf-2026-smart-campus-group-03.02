# 🎯 Unified Login System - Admin & User Login

## ✅ What's Changed

I've unified the login system so **both admin and regular users** can login through the **same "My Account Login"** button in the navbar!

---

## 🚀 How to Login as Admin

### **Step 1: Click "My Account Login"**
- Go to http://localhost:5173
- Click the **"My Account Login"** button in the navbar
- The login modal will open

### **Step 2: See Admin Credentials**
At the top of the login modal, you'll see:
```
Admin Login: admin@smartcampus.com / Admin@123456
```

### **Step 3: Enter Admin Credentials**
```
Email: admin@smartcampus.com
Password: Admin@123456
```

### **Step 4: Click "Sign in"**
- The system will automatically detect you're an admin
- You'll be redirected to the **Admin Dashboard** at `/admin/dashboard`

---

## 🎨 How It Works

### **Smart Login Detection**
The login system now:
1. ✅ Tries the Node.js backend first (for admin/email login)
2. ✅ Detects your role (ADMIN, MANAGER, STAFF, CUSTOMER)
3. ✅ Automatically redirects based on role:
   - **ADMIN/MANAGER** → Admin Dashboard (`/admin/dashboard`)
   - **CUSTOMER/STAFF** → Customer Dashboard (scroll to section)

### **Single Login Modal**
- ✅ Works for both admin and regular users
- ✅ Shows admin credentials at the top
- ✅ Supports email/password login
- ✅ Supports Google OAuth login
- ✅ Automatic role-based routing

---

## 👤 User Experience

### **For Admins:**
1. Click "My Account Login"
2. See admin credentials displayed
3. Enter admin email/password
4. Get redirected to Admin Dashboard
5. See "Admin Dashboard" link in profile dropdown

### **For Regular Users:**
1. Click "My Account Login"
2. Enter their credentials or register
3. Get redirected to Customer Dashboard
4. See "Customer Dashboard" link in profile dropdown

---

## 📊 Profile Dropdown Features

After logging in, click your profile avatar to see:

### **For Admins/Managers:**
- ✅ **Admin Dashboard** (link to `/admin/dashboard`)
- ✅ Customer Dashboard
- ✅ Settings
- ✅ Sign out

### **For Regular Users:**
- ✅ Customer Dashboard
- ✅ Settings
- ✅ Sign out

---

## 🔐 Authentication Flow

```
User clicks "My Account Login"
    ↓
Login modal opens
    ↓
User enters credentials
    ↓
System tries Node.js backend (port 5000)
    ↓
If successful:
  - Check user role
  - If ADMIN/MANAGER → Redirect to /admin/dashboard
  - If CUSTOMER/STAFF → Scroll to customer section
    ↓
If failed:
  - Try Spring Boot backend (port 8081)
  - Handle customer login
```

---

## 🎯 Key Features

### **1. Unified Login**
- ✅ Single login button for everyone
- ✅ Same modal for admin and users
- ✅ No separate admin login page needed

### **2. Role-Based Routing**
- ✅ Automatic detection of user role
- ✅ Smart redirection based on role
- ✅ Different dashboard access

### **3. Session Management**
- ✅ Persistent sessions with cookies
- ✅ User data stored in localStorage
- ✅ Auto-login on page refresh

### **4. Visual Indicators**
- ✅ Admin credentials shown in modal
- ✅ Role badge in navbar
- ✅ Role-specific menu items

---

## 📝 Admin Credentials (Reminder)

```
Email: admin@smartcampus.com
Password: Admin@123456
```

These credentials are displayed at the top of the login modal for easy access!

---

## 🧪 Testing the System

### **Test 1: Admin Login**
1. Go to http://localhost:5173
2. Click "My Account Login"
3. Enter admin credentials
4. ✅ Should redirect to `/admin/dashboard`
5. ✅ Should see admin stats and data

### **Test 2: Profile Dropdown**
1. After logging in as admin
2. Click your profile avatar
3. ✅ Should see "Admin Dashboard" link
4. ✅ Should see role badge (ADMIN)

### **Test 3: Regular User Login**
1. Click "My Account Login"
2. Click "Register" tab
3. Create a new account
4. ✅ Should scroll to customer dashboard
5. ✅ Should NOT see "Admin Dashboard" link

### **Test 4: Google OAuth**
1. Click "My Account Login"
2. Click "Continue with Google"
3. Complete Google login
4. ✅ Should redirect based on role

---

## 🔧 Technical Details

### **Backend Endpoints Used**
```javascript
// Primary (Node.js - Port 5000)
POST /api/auth/login
GET /api/auth/status
POST /api/auth/logout

// Fallback (Spring Boot - Port 8081)
POST /api/auth/login
```

### **Frontend Logic**
```javascript
// Try Node.js backend first
const nodeResponse = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  credentials: 'include',
  body: JSON.stringify({ email, password })
});

if (nodeResponse.ok) {
  const data = await nodeResponse.json();
  
  // Check role and redirect
  if (data.user.role === 'ADMIN' || data.user.role === 'MANAGER') {
    window.location.href = '/admin/dashboard';
  } else {
    goToCustomerDashboard();
  }
}
```

---

## 🎨 UI Changes

### **Login Modal**
- ✅ Added admin credentials display at top
- ✅ Blue info box with credentials
- ✅ Visible only on login tab (not register)

### **Profile Dropdown**
- ✅ Conditional "Admin Dashboard" link
- ✅ Shows only for ADMIN/MANAGER roles
- ✅ Role badge displays user role

### **Navbar**
- ✅ Removed separate "Admin Login" button
- ✅ Single "My Account Login" button
- ✅ Works for all user types

---

## 📚 Files Modified

1. ✅ `Home/src/components/Navbar.jsx`
   - Updated `handleLogin()` function
   - Added role-based routing
   - Added admin credentials display
   - Updated profile dropdown

---

## 🎉 Benefits

### **For Users:**
- ✅ Simpler interface (one login button)
- ✅ Clear admin credentials shown
- ✅ Automatic routing to correct dashboard
- ✅ Role-based menu options

### **For Developers:**
- ✅ Single login flow to maintain
- ✅ Consistent authentication logic
- ✅ Easy to add new roles
- ✅ Clean code structure

---

## 🚀 Quick Start

1. **Go to homepage**: http://localhost:5173
2. **Click**: "My Account Login"
3. **Enter**: admin@smartcampus.com / Admin@123456
4. **Click**: "Sign in"
5. **Enjoy**: Your admin dashboard!

---

## 🔗 All Services Running

✅ **Frontend**: http://localhost:5173  
✅ **Node.js Backend**: http://localhost:5000  
✅ **Spring Boot Backend**: http://localhost:8081  
✅ **MongoDB**: Connected  

---

## 💡 Pro Tips

1. **Admin credentials are always visible** in the login modal
2. **Role badge** in navbar shows your current role
3. **Profile dropdown** shows role-specific options
4. **Sessions persist** across page refreshes
5. **Logout** clears all session data

---

## ✨ Summary

**Now you can login as admin using the same "My Account Login" button!**

✅ Single unified login system  
✅ Admin credentials displayed in modal  
✅ Automatic role-based routing  
✅ Smart dashboard redirection  
✅ Role-specific menu options  
✅ Clean, simple user experience  

**Try it now at http://localhost:5173!** 🎊
