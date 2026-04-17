# Quick Start Guide - Ticket System Setup

## ⚡ Fast Track Setup (5 minutes)

### Step 1: Backend Setup

```bash
# Navigate to Backend folder
cd Backend

# Build the project
mvn clean install

# Run the Spring Boot application
mvn spring-boot:run
```

✅ Backend will run on `http://localhost:8081`

### Step 2: Frontend Setup

```bash
# In a new terminal, navigate to Home folder
cd Home

# Install dependencies
npm install

# Start development server
npm run dev
```

✅ Frontend will run on `http://localhost:5173` (or shown in terminal)

### Step 3: Access the Application

Open browser and go to `http://localhost:5173`

---

## 🔧 Important Configuration

### Database Setup

Make sure MySQL is running with these settings (in `Backend/src/main/resources/application.properties`):

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/smarthub?createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=root
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
