// ============================================================
// Trainers.gs — Trainer portal handlers
// Mastered Skill Academy LMS
// ============================================================

function handleGetTrainerDashboard(params) {
  try {
    const { user } = requireAuth(params, [CONFIG.ROLES.TRAINER]);
    const trainer = findByField(CONFIG.SHEETS.TRAINERS, 'USER_ID', user.USER_ID);
    if (!trainer) return errorResponse('Trainer profile not found', 'NOT_FOUND');

    const batches = findAllByField(CONFIG.SHEETS.BATCHES, 'TRAINER_ID', trainer.TRAINER_ID)
      .filter(b => b.STATUS === 'ACTIVE');

    const batchIds = batches.map(b => b.BATCH_ID);
    const allEnrollments = getAllFromSheet(CONFIG.SHEETS.BATCH_STUDENTS)
      .filter(bs => batchIds.includes(bs.BATCH_ID) && bs.STATUS === 'ACTIVE');
    const totalStudents = new Set(allEnrollments.map(e => e.STUDENT_ID)).size;

    const today = new Date().toISOString().split('T')[0];
    const allClasses = getAllFromSheet(CONFIG.SHEETS.CLASSES)
      .filter(c => batchIds.includes(c.BATCH_ID));
    const todayClasses = allClasses.filter(c => String(c.CLASS_DATE).startsWith(today));

    const pendingReviews = getAllFromSheet(CONFIG.SHEETS.ASSIGNMENT_SUBMISSIONS)
      .filter(s => s.STATUS === 'SUBMITTED');

    const announcements = getAllFromSheet(CONFIG.SHEETS.ANNOUNCEMENTS)
      .filter(a => batchIds.includes(a.BATCH_ID) && a.STATUS === 'ACTIVE')
      .sort((a, b) => new Date(b.CREATED_AT) - new Date(a.CREATED_AT)).slice(0, 5);

    return successResponse({
      trainer: { trainerId: trainer.TRAINER_ID, fullName: trainer.FULL_NAME, specialization: trainer.SPECIALIZATION },
      stats: {
        totalBatches: batches.length, totalStudents, todayClasses: todayClasses.length,
        pendingReviews: pendingReviews.length
      },
      batches, todayClasses, announcements
    });
  } catch (e) {
    return errorResponse(e.message, 'TRAINER_DASHBOARD_ERROR');
  }
}

function handleGetTrainerBatches(params) {
  try {
    const { user } = requireAuth(params, [CONFIG.ROLES.TRAINER]);
    const trainer = findByField(CONFIG.SHEETS.TRAINERS, 'USER_ID', user.USER_ID);
    if (!trainer) return errorResponse('Not found', 'NOT_FOUND');
    const batches = findAllByField(CONFIG.SHEETS.BATCHES, 'TRAINER_ID', trainer.TRAINER_ID);
    return successResponse(batches);
  } catch (e) {
    return errorResponse(e.message);
  }
}

function handleMarkAttendance(params) {
  try {
    const { user } = requireAuth(params, [CONFIG.ROLES.TRAINER, CONFIG.ROLES.ADMIN]);
    validateRequired(params, ['classId', 'attendanceList']);

    const cls = findByField(CONFIG.SHEETS.CLASSES, 'CLASS_ID', params.classId);
    if (!cls) return errorResponse('Class not found', 'NOT_FOUND');

    // Trainer can only mark for their batches
    if (user.ROLE === CONFIG.ROLES.TRAINER) {
      const trainer = findByField(CONFIG.SHEETS.TRAINERS, 'USER_ID', user.USER_ID);
      if (!trainer || cls.TRAINER_ID !== trainer.TRAINER_ID) {
        return errorResponse('Not authorized for this class', 'FORBIDDEN');
      }
    }

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const list = typeof params.attendanceList === 'string'
        ? JSON.parse(params.attendanceList) : params.attendanceList;

      list.forEach(item => {
        // Check if already marked
        const existing = getAllFromSheet(CONFIG.SHEETS.CLASS_ATTENDANCE).find(
          a => a.CLASS_ID === params.classId && a.STUDENT_ID === item.studentId
        );
        if (existing) {
          updateRow(CONFIG.SHEETS.CLASS_ATTENDANCE, 'ATTENDANCE_ID', existing.ATTENDANCE_ID, {
            STATUS: item.status, MARKED_AT: now(), MARKED_BY: user.USER_ID,
            REMARKS: item.remarks || '', UPDATED_AT: now()
          });
        } else {
          const attendanceId = generateId(CONFIG.ID_PREFIXES.CLASS, CONFIG.SHEETS.CLASS_ATTENDANCE);
          appendRow(CONFIG.SHEETS.CLASS_ATTENDANCE, {
            ATTENDANCE_ID: attendanceId, CLASS_ID: params.classId,
            BATCH_ID: cls.BATCH_ID, STUDENT_ID: item.studentId,
            STATUS: item.status, MARKED_AT: now(), MARKED_BY: user.USER_ID,
            REMARKS: item.remarks || '', CREATED_AT: now(), UPDATED_AT: now()
          });
        }
      });
    } finally {
      lock.releaseLock();
    }

    auditLog(user.USER_ID, user.ROLE, 'MARK_ATTENDANCE', 'CLASS', params.classId, '', '', 'SUCCESS');
    return successResponse(null, 'Attendance marked successfully');
  } catch (e) {
    return errorResponse(e.message, 'ATTENDANCE_ERROR');
  }
}

function handleCreateClass(params) {
  try {
    const { user } = requireAuth(params, [CONFIG.ROLES.TRAINER, CONFIG.ROLES.ADMIN]);
    validateRequired(params, ['batchId', 'classDate', 'startTime', 'title']);
    const classId = generateId(CONFIG.ID_PREFIXES.CLASS, CONFIG.SHEETS.CLASSES);
    appendRow(CONFIG.SHEETS.CLASSES, {
      CLASS_ID: classId, BATCH_ID: params.batchId, MODULE_ID: params.moduleId || '',
      LESSON_ID: params.lessonId || '', TRAINER_ID: params.trainerId || '',
      CLASS_DATE: params.classDate, START_TIME: params.startTime, END_TIME: params.endTime || '',
      TITLE: clean(params.title), DESCRIPTION: params.description || '',
      MEETING_LINK: params.meetingLink || '', RECORDING_URL: '',
      STATUS: 'SCHEDULED', CREATED_AT: now(), UPDATED_AT: now()
    });
    return successResponse({ classId }, 'Class created');
  } catch (e) {
    return errorResponse(e.message, 'CREATE_CLASS_ERROR');
  }
}

function handlePublishAnnouncement(params) {
  try {
    const { user } = requireAuth(params, [CONFIG.ROLES.TRAINER, CONFIG.ROLES.ADMIN]);
    validateRequired(params, ['batchId', 'title', 'content']);

    if (user.ROLE === CONFIG.ROLES.TRAINER) {
      const trainer = findByField(CONFIG.SHEETS.TRAINERS, 'USER_ID', user.USER_ID);
      const batch = findByField(CONFIG.SHEETS.BATCHES, 'BATCH_ID', params.batchId);
      if (!trainer || batch.TRAINER_ID !== trainer.TRAINER_ID) {
        return errorResponse('Not authorized for this batch', 'FORBIDDEN');
      }
    }

    const announcementId = generateId(CONFIG.ID_PREFIXES.ANNOUNCEMENT, CONFIG.SHEETS.ANNOUNCEMENTS);
    appendRow(CONFIG.SHEETS.ANNOUNCEMENTS, {
      ANNOUNCEMENT_ID: announcementId, BATCH_ID: params.batchId,
      TITLE: clean(params.title), CONTENT: clean(params.content),
      TYPE: params.type || 'ANNOUNCEMENT', PRIORITY: params.priority || 'NORMAL',
      PUBLISHED_BY: user.USER_ID, PUBLISHED_AT: now(), EXPIRES_AT: params.expiresAt || '',
      STATUS: 'ACTIVE', CREATED_AT: now(), UPDATED_AT: now()
    });

    // Notify batch students
    notifyBatchStudents(params.batchId, params.title, params.content, 'ANNOUNCEMENT', announcementId, user.USER_ID);

    return successResponse({ announcementId }, 'Announcement published');
  } catch (e) {
    return errorResponse(e.message, 'PUBLISH_ANNOUNCEMENT_ERROR');
  }
}

function notifyBatchStudents(batchId, title, body, type, entityId, senderId) {
  try {
    const enrollments = findAllByField(CONFIG.SHEETS.BATCH_STUDENTS, 'BATCH_ID', batchId)
      .filter(bs => bs.STATUS === 'ACTIVE');
    enrollments.forEach(bs => {
      const student = findByField(CONFIG.SHEETS.STUDENTS, 'STUDENT_ID', bs.STUDENT_ID);
      if (student) {
        const notifId = 'NTF' + Date.now() + Math.random().toString(36).substr(2, 5);
        appendRow(CONFIG.SHEETS.NOTIFICATIONS, {
          NOTIFICATION_ID: notifId, USER_ID: student.USER_ID,
          TITLE: title, BODY: body, TYPE: type,
          ENTITY_TYPE: type, ENTITY_ID: entityId,
          IS_READ: 'false', READ_AT: '', CREATED_AT: now()
        });
      }
    });
  } catch (e) {
    Logger.log('notifyBatchStudents error: ' + e.message);
  }
}
