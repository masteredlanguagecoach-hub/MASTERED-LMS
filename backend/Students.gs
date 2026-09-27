// ============================================================
// Students.gs — Student data handlers
// Mastered Skill Academy LMS
// ============================================================

function handleGetStudentDashboard(params) {
  try {
    const { user } = requireAuth(params, [CONFIG.ROLES.STUDENT]);
    const student = findByField(CONFIG.SHEETS.STUDENTS, 'USER_ID', user.USER_ID);
    if (!student) return errorResponse('Student profile not found', 'NOT_FOUND');

    // Course and batch
    const course = findByField(CONFIG.SHEETS.COURSES, 'COURSE_ID', student.COURSE_ID);
    const batch = findByField(CONFIG.SHEETS.BATCHES, 'BATCH_ID', student.BATCH_ID);

    // Progress
    const progress = findAllByField(CONFIG.SHEETS.STUDENT_PROGRESS, 'STUDENT_ID', student.STUDENT_ID);
    const completedLessons = progress.filter(p => p.STATUS === 'COMPLETED');
    const modules = getAllFromSheet(CONFIG.SHEETS.MODULES).filter(m => m.COURSE_ID === student.COURSE_ID);
    const allLessons = getAllFromSheet(CONFIG.SHEETS.LESSONS).filter(l =>
      modules.some(m => m.MODULE_ID === l.MODULE_ID)
    );
    const courseProgress = allLessons.length > 0
      ? Math.round((completedLessons.length / allLessons.length) * 100) : 0;

    // Modules completed
    const completedModuleIds = new Set();
    modules.forEach(mod => {
      const modLessons = allLessons.filter(l => l.MODULE_ID === mod.MODULE_ID);
      const modCompleted = modLessons.filter(l => completedLessons.some(c => c.LESSON_ID === l.LESSON_ID));
      if (modLessons.length > 0 && modCompleted.length === modLessons.length) {
        completedModuleIds.add(mod.MODULE_ID);
      }
    });

    // Current module (first incomplete)
    const currentModule = modules.find(m => !completedModuleIds.has(m.MODULE_ID)) || null;

    // Attendance
    const attendance = findAllByField(CONFIG.SHEETS.CLASS_ATTENDANCE, 'STUDENT_ID', student.STUDENT_ID);
    const presentCount = attendance.filter(a => a.STATUS === 'PRESENT' || a.STATUS === 'LATE').length;
    const attendancePercent = attendance.length > 0
      ? Math.round((presentCount / attendance.length) * 100) : 0;

    // Today's classes
    const today = new Date().toISOString().split('T')[0];
    const allClasses = findAllByField(CONFIG.SHEETS.CLASSES, 'BATCH_ID', student.BATCH_ID);
    const todayClasses = allClasses.filter(c => String(c.CLASS_DATE).startsWith(today));
    const upcomingClasses = allClasses.filter(c => String(c.CLASS_DATE) > today).slice(0, 5);

    // Pending assignments
    const assignments = findAllByField(CONFIG.SHEETS.ASSIGNMENTS, 'BATCH_ID', student.BATCH_ID)
      .filter(a => a.STATUS === 'ACTIVE');
    const submissions = findAllByField(CONFIG.SHEETS.ASSIGNMENT_SUBMISSIONS, 'STUDENT_ID', student.STUDENT_ID);
    const pendingAssignments = assignments.filter(a =>
      !submissions.some(s => s.ASSIGNMENT_ID === a.ASSIGNMENT_ID)
    );

    // Pending assessments
    const assessments = findAllByField(CONFIG.SHEETS.ASSESSMENTS, 'BATCH_ID', student.BATCH_ID)
      .filter(a => a.STATUS === 'ACTIVE');
    const studentAssessments = findAllByField(CONFIG.SHEETS.STUDENT_ASSESSMENTS, 'STUDENT_ID', student.STUDENT_ID)
      .filter(sa => sa.STATUS === 'COMPLETED');
    const pendingAssessments = assessments.filter(a =>
      !studentAssessments.some(sa => sa.ASSESSMENT_ID === a.ASSESSMENT_ID)
    );

    // Fees
    const fee = findByField(CONFIG.SHEETS.FEES, 'STUDENT_ID', student.STUDENT_ID);

    // Placement
    const placement = findByField(CONFIG.SHEETS.PLACEMENT_PROFILES, 'STUDENT_ID', student.STUDENT_ID);

    // Notifications
    const notifications = findAllByField(CONFIG.SHEETS.NOTIFICATIONS, 'USER_ID', user.USER_ID)
      .filter(n => String(n.IS_READ).toLowerCase() !== 'true')
      .sort((a, b) => new Date(b.CREATED_AT) - new Date(a.CREATED_AT))
      .slice(0, 5);

    return successResponse({
      student: {
        studentId: student.STUDENT_ID,
        fullName: student.FULL_NAME,
        admissionNumber: student.ADMISSION_NUMBER,
        email: student.EMAIL,
        profileImageUrl: student.PROFILE_IMAGE_URL
      },
      course: course ? { courseId: course.COURSE_ID, title: course.TITLE } : null,
      batch: batch ? { batchId: batch.BATCH_ID, batchName: batch.BATCH_NAME, timing: batch.TIMING } : null,
      progress: {
        courseProgress,
        modulesCompleted: completedModuleIds.size,
        totalModules: modules.length,
        lessonsCompleted: completedLessons.length,
        totalLessons: allLessons.length,
        currentModule: currentModule ? { moduleId: currentModule.MODULE_ID, title: currentModule.TITLE } : null
      },
      attendance: { percent: attendancePercent, total: attendance.length, present: presentCount },
      classes: { today: todayClasses, upcoming: upcomingClasses },
      pendingAssignments: pendingAssignments.length,
      pendingAssessments: pendingAssessments.length,
      fee: fee ? {
        totalAmount: parseFloat(fee.TOTAL_AMOUNT) || 0,
        paidAmount: parseFloat(fee.PAID_AMOUNT) || 0,
        pendingAmount: parseFloat(fee.PENDING_AMOUNT) || 0,
        status: fee.STATUS
      } : null,
      placement: placement ? {
        eligible: String(placement.PLACEMENT_ELIGIBLE).toLowerCase() === 'true',
        readinessPercent: parseFloat(placement.READINESS_PERCENT) || 0
      } : null,
      notifications
    });
  } catch (e) {
    Logger.log('Dashboard error: ' + e.message);
    return errorResponse(e.message, 'DASHBOARD_ERROR');
  }
}

function handleGetStudents(params) {
  try {
    const { user } = requireAuth(params, [CONFIG.ROLES.ADMIN, CONFIG.ROLES.STAFF, CONFIG.ROLES.TRAINER]);
    let students = getAllFromSheet(CONFIG.SHEETS.STUDENTS);
    if (params.batchId) {
      const enrolled = findAllByField(CONFIG.SHEETS.BATCH_STUDENTS, 'BATCH_ID', params.batchId)
        .map(bs => bs.STUDENT_ID);
      students = students.filter(s => enrolled.includes(s.STUDENT_ID));
    }
    if (params.courseId) students = students.filter(s => s.COURSE_ID === params.courseId);
    return successResponse(students);
  } catch (e) {
    return errorResponse(e.message, 'GET_STUDENTS_ERROR');
  }
}

function handleCreateStudent(params) {
  try {
    const { user } = requireAuth(params, [CONFIG.ROLES.ADMIN, CONFIG.ROLES.STAFF]);
    validateRequired(params, ['admissionNumber', 'fullName', 'email', 'mobile', 'courseId', 'batchId']);

    const admissionNum = clean(params.admissionNumber).toUpperCase();
    if (!admissionNum) {
      return errorResponse('Admission Number is mandatory.', 'MISSING_ADMISSION_NUMBER');
    }

    // Admission Number must be unique
    const existingStudent = findByField(CONFIG.SHEETS.STUDENTS, 'ADMISSION_NUMBER', admissionNum);
    const existingUser = findByField(CONFIG.SHEETS.USERS, 'ADMISSION_NUMBER', admissionNum);
    if (existingStudent || existingUser) {
      return errorResponse('Admission Number already exists.', 'DUPLICATE_ADMISSION_NUMBER');
    }

    // Check duplicate email
    const existingEmail = findByField(CONFIG.SHEETS.USERS, 'EMAIL', clean(params.email).toLowerCase());
    if (existingEmail) {
      return errorResponse('Email already exists.', 'DUPLICATE_EMAIL');
    }

    const course = findByField(CONFIG.SHEETS.COURSES, 'COURSE_ID', params.courseId);
    const batch = findByField(CONFIG.SHEETS.BATCHES, 'BATCH_ID', params.batchId);
    if (!course) return errorResponse('Selected course not found.', 'NOT_FOUND');
    if (!batch) return errorResponse('Selected batch not found.', 'NOT_FOUND');

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      // Create user first
      const salt = generateSalt();
      const tempPassword = params.password || generateToken(10);
      const hash = hashPassword(tempPassword, salt);
      const userId = generateId(CONFIG.ID_PREFIXES.USER, CONFIG.SHEETS.USERS);

      appendRow(CONFIG.SHEETS.USERS, {
        USER_ID: userId,
        ADMISSION_NUMBER: admissionNum,
        EMAIL: clean(params.email).toLowerCase(),
        MOBILE: clean(params.mobile),
        PASSWORD_HASH: hash,
        SALT: salt,
        ROLE: 'STUDENT',
        STATUS: params.status || 'ACTIVE',
        FULL_NAME: clean(params.fullName),
        PROFILE_IMAGE_URL: '',
        EMAIL_VERIFIED: 'false',
        LAST_LOGIN: '',
        CREATED_AT: now(),
        UPDATED_AT: now()
      });

      const studentId = generateId(CONFIG.ID_PREFIXES.STUDENT, CONFIG.SHEETS.STUDENTS);
      appendRow(CONFIG.SHEETS.STUDENTS, {
        STUDENT_ID: studentId,
        USER_ID: userId,
        ADMISSION_NUMBER: admissionNum,
        FULL_NAME: clean(params.fullName),
        EMAIL: clean(params.email).toLowerCase(),
        MOBILE: clean(params.mobile),
        DATE_OF_BIRTH: params.dateOfBirth || '',
        GENDER: params.gender || '',
        ADDRESS: params.address || '',
        CITY: params.city || '',
        STATE: params.state || '',
        PIN_CODE: params.pinCode || '',
        GUARDIAN_NAME: params.guardianName || '',
        GUARDIAN_MOBILE: params.guardianMobile || '',
        PROFILE_IMAGE_URL: '',
        COURSE_ID: params.courseId,
        BATCH_ID: params.batchId,
        ENROLLMENT_DATE: params.joiningDate || now().split('T')[0],
        STATUS: params.status || 'ACTIVE',
        CREATED_AT: now(),
        UPDATED_AT: now()
      });

      // Batch enrollment
      const bsId = generateId('BS', CONFIG.SHEETS.BATCH_STUDENTS);
      appendRow(CONFIG.SHEETS.BATCH_STUDENTS, {
        BS_ID: bsId,
        BATCH_ID: params.batchId,
        STUDENT_ID: studentId,
        ENROLLMENT_DATE: params.joiningDate || now().split('T')[0],
        STATUS: 'ACTIVE',
        CREATED_AT: now(),
        UPDATED_AT: now()
      });

      // Initialize student assigned fee (independent of future course fee changes)
      const feeId = generateId(CONFIG.ID_PREFIXES.FEE, CONFIG.SHEETS.FEES);
      const assignedFeeVal = params.assignedFee !== undefined && params.assignedFee !== ''
        ? parseFloat(params.assignedFee)
        : (params.totalFee !== undefined && params.totalFee !== ''
          ? parseFloat(params.totalFee)
          : (course.DEFAULT_FEE ? parseFloat(course.DEFAULT_FEE) : 0));

      const regFeeVal = parseFloat(params.registrationFee) || 0;
      const discountVal = parseFloat(params.discount) || parseFloat(params.discountAmount) || 0;
      const tuitionFeeVal = Math.max(0, assignedFeeVal - regFeeVal);

      appendRow(CONFIG.SHEETS.FEES, {
        FEE_ID: feeId,
        STUDENT_ID: studentId,
        BATCH_ID: params.batchId,
        COURSE_ID: params.courseId,
        TOTAL_AMOUNT: String(assignedFeeVal),
        PAID_AMOUNT: '0',
        PENDING_AMOUNT: String(assignedFeeVal),
        REGISTRATION_FEE: String(regFeeVal),
        TUITION_FEE: String(tuitionFeeVal),
        DISCOUNT_AMOUNT: String(discountVal),
        DISCOUNT_REASON: clean(params.discountReason || ''),
        OTHER_CHARGES: '0',
        NOTES: clean(params.notes || ''),
        STATUS: 'PENDING',
        CREATED_AT: now(),
        UPDATED_AT: now()
      });

      // Initialize Placement Profile
      const placementId = generateId(CONFIG.ID_PREFIXES.PLACEMENT, CONFIG.SHEETS.PLACEMENT_PROFILES);
      appendRow(CONFIG.SHEETS.PLACEMENT_PROFILES, {
        PLACEMENT_ID: placementId,
        STUDENT_ID: studentId,
        RESUME_URL: '',
        RESUME_UPDATED_AT: '',
        LINKEDIN_URL: '',
        GITHUB_URL: '',
        PORTFOLIO_URL: '',
        SKILLS: '',
        MOCK_INTERVIEW_DONE: 'false',
        MOCK_INTERVIEW_DATE: '',
        MOCK_SCORE: '',
        PLACEMENT_ELIGIBLE: 'false',
        READINESS_PERCENT: '0',
        STATUS: CONFIG.PLACEMENT_STATUS.NOT_READY,
        CREATED_AT: now(),
        UPDATED_AT: now()
      });

      auditLog(user.USER_ID, user.ROLE, 'CREATE_STUDENT', 'STUDENT', studentId, '', admissionNum, 'SUCCESS');
      return successResponse({ studentId, admissionNumber: admissionNum, tempPassword }, 'Student created successfully');
    } finally {
      lock.releaseLock();
    }
  } catch (e) {
    return errorResponse(e.message, 'CREATE_STUDENT_ERROR');
  }
}

function handleUpdateStudent(params) {
  try {
    const { user } = requireAuth(params, [CONFIG.ROLES.ADMIN, CONFIG.ROLES.STAFF, CONFIG.ROLES.STUDENT]);
    validateRequired(params, ['studentId']);

    // Students can only update their own profile
    if (user.ROLE === CONFIG.ROLES.STUDENT) {
      const student = findByField(CONFIG.SHEETS.STUDENTS, 'USER_ID', user.USER_ID);
      if (!student || student.STUDENT_ID !== params.studentId) {
        return errorResponse('Access denied', 'FORBIDDEN');
      }
    }

    const updates = { UPDATED_AT: now() };
    const allowed = ['FULL_NAME','MOBILE','DATE_OF_BIRTH','GENDER','ADDRESS','CITY','STATE','PIN_CODE',
                     'GUARDIAN_NAME','GUARDIAN_MOBILE','PROFILE_IMAGE_URL'];
    allowed.forEach(field => {
      const key = field.toLowerCase().replace(/_([a-z])/g, (_, c) => c.toUpperCase());
      if (params[key] !== undefined) updates[field] = params[key];
    });

    updateRow(CONFIG.SHEETS.STUDENTS, 'STUDENT_ID', params.studentId, updates);
    auditLog(user.USER_ID, user.ROLE, 'UPDATE_STUDENT', 'STUDENT', params.studentId, '', updates, 'SUCCESS');
    return successResponse(null, 'Student updated');
  } catch (e) {
    return errorResponse(e.message, 'UPDATE_STUDENT_ERROR');
  }
}

function handleGetStudentProfile(params) {
  try {
    const { user } = requireAuth(params, null);
    let studentId = params.studentId;

    if (user.ROLE === CONFIG.ROLES.STUDENT) {
      const student = findByField(CONFIG.SHEETS.STUDENTS, 'USER_ID', user.USER_ID);
      if (!student) return errorResponse('Profile not found', 'NOT_FOUND');
      // Students can only view their own
      studentId = student.STUDENT_ID;
    }

    const student = findByField(CONFIG.SHEETS.STUDENTS, 'STUDENT_ID', studentId);
    if (!student) return errorResponse('Student not found', 'NOT_FOUND');
    const course = findByField(CONFIG.SHEETS.COURSES, 'COURSE_ID', student.COURSE_ID);
    const batch = findByField(CONFIG.SHEETS.BATCHES, 'BATCH_ID', student.BATCH_ID);
    return successResponse({ student, course, batch });
  } catch (e) {
    return errorResponse(e.message, 'GET_PROFILE_ERROR');
  }
}

/**
 * Validate bulk student import data (XLSX / CSV rows).
 * Expected headers / fields per row:
 * Admission Number, Full Name, Mobile, Email, Course, Batch, Joining Date, Assigned Fee, Registration Fee, Discount, Status
 */
function handleValidateStudentImport(params) {
  try {
    const { user } = requireAuth(params, [CONFIG.ROLES.ADMIN, CONFIG.ROLES.STAFF]);
    const rows = Array.isArray(params.rows) ? params.rows : (params.rows ? JSON.parse(params.rows) : []);

    if (!rows || rows.length === 0) {
      return errorResponse('No rows provided for import', 'EMPTY_IMPORT');
    }

    const existingStudents = getAllFromSheet(CONFIG.SHEETS.STUDENTS);
    const existingUsers = getAllFromSheet(CONFIG.SHEETS.USERS);
    const existingCourses = getAllFromSheet(CONFIG.SHEETS.COURSES);
    const existingBatches = getAllFromSheet(CONFIG.SHEETS.BATCHES);

    const existingAdmissionNumbers = new Set([
      ...existingStudents.map(s => String(s.ADMISSION_NUMBER || '').trim().toUpperCase()),
      ...existingUsers.map(u => String(u.ADMISSION_NUMBER || '').trim().toUpperCase())
    ]);

    const existingEmails = new Set(
      existingUsers.map(u => String(u.EMAIL || '').trim().toLowerCase())
    );

    const seenBatchAdmissionNumbers = new Set();
    const validatedRows = [];
    let validCount = 0;
    let duplicateCount = 0;
    let invalidCount = 0;

    rows.forEach((row, idx) => {
      // Normalize row keys (support multiple variations of column titles)
      const admNo = clean(row['Admission Number'] || row['ADMISSION_NUMBER'] || row['admissionNumber'] || row['AdmissionNo'] || '').toUpperCase();
      const fullName = clean(row['Full Name'] || row['FULL_NAME'] || row['fullName'] || row['Name'] || '');
      const mobile = clean(row['Mobile'] || row['MOBILE'] || row['mobile'] || row['Phone'] || '');
      const email = clean(row['Email'] || row['EMAIL'] || row['email'] || '').toLowerCase();
      const courseInput = clean(row['Course'] || row['COURSE'] || row['course'] || row['Course ID'] || row['COURSE_ID'] || '');
      const batchInput = clean(row['Batch'] || row['BATCH'] || row['batch'] || row['Batch ID'] || row['BATCH_ID'] || '');
      const joiningDate = clean(row['Joining Date'] || row['JOINING_DATE'] || row['joiningDate'] || row['Enrollment Date'] || now().split('T')[0]);
      const assignedFee = row['Assigned Fee'] || row['ASSIGNED_FEE'] || row['assignedFee'] || row['Total Fee'] || '';
      const regFee = row['Registration Fee'] || row['REGISTRATION_FEE'] || row['registrationFee'] || '0';
      const discount = row['Discount'] || row['DISCOUNT'] || row['discount'] || '0';
      const status = clean(row['Status'] || row['STATUS'] || row['status'] || 'ACTIVE').toUpperCase() || 'ACTIVE';

      const errors = [];
      let isDuplicate = false;

      // 1. Validate Admission Number
      if (!admNo) {
        errors.push('Admission Number is required');
      } else if (existingAdmissionNumbers.has(admNo)) {
        errors.push('Admission Number already exists in database');
        isDuplicate = true;
      } else if (seenBatchAdmissionNumbers.has(admNo)) {
        errors.push('Duplicate Admission Number within import file');
        isDuplicate = true;
      } else {
        seenBatchAdmissionNumbers.add(admNo);
      }

      // 2. Validate Full Name
      if (!fullName) errors.push('Full Name is required');

      // 3. Validate Email
      if (!email) {
        errors.push('Email is required');
      } else if (existingEmails.has(email)) {
        errors.push('Email already registered: ' + email);
      }

      // 4. Validate Course
      const matchedCourse = existingCourses.find(c =>
        c.COURSE_ID === courseInput ||
        String(c.SHORT_CODE || '').toUpperCase() === courseInput.toUpperCase() ||
        String(c.TITLE || '').toLowerCase() === courseInput.toLowerCase()
      );
      if (!matchedCourse) {
        errors.push('Invalid Course: "' + courseInput + '" not found');
      }

      // 5. Validate Batch
      const matchedBatch = existingBatches.find(b =>
        b.BATCH_ID === batchInput ||
        String(b.BATCH_NAME || '').toLowerCase() === batchInput.toLowerCase()
      );
      if (!matchedBatch) {
        errors.push('Invalid Batch: "' + batchInput + '" not found');
      }

      // 6. Validate Fees
      let finalAssignedFee = assignedFee !== '' ? parseFloat(assignedFee) : (matchedCourse && matchedCourse.DEFAULT_FEE ? parseFloat(matchedCourse.DEFAULT_FEE) : 0);
      if (isNaN(finalAssignedFee) || finalAssignedFee < 0) {
        errors.push('Assigned fee must be a valid number');
      }
      const finalRegFee = parseFloat(regFee) || 0;
      const finalDiscount = parseFloat(discount) || 0;

      const isValid = errors.length === 0;
      if (isDuplicate) duplicateCount++;
      else if (!isValid) invalidCount++;
      else validCount++;

      validatedRows.push({
        rowIndex: idx + 1,
        admissionNumber: admNo,
        fullName,
        mobile,
        email,
        courseId: matchedCourse ? matchedCourse.COURSE_ID : courseInput,
        courseTitle: matchedCourse ? matchedCourse.TITLE : courseInput,
        batchId: matchedBatch ? matchedBatch.BATCH_ID : batchInput,
        batchName: matchedBatch ? matchedBatch.BATCH_NAME : batchInput,
        joiningDate,
        assignedFee: finalAssignedFee,
        registrationFee: finalRegFee,
        discount: finalDiscount,
        status,
        isValid,
        isDuplicate,
        errors
      });
    });

    return successResponse({
      totalRows: rows.length,
      validRows: validCount,
      invalidRows: invalidCount,
      duplicateRows: duplicateCount,
      preview: validatedRows
    });
  } catch (e) {
    return errorResponse(e.message, 'VALIDATE_IMPORT_ERROR');
  }
}

/**
 * Confirm bulk student import after preview approval.
 */
function handleConfirmStudentImport(params) {
  try {
    const { user } = requireAuth(params, [CONFIG.ROLES.ADMIN, CONFIG.ROLES.STAFF]);
    const validRows = Array.isArray(params.validRows) ? params.validRows : (params.validRows ? JSON.parse(params.validRows) : []);

    if (!validRows || validRows.length === 0) {
      return errorResponse('No valid rows provided to confirm import', 'EMPTY_IMPORT');
    }

    const lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      let importedCount = 0;
      const importedStudents = [];

      validRows.forEach(row => {
        // Re-check admission number duplicate in case of concurrency
        const existingStd = findByField(CONFIG.SHEETS.STUDENTS, 'ADMISSION_NUMBER', row.admissionNumber);
        if (existingStd) return;

        const salt = generateSalt();
        const tempPassword = generateToken(10);
        const hash = hashPassword(tempPassword, salt);
        const userId = generateId(CONFIG.ID_PREFIXES.USER, CONFIG.SHEETS.USERS);

        appendRow(CONFIG.SHEETS.USERS, {
          USER_ID: userId,
          ADMISSION_NUMBER: row.admissionNumber,
          EMAIL: clean(row.email),
          MOBILE: clean(row.mobile),
          PASSWORD_HASH: hash,
          SALT: salt,
          ROLE: 'STUDENT',
          STATUS: row.status || 'ACTIVE',
          FULL_NAME: clean(row.fullName),
          PROFILE_IMAGE_URL: '',
          EMAIL_VERIFIED: 'false',
          LAST_LOGIN: '',
          CREATED_AT: now(),
          UPDATED_AT: now()
        });

        const studentId = generateId(CONFIG.ID_PREFIXES.STUDENT, CONFIG.SHEETS.STUDENTS);
        appendRow(CONFIG.SHEETS.STUDENTS, {
          STUDENT_ID: studentId,
          USER_ID: userId,
          ADMISSION_NUMBER: row.admissionNumber,
          FULL_NAME: clean(row.fullName),
          EMAIL: clean(row.email),
          MOBILE: clean(row.mobile),
          DATE_OF_BIRTH: '',
          GENDER: '',
          ADDRESS: '',
          CITY: '',
          STATE: '',
          PIN_CODE: '',
          GUARDIAN_NAME: '',
          GUARDIAN_MOBILE: '',
          PROFILE_IMAGE_URL: '',
          COURSE_ID: row.courseId,
          BATCH_ID: row.batchId,
          ENROLLMENT_DATE: row.joiningDate || now().split('T')[0],
          STATUS: row.status || 'ACTIVE',
          CREATED_AT: now(),
          UPDATED_AT: now()
        });

        const bsId = generateId('BS', CONFIG.SHEETS.BATCH_STUDENTS);
        appendRow(CONFIG.SHEETS.BATCH_STUDENTS, {
          BS_ID: bsId,
          BATCH_ID: row.batchId,
          STUDENT_ID: studentId,
          ENROLLMENT_DATE: row.joiningDate || now().split('T')[0],
          STATUS: 'ACTIVE',
          CREATED_AT: now(),
          UPDATED_AT: now()
        });

        // Initialize Fee
        const feeId = generateId(CONFIG.ID_PREFIXES.FEE, CONFIG.SHEETS.FEES);
        const totalFee = String(row.assignedFee || 0);
        appendRow(CONFIG.SHEETS.FEES, {
          FEE_ID: feeId,
          STUDENT_ID: studentId,
          BATCH_ID: row.batchId,
          COURSE_ID: row.courseId,
          TOTAL_AMOUNT: totalFee,
          PAID_AMOUNT: '0',
          PENDING_AMOUNT: totalFee,
          REGISTRATION_FEE: String(row.registrationFee || 0),
          TUITION_FEE: String(Math.max(0, (row.assignedFee || 0) - (row.registrationFee || 0))),
          DISCOUNT_AMOUNT: String(row.discount || 0),
          DISCOUNT_REASON: '',
          OTHER_CHARGES: '0',
          NOTES: 'Bulk imported student',
          STATUS: 'PENDING',
          CREATED_AT: now(),
          UPDATED_AT: now()
        });

        // Initialize Placement Profile
        const placementId = generateId(CONFIG.ID_PREFIXES.PLACEMENT, CONFIG.SHEETS.PLACEMENT_PROFILES);
        appendRow(CONFIG.SHEETS.PLACEMENT_PROFILES, {
          PLACEMENT_ID: placementId,
          STUDENT_ID: studentId,
          RESUME_URL: '',
          RESUME_UPDATED_AT: '',
          LINKEDIN_URL: '',
          GITHUB_URL: '',
          PORTFOLIO_URL: '',
          SKILLS: '',
          MOCK_INTERVIEW_DONE: 'false',
          MOCK_INTERVIEW_DATE: '',
          MOCK_SCORE: '',
          PLACEMENT_ELIGIBLE: 'false',
          READINESS_PERCENT: '0',
          STATUS: CONFIG.PLACEMENT_STATUS.NOT_READY,
          CREATED_AT: now(),
          UPDATED_AT: now()
        });

        importedCount++;
        importedStudents.push({ studentId, admissionNumber: row.admissionNumber, fullName: row.fullName });
      });

      auditLog(user.USER_ID, user.ROLE, 'IMPORT_STUDENTS', 'STUDENT', 'BATCH', '', String(importedCount) + ' students imported', 'SUCCESS');

      return successResponse({
        importedCount,
        students: importedStudents
      }, 'Successfully imported ' + importedCount + ' students');
    } finally {
      lock.releaseLock();
    }
  } catch (e) {
    return errorResponse(e.message, 'CONFIRM_IMPORT_ERROR');
  }
}
