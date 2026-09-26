// ============================================================
// Database.gs — Database initialization and schema
// Mastered Skill Academy LMS
// ============================================================

/**
 * Initialize all Google Sheets with correct headers.
 * Run this once after creating the spreadsheet.
 */
function initializeDatabase() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const schemas = getDatabaseSchemas();

  schemas.forEach(schema => {
    let sheet = ss.getSheetByName(schema.name);
    if (!sheet) {
      sheet = ss.insertSheet(schema.name);
      Logger.log('Created sheet: ' + schema.name);
    }
    // Set headers on row 1 if sheet is empty or missing headers
    const existing = sheet.getLastRow() > 0 ? sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0] : [];
    if (!existing[0] || existing[0] !== schema.headers[0]) {
      sheet.getRange(1, 1, 1, schema.headers.length).setValues([schema.headers]);
      // Style header row
      const headerRange = sheet.getRange(1, 1, 1, schema.headers.length);
      headerRange.setBackground('#1a3a5c');
      headerRange.setFontColor('#ffffff');
      headerRange.setFontWeight('bold');
      sheet.setFrozenRows(1);
      Logger.log('Headers set for: ' + schema.name);
    }
  });

  // Initialize SETTINGS with defaults
  initializeSettings(ss);

  Logger.log('Database initialization complete!');
  return 'Database initialized successfully';
}

/**
 * Initialize SETTINGS sheet with default values.
 */
function initializeSettings(ss) {
  const sheet = ss.getSheetByName(CONFIG.SHEETS.SETTINGS);
  if (!sheet) return;

  const defaultSettings = [
    ['KEY', 'VALUE', 'DESCRIPTION', 'UPDATED_AT'],
    ['MIN_ATTENDANCE_PERCENT', '75', 'Minimum attendance percentage for placement eligibility', now()],
    ['ASSESSMENT_PASS_PERCENT', '60', 'Minimum percentage to pass an assessment', now()],
    ['PLACEMENT_MIN_ATTENDANCE', '75', 'Minimum attendance for placement readiness', now()],
    ['PLACEMENT_MIN_ASSESSMENTS', '70', 'Minimum assessment completion for placement readiness', now()],
    ['SESSION_EXPIRY_HOURS', '24', 'Session expiry in hours', now()],
    ['MAX_FILE_SIZE_MB', '25', 'Maximum upload file size in MB', now()],
    ['ALLOWED_FILE_TYPES', 'pdf,doc,docx,jpg,jpeg,png,mp4,zip', 'Comma-separated allowed file types', now()],
    ['LATE_THRESHOLD_MINUTES', '15', 'Minutes after class start to mark as LATE', now()],
    ['PLACEMENT_RESUME_REQUIRED', 'true', 'Resume required for placement eligibility', now()],
    ['PLACEMENT_MOCK_REQUIRED', 'true', 'Mock interview required for placement eligibility', now()]
  ];

  if (sheet.getLastRow() < 2) {
    sheet.getRange(1, 1, defaultSettings.length, defaultSettings[0].length)
      .setValues(defaultSettings);
  }
}

/**
 * Return all sheet schemas with their column headers.
 */
function getDatabaseSchemas() {
  return [
    {
      name: CONFIG.SHEETS.USERS,
      headers: ['USER_ID','ADMISSION_NUMBER','EMAIL','MOBILE','PASSWORD_HASH','SALT',
                 'ROLE','STATUS','FULL_NAME','PROFILE_IMAGE_URL','EMAIL_VERIFIED',
                 'LAST_LOGIN','CREATED_AT','UPDATED_AT']
    },
    {
      name: CONFIG.SHEETS.STUDENTS,
      headers: ['STUDENT_ID','USER_ID','ADMISSION_NUMBER','FULL_NAME','EMAIL','MOBILE',
                 'DATE_OF_BIRTH','GENDER','ADDRESS','CITY','STATE','PIN_CODE',
                 'GUARDIAN_NAME','GUARDIAN_MOBILE','PROFILE_IMAGE_URL',
                 'COURSE_ID','BATCH_ID','ENROLLMENT_DATE','STATUS',
                 'CREATED_AT','UPDATED_AT']
    },
    {
      name: CONFIG.SHEETS.STAFF,
      headers: ['STAFF_ID','USER_ID','FULL_NAME','EMAIL','MOBILE','DESIGNATION',
                 'DEPARTMENT','STATUS','CREATED_AT','UPDATED_AT']
    },
    {
      name: CONFIG.SHEETS.TRAINERS,
      headers: ['TRAINER_ID','USER_ID','FULL_NAME','EMAIL','MOBILE','SPECIALIZATION',
                 'QUALIFICATION','EXPERIENCE_YEARS','BIO','PROFILE_IMAGE_URL',
                 'STATUS','CREATED_AT','UPDATED_AT']
    },
    {
      name: CONFIG.SHEETS.COURSES,
      headers: ['COURSE_ID','TITLE','SHORT_CODE','DESCRIPTION','DURATION_WEEKS',
                 'DURATION_HOURS','LEVEL','THUMBNAIL_URL','STATUS',
                 'CREATED_BY','CREATED_AT','UPDATED_AT']
    },
    {
      name: CONFIG.SHEETS.BATCHES,
      headers: ['BATCH_ID','BATCH_NAME','COURSE_ID','TRAINER_ID','START_DATE',
                 'END_DATE','SCHEDULE','TIMING','VENUE','MODE','MAX_STUDENTS',
                 'STATUS','CREATED_AT','UPDATED_AT']
    },
    {
      name: CONFIG.SHEETS.BATCH_STUDENTS,
      headers: ['BS_ID','BATCH_ID','STUDENT_ID','ENROLLMENT_DATE','STATUS',
                 'CREATED_AT','UPDATED_AT']
    },
    {
      name: CONFIG.SHEETS.MODULES,
      headers: ['MODULE_ID','COURSE_ID','TITLE','DESCRIPTION','SEQUENCE',
                 'DURATION_HOURS','STATUS','CREATED_AT','UPDATED_AT']
    },
    {
      name: CONFIG.SHEETS.LESSONS,
      headers: ['LESSON_ID','MODULE_ID','TITLE','DESCRIPTION','CONTENT',
                 'VIDEO_URL','PDF_URL','AUDIO_URL','RESOURCE_URL',
                 'SEQUENCE','IS_REQUIRED','STATUS','CREATED_AT','UPDATED_AT']
    },
    {
      name: CONFIG.SHEETS.BATCH_MODULES,
      headers: ['BM_ID','BATCH_ID','MODULE_ID','SEQUENCE','IS_UNLOCKED',
                 'UNLOCK_DATE','STATUS','CREATED_AT','UPDATED_AT']
    },
    {
      name: CONFIG.SHEETS.CLASSES,
      headers: ['CLASS_ID','BATCH_ID','MODULE_ID','LESSON_ID','TRAINER_ID',
                 'CLASS_DATE','START_TIME','END_TIME','TITLE','DESCRIPTION',
                 'MEETING_LINK','RECORDING_URL','STATUS','CREATED_AT','UPDATED_AT']
    },
    {
      name: CONFIG.SHEETS.CLASS_ATTENDANCE,
      headers: ['ATTENDANCE_ID','CLASS_ID','BATCH_ID','STUDENT_ID',
                 'STATUS','MARKED_AT','MARKED_BY','REMARKS','CREATED_AT','UPDATED_AT']
    },
    {
      name: CONFIG.SHEETS.STUDENT_PROGRESS,
      headers: ['PROGRESS_ID','STUDENT_ID','COURSE_ID','MODULE_ID','LESSON_ID',
                 'STATUS','STARTED_AT','COMPLETED_AT','SCORE',
                 'TIME_SPENT_MINUTES','CREATED_AT','UPDATED_AT']
    },
    {
      name: CONFIG.SHEETS.ASSESSMENTS,
      headers: ['ASSESSMENT_ID','BATCH_ID','MODULE_ID','TITLE','DESCRIPTION',
                 'TYPE','TOTAL_MARKS','PASS_MARKS','DURATION_MINUTES',
                 'MAX_ATTEMPTS','START_DATE','DUE_DATE','STATUS',
                 'CREATED_BY','CREATED_AT','UPDATED_AT']
    },
    {
      name: CONFIG.SHEETS.QUESTIONS,
      headers: ['QUESTION_ID','QUESTION_TEXT','TYPE','OPTIONS','CORRECT_ANSWER',
                 'MARKS','EXPLANATION','CREATED_AT','UPDATED_AT']
    },
    {
      name: CONFIG.SHEETS.ASSESSMENT_QUESTIONS,
      headers: ['AQ_ID','ASSESSMENT_ID','QUESTION_ID','SEQUENCE','MARKS',
                 'CREATED_AT']
    },
    {
      name: CONFIG.SHEETS.STUDENT_ASSESSMENTS,
      headers: ['SA_ID','STUDENT_ID','ASSESSMENT_ID','ATTEMPT_NUMBER',
                 'SCORE','TOTAL_MARKS','PERCENTAGE','STATUS',
                 'STARTED_AT','SUBMITTED_AT','GRADED_BY','GRADED_AT',
                 'FEEDBACK','CREATED_AT','UPDATED_AT']
    },
    {
      name: CONFIG.SHEETS.STUDENT_ANSWERS,
      headers: ['ANSWER_ID','SA_ID','QUESTION_ID','STUDENT_ANSWER',
                 'IS_CORRECT','MARKS_AWARDED','CREATED_AT']
    },
    {
      name: CONFIG.SHEETS.ASSIGNMENTS,
      headers: ['ASSIGNMENT_ID','BATCH_ID','MODULE_ID','TRAINER_ID','TITLE',
                 'DESCRIPTION','INSTRUCTIONS','RESOURCE_URL','MAX_MARKS',
                 'DUE_DATE','SUBMISSION_TYPE','STATUS','CREATED_AT','UPDATED_AT']
    },
    {
      name: CONFIG.SHEETS.ASSIGNMENT_SUBMISSIONS,
      headers: ['SUBMISSION_ID','ASSIGNMENT_ID','STUDENT_ID','SUBMISSION_TEXT',
                 'FILE_URL','FILE_NAME','SUBMITTED_AT','STATUS','MARKS_AWARDED',
                 'FEEDBACK','REVIEWED_BY','REVIEWED_AT','CREATED_AT','UPDATED_AT']
    },
    {
      name: CONFIG.SHEETS.FEES,
      headers: ['FEE_ID','STUDENT_ID','BATCH_ID','COURSE_ID','TOTAL_AMOUNT',
                 'PAID_AMOUNT','PENDING_AMOUNT','DISCOUNT_AMOUNT','DISCOUNT_REASON',
                 'STATUS','CREATED_AT','UPDATED_AT']
    },
    {
      name: CONFIG.SHEETS.FEE_INSTALLMENTS,
      headers: ['INSTALLMENT_ID','FEE_ID','STUDENT_ID','INSTALLMENT_NUMBER',
                 'AMOUNT','DUE_DATE','PAID_DATE','STATUS','REMARKS',
                 'CREATED_AT','UPDATED_AT']
    },
    {
      name: CONFIG.SHEETS.PAYMENTS,
      headers: ['PAYMENT_ID','FEE_ID','INSTALLMENT_ID','STUDENT_ID',
                 'AMOUNT','PAYMENT_DATE','PAYMENT_MODE','TRANSACTION_ID',
                 'COLLECTED_BY','STATUS','REMARKS','CREATED_AT','UPDATED_AT']
    },
    {
      name: CONFIG.SHEETS.RECEIPTS,
      headers: ['RECEIPT_ID','PAYMENT_ID','STUDENT_ID','RECEIPT_NUMBER',
                 'AMOUNT','ISSUED_DATE','FILE_URL','CREATED_AT']
    },
    {
      name: CONFIG.SHEETS.ANNOUNCEMENTS,
      headers: ['ANNOUNCEMENT_ID','BATCH_ID','TITLE','CONTENT','TYPE',
                 'PRIORITY','PUBLISHED_BY','PUBLISHED_AT','EXPIRES_AT',
                 'STATUS','CREATED_AT','UPDATED_AT']
    },
    {
      name: CONFIG.SHEETS.CHAT_MESSAGES,
      headers: ['MESSAGE_ID','BATCH_ID','SENDER_ID','SENDER_NAME','SENDER_ROLE',
                 'MESSAGE_TEXT','FILE_URL','FILE_NAME','MESSAGE_TYPE',
                 'REPLY_TO','STATUS','CREATED_AT','UPDATED_AT']
    },
    {
      name: CONFIG.SHEETS.NOTIFICATIONS,
      headers: ['NOTIFICATION_ID','USER_ID','TITLE','BODY','TYPE','ENTITY_TYPE',
                 'ENTITY_ID','IS_READ','READ_AT','CREATED_AT']
    },
    {
      name: CONFIG.SHEETS.PLACEMENT_PROFILES,
      headers: ['PLACEMENT_ID','STUDENT_ID','RESUME_URL','RESUME_UPDATED_AT',
                 'LINKEDIN_URL','GITHUB_URL','PORTFOLIO_URL','SKILLS',
                 'MOCK_INTERVIEW_DONE','MOCK_INTERVIEW_DATE','MOCK_SCORE',
                 'PLACEMENT_ELIGIBLE','READINESS_PERCENT','STATUS',
                 'CREATED_AT','UPDATED_AT']
    },
    {
      name: CONFIG.SHEETS.JOBS,
      headers: ['JOB_ID','TITLE','COMPANY','COMPANY_LOGO_URL','LOCATION',
                 'WORK_MODE','SALARY_MIN','SALARY_MAX','OPENINGS','DESCRIPTION',
                 'RESPONSIBILITIES','REQUIREMENTS','ELIGIBILITY_CRITERIA',
                 'APPLICATION_DEADLINE','STATUS','POSTED_BY','CREATED_AT','UPDATED_AT']
    },
    {
      name: CONFIG.SHEETS.INTERNSHIPS,
      headers: ['INTERNSHIP_ID','TITLE','COMPANY','COMPANY_LOGO_URL','LOCATION',
                 'WORK_MODE','STIPEND','DURATION_MONTHS','OPENINGS','DESCRIPTION',
                 'RESPONSIBILITIES','REQUIREMENTS','ELIGIBILITY_CRITERIA',
                 'APPLICATION_DEADLINE','STATUS','POSTED_BY','CREATED_AT','UPDATED_AT']
    },
    {
      name: CONFIG.SHEETS.APPLICATIONS,
      headers: ['APPLICATION_ID','STUDENT_ID','JOB_ID','INTERNSHIP_ID','TYPE',
                 'RESUME_URL','COVER_LETTER','STATUS','APPLIED_AT',
                 'INTERVIEW_DATE','OFFER_DETAILS','JOINED_DATE',
                 'NOTES','CREATED_AT','UPDATED_AT']
    },
    {
      name: CONFIG.SHEETS.PLACEMENT_ACTIVITIES,
      headers: ['ACTIVITY_ID','STUDENT_ID','TYPE','DESCRIPTION','DATE',
                 'OUTCOME','NOTES','CREATED_AT']
    },
    {
      name: CONFIG.SHEETS.SESSIONS,
      headers: ['SESSION_ID','USER_ID','TOKEN','ROLE','IP_ADDRESS',
                 'USER_AGENT','EXPIRES_AT','IS_ACTIVE','CREATED_AT','UPDATED_AT']
    },
    {
      name: CONFIG.SHEETS.AUDIT_LOG,
      headers: ['LOG_ID','TIMESTAMP','USER_ID','ROLE','ACTION','ENTITY_TYPE',
                 'ENTITY_ID','OLD_VALUE','NEW_VALUE','IP_ADDRESS','USER_AGENT','STATUS']
    },
    {
      name: CONFIG.SHEETS.SETTINGS,
      headers: ['KEY','VALUE','DESCRIPTION','UPDATED_AT']
    }
  ];
}

/**
 * Insert safe demo data for testing.
 * Call this AFTER initializeDatabase().
 */
function seedDemoData() {
  Logger.log('Seeding demo data...');

  // Seed admin user
  const adminSalt = generateSalt();
  const adminHash = hashPassword('Admin@123', adminSalt);
  appendRow(CONFIG.SHEETS.USERS, {
    USER_ID: 'USR000001',
    ADMISSION_NUMBER: 'ADM000001',
    EMAIL: 'admin@masteredskill.academy',
    MOBILE: '9000000001',
    PASSWORD_HASH: adminHash,
    SALT: adminSalt,
    ROLE: 'ADMIN',
    STATUS: 'ACTIVE',
    FULL_NAME: 'Super Admin',
    PROFILE_IMAGE_URL: '',
    EMAIL_VERIFIED: 'true',
    LAST_LOGIN: '',
    CREATED_AT: now(),
    UPDATED_AT: now()
  });

  // Seed trainer
  const trainerSalt = generateSalt();
  const trainerHash = hashPassword('Trainer@123', trainerSalt);
  appendRow(CONFIG.SHEETS.USERS, {
    USER_ID: 'USR000002',
    ADMISSION_NUMBER: 'TRN000001',
    EMAIL: 'trainer@masteredskill.academy',
    MOBILE: '9000000002',
    PASSWORD_HASH: trainerHash,
    SALT: trainerSalt,
    ROLE: 'TRAINER',
    STATUS: 'ACTIVE',
    FULL_NAME: 'Rajesh Kumar',
    PROFILE_IMAGE_URL: '',
    EMAIL_VERIFIED: 'true',
    LAST_LOGIN: '',
    CREATED_AT: now(),
    UPDATED_AT: now()
  });

  appendRow(CONFIG.SHEETS.TRAINERS, {
    TRAINER_ID: 'TRN000001',
    USER_ID: 'USR000002',
    FULL_NAME: 'Rajesh Kumar',
    EMAIL: 'trainer@masteredskill.academy',
    MOBILE: '9000000002',
    SPECIALIZATION: 'Full Stack Development',
    QUALIFICATION: 'B.Tech Computer Science',
    EXPERIENCE_YEARS: '5',
    BIO: 'Experienced full stack developer and trainer.',
    PROFILE_IMAGE_URL: '',
    STATUS: 'ACTIVE',
    CREATED_AT: now(),
    UPDATED_AT: now()
  });

  // Seed student user
  const studentSalt = generateSalt();
  const studentHash = hashPassword('Student@123', studentSalt);
  appendRow(CONFIG.SHEETS.USERS, {
    USER_ID: 'USR000003',
    ADMISSION_NUMBER: 'STD000001',
    EMAIL: 'student@masteredskill.academy',
    MOBILE: '9000000003',
    PASSWORD_HASH: studentHash,
    SALT: studentSalt,
    ROLE: 'STUDENT',
    STATUS: 'ACTIVE',
    FULL_NAME: 'Priya Sharma',
    PROFILE_IMAGE_URL: '',
    EMAIL_VERIFIED: 'true',
    LAST_LOGIN: '',
    CREATED_AT: now(),
    UPDATED_AT: now()
  });

  appendRow(CONFIG.SHEETS.STUDENTS, {
    STUDENT_ID: 'STD000001',
    USER_ID: 'USR000003',
    ADMISSION_NUMBER: 'STD000001',
    FULL_NAME: 'Priya Sharma',
    EMAIL: 'student@masteredskill.academy',
    MOBILE: '9000000003',
    DATE_OF_BIRTH: '2000-05-15',
    GENDER: 'Female',
    ADDRESS: '123 Main Street',
    CITY: 'Hyderabad',
    STATE: 'Telangana',
    PIN_CODE: '500001',
    GUARDIAN_NAME: 'Ravi Sharma',
    GUARDIAN_MOBILE: '9000000099',
    PROFILE_IMAGE_URL: '',
    COURSE_ID: 'CRS000001',
    BATCH_ID: 'BAT000001',
    ENROLLMENT_DATE: '2026-01-01',
    STATUS: 'ACTIVE',
    CREATED_AT: now(),
    UPDATED_AT: now()
  });

  // Seed course
  appendRow(CONFIG.SHEETS.COURSES, {
    COURSE_ID: 'CRS000001',
    TITLE: 'Full Stack Web Development',
    SHORT_CODE: 'FSWD',
    DESCRIPTION: 'Comprehensive full stack web development course covering HTML, CSS, JavaScript, React, Node.js and databases.',
    DURATION_WEEKS: '24',
    DURATION_HOURS: '480',
    LEVEL: 'Beginner to Advanced',
    THUMBNAIL_URL: '',
    STATUS: 'ACTIVE',
    CREATED_BY: 'USR000001',
    CREATED_AT: now(),
    UPDATED_AT: now()
  });

  // Seed batch
  appendRow(CONFIG.SHEETS.BATCHES, {
    BATCH_ID: 'BAT000001',
    BATCH_NAME: 'FSWD - Batch 2026 A',
    COURSE_ID: 'CRS000001',
    TRAINER_ID: 'TRN000001',
    START_DATE: '2026-01-06',
    END_DATE: '2026-06-30',
    SCHEDULE: 'Monday,Wednesday,Friday',
    TIMING: '10:00 AM - 1:00 PM',
    VENUE: 'Online',
    MODE: 'Online',
    MAX_STUDENTS: '30',
    STATUS: 'ACTIVE',
    CREATED_AT: now(),
    UPDATED_AT: now()
  });

  // Batch student enrollment
  appendRow(CONFIG.SHEETS.BATCH_STUDENTS, {
    BS_ID: 'BS000001',
    BATCH_ID: 'BAT000001',
    STUDENT_ID: 'STD000001',
    ENROLLMENT_DATE: '2026-01-01',
    STATUS: 'ACTIVE',
    CREATED_AT: now(),
    UPDATED_AT: now()
  });

  // Seed modules
  const modules = [
    ['MOD000001', 'CRS000001', 'HTML & CSS Fundamentals', 'Learn the building blocks of web pages', 1, 40, 'ACTIVE'],
    ['MOD000002', 'CRS000001', 'JavaScript Essentials', 'Core JavaScript programming concepts', 2, 60, 'ACTIVE'],
    ['MOD000003', 'CRS000001', 'React Frontend Development', 'Build modern UIs with React', 3, 80, 'ACTIVE'],
    ['MOD000004', 'CRS000001', 'Node.js Backend Development', 'Server-side JavaScript with Node.js', 4, 80, 'ACTIVE']
  ];
  modules.forEach(m => appendRow(CONFIG.SHEETS.MODULES, {
    MODULE_ID: m[0], COURSE_ID: m[1], TITLE: m[2], DESCRIPTION: m[3],
    SEQUENCE: m[4], DURATION_HOURS: m[5], STATUS: m[6],
    CREATED_AT: now(), UPDATED_AT: now()
  }));

  // Seed lessons for module 1
  const lessons = [
    ['LES000001', 'MOD000001', 'Introduction to HTML', 'What is HTML?', 1, 'true'],
    ['LES000002', 'MOD000001', 'HTML Tags and Elements', 'Core HTML tags', 2, 'true'],
    ['LES000003', 'MOD000001', 'CSS Basics', 'Styling with CSS', 3, 'true'],
    ['LES000004', 'MOD000001', 'CSS Flexbox and Grid', 'Modern layouts', 4, 'true'],
    ['LES000005', 'MOD000001', 'Responsive Design', 'Mobile-first approach', 5, 'false']
  ];
  lessons.forEach(l => appendRow(CONFIG.SHEETS.LESSONS, {
    LESSON_ID: l[0], MODULE_ID: l[1], TITLE: l[2], DESCRIPTION: l[3],
    CONTENT: '', VIDEO_URL: '', PDF_URL: '', AUDIO_URL: '', RESOURCE_URL: '',
    SEQUENCE: l[4], IS_REQUIRED: l[5], STATUS: 'ACTIVE',
    CREATED_AT: now(), UPDATED_AT: now()
  }));

  // Seed fee
  appendRow(CONFIG.SHEETS.FEES, {
    FEE_ID: 'FEE000001',
    STUDENT_ID: 'STD000001',
    BATCH_ID: 'BAT000001',
    COURSE_ID: 'CRS000001',
    TOTAL_AMOUNT: '45000',
    PAID_AMOUNT: '15000',
    PENDING_AMOUNT: '30000',
    DISCOUNT_AMOUNT: '0',
    DISCOUNT_REASON: '',
    STATUS: 'PARTIAL',
    CREATED_AT: now(),
    UPDATED_AT: now()
  });

  // Fee installments
  appendRow(CONFIG.SHEETS.FEE_INSTALLMENTS, {
    INSTALLMENT_ID: 'INS000001', FEE_ID: 'FEE000001', STUDENT_ID: 'STD000001',
    INSTALLMENT_NUMBER: '1', AMOUNT: '15000', DUE_DATE: '2026-01-01',
    PAID_DATE: '2026-01-01', STATUS: 'PAID', REMARKS: 'Initial payment',
    CREATED_AT: now(), UPDATED_AT: now()
  });
  appendRow(CONFIG.SHEETS.FEE_INSTALLMENTS, {
    INSTALLMENT_ID: 'INS000002', FEE_ID: 'FEE000001', STUDENT_ID: 'STD000001',
    INSTALLMENT_NUMBER: '2', AMOUNT: '15000', DUE_DATE: '2026-03-01',
    PAID_DATE: '', STATUS: 'PENDING', REMARKS: '',
    CREATED_AT: now(), UPDATED_AT: now()
  });
  appendRow(CONFIG.SHEETS.FEE_INSTALLMENTS, {
    INSTALLMENT_ID: 'INS000003', FEE_ID: 'FEE000001', STUDENT_ID: 'STD000001',
    INSTALLMENT_NUMBER: '3', AMOUNT: '15000', DUE_DATE: '2026-05-01',
    PAID_DATE: '', STATUS: 'PENDING', REMARKS: '',
    CREATED_AT: now(), UPDATED_AT: now()
  });

  // Placement profile
  appendRow(CONFIG.SHEETS.PLACEMENT_PROFILES, {
    PLACEMENT_ID: 'PLC000001',
    STUDENT_ID: 'STD000001',
    RESUME_URL: '',
    RESUME_UPDATED_AT: '',
    LINKEDIN_URL: '',
    GITHUB_URL: '',
    PORTFOLIO_URL: '',
    SKILLS: 'HTML,CSS,JavaScript',
    MOCK_INTERVIEW_DONE: 'false',
    MOCK_INTERVIEW_DATE: '',
    MOCK_SCORE: '',
    PLACEMENT_ELIGIBLE: 'false',
    READINESS_PERCENT: '30',
    STATUS: 'ACTIVE',
    CREATED_AT: now(),
    UPDATED_AT: now()
  });

  // Demo announcement
  appendRow(CONFIG.SHEETS.ANNOUNCEMENTS, {
    ANNOUNCEMENT_ID: 'ANN000001',
    BATCH_ID: 'BAT000001',
    TITLE: 'Welcome to Mastered Skill Academy!',
    CONTENT: 'Dear students, welcome to the Full Stack Web Development course. Your learning journey begins today!',
    TYPE: 'ANNOUNCEMENT',
    PRIORITY: 'HIGH',
    PUBLISHED_BY: 'USR000001',
    PUBLISHED_AT: now(),
    EXPIRES_AT: '',
    STATUS: 'ACTIVE',
    CREATED_AT: now(),
    UPDATED_AT: now()
  });

  Logger.log('Demo data seeded successfully!');
  return 'Demo data seeded successfully';
}
