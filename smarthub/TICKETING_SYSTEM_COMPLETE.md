# Academic Support Ticket System - Complete Setup Guide

A complete ticketing system built with **React (Frontend)**, **Spring Boot (Backend)**, and **MongoDB (Database)** for students to raise and track academic issues.

## 🎯 Features

### 📌 Student Features
- ✅ Create support tickets with title, description, category, and priority
- ✅ Track ticket status in real-time (Open → In Progress → Resolved → Closed)
- ✅ View all personal tickets with filtering by status
- ✅ Categorize issues:
  - Grades
  - Assignment Help
  - Attendance
  - Course Content
  - Exam Related
  - Fee Related
  - Other
- ✅ Set priority levels: Low, Medium, High, Urgent
- ✅ View admin responses and comments

### 👨‍💼 Admin Features
- ✅ Comprehensive Dashboard with statistics
  - Total tickets count
  - Tickets by status (Open, In Progress, Resolved, Closed)
- ✅ Advanced filtering:
  - By Status
  - By Priority
  - By Category
- ✅ Manage all tickets from all students
- ✅ Update ticket status
- ✅ Add admin comments/responses
- ✅ Delete tickets
- ✅ View detailed ticket information
- ✅ Responsive table view with sorting

## 🛠️ Tech Stack

### Backend
```
✓ Java 17
✓ Spring Boot 3.3.4
✓ Spring Data MongoDB
✓ Spring Boot Web
✓ Spring Boot Validation
✓ Maven
```

### Frontend
```
✓ React 18.3.1
✓ Vite 5.4.10
✓ JavaScript ES6+
✓ CSS3
```

### Database
```
✓ MongoDB (NoSQL)
```

## 📁 Project Structure

```
smarthub/
├── Backend/
│   ├── src/main/java/com/paf/backend/
│   │   ├── BackendApplication.java
│   │   ├── config/
│   │   │   └── CorsConfig.java
│   │   ├── controller/
│   │   │   ├── HealthController.java
│   │   │   ├── HomeController.java
│   │   │   └── TicketController.java
│   │   ├── dto/
│   │   │   └── TicketDTO.java
│   │   ├── entity/
│   │   │   └── Ticket.java
│   │   ├── repository/
│   │   │   └── TicketRepository.java
│   │   └── service/
│   │       └── TicketService.java
│   ├── src/main/resources/
│   │   └── application.properties
│   ├── pom.xml
│   └── mvnw/mvnw.cmd
│
├── Home/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── TicketForm.jsx
│   │   │   ├── TicketList.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   └── ... other components
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── TicketsPage.jsx
│   │   │   └── AdminPage.jsx
│   │   ├── services/
│   │   │   └── ticketService.js
│   │   ├── styles/
│   │   │   ├── home.css
│   │   │   ├── ticketForm.css
│   │   │   ├── ticketList.css
│   │   │   ├── ticketsPage.css
│   │   │   ├── adminDashboard.css
│   │   │   └── adminPage.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
```

## 🚀 Setup Instructions

### Prerequisites
- Java 17+
- Node.js 16+
- MongoDB (local or Atlas)
- Maven
- Git

### Backend Setup

1. **Navigate to Backend directory:**
   ```bash
   cd smarthub/Backend
   ```

2. **Configure MongoDB in `application.properties`:**
   ```properties
   spring.application.name=backend
   server.port=8081
   
   # MongoDB Configuration
   spring.data.mongodb.uri=mongodb://localhost:27017/smartcampus
   spring.data.mongodb.auto-index-creation=true
   ```

   For MongoDB Atlas (Cloud):
   ```properties
   spring.data.mongodb.uri=mongodb+srv://username:password@cluster.mongodb.net/smartcampus
   ```

3. **Build the project:**
   ```bash
   # On Linux/Mac
   ./mvnw clean install
   
   # On Windows
   mvnw.cmd clean install
   ```

4. **Run the backend:**
   ```bash
   # On Linux/Mac
   ./mvnw spring-boot:run
   
   # On Windows
   mvnw.cmd spring-boot:run
   ```

   Backend will start at `http://localhost:8081`

### Frontend Setup

1. **Navigate to Frontend directory:**
   ```bash
   cd smarthub/Home
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

   Frontend will be available at `http://localhost:5173`

4. **Build for production:**
   ```bash
   npm run build
   ```

## 📡 API Endpoints

All endpoints are prefixed with `/api/tickets`

### Student Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/` | Create a new ticket |
| `GET` | `/student/{studentId}` | Get all tickets for a student |
| `GET` | `/{id}` | Get a specific ticket |
| `GET` | `/status/{status}` | Get tickets by status |

### Admin Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Get all tickets |
| `PUT` | `/{id}/status` | Update ticket status |
| `PUT` | `/{id}/comments` | Add admin comments |
| `DELETE` | `/{id}` | Delete a ticket |

### Request/Response Examples

**Create Ticket:**
```json
POST /api/tickets
{
  "studentId": "STU001",
  "title": "Grade Appeal for Midterm",
  "description": "I believe my midterm was graded incorrectly...",
  "category": "GRADES",
  "priority": "HIGH"
}
```

**Response:**
```json
{
  "id": "6507a1c2e4b0a1c2e4b0a1c2",
  "studentId": "STU001",
  "title": "Grade Appeal for Midterm",
  "description": "I believe my midterm was graded incorrectly...",
  "category": "GRADES",
  "priority": "HIGH",
  "status": "OPEN",
  "createdAt": "2024-04-18T10:30:00",
  "updatedAt": null,
  "adminComments": null
}
```

**Update Status:**
```json
PUT /api/tickets/{id}/status?status=IN_PROGRESS
```

**Add Comment:**
```json
PUT /api/tickets/{id}/comments?comments=We%20are%20reviewing%20your%20case
```

## 🎨 User Interface

### Student View
- **Navbar**: Navigation with Home, Tickets, etc.
- **Ticket Form**: Create new tickets with validation
- **Ticket List**: View and filter personal tickets
- **Ticket Details**: View full ticket information and admin responses

### Admin View
- **Admin Dashboard**: 
  - Statistics cards showing ticket counts
  - Advanced filtering panel (Status, Priority, Category)
  - Table view of all tickets
  - Click "View" to see detailed ticket information
  - Modal for:
    - Updating ticket status
    - Adding admin comments
    - Deleting tickets
    - Viewing all ticket details

## 🔐 Security Notes

**⚠️ Important:** This is a demonstration project. In production:

1. Implement proper authentication (JWT/OAuth2)
2. Add authorization checks for admin endpoints
3. Validate all inputs on both frontend and backend
4. Use HTTPS for all communications
5. Store sensitive data securely
6. Implement rate limiting
7. Add audit logging for admin actions
8. Use environment variables for sensitive config

## 🐛 Troubleshooting

### Backend Issues

**MongoDB Connection Error:**
```
Ensure MongoDB is running:
- Local: mongod command
- Atlas: Check connection string and network access
```

**Port Already in Use:**
```
Change port in application.properties:
server.port=8082
```

**Compilation Error:**
```
mvnw clean install -X  # For detailed output
```

### Frontend Issues

**Dependencies not installing:**
```bash
rm package-lock.json
npm install
```

**Port 5173 in use:**
```bash
npm run dev -- --port 3000  # Use different port
```

**API not responding:**
- Ensure backend is running on port 8081
- Check CORS configuration in `CorsConfig.java`
- Verify API_BASE_URL in `ticketService.js`

## 📊 Database Schema

### Ticket Collection (MongoDB)

```javascript
{
  _id: ObjectId,
  studentId: String,
  title: String,
  description: String,
  category: String,  // GRADES, ASSIGNMENT_HELP, etc.
  priority: String,  // LOW, MEDIUM, HIGH, URGENT
  status: String,    // OPEN, IN_PROGRESS, RESOLVED, CLOSED
  createdAt: ISODate,
  updatedAt: ISODate,
  adminComments: String
}
```

## 🔄 Workflow

1. **Student creates ticket** → Ticket created in OPEN status
2. **Admin reviews ticket** → Updates status to IN_PROGRESS
3. **Admin adds comments** → Student sees responses
4. **Issue resolved** → Status changed to RESOLVED
5. **Ticket closed** → Status changed to CLOSED

## 📱 Responsive Design

- ✅ Mobile (< 768px)
- ✅ Tablet (768px - 1024px)
- ✅ Desktop (> 1024px)

## 🤝 Navigation

### Switching Between Views

1. **Student View**: Click "Home" in navbar
2. **Tickets Page**: Click "Tickets" in navbar to create/view tickets
3. **Admin Panel**: Click profile icon → "⚙️ Admin Panel"
4. **Exit Admin**: Click profile icon → "👤 Exit Admin"

## 📝 File Descriptions

### Backend Key Files

- **TicketController.java**: REST endpoints
- **TicketService.java**: Business logic
- **TicketRepository.java**: MongoDB queries
- **Ticket.java**: Data model with MongoDB annotations
- **TicketDTO.java**: Data transfer object

### Frontend Key Files

- **AdminDashboard.jsx**: Complete admin interface
- **TicketForm.jsx**: Student ticket creation
- **TicketList.jsx**: Ticket display component
- **ticketService.js**: API communication layer
- **adminDashboard.css**: Admin panel styling

## 🎓 Learning Resources

- Spring Boot Docs: https://spring.io/projects/spring-boot
- MongoDB: https://docs.mongodb.com/
- React: https://react.dev/
- RESTful API Design: https://restfulapi.net/

## 📄 License

This project is part of the PAF Smart Campus initiative.

## 🚨 Support

For issues or questions:
1. Check the troubleshooting section
2. Review API error responses
3. Check browser console for frontend errors
4. Check application logs for backend errors

---

**Last Updated:** April 2024
**Version:** 1.0
