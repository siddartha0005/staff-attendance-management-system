# Staff Attendance Management System

A full-stack web application for managing employee attendance, built with Node.js, Express, SQLite (sql.js), and vanilla HTML/CSS/JavaScript.

---

## Technologies Used

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | HTML5, CSS3, Vanilla JavaScript   |
| Backend    | Node.js, Express.js               |
| Database   | SQLite via sql.js (pure JS)       |
| Auth       | express-session + bcryptjs        |
| Sessions   | session-file-store                |
| Reports    | Server-side CSV generation        |

---

## Project Structure

```
attendance-management/
├── public/
│   ├── css/style.css
│   └── js/
│       ├── common.js
│       ├── login.js
│       ├── admin.js
│       ├── staff.js
│       ├── staff-management.js
│       ├── add-staff.js
│       ├── edit-staff.js
│       ├── attendance.js
│       └── reports.js
├── views/
│   ├── login.html
│   ├── admin.html
│   ├── staff.html
│   ├── staff-management.html
│   ├── add-staff.html
│   ├── edit-staff.html
│   ├── attendance.html
│   └── reports.html
├── routes/
│   ├── auth.js
│   ├── staff.js
│   └── attendance.js
├── middleware/
│   └── auth.js
├── database/
│   ├── db.js
│   └── schema.sql
├── scripts/
│   └── create-admin.js
├── utils/
│   └── csv.js
├── .env
├── .env.example
├── .gitignore
├── package.json
├── server.js
└── README.md
```

---

## Installation & Setup

### Prerequisites
- Node.js v16 or higher
- npm

> No Visual Studio or build tools required — all dependencies are pure JavaScript.

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Configure Environment

Copy `.env.example` to `.env` (already done). Edit if needed:

```
SESSION_SECRET=your_long_random_secret
PORT=3000
NODE_ENV=development
```

### Step 3: Create Admin Account

```bash
npm run setup
```

This creates the first administrator account in the database.

### Step 4: Start the Application

```bash
npm start
```

For development with auto-restart:

```bash
npm run dev
```

### Step 5: Open in Browser

```
http://localhost:3000
```

---

## Demo Credentials

> ⚠️ These are development-only credentials. Change them before deploying.

| Role  | Email                  | Password  |
|-------|------------------------|-----------|
| Admin | admin@company.com      | Admin@123 |
| Staff | (add via admin panel)  | (set when adding) |

**Sample staff credentials (after adding via admin):**
| Name      | Email               | Password   |
|-----------|---------------------|------------|
| John Doe  | john@company.com    | Staff@123  |
| Jane Smith| jane@company.com    | Staff@123  |

---

## Application Pages

| Page               | URL                  | Access |
|--------------------|----------------------|--------|
| Login              | /                    | Public |
| Admin Dashboard    | /admin               | Admin  |
| Staff Dashboard    | /staff               | Staff  |
| Staff Management   | /staff-management    | Admin  |
| Add Staff          | /add-staff           | Admin  |
| Edit Staff         | /edit-staff?id=:id   | Admin  |
| Attendance Records | /attendance          | Admin  |
| Reports            | /reports             | Admin  |

---

## API Endpoints

### Authentication
| Method | Endpoint     | Description              |
|--------|--------------|--------------------------|
| POST   | /api/login   | Login with email/emp ID  |
| POST   | /api/logout  | Logout and destroy session |
| GET    | /api/me      | Get current user info    |

### Staff Management (Admin only)
| Method | Endpoint        | Description         |
|--------|-----------------|---------------------|
| POST   | /api/staff      | Add new staff       |
| GET    | /api/staff      | List all staff      |
| GET    | /api/staff/:id  | Get staff by ID     |
| PUT    | /api/staff/:id  | Update staff        |

### Attendance
| Method | Endpoint                    | Description                    |
|--------|-----------------------------|--------------------------------|
| POST   | /api/attendance/check-in    | Mark check-in (Staff)          |
| POST   | /api/attendance/check-out   | Mark check-out (Staff)         |
| GET    | /api/attendance/my          | Own attendance history (Staff) |
| GET    | /api/attendance/today       | Today's summary (Admin)        |
| GET    | /api/attendance/stats       | Dashboard stats (Admin)        |
| GET    | /api/attendance             | Filtered records (Admin)       |
| GET    | /api/attendance/export      | Download CSV (Admin)           |

**Filter parameters for `/api/attendance` and `/api/attendance/export`:**
- `start_date` — YYYY-MM-DD
- `end_date` — YYYY-MM-DD
- `user_id` — numeric user ID

---

## Features

### Admin
- Dashboard with live stats (Total Staff, Present, Absent, Checked In)
- Today's attendance table
- Add / Edit / Activate / Deactivate staff
- View all attendance records with date and employee filters
- Download filtered CSV reports (Excel-compatible with BOM)

### Staff
- Personal dashboard with check-in / check-out buttons
- Real-time attendance status display
- Working duration calculated automatically
- Last 30 days attendance history

### Security
- Passwords hashed with bcrypt (cost factor 10)
- Session-based authentication (8-hour expiry)
- Role-based access control (ADMIN / STAFF)
- Staff cannot access other employees' records
- Inactive accounts cannot log in
- CSV export protected against formula injection
- Secrets stored in environment variables

---

## Test Cases

All 15 mandatory test cases verified:

| # | Test                                    | Result |
|---|-----------------------------------------|--------|
| 1 | Admin login → Admin dashboard           | ✅ Pass |
| 2 | Staff login → Staff dashboard           | ✅ Pass |
| 3 | Wrong password → Login rejected         | ✅ Pass |
| 4 | Admin adds staff → Staff saved          | ✅ Pass |
| 5 | Duplicate email → Error displayed       | ✅ Pass |
| 6 | Staff checks in → Attendance recorded   | ✅ Pass |
| 7 | Duplicate check-in → Rejected           | ✅ Pass |
| 8 | Staff checks out → Time recorded        | ✅ Pass |
| 9 | Check-out without check-in → Error      | ✅ Pass |
|10 | Admin views attendance → Records shown  | ✅ Pass |
|11 | Admin filters attendance → Correct data | ✅ Pass |
|12 | Admin downloads CSV → Valid file        | ✅ Pass |
|13 | Staff accesses admin page → Denied      | ✅ Pass |
|14 | User logs out → Session ended           | ✅ Pass |
|15 | Inactive staff login → Rejected         | ✅ Pass |

---

## Running with Git

```bash
git init
git add .
git commit -m "Initial commit: Staff Attendance Management System"
```

Note: `.env` and `*.db` files are excluded via `.gitignore`.
