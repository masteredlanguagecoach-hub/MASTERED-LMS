# MASTERED SKILL ACADEMY LMS — TESTING CHECKLIST

This checklist covers end-to-end verification of all modules, security controls, and responsive UI layouts.

---

## 1. Authentication & Security Testing
- [x] **Multi-identifier Login:** Verify login works with Admission Number (`STD000001`), Email (`student@masteredskill.academy`), or Mobile Number (`9000000003`).
- [x] **Salted Password Hashing:** Verify `USERS` sheet stores `PASSWORD_HASH` and `SALT`, and never plaintext passwords.
- [x] **Session Expiry & Invalidation:** Verify logging out marks `IS_ACTIVE: false` in `SESSIONS`.
- [x] **Server-side Authorization:** Verify calling `getStudentDashboard` with a student token cannot return another student's ID.
- [x] **Role Access Restriction:** Verify student accounts are blocked from accessing `/admin/*` and `/trainer/*` routes.
- [x] **Trainer Scope Guard:** Verify trainer can only mark attendance and view students for their assigned `BATCH_ID`.

---

## 2. Student Portal Testing
- [x] **Dashboard Overview:**
  - [x] Student admission number, course, and batch display correctly.
  - [x] Progress rings and progress bars render based on completed lessons.
  - [x] Today's live classes show Google Meet button.
  - [x] Pending tasks and fee summary cards render accurately.
- [x] **Sequential Learning (Module & Lesson System):**
  - [x] Subsequent lessons remain locked until required prerequisite lessons are completed.
  - [x] Marking lesson as completed updates `STUDENT_PROGRESS` and recalculates module percentage.
  - [x] Embedded video, downloadable PDF links, and notes display correctly.
- [x] **Attendance Tracking:**
  - [x] Dynamic calculation of attendance percentage (`Present / Total Classes`).
  - [x] Module-wise breakdown and status badges (`PRESENT`, `ABSENT`, `LATE`, `EXCUSED`).
  - [x] Warning indicator when attendance drops below the configurable 75% threshold.
- [x] **Assessments & Submissions:**
  - [x] MCQ test interface records student selected answers.
  - [x] Automatic grading calculates score, pass/fail status, and creates records in `STUDENT_ASSESSMENTS`.
- [x] **Assignments:**
  - [x] Students can submit project URLs and Google Drive links.
  - [x] Shows trainer evaluation, score awarded, and review comments.
- [x] **Fees & Installments:**
  - [x] Displays total course fee, paid amount, and pending balance.
  - [x] Installment due dates and official receipt records.
- [x] **Batch Chat & Announcements:**
  - [x] Real-time messaging tab with sender role indicators.
  - [x] Official faculty announcements tab with priority badges.
- [x] **Placements & Jobs:**
  - [x] Circular placement readiness score dynamically computed from criteria.
  - [x] Job and internship catalog with one-click application submission modal.
  - [x] Application history tracking (`APPLIED` → `INTERVIEW_SCHEDULED` → `OFFER_RECEIVED`).

---

## 3. Trainer & Admin Portals Testing
- [x] **Trainer Dashboard:** Session schedules, quick attendance launcher, pending review queue.
- [x] **Trainer Attendance Registry:** Batch student roster with quick `Present`, `Late`, `Absent`, `Excused` toggles and remarks.
- [x] **Trainer Assignment Grading:** Grade submission modal with marks scoring and feedback submission.
- [x] **Admin Operations Dashboard:** Full academy KPIs, fee collection health, and active cohorts.
- [x] **Admin Student Admissions:** Provision new students with automatic admission number generation and password hashing.
- [x] **Admin Curriculum & Batches:** Course and batch creation with trainer allocation.
- [x] **Admin Fee Collection:** Record payments with transaction references and issue unique receipts.
- [x] **Admin Database Settings:** One-click execution of `initializeDatabase()` and `seedDemoData()`.

---

## 4. Responsive UI & Layout Testing
- [x] **Desktop (≥ 1024px):** Fixed navy sidebar, top header, multi-column card grids.
- [x] **Tablet (768px - 1023px):** Collapsible sidebar with overlay backdrop, responsive 2-column cards.
- [x] **Mobile (< 768px):** Header hamburger toggle, fixed bottom navigation bar (`Home`, `Modules`, `Chat`, `Placements`, `Profile`), touch-friendly action buttons.
