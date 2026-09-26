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
