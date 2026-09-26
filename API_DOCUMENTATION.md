# MASTERED SKILL ACADEMY LMS — API DOCUMENTATION

All requests are dispatched to the Google Apps Script Web App URL via HTTP `POST` (or `GET` for debugging) with `Content-Type: text/plain` to ensure seamless Cross-Origin Resource Sharing (CORS) with Google's redirect architecture.

Every request payload contains `{ "action": "<actionName>", ...params }`. If a session exists, the frontend client includes `"token": "<sessionToken>"`.

---

## 1. Authentication Endpoints

### `login`
Authenticate a student, trainer, staff, or admin.
- **Payload:**
  ```json
  {
    "action": "login",
    "identifier": "student@masteredskill.academy", // or Admission No or Mobile
    "password": "Student@123"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "token": "a1b2c3d4e5...",
      "sessionId": "SES000001",
      "user": {
        "userId": "USR000003",
        "admissionNumber": "STD000001",
        "fullName": "Priya Sharma",
        "email": "student@masteredskill.academy",
        "mobile": "9000000003",
        "role": "STUDENT",
        "profileImageUrl": ""
      }
    },
    "message": "Login successful"
  }
  ```

### `logout`
Invalidates active session and records in `AUDIT_LOG`.
- **Payload:** `{ "action": "logout", "token": "..." }`

### `getCurrentUser`
Derives authenticated user and role-specific profile directly from server session token.
- **Payload:** `{ "action": "getCurrentUser", "token": "..." }`

### `changePassword`
Verifies current password against stored hash/salt, generates new 32-character salt and PBKDF2 hash, and invalidates other sessions.
- **Payload:** `{ "action": "changePassword", "token": "...", "currentPassword": "...", "newPassword": "..." }`

---

## 2. Student Portal Endpoints

### `getStudentDashboard`
Fetches real-time consolidated dashboard metrics for the authenticated student.
- **Response Fields:**
  - `student`: Profile summary and admission number
  - `course`: Enrolled course title and details
  - `batch`: Assigned batch schedule and timing
  - `progress`: Course completion percentage, modules completed count, current active module
  - `attendance`: Calculated attendance percentage from `CLASS_ATTENDANCE`
  - `classes`: Today's live classes with Google Meet links, and upcoming schedule
  - `pendingAssignments` & `pendingAssessments` count
  - `fee`: Total fee, paid amount, pending balance, and payment status
  - `placement`: Placement eligibility boolean and readiness percentage
  - `notifications`: Unread announcements and academy alerts

### `getModules`
Returns sequential modules with progress percentage, lesson completion counts, and prerequisite lock state (`isLocked`).

### `getModuleDetails`
- **Params:** `moduleId`
- Returns module metadata and child lessons in sequence with completion status.

### `getLesson`
- **Params:** `lessonId`
- Returns lecture content, embedded video URL, PDF download links, and resource URLs. Marks lesson as `IN_PROGRESS` if not already begun.

### `completeLesson`
- **Params:** `lessonId`, `timeSpentMinutes`
- Updates lesson progress in `STUDENT_PROGRESS`, recalculates module completion, course completion, and unlocks the next lesson.

### `getAttendance`
Returns overall attendance percentage, module-wise breakdown, session statistics (Present, Absent, Late, Excused), and class history.

### `getAssessments` & `submitAssessment`
- Submits student MCQ answers for server-side evaluation. Calculates score, percentage, pass/fail status, and creates records in `STUDENT_ASSESSMENTS` and `STUDENT_ANSWERS`.

### `getAssignments` & `submitAssignment`
- Allows uploading project repositories, live demos, and Google Drive links. Shows review feedback and awarded marks.

### `getFees`
Returns fee ledger, installment schedule with due dates, payment history, and official receipt numbers.

---

## 3. Trainer Endpoints

- `getTrainerDashboard`: Summary of active assigned batches, student counts, and pending review submissions.
- `getTrainerBatches`: Batches assigned to the trainer.
- `getBatchStudents`: Student roster for an authorized batch.
- `markAttendance`: Bulk saves attendance for a class session using `LockService`.
- `reviewAssignment`: Grades submissions, awards marks, and attaches trainer feedback.
- `publishAnnouncement`: Publishes notice to batch members and triggers notification entries.

---

## 4. Admin Endpoints

- `getAdminDashboard`: Full academy KPIs (Students, Batches, Attendance, Fees, Placements).
- `createStudent`: Provisions student user, admission ID, salted password, batch enrollment, and fee record.
- `createCourse` & `createBatch`: Academic curriculum and schedule setup.
- `recordPayment`: Records fee payments with `LockService` and issues unique receipt numbers (`MSA-RCP-...`).
- `createJob` & `createInternship`: Posts recruitment opportunities with eligibility criteria.
- `updateApplication`: Advances candidates across application stages (`APPLIED` → `SHORTLISTED` → `INTERVIEW_SCHEDULED` → `SELECTED` → `JOINED`).
- `getReports`: Generates structured audit tables (`attendance`, `fees`, `assessment`, `placements`).
- `initializeDatabase`: Generates all 34 database sheets with styled headers.
- `seedDemoData`: Injects safe demo test records.
