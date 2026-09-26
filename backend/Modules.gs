// ============================================================
// Modules.gs — Module and lesson progress handlers
// Mastered Skill Academy LMS
// ============================================================

function handleGetModules(params) {
  try {
    const { user } = requireAuth(params, null);
    let courseId = params.courseId;

    if (user.ROLE === CONFIG.ROLES.STUDENT) {
      const student = findByField(CONFIG.SHEETS.STUDENTS, 'USER_ID', user.USER_ID);
      if (!student) return errorResponse('Student not found', 'NOT_FOUND');
      courseId = student.COURSE_ID;
    }

    if (!courseId) return errorResponse('courseId required', 'MISSING_FIELD');

    const modules = getAllFromSheet(CONFIG.SHEETS.MODULES)
      .filter(m => m.COURSE_ID === courseId && m.STATUS === 'ACTIVE')
      .sort((a, b) => parseInt(a.SEQUENCE) - parseInt(b.SEQUENCE));

    // For students, add progress data
    if (user.ROLE === CONFIG.ROLES.STUDENT) {
      const student = findByField(CONFIG.SHEETS.STUDENTS, 'USER_ID', user.USER_ID);
      const progress = findAllByField(CONFIG.SHEETS.STUDENT_PROGRESS, 'STUDENT_ID', student.STUDENT_ID);
      const allLessons = getAllFromSheet(CONFIG.SHEETS.LESSONS);

      return successResponse(modules.map(mod => {
        const modLessons = allLessons.filter(l => l.MODULE_ID === mod.MODULE_ID && l.STATUS === 'ACTIVE');
        const completed = modLessons.filter(l =>
          progress.some(p => p.LESSON_ID === l.LESSON_ID && p.STATUS === 'COMPLETED')
        );
        const progressPct = modLessons.length > 0
          ? Math.round((completed.length / modLessons.length) * 100) : 0;
        const isLocked = isModuleLocked(mod, modules, progress, allLessons, student.STUDENT_ID);
        return {
          ...mod,
          totalLessons: modLessons.length,
          completedLessons: completed.length,
          progressPercent: progressPct,
          isLocked,
          status: progressPct === 100 ? 'COMPLETED' : progressPct > 0 ? 'IN_PROGRESS' : 'NOT_STARTED'
        };
      }));
    }

    return successResponse(modules);
  } catch (e) {
    return errorResponse(e.message, 'GET_MODULES_ERROR');
  }
}

function isModuleLocked(module, allModules, progress, allLessons, studentId) {
  if (parseInt(module.SEQUENCE) <= 1) return false;
  const prevModule = allModules.find(m => parseInt(m.SEQUENCE) === parseInt(module.SEQUENCE) - 1);
  if (!prevModule) return false;
  const prevLessons = allLessons.filter(l => l.MODULE_ID === prevModule.MODULE_ID && l.IS_REQUIRED === 'true');
  return prevLessons.some(l => !progress.some(p => p.LESSON_ID === l.LESSON_ID && p.STATUS === 'COMPLETED'));
}

function handleGetModuleDetails(params) {
  try {
    const { user } = requireAuth(params, null);
    validateRequired(params, ['moduleId']);

    const module_ = findByField(CONFIG.SHEETS.MODULES, 'MODULE_ID', params.moduleId);
    if (!module_) return errorResponse('Module not found', 'NOT_FOUND');

    const lessons = getAllFromSheet(CONFIG.SHEETS.LESSONS)
      .filter(l => l.MODULE_ID === params.moduleId && l.STATUS === 'ACTIVE')
      .sort((a, b) => parseInt(a.SEQUENCE) - parseInt(b.SEQUENCE));

    if (user.ROLE === CONFIG.ROLES.STUDENT) {
      const student = findByField(CONFIG.SHEETS.STUDENTS, 'USER_ID', user.USER_ID);
      const progress = findAllByField(CONFIG.SHEETS.STUDENT_PROGRESS, 'STUDENT_ID', student.STUDENT_ID);

      const enrichedLessons = lessons.map((lesson, idx) => {
        const lessonProgress = progress.find(p => p.LESSON_ID === lesson.LESSON_ID);
        const isLocked = isLessonLocked(lesson, lessons, progress, idx);
        return {
          ...lesson,
          isCompleted: lessonProgress ? lessonProgress.STATUS === 'COMPLETED' : false,
          isLocked,
          startedAt: lessonProgress ? lessonProgress.STARTED_AT : '',
          completedAt: lessonProgress ? lessonProgress.COMPLETED_AT : ''
        };
      });

      return successResponse({ module: module_, lessons: enrichedLessons });
    }

    return successResponse({ module: module_, lessons });
  } catch (e) {
    return errorResponse(e.message, 'GET_MODULE_DETAILS_ERROR');
  }
}

function isLessonLocked(lesson, allLessons, progress, idx) {
  if (idx === 0) return false;
  const prevLesson = allLessons[idx - 1];
  if (!prevLesson) return false;
  if (prevLesson.IS_REQUIRED !== 'true') return false;
  return !progress.some(p => p.LESSON_ID === prevLesson.LESSON_ID && p.STATUS === 'COMPLETED');
}

function handleGetLesson(params) {
  try {
    const { user } = requireAuth(params, null);
    validateRequired(params, ['lessonId']);

    const lesson = findByField(CONFIG.SHEETS.LESSONS, 'LESSON_ID', params.lessonId);
    if (!lesson) return errorResponse('Lesson not found', 'NOT_FOUND');

    if (user.ROLE === CONFIG.ROLES.STUDENT) {
      const student = findByField(CONFIG.SHEETS.STUDENTS, 'USER_ID', user.USER_ID);
      const progress = findByField(CONFIG.SHEETS.STUDENT_PROGRESS, 'LESSON_ID', params.lessonId);

      // Mark as started if not already
      if (!progress) {
        const progressId = generateId('PRG', CONFIG.SHEETS.STUDENT_PROGRESS);
        appendRow(CONFIG.SHEETS.STUDENT_PROGRESS, {
          PROGRESS_ID: progressId, STUDENT_ID: student.STUDENT_ID,
          COURSE_ID: '', MODULE_ID: lesson.MODULE_ID, LESSON_ID: params.lessonId,
          STATUS: 'IN_PROGRESS', STARTED_AT: now(), COMPLETED_AT: '',
          SCORE: '', TIME_SPENT_MINUTES: '', CREATED_AT: now(), UPDATED_AT: now()
        });
      }
    }

    return successResponse(lesson);
  } catch (e) {
    return errorResponse(e.message, 'GET_LESSON_ERROR');
  }
}

function handleCompleteLesson(params) {
  try {
    const { user } = requireAuth(params, [CONFIG.ROLES.STUDENT]);
    validateRequired(params, ['lessonId']);

    const student = findByField(CONFIG.SHEETS.STUDENTS, 'USER_ID', user.USER_ID);
    if (!student) return errorResponse('Student not found', 'NOT_FOUND');

    const lesson = findByField(CONFIG.SHEETS.LESSONS, 'LESSON_ID', params.lessonId);
    if (!lesson) return errorResponse('Lesson not found', 'NOT_FOUND');

    const module_ = findByField(CONFIG.SHEETS.MODULES, 'MODULE_ID', lesson.MODULE_ID);
    if (!module_) return errorResponse('Module not found', 'NOT_FOUND');

    // Check if lesson is locked
    const allLessons = getAllFromSheet(CONFIG.SHEETS.LESSONS)
      .filter(l => l.MODULE_ID === lesson.MODULE_ID && l.STATUS === 'ACTIVE')
      .sort((a, b) => parseInt(a.SEQUENCE) - parseInt(b.SEQUENCE));
    const progress = findAllByField(CONFIG.SHEETS.STUDENT_PROGRESS, 'STUDENT_ID', student.STUDENT_ID);
    const idx = allLessons.findIndex(l => l.LESSON_ID === params.lessonId);
    if (isLessonLocked(lesson, allLessons, progress, idx)) {
      return errorResponse('Lesson is locked. Complete previous required lessons first.', 'LESSON_LOCKED');
    }

    // Update or create progress
    const existing = progress.find(p => p.LESSON_ID === params.lessonId);
    if (existing) {
      updateRow(CONFIG.SHEETS.STUDENT_PROGRESS, 'PROGRESS_ID', existing.PROGRESS_ID, {
        STATUS: 'COMPLETED', COMPLETED_AT: now(),
        TIME_SPENT_MINUTES: params.timeSpentMinutes || '',
        UPDATED_AT: now()
      });
    } else {
      const progressId = generateId('PRG', CONFIG.SHEETS.STUDENT_PROGRESS);
      appendRow(CONFIG.SHEETS.STUDENT_PROGRESS, {
        PROGRESS_ID: progressId, STUDENT_ID: student.STUDENT_ID,
        COURSE_ID: module_.COURSE_ID, MODULE_ID: lesson.MODULE_ID, LESSON_ID: params.lessonId,
        STATUS: 'COMPLETED', STARTED_AT: now(), COMPLETED_AT: now(),
        SCORE: '', TIME_SPENT_MINUTES: params.timeSpentMinutes || '',
        CREATED_AT: now(), UPDATED_AT: now()
      });
    }

    // Check module completion
    const updatedProgress = findAllByField(CONFIG.SHEETS.STUDENT_PROGRESS, 'STUDENT_ID', student.STUDENT_ID);
    const requiredLessons = allLessons.filter(l => l.IS_REQUIRED === 'true');
    const moduleComplete = requiredLessons.every(l =>
      updatedProgress.some(p => p.LESSON_ID === l.LESSON_ID && p.STATUS === 'COMPLETED')
    );

    return successResponse({
      lessonCompleted: true,
      moduleCompleted: moduleComplete,
      nextLesson: idx < allLessons.length - 1 ? allLessons[idx + 1] : null
    }, 'Lesson completed successfully');
  } catch (e) {
    return errorResponse(e.message, 'COMPLETE_LESSON_ERROR');
  }
}

function handleCreateModule(params) {
  try {
    const { user } = requireAuth(params, [CONFIG.ROLES.ADMIN]);
    validateRequired(params, ['courseId', 'title', 'sequence']);
    const moduleId = generateId(CONFIG.ID_PREFIXES.MODULE, CONFIG.SHEETS.MODULES);
    appendRow(CONFIG.SHEETS.MODULES, {
      MODULE_ID: moduleId, COURSE_ID: params.courseId, TITLE: clean(params.title),
      DESCRIPTION: params.description || '', SEQUENCE: params.sequence,
      DURATION_HOURS: params.durationHours || '', STATUS: 'ACTIVE',
      CREATED_AT: now(), UPDATED_AT: now()
    });
    return successResponse({ moduleId }, 'Module created');
  } catch (e) {
    return errorResponse(e.message, 'CREATE_MODULE_ERROR');
  }
}

function handleCreateLesson(params) {
  try {
    const { user } = requireAuth(params, [CONFIG.ROLES.ADMIN]);
    validateRequired(params, ['moduleId', 'title', 'sequence']);
    const lessonId = generateId(CONFIG.ID_PREFIXES.LESSON, CONFIG.SHEETS.LESSONS);
    appendRow(CONFIG.SHEETS.LESSONS, {
      LESSON_ID: lessonId, MODULE_ID: params.moduleId, TITLE: clean(params.title),
      DESCRIPTION: params.description || '', CONTENT: params.content || '',
      VIDEO_URL: params.videoUrl || '', PDF_URL: params.pdfUrl || '',
      AUDIO_URL: params.audioUrl || '', RESOURCE_URL: params.resourceUrl || '',
      SEQUENCE: params.sequence, IS_REQUIRED: params.isRequired === 'false' ? 'false' : 'true',
      STATUS: 'ACTIVE', CREATED_AT: now(), UPDATED_AT: now()
    });
    return successResponse({ lessonId }, 'Lesson created');
  } catch (e) {
    return errorResponse(e.message, 'CREATE_LESSON_ERROR');
  }
}
