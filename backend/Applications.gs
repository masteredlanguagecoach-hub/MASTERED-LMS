// ============================================================
// Applications.gs — Job/Internship application handlers
// Mastered Skill Academy LMS
// ============================================================

function handleGetJobs(params) {
  try {
    requireAuth(params, null);
    const jobs = getAllFromSheet(CONFIG.SHEETS.JOBS)
      .filter(j => j.STATUS === 'ACTIVE')
      .sort((a, b) => new Date(b.CREATED_AT) - new Date(a.CREATED_AT));
    return successResponse(jobs);
  } catch (e) {
    return errorResponse(e.message, 'GET_JOBS_ERROR');
  }
}

function handleGetInternships(params) {
  try {
    requireAuth(params, null);
    const internships = getAllFromSheet(CONFIG.SHEETS.INTERNSHIPS)
      .filter(i => i.STATUS === 'ACTIVE')
      .sort((a, b) => new Date(b.CREATED_AT) - new Date(a.CREATED_AT));
    return successResponse(internships);
  } catch (e) {
    return errorResponse(e.message, 'GET_INTERNSHIPS_ERROR');
  }
}

function handleApplyForJob(params) {
  try {
    const { user } = requireAuth(params, [CONFIG.ROLES.STUDENT]);
    validateRequired(params, ['jobId']);

    const student = findByField(CONFIG.SHEETS.STUDENTS, 'USER_ID', user.USER_ID);
    if (!student) return errorResponse('Student not found', 'NOT_FOUND');

    const job = findByField(CONFIG.SHEETS.JOBS, 'JOB_ID', params.jobId);
    if (!job) return errorResponse('Job not found', 'NOT_FOUND');
    if (job.STATUS !== 'ACTIVE') return errorResponse('Job is no longer active', 'INACTIVE');

    // Check for existing application
    const existing = getAllFromSheet(CONFIG.SHEETS.APPLICATIONS).find(
      a => a.JOB_ID === params.jobId && a.STUDENT_ID === student.STUDENT_ID && a.STATUS !== 'WITHDRAWN'
    );
    if (existing) return errorResponse('Already applied for this job', 'DUPLICATE_APPLICATION');

    const lock = LockService.getScriptLock();
    lock.waitLock(5000);
    try {
      const appId = generateId(CONFIG.ID_PREFIXES.APPLICATION, CONFIG.SHEETS.APPLICATIONS);
      appendRow(CONFIG.SHEETS.APPLICATIONS, {
        APPLICATION_ID: appId, STUDENT_ID: student.STUDENT_ID,
        JOB_ID: params.jobId, INTERNSHIP_ID: '',
        TYPE: 'JOB', RESUME_URL: params.resumeUrl || '',
        COVER_LETTER: params.coverLetter || '', STATUS: 'APPLIED',
        APPLIED_AT: now(), INTERVIEW_DATE: '', OFFER_DETAILS: '',
        JOINED_DATE: '', NOTES: '', CREATED_AT: now(), UPDATED_AT: now()
      });
      return successResponse({ applicationId: appId }, 'Application submitted successfully');
    } finally {
      lock.releaseLock();
    }
  } catch (e) {
    return errorResponse(e.message, 'APPLY_JOB_ERROR');
  }
}

function handleApplyForInternship(params) {
  try {
    const { user } = requireAuth(params, [CONFIG.ROLES.STUDENT]);
    validateRequired(params, ['internshipId']);

    const student = findByField(CONFIG.SHEETS.STUDENTS, 'USER_ID', user.USER_ID);
    if (!student) return errorResponse('Student not found', 'NOT_FOUND');

    const internship = findByField(CONFIG.SHEETS.INTERNSHIPS, 'INTERNSHIP_ID', params.internshipId);
    if (!internship) return errorResponse('Internship not found', 'NOT_FOUND');
    if (internship.STATUS !== 'ACTIVE') return errorResponse('Internship is no longer active', 'INACTIVE');

    const existing = getAllFromSheet(CONFIG.SHEETS.APPLICATIONS).find(
      a => a.INTERNSHIP_ID === params.internshipId && a.STUDENT_ID === student.STUDENT_ID && a.STATUS !== 'WITHDRAWN'
    );
    if (existing) return errorResponse('Already applied for this internship', 'DUPLICATE_APPLICATION');

    const lock = LockService.getScriptLock();
    lock.waitLock(5000);
    try {
      const appId = generateId(CONFIG.ID_PREFIXES.APPLICATION, CONFIG.SHEETS.APPLICATIONS);
      appendRow(CONFIG.SHEETS.APPLICATIONS, {
        APPLICATION_ID: appId, STUDENT_ID: student.STUDENT_ID,
        JOB_ID: '', INTERNSHIP_ID: params.internshipId,
        TYPE: 'INTERNSHIP', RESUME_URL: params.resumeUrl || '',
        COVER_LETTER: params.coverLetter || '', STATUS: 'APPLIED',
        APPLIED_AT: now(), INTERVIEW_DATE: '', OFFER_DETAILS: '',
        JOINED_DATE: '', NOTES: '', CREATED_AT: now(), UPDATED_AT: now()
      });
      return successResponse({ applicationId: appId }, 'Application submitted');
    } finally {
      lock.releaseLock();
    }
  } catch (e) {
    return errorResponse(e.message, 'APPLY_INTERNSHIP_ERROR');
  }
}

function handleGetApplications(params) {
  try {
    const { user } = requireAuth(params, null);
    let studentId = params.studentId;

    if (user.ROLE === CONFIG.ROLES.STUDENT) {
      const student = findByField(CONFIG.SHEETS.STUDENTS, 'USER_ID', user.USER_ID);
      if (!student) return errorResponse('Not found', 'NOT_FOUND');
      studentId = student.STUDENT_ID;
    }

    const applications = studentId
      ? findAllByField(CONFIG.SHEETS.APPLICATIONS, 'STUDENT_ID', studentId)
      : getAllFromSheet(CONFIG.SHEETS.APPLICATIONS);

    const jobs = getAllFromSheet(CONFIG.SHEETS.JOBS);
    const internships = getAllFromSheet(CONFIG.SHEETS.INTERNSHIPS);

    const enriched = applications
      .sort((a, b) => new Date(b.APPLIED_AT) - new Date(a.APPLIED_AT))
      .map(app => {
        const job = app.JOB_ID ? jobs.find(j => j.JOB_ID === app.JOB_ID) : null;
        const internship = app.INTERNSHIP_ID ? internships.find(i => i.INTERNSHIP_ID === app.INTERNSHIP_ID) : null;
        return { ...app, jobDetails: job || null, internshipDetails: internship || null };
      });

    return successResponse(enriched);
  } catch (e) {
    return errorResponse(e.message, 'GET_APPLICATIONS_ERROR');
  }
}

function handleUpdateApplication(params) {
  try {
    const { user } = requireAuth(params, [CONFIG.ROLES.ADMIN, CONFIG.ROLES.STAFF]);
    validateRequired(params, ['applicationId', 'status']);

    const validStatuses = ['APPLIED','SHORTLISTED','INTERVIEW_SCHEDULED','INTERVIEW_COMPLETED',
      'SELECTED','OFFER_RECEIVED','JOINED','REJECTED','WITHDRAWN'];
    if (!validStatuses.includes(params.status)) {
      return errorResponse('Invalid status', 'INVALID_STATUS');
    }

    updateRow(CONFIG.SHEETS.APPLICATIONS, 'APPLICATION_ID', params.applicationId, {
      STATUS: params.status,
      INTERVIEW_DATE: params.interviewDate || '',
      OFFER_DETAILS: params.offerDetails || '',
      JOINED_DATE: params.joinedDate || '',
      NOTES: params.notes || '',
      UPDATED_AT: now()
    });

    auditLog(user.USER_ID, user.ROLE, 'UPDATE_APPLICATION', 'APPLICATION', params.applicationId, '', params.status, 'SUCCESS');
    return successResponse(null, 'Application updated');
  } catch (e) {
    return errorResponse(e.message, 'UPDATE_APPLICATION_ERROR');
  }
}

function handleCreateJob(params) {
  try {
    const { user } = requireAuth(params, [CONFIG.ROLES.ADMIN]);
    validateRequired(params, ['title', 'company']);
    const jobId = generateId(CONFIG.ID_PREFIXES.JOB, CONFIG.SHEETS.JOBS);
    appendRow(CONFIG.SHEETS.JOBS, {
      JOB_ID: jobId, TITLE: clean(params.title), COMPANY: clean(params.company),
      COMPANY_LOGO_URL: params.companyLogoUrl || '', LOCATION: params.location || '',
      WORK_MODE: params.workMode || 'Hybrid', SALARY_MIN: params.salaryMin || '',
      SALARY_MAX: params.salaryMax || '', OPENINGS: params.openings || '1',
      DESCRIPTION: params.description || '', RESPONSIBILITIES: params.responsibilities || '',
      REQUIREMENTS: params.requirements || '', ELIGIBILITY_CRITERIA: params.eligibilityCriteria || '',
      APPLICATION_DEADLINE: params.applicationDeadline || '',
      STATUS: 'ACTIVE', POSTED_BY: user.USER_ID, CREATED_AT: now(), UPDATED_AT: now()
    });
    return successResponse({ jobId }, 'Job posted');
  } catch (e) {
    return errorResponse(e.message, 'CREATE_JOB_ERROR');
  }
}

function handleCreateInternship(params) {
  try {
    const { user } = requireAuth(params, [CONFIG.ROLES.ADMIN]);
    validateRequired(params, ['title', 'company']);
    const internshipId = generateId(CONFIG.ID_PREFIXES.INTERNSHIP, CONFIG.SHEETS.INTERNSHIPS);
    appendRow(CONFIG.SHEETS.INTERNSHIPS, {
      INTERNSHIP_ID: internshipId, TITLE: clean(params.title), COMPANY: clean(params.company),
      COMPANY_LOGO_URL: params.companyLogoUrl || '', LOCATION: params.location || '',
      WORK_MODE: params.workMode || 'Remote', STIPEND: params.stipend || '',
      DURATION_MONTHS: params.durationMonths || '', OPENINGS: params.openings || '1',
      DESCRIPTION: params.description || '', RESPONSIBILITIES: params.responsibilities || '',
      REQUIREMENTS: params.requirements || '', ELIGIBILITY_CRITERIA: params.eligibilityCriteria || '',
      APPLICATION_DEADLINE: params.applicationDeadline || '',
      STATUS: 'ACTIVE', POSTED_BY: user.USER_ID, CREATED_AT: now(), UPDATED_AT: now()
    });
    return successResponse({ internshipId }, 'Internship posted');
  } catch (e) {
    return errorResponse(e.message, 'CREATE_INTERNSHIP_ERROR');
  }
}
