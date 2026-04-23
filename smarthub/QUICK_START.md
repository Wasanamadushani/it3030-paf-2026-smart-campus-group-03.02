# Quick Start Guide - Complete Ticketing System

## ⚡ Setup in 5 Minutes

### Prerequisites
- Java 17+
- Node.js 16+
- MongoDB running locally or on Atlas

---

## Step 1: Start MongoDB

```bash
# Local MongoDB
mongod

# OR use MongoDB Atlas (Cloud)
# Update connection string in application.properties
```

---

## Step 2: Start Backend

```bash
cd smarthub/Backend

# Build and run
./mvnw clean install        # Mac/Linux
./mvnw spring-boot:run

# OR on Windows
mvnw.cmd clean install
mvnw.cmd spring-boot:run
```

**Backend runs at:** `http://localhost:8081`

---

## Step 3: Start Frontend

```bash
cd smarthub/Home

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

**Frontend runs at:** `http://localhost:5173`

---

## 🎯 Using the System

### As a Student:

1. Go to http://localhost:5173
2. Click **Tickets** in the navbar
3. Fill the form:
   - Title: Your issue title
   - Description: Detailed description
   - Category: Select from dropdown
   - Priority: Low/Medium/High/Urgent
4. Click **Submit Ticket**
5. View your tickets in **My Tickets** tab

### As an Admin:

1. Click **profile icon** (top-right corner)
2. Select **⚙️ Admin Panel**
3. Use the **Filters** to find tickets:
   - By Status (Open, In Progress, Resolved, Closed)
   - By Priority (Low, Medium, High, Urgent)
   - By Category
4. Click **View** button on any ticket to:
   - See full details
   - Change status
   - Add admin comments
   - Delete ticket if needed

---

## 🗄️ MongoDB Configuration

In `Backend/src/main/resources/application.properties`:

```properties
# Local MongoDB
spring.data.mongodb.uri=mongodb://localhost:27017/smartcampus

# OR MongoDB Atlas (replace with your credentials)
spring.data.mongodb.uri=mongodb+srv://username:password@cluster.mongodb.net/smartcampus
```

---

## 📋 Features Implemented

### Backend (Spring Boot + MongoDB)
✅ Ticket creation with student ID
✅ Category: Grades, Assignments, Attendance, Course Content, Exam, Fee, Other
✅ Priority levels: Low, Medium, High, Urgent
✅ Status tracking: Open, In Progress, Resolved, Closed
✅ Admin comments/responses
✅ Full CRUD operations
✅ MongoDB queries for filtering

### Frontend (React)
✅ Student ticket creation form
✅ Ticket listing with filtering
✅ Admin Dashboard with:
   - Statistics cards
   - Advanced filtering panel
   - Detailed table view
   - Modal for ticket management
✅ Responsive design (Mobile, Tablet, Desktop)
✅ Real-time status updates

---

## 🔗 API Endpoints

```
Student Endpoints:
POST   /api/tickets                           - Create ticket
GET    /api/tickets/student/{studentId}      - Get my tickets
GET    /api/tickets/{id}                      - Get ticket details
GET    /api/tickets/status/{status}           - Filter by status

Admin Endpoints:
GET    /api/tickets                           - Get all tickets
PUT    /api/tickets/{id}/status               - Update status
PUT    /api/tickets/{id}/comments             - Add admin comment
DELETE /api/tickets/{id}                      - Delete ticket
```

---

## 📊 Ticket Categories

1. **GRADES** - Grade-related issues
2. **ASSIGNMENT_HELP** - Assignment questions
3. **ATTENDANCE** - Attendance concerns
4. **COURSE_CONTENT** - Course material issues
5. **EXAM_RELATED** - Exam-related problems
6. **FEE_RELATED** - Fee/Payment issues
7. **OTHER** - General issues

---

## 🎨 UI Navigation

```
Home Page
  ├── Tickets (Student View)
  │   ├── Create Ticket Form
  │   └── My Tickets List
  │
  └── Admin Panel (Click profile icon)
      └── Admin Dashboard
          ├── Statistics
          ├── Filters
          └── Ticket Management
```

---

## 🐛 Common Issues & Solutions

| Problem | Solution |
|---------|----------|
| **Backend won't start** | Ensure MongoDB is running: `mongod` |
| **API connection fails** | Check backend is on http://localhost:8081 |
| **Tickets not loading** | Refresh page, check browser console |
| **Can't create ticket** | Verify backend is running |
| **CORS error** | CORS is configured, restart backend if needed |
| **Port already in use** | Change port in application.properties |

---

## 📁 Project Structure

```
smarthub/
├── Backend/
│   ├── src/main/java/com/paf/backend/
│   │   ├── entity/Ticket.java (MongoDB document)
│   │   ├── repository/TicketRepository.java
│   │   ├── service/TicketService.java
│   │   ├── controller/TicketController.java
│   │   └── dto/TicketDTO.java
│   └── src/main/resources/application.properties
│
└── Home/
    ├── src/components/
    │   ├── AdminDashboard.jsx (NEW!)
    │   ├── TicketForm.jsx
    │   ├── TicketList.jsx
    │   └── Navbar.jsx
    ├── src/pages/
    │   ├── AdminPage.jsx (NEW!)
    │   ├── HomePage.jsx
    │   └── TicketsPage.jsx
    └── src/services/ticketService.js
```

---

## 🔐 Security Notes

⚠️ **For Production Deployment:**
- Add JWT/OAuth2 authentication
- Validate all inputs server-side
- Use HTTPS
- Implement rate limiting
- Add audit logging
- Secure admin endpoints with role-based access
- Use environment variables for secrets

---

## ✨ What's New (Recently Added)

🆕 **Admin Dashboard** - Full-featured admin interface
🆕 **Statistics Cards** - Real-time ticket counts
🆕 **Advanced Filtering** - Filter by Status, Priority, Category
🆕 **MongoDB Integration** - Replaced H2 with MongoDB
🆕 **Admin Comments** - Add responses to tickets
🆕 **Ticket Deletion** - Admin can delete tickets
🆕 **Responsive Design** - Works on all devices

---

## 📚 Documentation Files

- `TICKETING_SYSTEM_COMPLETE.md` - Full technical documentation
- `QUICK_START.md` - This file (Quick reference)
- `INTEGRATION_EXAMPLE.jsx` - Integration examples

---

## 🚀 Next Steps

1. ✅ System is ready to use
2. Create sample tickets as a student
3. Switch to admin mode to manage tickets
4. Customize styling and branding
5. Deploy to production with authentication

---

## 📞 Support

For detailed information, see:
- **Full Docs:** `TICKETING_SYSTEM_COMPLETE.md`
- **Backend:** Check `src/main/java/com/paf/backend/`
- **Frontend:** Check `src/components/AdminDashboard.jsx`

**Happy ticketing! 🎟️**
```

The database and tables will be created automatically on first run.

---

## 📝 How to Use

### For Students:

1. Go to the application
2. Click "Raise New Ticket"
3. Fill in the form:
   - **Title**: Brief issue description
   - **Description**: Detailed explanation
   - **Category**: Select from (Grades, Assignment Help, Attendance, etc.)
   - **Priority**: Choose urgency level
4. Click "Raise Ticket"
5. View your tickets in "My Tickets" tab

### For Admins:

1. Navigate to ticket system with `isAdmin={true}`
2. View all student tickets
3. Click on a ticket to see details
4. Update ticket status (Open → In Progress → Resolved → Closed)
5. Add comments/responses to students

---

## 🔌 Integration with Main App

In your main `App.jsx`:

```jsx
import TicketsPage from './pages/TicketsPage';

function App() {
  return (
    <div>
      {/* ... other components ... */}
      
      {/* Add this route for tickets */}
      <Route path="/tickets" element={<TicketsPage studentId="STU001" isAdmin={false} />} />
    </div>
  );
}
```

Or add a navigation link:

```jsx
<nav>
  <Link to="/tickets">Support Tickets</Link>
</nav>
```

---

## 📊 API Endpoints Reference

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/tickets` | Create new ticket |
| GET | `/api/tickets/student/{id}` | Get student's tickets |
| GET | `/api/tickets` | Get all tickets (admin) |
| GET | `/api/tickets/{id}` | Get ticket details |
| PUT | `/api/tickets/{id}/status` | Update status |
| PUT | `/api/tickets/{id}/comments` | Add admin comments |
| DELETE | `/api/tickets/{id}` | Delete ticket |

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Backend won't start | Check MySQL is running, port 8081 is free |
| Database errors | Verify MySQL credentials in application.properties |
| Frontend can't connect to API | Check backend is running on 8081, CORS is enabled |
| Port 5173 already in use | Vite will use next available port, check terminal output |

---

## 📂 File Structure Created

```
Backend/
└── src/main/java/com/paf/backend/
    ├── controller/TicketController.java      ✅ REST endpoints
    ├── service/TicketService.java             ✅ Business logic
    ├── repository/TicketRepository.java       ✅ Database queries
    ├── entity/Ticket.java                     ✅ Data model
    └── dto/TicketDTO.java                     ✅ Data transfer

Home/
└── src/
    ├── components/
    │   ├── TicketForm.jsx                     ✅ Create ticket form
    │   └── TicketList.jsx                     ✅ View & manage tickets
    ├── pages/
    │   └── TicketsPage.jsx                    ✅ Main ticket page
    ├── services/
    │   └── ticketService.js                   ✅ API service
    └── styles/
        ├── ticketForm.css                     ✅ Form styling
        ├── ticketList.css                     ✅ List styling
        └── ticketsPage.css                    ✅ Page styling
```

---

## ✨ Features Included

✅ Create tickets with categories and priorities  
✅ Real-time status tracking  
✅ Admin comment system  
✅ Responsive mobile design  
✅ Filter tickets by status  
✅ Modal detail view  
✅ Clean, modern UI  
✅ RESTful API  
✅ MySQL persistence  

---

## 🚀 Next Steps

1. ✅ Run both backend and frontend
2. ✅ Test creating a ticket
3. ✅ Verify tickets appear in list
4. ✅ Test status updates (admin)
5. ✅ Integrate into main app navigation

For detailed documentation, see: `TICKET_SYSTEM_README.md`

---

**Happy Ticketing! 🎫**
