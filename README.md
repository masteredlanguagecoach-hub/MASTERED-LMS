# Mastered Skill Academy — LMS Platform

> **Tagline:** Learn • Grow • Get Placed  
> **Production Stack:** React + TypeScript + Google Apps Script Web API + Google Sheets Relational Database + Google Drive

---

## 🏛️ System Architecture

```
Antigravity React Frontend (TypeScript + Vite)
        ↓  (HTTPS POST with Action-based RESTful API)
Google Apps Script API Web App (Code.gs, Auth.gs, Database.gs, etc.)
        ↓  (Batch Reads & ScriptLock Writes)
Google Sheets Database (34 Relational Sheets)
        ↓
Google Drive (Uploaded project submissions & candidate resumes)
```

- **Single Source of Truth:** Google Sheets Database.
- **Security:** Passwords salted with 32-character cryptographically random tokens and hashed with PBKDF2 stretching (10,000 SHA-256 iterations).
- **Session Authentication:** Server-side token validation against `SESSIONS` table with configurable expiry.
- **Role-Based Access Control (RBAC):** `STUDENT`, `TRAINER`, `ADMIN`, and `STAFF`.

---

## 🚀 Key Modules & Capabilities

### 1. Student Portal
- **Dashboard:** Progress rings, KPI overview, live classes with Google Meet links, pending assignments & assessments, fee status, and announcements.
- **Sequential Learning:** Modules contain sequential lessons. Prerequisites enforced server-side.
- **Attendance Registry:** Dynamic attendance percentages (Overall, Module-wise, Class-wise) with warning alerts if below threshold (default: 75%).
- **Assessments & Quizzes:** Module tests and interactive MCQ runner with instant grading.
- **Assignments:** Project upload modal (URLs, GitHub, Drive links), grading records, and trainer feedback.
- **Fees & Installments:** Master fee ledger, installment due dates, payments, and receipt generation.
- **Batch Chat & Announcements:** Batch communication space with role-tagged messages and broadcast bulletins.
- **Placement Readiness Engine:** Automated readiness calculation based on attendance, assessments, resume verification, and mock interviews.
- **Jobs & Internships:** Corporate opportunity catalog with 1-click applications.
- **Application Tracker:** 9-stage status pipeline (`APPLIED` → `SHORTLISTED` → `INTERVIEW_SCHEDULED` → `SELECTED` → `JOINED`).
- **Profile:** Personal, academic, guardian details, and password updater.

### 2. Trainer Portal
- **Trainer Dashboard:** Live session launcher, active cohorts, and pending review queue.
- **My Batches:** View authorized batches and enrolled student rosters.
- **Mark Attendance:** Session attendance recorder with `LockService` concurrency protection.
- **Review Submissions:** Grade student code deliverables with scoring out of 100 and feedback remarks.

### 3. Admin & Governance Portal
- **Operations Dashboard:** High-level academy KPIs, active cohorts, and fee collection rate.
- **Student Admissions:** Provision student users with auto-generated IDs, salted credentials, and fee ledgers.
- **Courses & Curriculum:** Manage courses and module breakdowns.
- **Batches & Scheduling:** Cohort scheduling and trainer allocations.
- **Fee Collections:** Record payments with transaction references and issue unique receipts (`MSA-RCP-...`).
- **Placement Drives:** Post job openings and internships with eligibility criteria.
- **Analytics & Reports:** Consolidated audit reports for Attendance, Fees, Assessments, and Placements.
- **Database & Settings:** Automated one-click execution of `initializeDatabase()` and `seedDemoData()`, plus rule configuration.

---

## 🛠️ Project Structure

```
├── backend/                   # Google Apps Script Web App source
│   ├── Code.gs                # Central API router & action dispatcher
│   ├── Config.gs              # Configuration constants, prefixes, sheet names
│   ├── Database.gs            # initializeDatabase() & seedDemoData()
│   ├── Auth.gs                # PBKDF2 hashing, session creation & verification
│   ├── Utils.gs               # generateId(), LockService, sheet helpers
│   ├── Users.gs               # User management & password resets
│   ├── Students.gs            # Student dashboard & admission handlers
│   ├── Trainers.gs            # Trainer portal & class management
│   ├── Courses.gs             # Course & batch curriculum handlers
│   ├── Batches.gs             # Cohort scheduling & student roster
│   ├── Modules.gs             # Module & sequential lesson progress
│   ├── Attendance.gs          # Dynamic attendance calculation
│   ├── Assessments.gs         # Quiz evaluations & grading engine
│   ├── Assignments.gs         # Project submissions & evaluation
│   ├── Fees.gs                # Fee schedules & payment transactions
│   ├── Chat.gs                # Batch discussions & announcements
│   ├── Notifications.gs       # User alerts & delivery
│   ├── Placements.gs          # Placement readiness score engine
│   ├── Applications.gs        # Job applications & status pipeline
│   ├── Reports.gs             # Multi-category audit reporting
│   └── appsscript.json        # Apps Script manifest
│
├── frontend/                  # React + TypeScript + Vite
│   ├── src/
│   │   ├── api/client.ts      # Google Apps Script API client
│   │   ├── context/           # AuthContext & Session Provider
│   │   ├── hooks/             # useApi & useAsyncAction
│   │   ├── types/             # Full TypeScript interfaces
│   │   ├── styles/globals.css # Design system & responsive layout tokens
│   │   ├── components/        # Layout (Sidebar, Header, MobileNav) & UI
│   │   └── pages/             # Student, Trainer, Admin, and Auth pages
│   ├── package.json
│   └── vite.config.ts
│
├── DEPLOYMENT_GUIDE.md        # Step-by-step Google Sheets & Apps Script deployment
├── API_DOCUMENTATION.md       # API specification and action payloads
├── ROLE_PERMISSION_MATRIX.md  # RBAC permissions & primary ID conventions
└── TESTING_CHECKLIST.md       # Verification & QA checklist
```

---

## ⚡ Quick Start

### 1. Run Frontend Locally
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173).

### 2. Build for Production
```bash
npm run build
```

---

## 🔐 Default Demo Accounts

| Role | Admission / Username | Password |
|---|---|---|
| **Student** | `student@masteredskill.academy` *(or `STD000001`)* | `Student@123` |
| **Trainer** | `trainer@masteredskill.academy` *(or `TRN000001`)* | `Trainer@123` |
| **Admin** | `admin@masteredskill.academy` *(or `ADM000001`)* | `Admin@123` |
