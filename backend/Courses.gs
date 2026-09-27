// ============================================================
// Courses.gs — Course and Batch management
// Mastered Skill Academy LMS
// ============================================================

function handleGetCourses(params) {
  try {
    requireAuth(params, null);
    const courses = getAllFromSheet(CONFIG.SHEETS.COURSES)
      .filter(c => c.STATUS !== 'ARCHIVED');
    return successResponse(courses);
  } catch (e) {
    return errorResponse(e.message, 'GET_COURSES_ERROR');
  }
}

function handleCreateCourse(params) {
  try {
    const { user } = requireAuth(params, [CONFIG.ROLES.ADMIN]);
    validateRequired(params, ['title', 'description']);
    const courseId = generateId(CONFIG.ID_PREFIXES.COURSE, CONFIG.SHEETS.COURSES);
    appendRow(CONFIG.SHEETS.COURSES, {
      COURSE_ID: courseId, TITLE: clean(params.title),
      SHORT_CODE: clean(params.shortCode || ''), DESCRIPTION: clean(params.description),
      DURATION_WEEKS: params.durationWeeks || '', DURATION_HOURS: params.durationHours || '',
      LEVEL: params.level || 'Beginner', THUMBNAIL_URL: params.thumbnailUrl || '',
      DEFAULT_FEE: params.defaultFee || '',
      STATUS: 'ACTIVE', CREATED_BY: user.USER_ID, CREATED_AT: now(), UPDATED_AT: now()
    });
    auditLog(user.USER_ID, user.ROLE, 'CREATE_COURSE', 'COURSE', courseId, '', params.title, 'SUCCESS');
    return successResponse({ courseId }, 'Course created');
  } catch (e) {
    return errorResponse(e.message, 'CREATE_COURSE_ERROR');
  }
}

/**
 * Update course details, including course default fee.
 * CRITICAL: Updating the course default fee here modifies ONLY the COURSES sheet.
 * It NEVER modifies existing students' assigned fees in the FEES sheet.
 */
function handleUpdateCourse(params) {
  try {
    const { user } = requireAuth(params, [CONFIG.ROLES.ADMIN]);
    validateRequired(params, ['courseId']);

    const course = findByField(CONFIG.SHEETS.COURSES, 'COURSE_ID', params.courseId);
    if (!course) return errorResponse('Course not found', 'NOT_FOUND');

    const updates = { UPDATED_AT: now() };
    if (params.title) updates.TITLE = clean(params.title);
    if (params.shortCode) updates.SHORT_CODE = clean(params.shortCode);
    if (params.description) updates.DESCRIPTION = clean(params.description);
    if (params.durationWeeks) updates.DURATION_WEEKS = params.durationWeeks;
    if (params.durationHours) updates.DURATION_HOURS = params.durationHours;
    if (params.level) updates.LEVEL = params.level;
    if (params.defaultFee !== undefined) updates.DEFAULT_FEE = String(params.defaultFee);
    if (params.status) updates.STATUS = params.status;

    updateRow(CONFIG.SHEETS.COURSES, 'COURSE_ID', params.courseId, updates);
    auditLog(user.USER_ID, user.ROLE, 'UPDATE_COURSE', 'COURSE', params.courseId, course, updates, 'SUCCESS');

    return successResponse(null, 'Course updated successfully without altering existing student fees');
  } catch (e) {
    return errorResponse(e.message, 'UPDATE_COURSE_ERROR');
  }
}

function handleGetBatches(params) {
  try {
    const { user } = requireAuth(params, null);
    let batches = getAllFromSheet(CONFIG.SHEETS.BATCHES);
    if (params.courseId) batches = batches.filter(b => b.COURSE_ID === params.courseId);
    if (user.ROLE === CONFIG.ROLES.TRAINER) {
      const trainer = findByField(CONFIG.SHEETS.TRAINERS, 'USER_ID', user.USER_ID);
      if (trainer) batches = batches.filter(b => b.TRAINER_ID === trainer.TRAINER_ID);
    }
    return successResponse(batches);
  } catch (e) {
    return errorResponse(e.message, 'GET_BATCHES_ERROR');
  }
}

function handleCreateBatch(params) {
  try {
    const { user } = requireAuth(params, [CONFIG.ROLES.ADMIN]);
    validateRequired(params, ['batchName', 'courseId', 'trainerId', 'startDate']);
    const batchId = generateId(CONFIG.ID_PREFIXES.BATCH, CONFIG.SHEETS.BATCHES);
    appendRow(CONFIG.SHEETS.BATCHES, {
      BATCH_ID: batchId, BATCH_NAME: clean(params.batchName),
      COURSE_ID: params.courseId, TRAINER_ID: params.trainerId,
      START_DATE: params.startDate, END_DATE: params.endDate || '',
      SCHEDULE: params.schedule || '', TIMING: params.timing || '',
      VENUE: params.venue || '', MODE: params.mode || 'Online',
      MAX_STUDENTS: params.maxStudents || '30',
      STATUS: 'ACTIVE', CREATED_AT: now(), UPDATED_AT: now()
    });
    auditLog(user.USER_ID, user.ROLE, 'CREATE_BATCH', 'BATCH', batchId, '', params.batchName, 'SUCCESS');
    return successResponse({ batchId }, 'Batch created');
  } catch (e) {
    return errorResponse(e.message, 'CREATE_BATCH_ERROR');
  }
}

function handleGetBatchStudents(params) {
  try {
    const { user } = requireAuth(params, [CONFIG.ROLES.ADMIN, CONFIG.ROLES.TRAINER, CONFIG.ROLES.STAFF]);
    validateRequired(params, ['batchId']);

    // Trainers can only access their authorized batches
    if (user.ROLE === CONFIG.ROLES.TRAINER) {
      const trainer = findByField(CONFIG.SHEETS.TRAINERS, 'USER_ID', user.USER_ID);
      const batch = findByField(CONFIG.SHEETS.BATCHES, 'BATCH_ID', params.batchId);
      if (!trainer || !batch || batch.TRAINER_ID !== trainer.TRAINER_ID) {
        return errorResponse('Not authorized for this batch', 'FORBIDDEN');
      }
    }

    const enrollments = findAllByField(CONFIG.SHEETS.BATCH_STUDENTS, 'BATCH_ID', params.batchId)
      .filter(bs => bs.STATUS === 'ACTIVE');
    const students = enrollments.map(bs =>
      findByField(CONFIG.SHEETS.STUDENTS, 'STUDENT_ID', bs.STUDENT_ID)
    ).filter(Boolean);
    return successResponse(students);
  } catch (e) {
    return errorResponse(e.message, 'GET_BATCH_STUDENTS_ERROR');
  }
}
