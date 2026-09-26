# MASTERED SKILL ACADEMY LMS — ROLE & PERMISSION MATRIX

Strict role-based access control (RBAC) is enforced both at the **React route level** (via `ProtectedRoute`) and at the **Google Apps Script API level** (via `requireAuth(params, allowedRoles)`). Client-side claims are never trusted; session tokens determine identity and scope.

---

## Permission Matrix by Action

| Action | STUDENT | TRAINER | STAFF | ADMIN | Data Scope Restriction |
|---|:---:|:---:|:---:|:---:|---|
| **login / logout** | ✅ | ✅ | ✅ | ✅ | Global |
| **getStudentDashboard** | ✅ | ❌ | ❌ | ❌ | Derived from authenticated session only |
| **getModules / getModuleDetails** | ✅ | ✅ | ✅ | ✅ | Students see own course with unlock locks |
| **completeLesson** | ✅ | ❌ | ❌ | ❌ | Validates sequence lock prerequisites |
| **getAttendance** | ✅ | ✅ | ✅ | ✅ | Students: self only; Trainers: authorized batches |
| **markAttendance** | ❌ | ✅ | ❌ | ✅ | Trainer: verified against assigned batch |
| **getAssessments / submit** | ✅ | ✅ | ❌ | ✅ | Students submit answers for auto-grading |
| **getAssignments / submit** | ✅ | ✅ | ❌ | ✅ | Students upload submissions for their batch |
| **reviewAssignment** | ❌ | ✅ | ❌ | ✅ | Trainer evaluates assigned batch students |
| **getFees / getInstallments** | ✅ | ❌ | ✅ | ✅ | Students view own ledger; Staff/Admin full access |
| **recordPayment** | ❌ | ❌ | ✅ | ✅ | Generates receipt with `LockService` |
| **getChatMessages / send** | ✅ | ✅ | ✅ | ✅ | Verified against batch enrollment |
| **publishAnnouncement** | ❌ | ✅ | ✅ | ✅ | Broadcasts to batch with notification trigger |
| **getPlacements / updateProfile** | ✅ | ❌ | ✅ | ✅ | Student maintains portfolio & resume |
| **getJobs / apply** | ✅ | ❌ | ✅ | ✅ | Validates placement readiness criteria |
| **createJob / createInternship** | ❌ | ❌ | ❌ | ✅ | Admin post |
| **updateApplication** | ❌ | ❌ | ✅ | ✅ | Admin/Staff recruitment workflow |
| **getTrainerDashboard** | ❌ | ✅ | ❌ | ✅ | Trainer sees only own assigned batches |
| **getAdminDashboard** | ❌ | ❌ | ✅ | ✅ | Academy-wide consolidated operations |
| **createStudent / createBatch** | ❌ | ❌ | ✅ | ✅ | Provisions user, enrollment, and fee record |
| **initializeDatabase / seedDemo** | ❌ | ❌ | ❌ | ✅ | Super Admin execution |

---

## Database Primary Key ID Schemas

Every entity in Google Sheets uses a strictly formatted, permanent alphanumeric primary ID (never spreadsheet row numbers):

| Table | Prefix | Example ID Format | Generator |
|---|---|---|---|
| `USERS` | `USR` | `USR000001` | `generateId('USR', 'USERS')` with `ScriptLock` |
| `STUDENTS` | `STD` | `STD000001` | Sequential with Admission No correlation |
| `TRAINERS` | `TRN` | `TRN000001` | Permanent faculty identifier |
| `STAFF` | `STA` | `STA000001` | Staff personnel identifier |
| `COURSES` | `CRS` | `CRS000001` | Course curriculum catalog |
| `BATCHES` | `BAT` | `BAT000001` | Academic cohort identifier |
| `MODULES` | `MOD` | `MOD000001` | Course module chapter |
| `LESSONS` | `LES` | `LES000001` | Granular lecture item |
| `CLASSES` | `CLS` | `CLS000001` | Live or scheduled class session |
| `ASSESSMENTS` | `ASM` | `ASM000001` | Quiz or test paper |
| `QUESTIONS` | `QST` | `QST000001` | Reusable question item |
| `ASSIGNMENTS` | `ASG` | `ASG000001` | Practical project deliverable |
| `FEES` | `FEE` | `FEE000001` | Student fee master record |
| `PAYMENTS` | `PAY` | `PAY000001` | Cleared financial transaction |
| `RECEIPTS` | `REC` | `REC000001` | Official payment receipt (`MSA-RCP-...`) |
| `APPLICATIONS` | `APP` | `APP000001` | Placement job application |
| `SESSIONS` | `SES` | `SES000001` | Cryptographic token session |
