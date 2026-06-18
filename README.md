# Bhumi Didi Web — Sales CRM & Prospect Management Platform

> **🚀 Production-Ready Full-Stack Application** | Role-Based Dashboards | Click & Go Live

A complete internal CRM platform for managing prospects, employees, and sales outreach. Includes a Super Admin control centre, an Agent/Employee portal, and a Client dashboard — each with role-specific views and features.

> [!NOTE]
> The frontend runs on port **`3001`** and the API backend on port **`4000`**. Both start automatically with `npm run dev`.

---

## ⚡ Quick Start (30 seconds)

**Windows:** Double-click `START_DEV.bat`

**Mac/Linux:** `chmod +x run.sh && ./run.sh`

**Anywhere:**
```bash
npm run dev
```

Then open: **http://localhost:3001**

✅ Done! Both frontend and backend are live.

---

## 🔐 Test Credentials

| Role | Email | Password |
|---|---|---|
| **Super Admin** | `superadmin@gmail.com` | `AdminPass123!` |
| **Agent** | `agent@gmail.com` | `AdminPass123!` |
| **Client** | `client@gmail.com` | `AdminPass123!` |

> Or create your own account via the Sign Up page.

---

## 🎯 Feature Overview

### 👑 Super Admin Portal
Full control over all platform data:

**Prospect Management**
- Upload prospect lists in bulk via CSV with preview before confirming
- View all uploaded prospect lists in a structured table with search + filter (All / Assigned / Unassigned)
- Overview stats bar: Total Lists, Total Prospects, Assigned, Unassigned counts
- Drill into any list to view individual prospects and their call status
- Assign entire prospect lists or individual prospects to specific employees
- Track which prospects are assigned to whom with an "Assigned Agent" column

**Employee Management**
- Add new employees with name, email, phone, password, designation, and role
- Edit or deactivate (suspend) existing employees
- Create and manage custom designations (e.g. Sales Agent, Team Lead, Senior Agent) with permission scopes
- Employee dashboard cards showing assigned prospect count, daily call target progress, and latest daily update
- **Active Today** badge shows which agents submitted a daily update today

**System Tools**
- System health dashboard (uptime, RAM, API latency, integration statuses)
- Full audit trail log of all admin actions
- AI chatbot conversation logs
- Global system configuration key-value editor
- Platform user directory with role management and account suspension

---

### 👤 Agent / Employee Portal
Each agent sees only their own data:

**My Prospects Tab**
- Clean structured table of assigned prospects (Name, Company, Phone, Status, Edit)
- Responsive — Company and Phone columns collapse gracefully on mobile
- Click any row to open the lead detail/feedback panel
- For each prospect, agents can update:
  - Decision maker's phone number
  - Decision maker's email address
  - Call status with emoji labels:
    - `Call Went Well 👍`
    - `Call Went Poorly 👎`
    - `Follow-up Meeting Scheduled 📅`
    - `Deal Closed ✅`
    - `Lost / Failed ❌`
    - + No Answer, Interested, Follow Up, Contacted
  - Free-text notes / remarks
- **Quick Daily Log bar** at the top — submit a daily summary in under 30 seconds without leaving the prospects view

**Daily Planner Tab**
- Circular progress ring for daily call target (set your own target, auto-tracks calls made)
- Schedule and manage today's meetings (time, prospect name, purpose) — mark complete or delete
- Personal task checklist — add, check off, and delete tasks
- Daily log history — view past submissions

**Dashboard Stats**
- Allocated Projects count
- Total Leads assigned
- Leads Contacted
- Outcomes Rate (% of prospects with a positive outcome)

---

### 🏢 Client Portal
- View assigned projects and their progress
- Upload lead files (pending Super Admin approval)
- Track agent activity and call outcomes on their campaigns
- Appointment management

---

## 🏗️ Tech Stack

| Component | Technology | Version |
|---|---|---|
| Frontend | Next.js | 15.2.3 |
| Frontend UI | React + TypeScript | 18.3.1 |
| Styling | Tailwind CSS | 3.4.4 |
| Animations | Framer Motion | — |
| Icons | Lucide React | — |
| Backend | Express.js | 4.19.2 |
| Database | In-Memory (Prisma-style mock, persisted to `prisma/db.json`) | — |
| Auth | JWT + NextAuth.js | 4.24.14 |
| AI | OpenAI Integration | 4.13.0 |
| Voice | Twilio Integration | 4.10.0 |
| Real-time | Server-Sent Events (SSE) | — |

---

## 🔌 URLs After Starting

| Service | URL |
|---|---|
| Frontend App | http://localhost:3001 |
| API Backend | http://localhost:4000 |
| API Health | http://localhost:4000/api/health |

---

## 📁 Project Structure

```
Bhumi Didi Web/
├── frontend/                   # Next.js 15 frontend
│   ├── app/
│   │   ├── dashboard/          # Unified role-based dashboard entry point
│   │   ├── login/              # Login page
│   │   ├── register/           # Sign up page
│   │   ├── admin/              # Admin route
│   │   ├── superadmin/         # Super Admin route
│   │   └── profile/            # User profile
│   ├── components/
│   │   ├── SuperAdminDashboard.tsx   # Full super admin control centre
│   │   ├── AgentDashboard.tsx        # Agent prospect list + planner
│   │   ├── AdminDashboard.tsx        # Admin panel
│   │   ├── ClientDashboard.tsx       # Client project/lead view
│   │   ├── Navbar.tsx                # Top navigation
│   │   └── ...                       # Landing page components
│   └── styles/
│       └── globals.css
│
├── backend/                    # Express.js API server
│   └── src/
│       ├── routes/
│       │   ├── auth.ts         # Login, register, session
│       │   ├── superadmin.ts   # Prospect upload, assign, employee CRUD
│       │   ├── crm.ts          # Projects, leads, agent planner, SSE stream
│       │   ├── admin.ts        # Admin-specific routes
│       │   └── leads.ts        # Lead status updates
│       ├── prisma-client.ts    # In-memory mock database with persistence
│       └── index.ts            # Express server entry point
│
├── START_DEV.bat               # Windows one-click startup
├── package.json                # Monorepo root (npm workspaces)
└── README.md
```

---

## 🔑 API Highlights

**Auth**
- `POST /api/auth/login` — authenticate, receive JWT
- `POST /api/auth/register` — create new user account

**Prospect Management (Super Admin)**
- `POST /api/superadmin/prospects/upload-preview` — parse CSV and return row preview
- `POST /api/superadmin/prospects/upload-confirm` — save prospect list to database
- `POST /api/superadmin/prospects/assign` — assign list or individual leads to an employee
- `GET /api/superadmin/prospects/summary` — all lists with assigned agent and progress

**Employee Management (Super Admin)**
- `GET /api/superadmin/employees` — list all employees with stats
- `POST /api/superadmin/employees` — create employee account
- `PATCH /api/superadmin/employees/:id` — update or suspend employee
- `DELETE /api/superadmin/employees/:id` — remove employee
- `GET/POST/PATCH/DELETE /api/superadmin/designations` — manage designations

**Agent CRM**
- `GET /api/crm/projects` — agent's assigned campaigns
- `GET /api/crm/agent-leads/:projectId` — prospects in a campaign
- `PATCH /api/crm/leads/:id/status` — update prospect call status, notes, phone, email
- `GET/POST /api/crm/agent/daily-planner` — target, meetings, tasks
- `POST /api/crm/agent/daily-update` — submit daily log
- `GET /api/crm/stream` — SSE stream for real-time updates

---

## 🗄️ Data Models

The in-memory database includes:

- `User`, `Role`, `Designation` — people and their permissions
- `Project` — prospect campaign lists
- `Lead` — individual prospects with call status and assignment
- `Assignment` — records of which agent was assigned which list
- `DailyPlanner`, `DailyUpdate` — agent daily targets and logs
- `Meeting`, `Task` — agent planner items
- `Client`, `Appointment` — client management
- `AuditLog`, `ChatbotLog`, `Notification` — system tracking

> Data is persisted between restarts in `backend/prisma/db.json`.

---

## 🐳 Docker

```bash
docker compose up --build
```

---

## Notes

- The platform uses glassmorphism styling, premium Framer Motion animations, and a dark luxury theme throughout.
- Role-based routing: Super Admin sees everything; Agents see only their assigned data; Clients see only their projects.
- The backend mock database automatically seeds with demo users, a sample prospect list, and sample leads on first run.
- For production, swap `prisma-client.ts` with a real Prisma + PostgreSQL connection.
