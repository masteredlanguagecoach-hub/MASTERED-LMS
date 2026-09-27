// ============================================================
// Assessments.gs — Assessment and quiz handlers
// Mastered Skill Academy LMS
// ============================================================

function handleGetAssessments(params) {
  try {
    const { user } = requireAuth(params, null);
    let batchId = params.batchId;

    if (user.ROLE === CONFIG.ROLES.STUDENT) {
      const student = findByField(CONFIG.SHEETS.STUDENTS, 'USER_ID', user.USER_ID);
      if (!student) return errorResponse('Not found', 'NOT_FOUND');
      batchId = student.BATCH_ID;
    }

    let assessments = batchId
      ? findAllByField(CONFIG.SHEETS.ASSESSMENTS, 'BATCH_ID', batchId)
      : getAllFromSheet(CONFIG.SHEETS.ASSESSMENTS);
    assessments = assessments.filter(a => a.STATUS === 'ACTIVE');

    if (user.ROLE === CONFIG.ROLES.STUDENT) {
      const student = findByField(CONFIG.SHEETS.STUDENTS, 'USER_ID', user.USER_ID);
      const studentAssessments = findAllByField(CONFIG.SHEETS.STUDENT_ASSESSMENTS, 'STUDENT_ID', student.STUDENT_ID);
      assessments = assessments.map(a => {
        const attempt = studentAssessments.find(sa => sa.ASSESSMENT_ID === a.ASSESSMENT_ID);
        return {
          ...a,
          studentStatus: attempt ? attempt.STATUS : 'NOT_STARTED',
          score: attempt ? attempt.SCORE : null,
          percentage: attempt ? attempt.PERCENTAGE : null,
          attemptId: attempt ? attempt.SA_ID : null
        };
      });
    }

    return successResponse(assessments);
  } catch (e) {
    return errorResponse(e.message, 'GET_ASSESSMENTS_ERROR');
  }
}

function handleGetAssessmentDetails(params) {
  try {
    const { user } = requireAuth(params, null);
    validateRequired(params, ['assessmentId']);

    const assessment = findByField(CONFIG.SHEETS.ASSESSMENTS, 'ASSESSMENT_ID', params.assessmentId);
    if (!assessment) return errorResponse('Assessment not found', 'NOT_FOUND');

    // Get questions
    const aqLinks = findAllByField(CONFIG.SHEETS.ASSESSMENT_QUESTIONS, 'ASSESSMENT_ID', params.assessmentId)
      .sort((a, b) => parseInt(a.SEQUENCE) - parseInt(b.SEQUENCE));
    const allQuestions = getAllFromSheet(CONFIG.SHEETS.QUESTIONS);
    const questions = aqLinks.map(aq => {
      const q = allQuestions.find(q => q.QUESTION_ID === aq.QUESTION_ID);
      if (!q) return null;
      // For students, don't send correct answer during active test
      if (user.ROLE === CONFIG.ROLES.STUDENT) {
        const { CORRECT_ANSWER, EXPLANATION, ...safe } = q;
        return { ...safe, aqId: aq.AQ_ID, sequence: aq.SEQUENCE, marks: aq.MARKS };
      }
      return { ...q, aqId: aq.AQ_ID, sequence: aq.SEQUENCE, marks: aq.MARKS };
    }).filter(Boolean);

    return successResponse({ assessment, questions });
  } catch (e) {
    return errorResponse(e.message, 'GET_ASSESSMENT_DETAILS_ERROR');
  }
}

function handleSubmitAssessment(params) {
  try {
    const { user } = requireAuth(params, [CONFIG.ROLES.STUDENT]);
    validateRequired(params, ['assessmentId', 'answers']);

    const student = findByField(CONFIG.SHEETS.STUDENTS, 'USER_ID', user.USER_ID);
    if (!student) return errorResponse('Not found', 'NOT_FOUND');

    const assessment = findByField(CONFIG.SHEETS.ASSESSMENTS, 'ASSESSMENT_ID', params.assessmentId);
    if (!assessment) return errorResponse('Assessment not found', 'NOT_FOUND');

    // Check max attempts
    const prevAttempts = findAllByField(CONFIG.SHEETS.STUDENT_ASSESSMENTS, 'STUDENT_ID', student.STUDENT_ID)
      .filter(sa => sa.ASSESSMENT_ID === params.assessmentId);
    const maxAttempts = parseInt(assessment.MAX_ATTEMPTS) || 1;
    if (prevAttempts.length >= maxAttempts) {
      return errorResponse('Maximum attempts reached', 'MAX_ATTEMPTS');
    }

    const answers = typeof params.answers === 'string'
      ? JSON.parse(params.answers) : params.answers;

    // Get questions with correct answers
    const aqLinks = findAllByField(CONFIG.SHEETS.ASSESSMENT_QUESTIONS, 'ASSESSMENT_ID', params.assessmentId);
    const allQuestions = getAllFromSheet(CONFIG.SHEETS.QUESTIONS);

    let totalScore = 0;
    let maxScore = 0;
    const processedAnswers = [];

    aqLinks.forEach(aq => {
      const q = allQuestions.find(q => q.QUESTION_ID === aq.QUESTION_ID);
      if (!q) return;
      const marks = parseFloat(aq.MARKS) || parseFloat(q.MARKS) || 1;
      maxScore += marks;
      const studentAnswer = answers[aq.QUESTION_ID] || '';
      const isCorrect = String(studentAnswer).trim().toLowerCase() === String(q.CORRECT_ANSWER).trim().toLowerCase();
      const marksAwarded = isCorrect ? marks : 0;
      totalScore += marksAwarded;
      processedAnswers.push({
        questionId: aq.QUESTION_ID, studentAnswer, isCorrect, marksAwarded
      });
    });

    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
    const passPercent = getNumericSetting('ASSESSMENT_PASS_PERCENT', CONFIG.ASSESSMENT_PASS_PERCENT);
    const status = percentage >= passPercent ? 'PASSED' : 'FAILED';

    const saId = generateId('SA', CONFIG.SHEETS.STUDENT_ASSESSMENTS);
    appendRow(CONFIG.SHEETS.STUDENT_ASSESSMENTS, {
      SA_ID: saId, STUDENT_ID: student.STUDENT_ID,
      ASSESSMENT_ID: params.assessmentId,
      ATTEMPT_NUMBER: String(prevAttempts.length + 1),
      SCORE: String(totalScore), TOTAL_MARKS: String(maxScore),
      PERCENTAGE: String(percentage), STATUS: status,
      STARTED_AT: params.startedAt || now(), SUBMITTED_AT: now(),
      GRADED_BY: 'AUTO', GRADED_AT: now(), FEEDBACK: '',
      CREATED_AT: now(), UPDATED_AT: now()
    });

    // Store individual answers
    processedAnswers.forEach(a => {
      const answerId = 'ANS' + Date.now() + Math.random().toString(36).substr(2, 5);
      appendRow(CONFIG.SHEETS.STUDENT_ANSWERS, {
        ANSWER_ID: answerId, SA_ID: saId,
        QUESTION_ID: a.questionId, STUDENT_ANSWER: a.studentAnswer,
        IS_CORRECT: String(a.isCorrect), MARKS_AWARDED: String(a.marksAwarded),
        CREATED_AT: now()
      });
    });

    return successResponse({
      saId, score: totalScore, totalMarks: maxScore,
      percentage, status, passed: status === 'PASSED'
    }, 'Assessment submitted');
  } catch (e) {
    return errorResponse(e.message, 'SUBMIT_ASSESSMENT_ERROR');
  }
}

function handleCreateAssessment(params) {
  try {
    const { user } = requireAuth(params, [CONFIG.ROLES.ADMIN, CONFIG.ROLES.TRAINER]);
    validateRequired(params, ['batchId', 'title', 'type', 'totalMarks']);
    const assessmentId = generateId(CONFIG.ID_PREFIXES.ASSESSMENT, CONFIG.SHEETS.ASSESSMENTS);
    appendRow(CONFIG.SHEETS.ASSESSMENTS, {
      ASSESSMENT_ID: assessmentId, BATCH_ID: params.batchId,
      MODULE_ID: params.moduleId || '', TITLE: clean(params.title),
      DESCRIPTION: params.description || '', TYPE: params.type,
      TOTAL_MARKS: params.totalMarks, PASS_MARKS: params.passMarks || '',
      DURATION_MINUTES: params.durationMinutes || '', MAX_ATTEMPTS: params.maxAttempts || '1',
      START_DATE: params.startDate || '', DUE_DATE: params.dueDate || '',
      STATUS: 'ACTIVE', CREATED_BY: user.USER_ID, CREATED_AT: now(), UPDATED_AT: now()
    });
    return successResponse({ assessmentId }, 'Assessment created');
  } catch (e) {
    return errorResponse(e.message, 'CREATE_ASSESSMENT_ERROR');
  }
}

/**
 * Calculate assessment category from marks and absent flag.
 * Marks out of 10:
 * IF ABSENT: Category = E
 * ELSE IF mark >= 8: Category = A
 * ELSE IF mark >= 6: Category = B
 * ELSE IF mark == 5: Category = C
 * ELSE IF mark == 4: Category = D
 * ELSE: Category = D
 */
function calculateAssessmentCategory(isAbsent, marks) {
  if (isAbsent === true || String(isAbsent).toLowerCase() === 'true') {
    return 'E';
  }
  const m = parseFloat(marks);
  if (isNaN(m)) return '';
  if (m >= 8) return 'A';
  if (m >= 6) return 'B';
  if (m === 5) return 'C';
  if (m === 4) return 'D';
  return 'D';
}

/**
 * Validate if mock interview is allowed for a module.
 * Topic Mock Interview must be available ONLY for:
 * Module 3, Module 4, Module 5 (or if module ALLOW_MOCK_INTERVIEW === 'true').
 */
function validateMockInterviewAllowed(moduleId) {
  if (!moduleId) return false;
  const mod = findByField(CONFIG.SHEETS.MODULES, 'MODULE_ID', moduleId);
  if (!mod) return false;
  if (mod.ALLOW_MOCK_INTERVIEW === 'true' || String(mod.ALLOW_MOCK_INTERVIEW).toLowerCase() === 'true') {
    return true;
  }
  const seq = parseInt(mod.SEQUENCE);
  return seq === 3 || seq === 4 || seq === 5;
}

/**
 * Handler to record or edit an assessment mark for a student.
 * Validates category calculation on backend, absent status, and mock interview rules.
 */
function handleRecordAssessment(params) {
  try {
    const { user } = requireAuth(params, [CONFIG.ROLES.ADMIN, CONFIG.ROLES.TRAINER, CONFIG.ROLES.STAFF]);
    validateRequired(params, ['studentId', 'moduleId', 'assessmentType']);

    const student = findByField(CONFIG.SHEETS.STUDENTS, 'STUDENT_ID', params.studentId);
    if (!student) return errorResponse('Student not found', 'NOT_FOUND');

    const mod = findByField(CONFIG.SHEETS.MODULES, 'MODULE_ID', params.moduleId);
    if (!mod) return errorResponse('Module not found', 'NOT_FOUND');

    // Trainers can only record for their assigned batches
    if (user.ROLE === CONFIG.ROLES.TRAINER) {
      const trainer = findByField(CONFIG.SHEETS.TRAINERS, 'USER_ID', user.USER_ID);
      const batch = findByField(CONFIG.SHEETS.BATCHES, 'BATCH_ID', student.BATCH_ID);
      if (!trainer || !batch || batch.TRAINER_ID !== trainer.TRAINER_ID) {
        return errorResponse('Not authorized to assess students outside your assigned batches', 'FORBIDDEN');
      }
    }

    const validTypes = [
      CONFIG.ASSESSMENT_TYPES.TOPIC_TEST,
      CONFIG.ASSESSMENT_TYPES.PRESENTATION,
      CONFIG.ASSESSMENT_TYPES.TOPIC_MOCK_INTERVIEW,
      CONFIG.ASSESSMENT_TYPES.TOPIC_ATTENDANCE
    ];

    if (!validTypes.includes(params.assessmentType)) {
      return errorResponse('Invalid assessment type. Must be Topic Test, Presentation, Topic Mock Interview, or Topic Attendance.', 'INVALID_TYPE');
    }

    // Rule: Topic Mock Interview allowed ONLY for Module 3, 4, 5 or configured modules
    if (params.assessmentType === CONFIG.ASSESSMENT_TYPES.TOPIC_MOCK_INTERVIEW) {
      if (!validateMockInterviewAllowed(params.moduleId)) {
        return errorResponse('Topic Mock Interview is only allowed for Module 3, 4, 5 or configured modules.', 'MOCK_INTERVIEW_NOT_ALLOWED');
      }
    }

    const isAbsent = params.isAbsent === true || String(params.isAbsent).toLowerCase() === 'true';
    let marks = null;

    if (isAbsent) {
      marks = null;
    } else {
      if (params.marks === undefined || params.marks === null || params.marks === '') {
        return errorResponse('Marks are required when student is not absent', 'MISSING_MARKS');
      }
      const num = parseFloat(params.marks);
      if (isNaN(num) || num < 0 || num > 10) {
        return errorResponse('Assessment marks must be between 0 and 10.', 'INVALID_MARKS');
      }
      marks = num;
    }

    const category = calculateAssessmentCategory(isAbsent, marks);

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      let saId = params.saId || '';
      let existing = null;

      if (saId) {
        existing = findByField(CONFIG.SHEETS.STUDENT_ASSESSMENTS, 'SA_ID', saId);
      } else {
        // Look for existing assessment record matching student + module + topic + assessmentType
        const allStudentAssessments = findAllByField(CONFIG.SHEETS.STUDENT_ASSESSMENTS, 'STUDENT_ID', student.STUDENT_ID);
        existing = allStudentAssessments.find(a =>
          a.MODULE_ID === params.moduleId &&
          String(a.TOPIC || '').trim().toLowerCase() === String(params.topic || '').trim().toLowerCase() &&
          a.ASSESSMENT_TYPE === params.assessmentType
        );
      }

      const trainerUser = user.ROLE === CONFIG.ROLES.TRAINER ? user.FULL_NAME : (params.trainerName || user.FULL_NAME);
      const trainerId = user.ROLE === CONFIG.ROLES.TRAINER ? user.USER_ID : (params.trainerId || user.USER_ID);

      const recordData = {
        STUDENT_ID: student.STUDENT_ID,
        COURSE_ID: student.COURSE_ID,
        BATCH_ID: student.BATCH_ID,
        MODULE_ID: params.moduleId,
        TOPIC: clean(params.topic || ''),
        ASSESSMENT_TYPE: params.assessmentType,
        IS_ABSENT: String(isAbsent),
        MARKS: isAbsent ? '' : String(marks),
        SCORE: isAbsent ? '' : String(marks),
        TOTAL_MARKS: '10',
        PERCENTAGE: isAbsent ? '0' : String(Math.round((marks / 10) * 100)),
        CATEGORY: category,
        STATUS: 'COMPLETED',
        TRAINER_ID: trainerId,
        TRAINER_NAME: trainerUser,
        REMARKS: clean(params.remarks || ''),
        GRADED_BY: user.USER_ID,
        GRADED_AT: now(),
        UPDATED_AT: now()
      };

      if (existing) {
        saId = existing.SA_ID;
        updateRow(CONFIG.SHEETS.STUDENT_ASSESSMENTS, 'SA_ID', saId, recordData);
        auditLog(user.USER_ID, user.ROLE, 'UPDATE_ASSESSMENT', 'STUDENT_ASSESSMENT', saId, existing, recordData, 'SUCCESS');
      } else {
        saId = generateId('SA', CONFIG.SHEETS.STUDENT_ASSESSMENTS);
        recordData.SA_ID = saId;
        recordData.ASSESSMENT_ID = params.assessmentId || '';
        recordData.ATTEMPT_NUMBER = '1';
        recordData.FEEDBACK = '';
        recordData.STARTED_AT = now();
        recordData.SUBMITTED_AT = now();
        recordData.CREATED_AT = now();
        appendRow(CONFIG.SHEETS.STUDENT_ASSESSMENTS, recordData);
        auditLog(user.USER_ID, user.ROLE, 'RECORD_ASSESSMENT', 'STUDENT_ASSESSMENT', saId, '', recordData, 'SUCCESS');
      }

      // Recalculate placement readiness for student
      try {
        const profile = findByField(CONFIG.SHEETS.PLACEMENT_PROFILES, 'STUDENT_ID', student.STUDENT_ID);
        if (profile) {
          const readiness = calculatePlacementReadiness(student, profile);
          updateRow(CONFIG.SHEETS.PLACEMENT_PROFILES, 'PLACEMENT_ID', profile.PLACEMENT_ID, {
            PLACEMENT_ELIGIBLE: String(readiness.eligible),
            READINESS_PERCENT: String(readiness.readinessPercent),
            UPDATED_AT: now()
          });
        }
      } catch (err) {
        Logger.log('Error updating placement readiness after assessment: ' + err.message);
      }

      return successResponse({
        saId,
        studentId: student.STUDENT_ID,
        admissionNumber: student.ADMISSION_NUMBER,
        marks,
        isAbsent,
        category,
        assessmentType: params.assessmentType
      }, 'Assessment recorded successfully');
    } finally {
      lock.releaseLock();
    }
  } catch (e) {
    return errorResponse(e.message, 'RECORD_ASSESSMENT_ERROR');
  }
}

/**
 * Get assessment history for student, trainer or admin.
 * For every record: Course, Batch, Module, Topic, Assessment Type, Date, Marks, Category, Trainer, Remarks.
 */
function handleGetAssessmentHistory(params) {
  try {
    const { user } = requireAuth(params, null);
    let studentId = params.studentId || '';
    let batchId = params.batchId || '';

    // Student role: can only view own history
    if (user.ROLE === CONFIG.ROLES.STUDENT) {
      const student = findByField(CONFIG.SHEETS.STUDENTS, 'USER_ID', user.USER_ID);
      if (!student) return errorResponse('Student not found', 'NOT_FOUND');
      studentId = student.STUDENT_ID;
    }

    // Trainer role: only for assigned batches
    if (user.ROLE === CONFIG.ROLES.TRAINER) {
      const trainer = findByField(CONFIG.SHEETS.TRAINERS, 'USER_ID', user.USER_ID);
      if (!trainer) return errorResponse('Trainer not found', 'NOT_FOUND');
      const trainerBatches = findAllByField(CONFIG.SHEETS.BATCHES, 'TRAINER_ID', trainer.TRAINER_ID)
        .map(b => b.BATCH_ID);

      if (studentId) {
        const student = findByField(CONFIG.SHEETS.STUDENTS, 'STUDENT_ID', studentId);
        if (!student || !trainerBatches.includes(student.BATCH_ID)) {
          return errorResponse('Not authorized to view records for this student', 'FORBIDDEN');
        }
      } else if (batchId) {
        if (!trainerBatches.includes(batchId)) {
          return errorResponse('Not authorized for this batch', 'FORBIDDEN');
        }
      }
    }

    let records = getAllFromSheet(CONFIG.SHEETS.STUDENT_ASSESSMENTS);

    if (studentId) {
      records = records.filter(r => r.STUDENT_ID === studentId);
    }
    if (batchId) {
      records = records.filter(r => r.BATCH_ID === batchId);
    }
    if (params.courseId) {
      records = records.filter(r => r.COURSE_ID === params.courseId);
    }
    if (params.moduleId) {
      records = records.filter(r => r.MODULE_ID === params.moduleId);
    }

    // Lookup caches
    const courses = getAllFromSheet(CONFIG.SHEETS.COURSES);
    const batches = getAllFromSheet(CONFIG.SHEETS.BATCHES);
    const modules = getAllFromSheet(CONFIG.SHEETS.MODULES);
    const students = getAllFromSheet(CONFIG.SHEETS.STUDENTS);

    const history = records.map(r => {
      const crs = courses.find(c => c.COURSE_ID === r.COURSE_ID);
      const bat = batches.find(b => b.BATCH_ID === r.BATCH_ID);
      const mod = modules.find(m => m.MODULE_ID === r.MODULE_ID);
      const std = students.find(s => s.STUDENT_ID === r.STUDENT_ID);

      const isAbsent = r.IS_ABSENT === true || String(r.IS_ABSENT).toLowerCase() === 'true';
      const marksVal = isAbsent ? null : (r.MARKS !== '' && r.MARKS !== undefined ? parseFloat(r.MARKS) : (r.SCORE !== '' ? parseFloat(r.SCORE) : null));
      const category = r.CATEGORY || calculateAssessmentCategory(isAbsent, marksVal);

      return {
        saId: r.SA_ID,
        studentId: r.STUDENT_ID,
        admissionNumber: std ? std.ADMISSION_NUMBER : '',
        studentName: std ? std.FULL_NAME : '',
        courseId: r.COURSE_ID,
        courseTitle: crs ? crs.TITLE : '',
        batchId: r.BATCH_ID,
        batchName: bat ? bat.BATCH_NAME : '',
        moduleId: r.MODULE_ID,
        moduleTitle: mod ? mod.TITLE : '',
        topic: r.TOPIC || '',
        assessmentType: r.ASSESSMENT_TYPE || 'Topic Test',
        date: r.GRADED_AT || r.SUBMITTED_AT || r.CREATED_AT || '',
        marks: marksVal,
        totalMarks: 10,
        category: category,
        isAbsent: isAbsent,
        trainerId: r.TRAINER_ID || '',
        trainerName: r.TRAINER_NAME || '',
        remarks: r.REMARKS || ''
      };
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return successResponse(history);
  } catch (e) {
    return errorResponse(e.message, 'GET_ASSESSMENT_HISTORY_ERROR');
  }
}
