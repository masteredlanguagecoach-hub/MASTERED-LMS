// ============================================================
// Assignments.gs — Assignment and submission handlers
// Mastered Skill Academy LMS
// ============================================================

function handleGetAssignments(params) {
  try {
    const { user } = requireAuth(params, null);
    let batchId = params.batchId;

    if (user.ROLE === CONFIG.ROLES.STUDENT) {
      const student = findByField(CONFIG.SHEETS.STUDENTS, 'USER_ID', user.USER_ID);
      if (!student) return errorResponse('Not found', 'NOT_FOUND');
      batchId = student.BATCH_ID;
    }

    let assignments = batchId
      ? findAllByField(CONFIG.SHEETS.ASSIGNMENTS, 'BATCH_ID', batchId)
      : getAllFromSheet(CONFIG.SHEETS.ASSIGNMENTS);
    assignments = assignments.filter(a => a.STATUS === 'ACTIVE');

    if (user.ROLE === CONFIG.ROLES.STUDENT) {
      const student = findByField(CONFIG.SHEETS.STUDENTS, 'USER_ID', user.USER_ID);
      const submissions = findAllByField(CONFIG.SHEETS.ASSIGNMENT_SUBMISSIONS, 'STUDENT_ID', student.STUDENT_ID);
      assignments = assignments.map(a => {
        const sub = submissions.find(s => s.ASSIGNMENT_ID === a.ASSIGNMENT_ID);
        return {
          ...a,
          submissionStatus: sub ? sub.STATUS : 'PENDING',
          submission: sub || null
        };
      });
    }

    return successResponse(assignments);
  } catch (e) {
    return errorResponse(e.message, 'GET_ASSIGNMENTS_ERROR');
  }
}

function handleSubmitAssignment(params) {
  try {
    const { user } = requireAuth(params, [CONFIG.ROLES.STUDENT]);
    validateRequired(params, ['assignmentId']);

    const student = findByField(CONFIG.SHEETS.STUDENTS, 'USER_ID', user.USER_ID);
    if (!student) return errorResponse('Not found', 'NOT_FOUND');

    const assignment = findByField(CONFIG.SHEETS.ASSIGNMENTS, 'ASSIGNMENT_ID', params.assignmentId);
    if (!assignment) return errorResponse('Assignment not found', 'NOT_FOUND');

    // Check existing submission
    const existing = getAllFromSheet(CONFIG.SHEETS.ASSIGNMENT_SUBMISSIONS).find(
      s => s.ASSIGNMENT_ID === params.assignmentId && s.STUDENT_ID === student.STUDENT_ID
    );

    if (existing && existing.STATUS !== 'REJECTED') {
      return errorResponse('Assignment already submitted', 'ALREADY_SUBMITTED');
    }

    const submissionId = generateId(CONFIG.ID_PREFIXES.SUBMISSION, CONFIG.SHEETS.ASSIGNMENT_SUBMISSIONS);
    appendRow(CONFIG.SHEETS.ASSIGNMENT_SUBMISSIONS, {
      SUBMISSION_ID: submissionId, ASSIGNMENT_ID: params.assignmentId,
      STUDENT_ID: student.STUDENT_ID,
      SUBMISSION_TEXT: params.submissionText || '',
      FILE_URL: params.fileUrl || '', FILE_NAME: params.fileName || '',
      SUBMITTED_AT: now(), STATUS: 'SUBMITTED',
      MARKS_AWARDED: '', FEEDBACK: '', REVIEWED_BY: '', REVIEWED_AT: '',
      CREATED_AT: now(), UPDATED_AT: now()
    });

    return successResponse({ submissionId }, 'Assignment submitted successfully');
  } catch (e) {
    return errorResponse(e.message, 'SUBMIT_ASSIGNMENT_ERROR');
  }
}

function handleReviewAssignment(params) {
  try {
    const { user } = requireAuth(params, [CONFIG.ROLES.TRAINER, CONFIG.ROLES.ADMIN]);
    validateRequired(params, ['submissionId', 'status']);

    const allowed = ['APPROVED', 'REJECTED', 'UNDER_REVIEW'];
    if (!allowed.includes(params.status)) {
      return errorResponse('Invalid status', 'INVALID_STATUS');
    }

    updateRow(CONFIG.SHEETS.ASSIGNMENT_SUBMISSIONS, 'SUBMISSION_ID', params.submissionId, {
      STATUS: params.status, MARKS_AWARDED: params.marksAwarded || '',
      FEEDBACK: params.feedback || '', REVIEWED_BY: user.USER_ID,
      REVIEWED_AT: now(), UPDATED_AT: now()
    });

    return successResponse(null, 'Submission reviewed');
  } catch (e) {
    return errorResponse(e.message, 'REVIEW_ASSIGNMENT_ERROR');
  }
}

function handleCreateAssignment(params) {
  try {
    const { user } = requireAuth(params, [CONFIG.ROLES.TRAINER, CONFIG.ROLES.ADMIN]);
    validateRequired(params, ['batchId', 'title', 'dueDate']);
    const assignmentId = generateId(CONFIG.ID_PREFIXES.ASSIGNMENT, CONFIG.SHEETS.ASSIGNMENTS);
    appendRow(CONFIG.SHEETS.ASSIGNMENTS, {
      ASSIGNMENT_ID: assignmentId, BATCH_ID: params.batchId,
      MODULE_ID: params.moduleId || '', TRAINER_ID: params.trainerId || user.USER_ID,
      TITLE: clean(params.title), DESCRIPTION: params.description || '',
      INSTRUCTIONS: params.instructions || '', RESOURCE_URL: params.resourceUrl || '',
      MAX_MARKS: params.maxMarks || '100', DUE_DATE: params.dueDate,
      SUBMISSION_TYPE: params.submissionType || 'FILE',
      STATUS: 'ACTIVE', CREATED_AT: now(), UPDATED_AT: now()
    });
    return successResponse({ assignmentId }, 'Assignment created');
  } catch (e) {
    return errorResponse(e.message, 'CREATE_ASSIGNMENT_ERROR');
  }
}
