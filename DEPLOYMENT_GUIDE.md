# MASTERED SKILL ACADEMY LMS — DEPLOYMENT & SETUP GUIDE

> **Tagline:** Learn • Grow • Get Placed  
> **Architecture:** Antigravity React Frontend → Google Apps Script API Web App → Google Sheets Database → Google Drive Storage

---

## 1. Overview of Architecture

```
Antigravity React Frontend (TypeScript + Vite)
        ↓  (HTTPS POST with action-based RESTful API)
Google Apps Script Web App (Code.gs, Auth.gs, Database.gs, etc.)
        ↓  (Batch Reads & ScriptLock Writes)
Google Sheets Database (34 Relational Sheets)
        ↓
Google Drive (Uploaded project submissions & resumes)
```

- **Single Source of Truth:** Google Sheets.
- **Frontend Direct Access:** Completely prohibited. Frontend only interacts with the Google Apps Script Web App.
- **Passwords:** Salted with a 32-character cryptographically secure token and hashed using PBKDF2 stretching with 10,000 SHA-256 iterations.
- **Sessions & RBAC:** Tokens stored in `SESSIONS` sheet with configurable expiration. Every API request validates `Token → Session → Active User → Role → Authorization Scope`.

---

## 2. Google Sheets & Apps Script Setup

### Step 2.1: Create Google Spreadsheet
1. Open [Google Sheets](https://sheets.new) and create a new blank spreadsheet.
2. Name it: `Mastered Skill Academy — Production Database`.
3. Copy the **Spreadsheet ID** from the browser URL:
   `https://docs.google.com/spreadsheets/d/`**`1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`**`/edit`

### Step 2.2: Create Google Drive Upload Folder
1. Open [Google Drive](https://drive.google.com) and create a folder named `Mastered Skill Academy Uploads`.
2. Right click the folder → **Share** → ensure "Anyone with the link can view/upload" or authorized service access.
3. Copy the **Drive Folder ID** from the URL.

### Step 2.3: Create Google Apps Script Project
1. In your Google Sheet, click **Extensions** → **Apps Script**.
2. Rename the project to `Mastered Skill Academy Backend API`.
3. For each `.gs` file in `c:\Users\user\Desktop\lms\backend\`:
   - Click the **+** icon beside Files → choose **Script**.
   - Copy and paste the corresponding file code:
     - `Code.gs`
     - `Config.gs`
     - `Database.gs`
     - `Auth.gs`
     - `Utils.gs`
     - `Users.gs`
     - `Students.gs`
     - `Trainers.gs`
     - `Courses.gs`
     - `Batches.gs`
     - `Modules.gs`
     - `Attendance.gs`
     - `Assessments.gs`
     - `Assignments.gs`
     - `Fees.gs`
     - `Chat.gs`
     - `Notifications.gs`
     - `Placements.gs`
     - `Applications.gs`
     - `Reports.gs`
4. Update `appsscript.json` (Project Settings → check "Show appsscript.json manifest in editor"):
   ```json
   {
     "timeZone": "Asia/Kolkata",
     "dependencies": {},
     "exceptionLogging": "STACKDRIVER",
     "runtimeVersion": "V8",
     "webapp": {
       "executeAs": "USER_DEPLOYING",
       "access": "ANYONE_ANONYMOUS"
     }
   }
   ```

### Step 2.4: Configure Config.gs
In `Config.gs`, replace:
```javascript
SPREADSHEET_ID: 'YOUR_SPREADSHEET_ID_HERE',
DRIVE_FOLDER_ID: 'YOUR_DRIVE_FOLDER_ID_HERE',
```
with your actual IDs.

### Step 2.5: Initialize Database & Seed Demo Data
In the Apps Script editor toolbar:
1. Select function **`initializeDatabase`** from the dropdown and click **Run**.
   - Grant permissions when prompted.
   - This creates all 34 sheets with formatted navy-blue header rows, columns, and frozen header rows.
2. Select function **`seedDemoData`** and click **Run**.
   - This populates demo users, course, batch, module breakdown, lesson items, fees, and placement profiles.

### Step 2.6: Deploy Web App
1. Click **Deploy** → **New deployment**.
2. Select type: **Web app**.
3. Description: `Production API v1`.
4. **Execute as:** `Me (your Google account)`.
5. **Who has access:** `Anyone`.
6. Click **Deploy**.
7. Copy the generated **Web App URL**:
   `https://script.google.com/macros/s/AKfycbx.../exec`

---

## 3. Frontend Setup & Run

### Step 3.1: Configure Environment
In `c:\Users\user\Desktop\lms\frontend\.env.local`:
```bash
VITE_GAS_URL=https://script.google.com/macros/s/AKfycbx.../exec
```

### Step 3.2: Run Development Server
```powershell
cd c:\Users\user\Desktop\lms\frontend
npm run dev
```

### Step 3.3: Production Build
```powershell
npm run build
```
The optimized bundle is written to `dist/`.

---

## 4. Default Seed User Accounts

| Role | Admission / Identifier | Email | Password |
|---|---|---|---|
| **Student** | `STD000001` | `student@masteredskill.academy` | `Student@123` |
| **Trainer** | `TRN000001` | `trainer@masteredskill.academy` | `Trainer@123` |
| **Admin** | `ADM000001` | `admin@masteredskill.academy` | `Admin@123` |
