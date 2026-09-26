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
