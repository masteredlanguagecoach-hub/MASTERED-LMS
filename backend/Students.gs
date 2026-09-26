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
    validateRequired(params, ['fullName', 'email', 'mobile', 'courseId', 'batchId']);

    // Create user first
    const salt = generateSalt();
    const tempPassword = generateToken(10);
    const hash = hashPassword(tempPassword, salt);
    const userId = generateId(CONFIG.ID_PREFIXES.USER, CONFIG.SHEETS.USERS);
    const admissionNumber = generateId(CONFIG.ID_PREFIXES.STUDENT, CONFIG.SHEETS.STUDENTS);

    appendRow(CONFIG.SHEETS.USERS, {
      USER_ID: userId, ADMISSION_NUMBER: admissionNumber,
      EMAIL: clean(params.email), MOBILE: clean(params.mobile),
      PASSWORD_HASH: hash, SALT: salt, ROLE: 'STUDENT', STATUS: 'ACTIVE',
      FULL_NAME: clean(params.fullName), PROFILE_IMAGE_URL: '',
      EMAIL_VERIFIED: 'false', LAST_LOGIN: '', CREATED_AT: now(), UPDATED_AT: now()
    });

    const studentId = generateId(CONFIG.ID_PREFIXES.STUDENT, CONFIG.SHEETS.STUDENTS);
    appendRow(CONFIG.SHEETS.STUDENTS, {
      STUDENT_ID: studentId, USER_ID: userId, ADMISSION_NUMBER: admissionNumber,
      FULL_NAME: clean(params.fullName), EMAIL: clean(params.email), MOBILE: clean(params.mobile),
      DATE_OF_BIRTH: params.dateOfBirth || '', GENDER: params.gender || '',
      ADDRESS: params.address || '', CITY: params.city || '', STATE: params.state || '',
      PIN_CODE: params.pinCode || '', GUARDIAN_NAME: params.guardianName || '',
      GUARDIAN_MOBILE: params.guardianMobile || '', PROFILE_IMAGE_URL: '',
      COURSE_ID: params.courseId, BATCH_ID: params.batchId,
      ENROLLMENT_DATE: now(), STATUS: 'ACTIVE', CREATED_AT: now(), UPDATED_AT: now()
    });

    // Batch enrollment
    const bsId = generateId('BS', CONFIG.SHEETS.BATCH_STUDENTS);
    appendRow(CONFIG.SHEETS.BATCH_STUDENTS, {
      BS_ID: bsId, BATCH_ID: params.batchId, STUDENT_ID: studentId,
      ENROLLMENT_DATE: now(), STATUS: 'ACTIVE', CREATED_AT: now(), UPDATED_AT: now()
    });

    // Initialize fee record
    if (params.totalFee) {
      const feeId = generateId(CONFIG.ID_PREFIXES.FEE, CONFIG.SHEETS.FEES);
      appendRow(CONFIG.SHEETS.FEES, {
        FEE_ID: feeId, STUDENT_ID: studentId, BATCH_ID: params.batchId,
        COURSE_ID: params.courseId, TOTAL_AMOUNT: params.totalFee,
        PAID_AMOUNT: '0', PENDING_AMOUNT: params.totalFee,
        DISCOUNT_AMOUNT: '0', DISCOUNT_REASON: '', STATUS: 'PENDING',
        CREATED_AT: now(), UPDATED_AT: now()
      });
    }

    auditLog(user.USER_ID, user.ROLE, 'CREATE_STUDENT', 'STUDENT', studentId, '', params.email, 'SUCCESS');
    return successResponse({ studentId, admissionNumber, tempPassword }, 'Student created successfully');
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
