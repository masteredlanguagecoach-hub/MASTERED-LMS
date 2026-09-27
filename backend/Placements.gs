// ============================================================
// Placements.gs — Placement readiness handlers
// Mastered Skill Academy LMS
// ============================================================

function handleGetPlacements(params) {
  try {
    const { user } = requireAuth(params, null);
    let studentId = params.studentId;

    if (user.ROLE === CONFIG.ROLES.STUDENT) {
      const student = findByField(CONFIG.SHEETS.STUDENTS, 'USER_ID', user.USER_ID);
      if (!student) return errorResponse('Not found', 'NOT_FOUND');
      studentId = student.STUDENT_ID;
    } else if (!studentId) {
      return errorResponse('studentId required', 'MISSING_FIELD');
    }

    const student = findByField(CONFIG.SHEETS.STUDENTS, 'STUDENT_ID', studentId);
    if (!student) return errorResponse('Student not found', 'NOT_FOUND');

    let profile = findByField(CONFIG.SHEETS.PLACEMENT_PROFILES, 'STUDENT_ID', studentId);

    // Calculate readiness dynamically
    const readiness = calculatePlacementReadiness(student, profile);

    // Update profile with calculated readiness
    if (profile) {
      updateRow(CONFIG.SHEETS.PLACEMENT_PROFILES, 'PLACEMENT_ID', profile.PLACEMENT_ID, {
        PLACEMENT_ELIGIBLE: String(readiness.eligible),
        READINESS_PERCENT: String(readiness.readinessPercent),
        UPDATED_AT: now()
      });
    }

    const activities = findAllByField(CONFIG.SHEETS.PLACEMENT_ACTIVITIES, 'STUDENT_ID', studentId)
      .sort((a, b) => new Date(b.DATE) - new Date(a.DATE));

    return successResponse({
      student: { studentId: student.STUDENT_ID, fullName: student.FULL_NAME },
      profile: profile,
      readiness,
      activities
    });
  } catch (e) {
    return errorResponse(e.message, 'GET_PLACEMENTS_ERROR');
  }
}

function calculatePlacementReadiness(student, profile) {
  const minAttendance = getNumericSetting('PLACEMENT_MIN_ATTENDANCE', CONFIG.PLACEMENT_MIN_ATTENDANCE);
  const minAssessments = getNumericSetting('PLACEMENT_MIN_ASSESSMENTS', CONFIG.PLACEMENT_MIN_ASSESSMENTS);
  const resumeRequired = getSetting('PLACEMENT_RESUME_REQUIRED') !== 'false';
  const mockRequired = getSetting('PLACEMENT_MOCK_REQUIRED') !== 'false';

  let score = 0;
  let maxScore = 0;
  const criteria = [];

  // Attendance check
  maxScore += 25;
  const attendance = findAllByField(CONFIG.SHEETS.CLASS_ATTENDANCE, 'STUDENT_ID', student.STUDENT_ID);
  const presentCount = attendance.filter(a => a.STATUS === 'PRESENT' || a.STATUS === 'LATE').length;
  const attendancePercent = attendance.length > 0 ? Math.round((presentCount / attendance.length) * 100) : 0;
  const attendanceMet = attendancePercent >= minAttendance;
  if (attendanceMet) score += 25;
  criteria.push({ name: 'Attendance', value: attendancePercent + '%', required: minAttendance + '%', met: attendanceMet });

  // Assessment completion
  maxScore += 25;
  const assessments = findAllByField(CONFIG.SHEETS.ASSESSMENTS, 'BATCH_ID', student.BATCH_ID).filter(a => a.STATUS === 'ACTIVE');
  const studentAssessments = findAllByField(CONFIG.SHEETS.STUDENT_ASSESSMENTS, 'STUDENT_ID', student.STUDENT_ID)
    .filter(sa => sa.STATUS === 'PASSED' || sa.STATUS === 'COMPLETED' || sa.STATUS === 'FAILED');
  const assessmentCompletion = assessments.length > 0
    ? Math.round((studentAssessments.length / assessments.length) * 100) : 0;
  const assessmentsMet = assessmentCompletion >= minAssessments;
  if (assessmentsMet) score += 25;
  criteria.push({ name: 'Assessments', value: assessmentCompletion + '%', required: minAssessments + '%', met: assessmentsMet });

  // Resume check
  if (resumeRequired) {
    maxScore += 25;
    const resumeUploaded = profile && profile.RESUME_URL && profile.RESUME_URL.length > 0;
    if (resumeUploaded) score += 25;
    criteria.push({ name: 'Resume', value: resumeUploaded ? 'Uploaded' : 'Not Uploaded', required: 'Required', met: resumeUploaded });
  }

  // Mock interview
  if (mockRequired) {
    maxScore += 25;
    const mockDone = profile && profile.MOCK_INTERVIEW_DONE === 'true';
    if (mockDone) score += 25;
    criteria.push({ name: 'Mock Interview', value: mockDone ? 'Completed' : 'Pending', required: 'Required', met: mockDone });
  }

  const readinessPercent = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  const eligible = criteria.every(c => c.met);

  return { eligible, readinessPercent, criteria, attendancePercent, assessmentCompletion };
}

function handleUpdatePlacementProfile(params) {
  try {
    const { user } = requireAuth(params, [CONFIG.ROLES.STUDENT, CONFIG.ROLES.ADMIN]);
    let studentId = params.studentId;

    if (user.ROLE === CONFIG.ROLES.STUDENT) {
      const student = findByField(CONFIG.SHEETS.STUDENTS, 'USER_ID', user.USER_ID);
      if (!student) return errorResponse('Not found', 'NOT_FOUND');
      studentId = student.STUDENT_ID;
    }

    let profile = findByField(CONFIG.SHEETS.PLACEMENT_PROFILES, 'STUDENT_ID', studentId);
    const updates = { UPDATED_AT: now() };
    if (params.resumeUrl) updates.RESUME_URL = params.resumeUrl;
    if (params.linkedinUrl) updates.LINKEDIN_URL = params.linkedinUrl;
    if (params.githubUrl) updates.GITHUB_URL = params.githubUrl;
    if (params.portfolioUrl) updates.PORTFOLIO_URL = params.portfolioUrl;
    if (params.skills) updates.SKILLS = params.skills;
    if (params.mockInterviewDone) updates.MOCK_INTERVIEW_DONE = params.mockInterviewDone;
    if (params.mockScore) updates.MOCK_SCORE = params.mockScore;

    if (profile) {
      updateRow(CONFIG.SHEETS.PLACEMENT_PROFILES, 'PLACEMENT_ID', profile.PLACEMENT_ID, updates);
    } else {
      const placementId = generateId(CONFIG.ID_PREFIXES.PLACEMENT, CONFIG.SHEETS.PLACEMENT_PROFILES);
      appendRow(CONFIG.SHEETS.PLACEMENT_PROFILES, {
        PLACEMENT_ID: placementId, STUDENT_ID: studentId,
        RESUME_URL: params.resumeUrl || '', RESUME_UPDATED_AT: params.resumeUrl ? now() : '',
        LINKEDIN_URL: params.linkedinUrl || '', GITHUB_URL: params.githubUrl || '',
        PORTFOLIO_URL: params.portfolioUrl || '', SKILLS: params.skills || '',
        MOCK_INTERVIEW_DONE: 'false', MOCK_INTERVIEW_DATE: '', MOCK_SCORE: '',
        PLACEMENT_ELIGIBLE: 'false', READINESS_PERCENT: '0',
        STATUS: 'ACTIVE', CREATED_AT: now(), UPDATED_AT: now()
      });
    }
    return successResponse(null, 'Profile updated');
  } catch (e) {
    return errorResponse(e.message, 'UPDATE_PLACEMENT_ERROR');
  }
}

/**
 * Placement candidates engine.
 * Dynamically identifies students who:
 * A. Have completed the course (Progress = 100%) -> Completed
 * B. Are near completion (Progress >= NEAR_COMPLETION_PERCENT, default 80%) -> Near Completion
 * Returns candidate records with: Name, Admission Number, Course, Batch, Progress,
 * Attendance, Assessment Performance, Placement Status, Interview Count, Last Interview Date/Result.
 */
function handleGetPlacementCandidates(params) {
  try {
    const { user } = requireAuth(params, [CONFIG.ROLES.ADMIN, CONFIG.ROLES.STAFF, CONFIG.ROLES.TRAINER]);
    const nearCompletionThreshold = getNumericSetting('NEAR_COMPLETION_PERCENT', 80);

    const students = getAllFromSheet(CONFIG.SHEETS.STUDENTS).filter(s => s.STATUS === 'ACTIVE');
    const courses = getAllFromSheet(CONFIG.SHEETS.COURSES);
    const batches = getAllFromSheet(CONFIG.SHEETS.BATCHES);
    const modules = getAllFromSheet(CONFIG.SHEETS.MODULES);
    const lessons = getAllFromSheet(CONFIG.SHEETS.LESSONS);
    const allProgress = getAllFromSheet(CONFIG.SHEETS.STUDENT_PROGRESS);
    const allAttendance = getAllFromSheet(CONFIG.SHEETS.CLASS_ATTENDANCE);
    const allAssessments = getAllFromSheet(CONFIG.SHEETS.STUDENT_ASSESSMENTS);
    const allInterviews = getAllFromSheet(CONFIG.SHEETS.INTERVIEWS);
    const allProfiles = getAllFromSheet(CONFIG.SHEETS.PLACEMENT_PROFILES);

    const candidates = [];

    students.forEach(std => {
      // Trainer access check: only their batches
      if (user.ROLE === CONFIG.ROLES.TRAINER) {
        const trainer = findByField(CONFIG.SHEETS.TRAINERS, 'USER_ID', user.USER_ID);
        const batch = batches.find(b => b.BATCH_ID === std.BATCH_ID);
        if (!trainer || !batch || batch.TRAINER_ID !== trainer.TRAINER_ID) {
          return;
        }
      }

      // Course progress calculation
      const courseModules = modules.filter(m => m.COURSE_ID === std.COURSE_ID);
      const courseModuleIds = courseModules.map(m => m.MODULE_ID);
      const courseLessons = lessons.filter(l => courseModuleIds.includes(l.MODULE_ID));
      const studentProgress = allProgress.filter(p => p.STUDENT_ID === std.STUDENT_ID && p.STATUS === 'COMPLETED');
      const progress = courseLessons.length > 0
        ? Math.round((studentProgress.length / courseLessons.length) * 100)
        : 0;

      // Attendance calculation
      const stdAttendance = allAttendance.filter(a => a.STUDENT_ID === std.STUDENT_ID);
      const presentCount = stdAttendance.filter(a => a.STATUS === 'PRESENT' || a.STATUS === 'LATE').length;
      const attendancePercent = stdAttendance.length > 0
        ? Math.round((presentCount / stdAttendance.length) * 100)
        : 0;

      // Existing placement profile & status
      const profile = allProfiles.find(p => p.STUDENT_ID === std.STUDENT_ID);
      let currentStatus = profile && profile.STATUS && profile.STATUS !== 'ACTIVE' ? profile.STATUS : '';

      if (!currentStatus) {
        if (progress >= 100) {
          currentStatus = CONFIG.PLACEMENT_STATUS.ELIGIBLE;
        } else if (progress >= nearCompletionThreshold) {
          currentStatus = CONFIG.PLACEMENT_STATUS.NEAR_COMPLETION;
        } else {
          currentStatus = CONFIG.PLACEMENT_STATUS.NOT_READY;
        }
      }

      // Candidates should be near completion, completed, or actively in placement status
      const isCandidate = progress >= nearCompletionThreshold ||
        (currentStatus !== CONFIG.PLACEMENT_STATUS.NOT_READY && currentStatus !== '');

      if (!isCandidate) {
        return;
      }

      // Assessment performance calculation
      const stdAssessments = allAssessments.filter(a => a.STUDENT_ID === std.STUDENT_ID);
      let totalMarksSum = 0;
      let assessedCount = 0;
      const categoryCounts = { A: 0, B: 0, C: 0, D: 0, E: 0 };

      stdAssessments.forEach(sa => {
        const isAbsent = sa.IS_ABSENT === true || String(sa.IS_ABSENT).toLowerCase() === 'true';
        const marks = isAbsent ? null : (sa.MARKS !== '' ? parseFloat(sa.MARKS) : null);
        const cat = sa.CATEGORY || calculateAssessmentCategory(isAbsent, marks);
        if (categoryCounts[cat] !== undefined) {
          categoryCounts[cat]++;
        }
        if (!isAbsent && marks !== null && !isNaN(marks)) {
          totalMarksSum += marks;
          assessedCount++;
        }
      });

      const averageMark = assessedCount > 0 ? parseFloat((totalMarksSum / assessedCount).toFixed(1)) : 0;

      // Interview tracking
      const stdInterviews = allInterviews.filter(i => i.STUDENT_ID === std.STUDENT_ID)
        .sort((a, b) => new Date(b.INTERVIEW_DATE || b.CREATED_AT).getTime() - new Date(a.INTERVIEW_DATE || a.CREATED_AT).getTime());
      const interviewCount = stdInterviews.length;
      const lastInterview = stdInterviews.length > 0 ? stdInterviews[0] : null;

      const crs = courses.find(c => c.COURSE_ID === std.COURSE_ID);
      const bat = batches.find(b => b.BATCH_ID === std.BATCH_ID);

      candidates.push({
        studentId: std.STUDENT_ID,
        admissionNumber: std.ADMISSION_NUMBER,
        fullName: std.FULL_NAME,
        email: std.EMAIL,
        mobile: std.MOBILE,
        courseId: std.COURSE_ID,
        courseTitle: crs ? crs.TITLE : '',
        batchId: std.BATCH_ID,
        batchName: bat ? bat.BATCH_NAME : '',
        progress,
        isCompleted: progress >= 100,
        isNearCompletion: progress >= nearCompletionThreshold && progress < 100,
        attendancePercent,
        assessmentPerformance: {
          averageMark,
          totalCompleted: stdAssessments.length,
          categoryCounts
        },
        placementStatus: currentStatus,
        placementEligible: profile ? (profile.PLACEMENT_ELIGIBLE === 'true') : (progress >= 100),
        interviewCount,
        lastInterviewDate: lastInterview ? (lastInterview.INTERVIEW_DATE || '') : '',
        lastInterviewResult: lastInterview ? (lastInterview.RESULT || '') : '',
        lastInterviewCompany: lastInterview ? (lastInterview.COMPANY || '') : ''
      });
    });

    // Apply optional filters
    let filtered = candidates;
    if (params.courseId) {
      filtered = filtered.filter(c => c.courseId === params.courseId);
    }
    if (params.batchId) {
      filtered = filtered.filter(c => c.batchId === params.batchId);
    }
    if (params.status) {
      filtered = filtered.filter(c => c.placementStatus === params.status);
    }
    if (params.completionFilter === 'completed') {
      filtered = filtered.filter(c => c.isCompleted);
    } else if (params.completionFilter === 'near_completion') {
      filtered = filtered.filter(c => c.isNearCompletion);
    }
    if (params.minProgress) {
      const minP = parseFloat(params.minProgress);
      filtered = filtered.filter(c => c.progress >= minP);
    }
    if (params.minAttendance) {
      const minA = parseFloat(params.minAttendance);
      filtered = filtered.filter(c => c.attendancePercent >= minA);
    }

    return successResponse(filtered);
  } catch (e) {
    return errorResponse(e.message, 'GET_PLACEMENT_CANDIDATES_ERROR');
  }
}

/**
 * Detailed placement profile for a student including:
 * - Assessment Summary (Topic Tests, Presentations, Mock Interviews)
 * - Assessment History
 * - Interview History (with total counts)
 * - Placement Status Timeline
 */
function handleGetPlacementProfile(params) {
  try {
    const { user } = requireAuth(params, null);
    let studentId = params.studentId;

    if (user.ROLE === CONFIG.ROLES.STUDENT) {
      const student = findByField(CONFIG.SHEETS.STUDENTS, 'USER_ID', user.USER_ID);
      if (!student) return errorResponse('Student not found', 'NOT_FOUND');
      studentId = student.STUDENT_ID;
    } else if (!studentId) {
      return errorResponse('studentId required', 'MISSING_FIELD');
    }

    const student = findByField(CONFIG.SHEETS.STUDENTS, 'STUDENT_ID', studentId);
    if (!student) return errorResponse('Student not found', 'NOT_FOUND');

    const course = findByField(CONFIG.SHEETS.COURSES, 'COURSE_ID', student.COURSE_ID);
    const batch = findByField(CONFIG.SHEETS.BATCHES, 'BATCH_ID', student.BATCH_ID);

    // Profile & readiness
    let profile = findByField(CONFIG.SHEETS.PLACEMENT_PROFILES, 'STUDENT_ID', studentId);
    const readiness = calculatePlacementReadiness(student, profile);

    // Assessments & Assessment Summary
    const assessments = findAllByField(CONFIG.SHEETS.STUDENT_ASSESSMENTS, 'STUDENT_ID', studentId);
    const modules = getAllFromSheet(CONFIG.SHEETS.MODULES);

    const summary = {
      topicTests: { count: 0, totalMarks: 0, avgMarks: 0, categories: { A: 0, B: 0, C: 0, D: 0, E: 0 } },
      presentations: { count: 0, totalMarks: 0, avgMarks: 0, categories: { A: 0, B: 0, C: 0, D: 0, E: 0 } },
      mockInterviews: { count: 0, totalMarks: 0, avgMarks: 0, categories: { A: 0, B: 0, C: 0, D: 0, E: 0 } }
    };

    const assessmentHistory = assessments.map(a => {
      const mod = modules.find(m => m.MODULE_ID === a.MODULE_ID);
      const isAbsent = a.IS_ABSENT === true || String(a.IS_ABSENT).toLowerCase() === 'true';
      const marksVal = isAbsent ? null : (a.MARKS !== '' ? parseFloat(a.MARKS) : (a.SCORE !== '' ? parseFloat(a.SCORE) : null));
      const cat = a.CATEGORY || calculateAssessmentCategory(isAbsent, marksVal);

      // Categorize into summary
      const type = a.ASSESSMENT_TYPE || 'Topic Test';
      let targetSummary = null;
      if (type === CONFIG.ASSESSMENT_TYPES.TOPIC_TEST) targetSummary = summary.topicTests;
      else if (type === CONFIG.ASSESSMENT_TYPES.PRESENTATION) targetSummary = summary.presentations;
      else if (type === CONFIG.ASSESSMENT_TYPES.TOPIC_MOCK_INTERVIEW) targetSummary = summary.mockInterviews;

      if (targetSummary) {
        targetSummary.count++;
        if (targetSummary.categories[cat] !== undefined) targetSummary.categories[cat]++;
        if (!isAbsent && marksVal !== null) targetSummary.totalMarks += marksVal;
      }

      return {
        saId: a.SA_ID,
        moduleId: a.MODULE_ID,
        moduleTitle: mod ? mod.TITLE : (a.MODULE_ID || ''),
        topic: a.TOPIC || '',
        assessmentType: type,
        marks: marksVal,
        totalMarks: 10,
        category: cat,
        isAbsent,
        date: a.GRADED_AT || a.SUBMITTED_AT || a.CREATED_AT || '',
        trainer: a.TRAINER_NAME || '',
        remarks: a.REMARKS || ''
      };
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Compute averages for summary
    ['topicTests', 'presentations', 'mockInterviews'].forEach(k => {
      const s = summary[k];
      s.avgMarks = s.count > 0 ? parseFloat((s.totalMarks / s.count).toFixed(1)) : 0;
    });

    // Interviews & Interview History
    const rawInterviews = findAllByField(CONFIG.SHEETS.INTERVIEWS, 'STUDENT_ID', studentId)
      .sort((a, b) => new Date(b.INTERVIEW_DATE || b.CREATED_AT).getTime() - new Date(a.INTERVIEW_DATE || a.CREATED_AT).getTime());

    const interviewCounts = {
      total: rawInterviews.length,
      upcoming: rawInterviews.filter(i => i.STATUS === 'ASSIGNED' || i.STATUS === 'SCHEDULED').length,
      completed: rawInterviews.filter(i => i.STATUS === 'COMPLETED').length,
      selected: rawInterviews.filter(i => i.RESULT === 'SELECTED' || i.RESULT === 'OFFERED').length,
      rejected: rawInterviews.filter(i => i.RESULT === 'REJECTED').length
    };

    // Placement status history / timeline
    const statusHistory = findAllByField(CONFIG.SHEETS.PLACEMENT_STATUS_HISTORY, 'STUDENT_ID', studentId)
      .sort((a, b) => new Date(b.CHANGED_DATE || b.CREATED_AT).getTime() - new Date(a.CHANGED_DATE || a.CREATED_AT).getTime());

    return successResponse({
      student: {
        studentId: student.STUDENT_ID,
        admissionNumber: student.ADMISSION_NUMBER,
        fullName: student.FULL_NAME,
        email: student.EMAIL,
        mobile: student.MOBILE,
        courseTitle: course ? course.TITLE : '',
        batchName: batch ? batch.BATCH_NAME : ''
      },
      profile,
      readiness,
      assessmentSummary: summary,
      assessmentHistory,
      interviews: rawInterviews,
      interviewCounts,
      statusHistory
    });
  } catch (e) {
    return errorResponse(e.message, 'GET_PLACEMENT_PROFILE_ERROR');
  }
}

/**
 * Update placement status with history tracking.
 */
function handleUpdatePlacementStatus(params) {
  try {
    const { user } = requireAuth(params, [CONFIG.ROLES.ADMIN, CONFIG.ROLES.STAFF]);
    validateRequired(params, ['studentId', 'newStatus']);

    const student = findByField(CONFIG.SHEETS.STUDENTS, 'STUDENT_ID', params.studentId);
    if (!student) return errorResponse('Student not found', 'NOT_FOUND');

    const validStatuses = Object.values(CONFIG.PLACEMENT_STATUS);
    if (!validStatuses.includes(params.newStatus)) {
      return errorResponse('Invalid placement status: ' + params.newStatus, 'INVALID_STATUS');
    }

    let profile = findByField(CONFIG.SHEETS.PLACEMENT_PROFILES, 'STUDENT_ID', params.studentId);
    const oldStatus = profile ? (profile.STATUS || 'NOT_READY') : 'NOT_READY';

    if (profile) {
      updateRow(CONFIG.SHEETS.PLACEMENT_PROFILES, 'PLACEMENT_ID', profile.PLACEMENT_ID, {
        STATUS: params.newStatus,
        UPDATED_AT: now()
      });
    } else {
      const placementId = generateId(CONFIG.ID_PREFIXES.PLACEMENT, CONFIG.SHEETS.PLACEMENT_PROFILES);
      appendRow(CONFIG.SHEETS.PLACEMENT_PROFILES, {
        PLACEMENT_ID: placementId,
        STUDENT_ID: student.STUDENT_ID,
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
        STATUS: params.newStatus,
        CREATED_AT: now(),
        UPDATED_AT: now()
      });
    }

    // Append to PLACEMENT_STATUS_HISTORY
    const historyId = generateId(CONFIG.ID_PREFIXES.PLACEMENT_HISTORY, CONFIG.SHEETS.PLACEMENT_STATUS_HISTORY);
    appendRow(CONFIG.SHEETS.PLACEMENT_STATUS_HISTORY, {
      HISTORY_ID: historyId,
      STUDENT_ID: student.STUDENT_ID,
      ADMISSION_NUMBER: student.ADMISSION_NUMBER,
      PREVIOUS_STATUS: oldStatus,
      NEW_STATUS: params.newStatus,
      CHANGED_BY: user.FULL_NAME || user.USER_ID,
      CHANGED_DATE: now(),
      REMARKS: clean(params.remarks || ''),
      CREATED_AT: now()
    });

    auditLog(user.USER_ID, user.ROLE, 'UPDATE_PLACEMENT_STATUS', 'PLACEMENT', params.studentId, oldStatus, params.newStatus, 'SUCCESS');

    return successResponse({
      studentId: student.STUDENT_ID,
      previousStatus: oldStatus,
      newStatus: params.newStatus
    }, 'Placement status updated successfully');
  } catch (e) {
    return errorResponse(e.message, 'UPDATE_PLACEMENT_STATUS_ERROR');
  }
}

/**
 * Assign interview to a student.
 */
function handleAssignInterview(params) {
  try {
    const { user } = requireAuth(params, [CONFIG.ROLES.ADMIN, CONFIG.ROLES.STAFF]);
    validateRequired(params, ['studentId', 'company', 'position', 'interviewDate']);

    const student = findByField(CONFIG.SHEETS.STUDENTS, 'STUDENT_ID', params.studentId);
    if (!student) return errorResponse('Student not found', 'NOT_FOUND');

    const interviewId = generateId(CONFIG.ID_PREFIXES.INTERVIEW, CONFIG.SHEETS.INTERVIEWS);

    appendRow(CONFIG.SHEETS.INTERVIEWS, {
      INTERVIEW_ID: interviewId,
      STUDENT_ID: student.STUDENT_ID,
      ADMISSION_NUMBER: student.ADMISSION_NUMBER,
      COMPANY: clean(params.company),
      POSITION: clean(params.position),
      INTERVIEW_TYPE: params.interviewType || 'Technical Round',
      INTERVIEW_DATE: params.interviewDate,
      INTERVIEW_TIME: params.interviewTime || '',
      LOCATION: clean(params.location || 'Online / Google Meet'),
      ASSIGNED_BY: user.FULL_NAME || user.USER_ID,
      ASSIGNED_DATE: now(),
      STATUS: CONFIG.INTERVIEW_STATUS.ASSIGNED,
      RESULT: CONFIG.INTERVIEW_RESULT.PENDING,
      FEEDBACK: '',
      REMARKS: clean(params.remarks || ''),
      CREATED_AT: now(),
      UPDATED_AT: now()
    });

    // Advance placement status to INTERVIEW_ASSIGNED if student is currently ELIGIBLE or NEAR_COMPLETION
    try {
      let profile = findByField(CONFIG.SHEETS.PLACEMENT_PROFILES, 'STUDENT_ID', student.STUDENT_ID);
      const currentSt = profile ? profile.STATUS : 'ELIGIBLE';
      if (!profile || currentSt === CONFIG.PLACEMENT_STATUS.ELIGIBLE || currentSt === CONFIG.PLACEMENT_STATUS.NEAR_COMPLETION) {
        handleUpdatePlacementStatus({
          token: params.token,
          studentId: student.STUDENT_ID,
          newStatus: CONFIG.PLACEMENT_STATUS.INTERVIEW_ASSIGNED,
          remarks: 'Interview assigned with ' + params.company
        });
      }
    } catch (_) {}

    auditLog(user.USER_ID, user.ROLE, 'ASSIGN_INTERVIEW', 'INTERVIEW', interviewId, '', params.company, 'SUCCESS');

    return successResponse({ interviewId }, 'Interview assigned successfully');
  } catch (e) {
    return errorResponse(e.message, 'ASSIGN_INTERVIEW_ERROR');
  }
}

/**
 * Update interview status and result.
 */
function handleUpdateInterview(params) {
  try {
    const { user } = requireAuth(params, [CONFIG.ROLES.ADMIN, CONFIG.ROLES.STAFF]);
    validateRequired(params, ['interviewId']);

    const interview = findByField(CONFIG.SHEETS.INTERVIEWS, 'INTERVIEW_ID', params.interviewId);
    if (!interview) return errorResponse('Interview not found', 'NOT_FOUND');

    const updates = { UPDATED_AT: now() };
    if (params.status) updates.STATUS = params.status;
    if (params.result) updates.RESULT = params.result;
    if (params.feedback !== undefined) updates.FEEDBACK = clean(params.feedback);
    if (params.remarks !== undefined) updates.REMARKS = clean(params.remarks);
    if (params.interviewDate) updates.INTERVIEW_DATE = params.interviewDate;
    if (params.interviewTime) updates.INTERVIEW_TIME = params.interviewTime;
    if (params.location) updates.LOCATION = clean(params.location);

    updateRow(CONFIG.SHEETS.INTERVIEWS, 'INTERVIEW_ID', params.interviewId, updates);

    // If result changed to SELECTED, update placement status
    if (params.result === CONFIG.INTERVIEW_RESULT.SELECTED) {
      try {
        handleUpdatePlacementStatus({
          token: params.token,
          studentId: interview.STUDENT_ID,
          newStatus: CONFIG.PLACEMENT_STATUS.SELECTED,
          remarks: 'Selected in interview with ' + interview.COMPANY
        });
      } catch (_) {}
    }

    auditLog(user.USER_ID, user.ROLE, 'UPDATE_INTERVIEW', 'INTERVIEW', params.interviewId, interview, updates, 'SUCCESS');

    return successResponse(null, 'Interview updated successfully');
  } catch (e) {
    return errorResponse(e.message, 'UPDATE_INTERVIEW_ERROR');
  }
}

/**
 * Get interview history for a student or batch.
 */
function handleGetInterviewHistory(params) {
  try {
    const { user } = requireAuth(params, null);
    let studentId = params.studentId || '';

    if (user.ROLE === CONFIG.ROLES.STUDENT) {
      const student = findByField(CONFIG.SHEETS.STUDENTS, 'USER_ID', user.USER_ID);
      if (!student) return errorResponse('Student not found', 'NOT_FOUND');
      studentId = student.STUDENT_ID;
    }

    let interviews = getAllFromSheet(CONFIG.SHEETS.INTERVIEWS);
    if (studentId) {
      interviews = interviews.filter(i => i.STUDENT_ID === studentId);
    }

    interviews.sort((a, b) => new Date(b.INTERVIEW_DATE || b.CREATED_AT).getTime() - new Date(a.INTERVIEW_DATE || a.CREATED_AT).getTime());

    return successResponse(interviews);
  } catch (e) {
    return errorResponse(e.message, 'GET_INTERVIEW_HISTORY_ERROR');
  }
}

/**
 * Get placement status timeline history for a student.
 */
function handleGetPlacementStatusHistory(params) {
  try {
    const { user } = requireAuth(params, null);
    let studentId = params.studentId || '';

    if (user.ROLE === CONFIG.ROLES.STUDENT) {
      const student = findByField(CONFIG.SHEETS.STUDENTS, 'USER_ID', user.USER_ID);
      if (!student) return errorResponse('Student not found', 'NOT_FOUND');
      studentId = student.STUDENT_ID;
    }

    if (!studentId) return errorResponse('studentId required', 'MISSING_FIELD');

    const history = findAllByField(CONFIG.SHEETS.PLACEMENT_STATUS_HISTORY, 'STUDENT_ID', studentId)
      .sort((a, b) => new Date(b.CHANGED_DATE || b.CREATED_AT).getTime() - new Date(a.CHANGED_DATE || a.CREATED_AT).getTime());

    return successResponse(history);
  } catch (e) {
    return errorResponse(e.message, 'GET_PLACEMENT_STATUS_HISTORY_ERROR');
  }
}
