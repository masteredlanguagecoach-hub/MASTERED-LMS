// ============================================================
// Config.gs — Global configuration constants
// Mastered Skill Academy LMS
// ============================================================

const CONFIG = {
  // Replace with your actual Google Spreadsheet ID after creating it
  SPREADSHEET_ID: 'YOUR_SPREADSHEET_ID_HERE',

  // Replace with your Google Drive folder ID for file uploads
  DRIVE_FOLDER_ID: 'YOUR_DRIVE_FOLDER_ID_HERE',

  // Session configuration
  SESSION_EXPIRY_HOURS: 24,
  SESSION_TOKEN_LENGTH: 64,

  // Security
  SALT_LENGTH: 32,
  HASH_ITERATIONS: 10000,

  // File upload limits
  MAX_FILE_SIZE_MB: 25,
  ALLOWED_FILE_TYPES: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'mp4', 'zip'],

  // Pagination
  DEFAULT_PAGE_SIZE: 50,

  // Cache TTL (seconds)
  CACHE_TTL_SHORT: 300,    // 5 minutes
  CACHE_TTL_MEDIUM: 1800,  // 30 minutes
  CACHE_TTL_LONG: 3600,    // 1 hour

  // Business rules (overridden by SETTINGS sheet if present)
  MIN_ATTENDANCE_PERCENT: 75,
  ASSESSMENT_PASS_PERCENT: 60,
  PLACEMENT_MIN_ATTENDANCE: 75,
  PLACEMENT_MIN_ASSESSMENTS: 70,

  // ID prefixes
  ID_PREFIXES: {
    USER:         'USR',
    STUDENT:      'STD',
    STAFF:        'STA',
    TRAINER:      'TRN',
    COURSE:       'CRS',
    BATCH:        'BAT',
    MODULE:       'MOD',
    LESSON:       'LES',
    CLASS:        'CLS',
    ASSESSMENT:   'ASM',
    QUESTION:     'QST',
    ASSIGNMENT:   'ASG',
    SUBMISSION:   'SUB',
    FEE:          'FEE',
    INSTALLMENT:  'INS',
    PAYMENT:      'PAY',
    RECEIPT:      'REC',
    ANNOUNCEMENT: 'ANN',
    MESSAGE:      'MSG',
    NOTIFICATION: 'NTF',
    JOB:          'JOB',
    INTERNSHIP:   'INT',
    APPLICATION:  'APP',
    PLACEMENT:    'PLC',
    SESSION:      'SES',
    LOG:          'LOG',
    INTERVIEW:    'INTV',
    PLACEMENT_HISTORY: 'PSH',
    FEE_HISTORY:  'FCH'
  },

  // Sheet names
  SHEETS: {
    USERS:                'USERS',
    STUDENTS:             'STUDENTS',
    STAFF:                'STAFF',
    TRAINERS:             'TRAINERS',
    COURSES:              'COURSES',
    BATCHES:              'BATCHES',
    BATCH_STUDENTS:       'BATCH_STUDENTS',
    MODULES:              'MODULES',
    LESSONS:              'LESSONS',
    BATCH_MODULES:        'BATCH_MODULES',
    CLASSES:              'CLASSES',
    CLASS_ATTENDANCE:     'CLASS_ATTENDANCE',
    STUDENT_PROGRESS:     'STUDENT_PROGRESS',
    ASSESSMENTS:          'ASSESSMENTS',
    QUESTIONS:            'QUESTIONS',
    ASSESSMENT_QUESTIONS: 'ASSESSMENT_QUESTIONS',
    STUDENT_ASSESSMENTS:  'STUDENT_ASSESSMENTS',
    STUDENT_ANSWERS:      'STUDENT_ANSWERS',
    ASSIGNMENTS:          'ASSIGNMENTS',
    ASSIGNMENT_SUBMISSIONS: 'ASSIGNMENT_SUBMISSIONS',
    FEES:                 'FEES',
    FEE_INSTALLMENTS:     'FEE_INSTALLMENTS',
    PAYMENTS:             'PAYMENTS',
    RECEIPTS:             'RECEIPTS',
    ANNOUNCEMENTS:        'ANNOUNCEMENTS',
    CHAT_MESSAGES:        'CHAT_MESSAGES',
    NOTIFICATIONS:        'NOTIFICATIONS',
    PLACEMENT_PROFILES:   'PLACEMENT_PROFILES',
    PLACEMENT_STATUS_HISTORY: 'PLACEMENT_STATUS_HISTORY',
    INTERVIEWS:           'INTERVIEWS',
    FEE_CHANGE_HISTORY:   'FEE_CHANGE_HISTORY',
    JOBS:                 'JOBS',
    INTERNSHIPS:          'INTERNSHIPS',
    APPLICATIONS:         'APPLICATIONS',
    PLACEMENT_ACTIVITIES: 'PLACEMENT_ACTIVITIES',
    SESSIONS:             'SESSIONS',
    AUDIT_LOG:            'AUDIT_LOG',
    SETTINGS:             'SETTINGS'
  },

  // Roles
  ROLES: {
    ADMIN:   'ADMIN',
    TRAINER: 'TRAINER',
    STUDENT: 'STUDENT',
    STAFF:   'STAFF'
  },

  // Statuses
  STATUS: {
    ACTIVE:   'ACTIVE',
    INACTIVE: 'INACTIVE',
    ARCHIVED: 'ARCHIVED'
  },

  // Placement Candidates & Workflow Statuses
  PLACEMENT_STATUS: {
    NOT_READY:          'NOT_READY',
    NEAR_COMPLETION:    'NEAR_COMPLETION',
    ELIGIBLE:           'ELIGIBLE',
    INTERVIEW_ASSIGNED: 'INTERVIEW_ASSIGNED',
    INTERVIEWED:        'INTERVIEWED',
    SHORTLISTED:        'SHORTLISTED',
    SELECTED:           'SELECTED',
    OFFER_RECEIVED:     'OFFER_RECEIVED',
    PLACED:             'PLACED',
    NOT_SELECTED:       'NOT_SELECTED',
    ON_HOLD:            'ON_HOLD',
    WITHDRAWN:          'WITHDRAWN'
  },

  // Assessment Types
  ASSESSMENT_TYPES: {
    TOPIC_TEST:           'Topic Test',
    PRESENTATION:         'Presentation',
    TOPIC_MOCK_INTERVIEW: 'Topic Mock Interview',
    TOPIC_ATTENDANCE:     'Topic Attendance'
  },

  // Interview Statuses & Results
  INTERVIEW_STATUS: {
    ASSIGNED:   'ASSIGNED',
    SCHEDULED:  'SCHEDULED',
    COMPLETED:  'COMPLETED',
    CANCELLED:  'CANCELLED',
    NO_SHOW:    'NO_SHOW'
  },

  INTERVIEW_RESULT: {
    PENDING:  'PENDING',
    SELECTED: 'SELECTED',
    REJECTED: 'REJECTED',
    WAITING:  'WAITING',
    OFFERED:  'OFFERED'
  }
};

/**
 * Load a setting from the SETTINGS sheet, falling back to CONFIG defaults.
 */
function getSetting(key) {
  try {
    const cache = CacheService.getScriptCache();
    const cacheKey = 'SETTING_' + key;
    const cached = cache.get(cacheKey);
    if (cached !== null) return cached;

    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sheet = ss.getSheetByName(CONFIG.SHEETS.SETTINGS);
    if (!sheet) return null;

    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === key) {
        const value = String(data[i][1]);
        cache.put(cacheKey, value, CONFIG.CACHE_TTL_MEDIUM);
        return value;
      }
    }
    return null;
  } catch (e) {
    Logger.log('getSetting error: ' + e.message);
    return null;
  }
}

/**
 * Get a numeric setting with fallback.
 */
function getNumericSetting(key, fallback) {
  const val = getSetting(key);
  return val !== null ? parseFloat(val) : fallback;
}
