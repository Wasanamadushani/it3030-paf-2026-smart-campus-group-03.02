# Academic Support Ticket System

Complete ticket-raising system for students to report academic issues in SmartHub.

## Features

✅ **Student Features:**
- Create support tickets for academic issues
- Track ticket status (Open, In Progress, Resolved, Closed)
- View all their tickets with filtering
- Categorize issues (Grades, Assignments, Attendance, etc.)
- Set priority levels (Low, Medium, High, Urgent)
- View admin comments on tickets

✅ **Admin Features:**
- View all support tickets from all students
- Update ticket status
- Add comments/responses to tickets
- Filter and search tickets

## Tech Stack

### Backend (Spring Boot)
- Java 17
- Spring Boot 3.3.4
- Spring Data JPA
- MySQL 8.0
- RESTful API

### Frontend (React)
- React 18+
- Vite
- CSS3

## Project Structure

```
Backend/
├── src/main/java/com/paf/backend/
│   ├── controller/TicketController.java
│   ├── service/TicketService.java
│   ├── repository/TicketRepository.java
│   ├── entity/Ticket.java
│   └── dto/TicketDTO.java
├── src/main/resources/
│   └── application.properties
└── pom.xml

Home/
├── src/
│   ├── components/
│   │   ├── TicketForm.jsx
│   │   └── TicketList.jsx
│   ├── pages/
│   │   └── TicketsPage.jsx
│   ├── services/
│   │   └── ticketService.js
│   └── styles/
│       ├── ticketForm.css
│       ├── ticketList.css
│       └── ticketsPage.css
└── package.json
```

## Setup Instructions

### Prerequisites
- Java 17 or higher
- Node.js 16+ and npm
- MySQL Server 8.0+

### Backend Setup

1. **Navigate to Backend directory:**
   ```bash
   cd Backend
   ```

2. **Update Database Configuration** (if needed):
   Edit `src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/smarthub
   spring.datasource.username=root
   spring.datasource.password=root
   ```

3. **Install Dependencies:**
   ```bash
   mvn clean install
   ```

4. **Run the Application:**
   ```bash
   mvn spring-boot:run
   ```
   Or use Maven wrapper:
   ```bash
   ./mvnw spring-boot:run
   ```

   The backend will start on `http://localhost:8081`

### Frontend Setup

1. **Navigate to Home directory:**
   ```bash
   cd Home
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Run Development Server:**
   ```bash
   npm run dev
   ```

   The frontend will start on `http://localhost:5173` (or another port shown in terminal)

## API Endpoints

### Create Ticket
```
POST /api/tickets
Content-Type: application/json

{
  "studentId": "STU001",
  "title": "Issue with calculations",
  "description": "I don't understand how to solve problem 5",
  "category": "ASSIGNMENT_HELP",
  "priority": "MEDIUM"
}
```

### Get Student Tickets
```
GET /api/tickets/student/{studentId}
```

### Get All Tickets (Admin)
```
GET /api/tickets
```

### Get Single Ticket
```
GET /api/tickets/{id}
```

### Get Tickets by Status
```
GET /api/tickets/status/{status}
```
Status values: `OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`

### Update Ticket Status
```
PUT /api/tickets/{id}/status?status=IN_PROGRESS
```

### Add Admin Comments
```
PUT /api/tickets/{id}/comments?comments=We are looking into this
```

### Delete Ticket
```
DELETE /api/tickets/{id}
```

## Using the Components

### In React App

To use the TicketsPage in your app:

```jsx
import TicketsPage from './pages/TicketsPage';

// For student view
<TicketsPage studentId="STU001" isAdmin={false} />

// For admin view
<TicketsPage studentId="ADMIN001" isAdmin={true} />
```

Or use individual components:

```jsx
import TicketForm from './components/TicketForm';
import TicketList from './components/TicketList';

// Form to create tickets
<TicketForm studentId="STU001" onTicketCreated={callback} />

// List to view tickets
<TicketList studentId="STU001" isAdmin={false} />
```

## Database Schema

### Tickets Table

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT | Primary key, auto-increment |
| student_id | VARCHAR(50) | Student who created ticket |
| title | VARCHAR(255) | Ticket title |
| description | TEXT | Detailed description |
| category | VARCHAR(50) | Issue category (ENUM) |
| priority | VARCHAR(50) | Priority level (ENUM) |
| status | VARCHAR(50) | Current status (ENUM) |
| created_at | DATETIME | Creation timestamp |
| updated_at | DATETIME | Last update timestamp |
| admin_comments | TEXT | Admin responses |

## Categories

- GRADES
- ASSIGNMENT_HELP
- ATTENDANCE
- COURSE_CONTENT
- EXAM_RELATED
- FEE_RELATED
- OTHER

## Priority Levels

- LOW
- MEDIUM
- HIGH
- URGENT

## Status Values

- OPEN (newly created)
- IN_PROGRESS (being handled)
- RESOLVED (issue resolved)
- CLOSED (ticket closed)

## Features to Add (Future)

- [ ] Ticket attachments
- [ ] Email notifications
- [ ] Comments/replies thread
- [ ] Real-time updates with WebSocket
- [ ] Ticket search and advanced filters
- [ ] SLA tracking
- [ ] Analytics dashboard
- [ ] Escalation levels

## Troubleshooting

### Backend not connecting to database
- Ensure MySQL is running
- Check database credentials in `application.properties`
- Create database: `CREATE DATABASE IF NOT EXISTS smarthub;`

### CORS errors
- Backend has `@CrossOrigin(origins = "*")` enabled
- Frontend API URL should match backend port (8081)

### Port already in use
- Backend: Change port in `application.properties` (`server.port=8082`)
- Frontend: Vite will use next available port

## Support

For issues or questions, please check:
1. Backend logs: `target/` directory
2. Browser console: Press F12
3. Network tab: Check API request/response

---

**Created for SmartHub - Academic Support System**
