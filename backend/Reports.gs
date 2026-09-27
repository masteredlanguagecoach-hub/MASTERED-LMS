// ============================================================
// Reports.gs — Admin dashboard and reports
// Mastered Skill Academy LMS
// ============================================================

function handleGetAdminDashboard(params) {
  try {
    const { user } = requireAuth(params, [CONFIG.ROLES.ADMIN, CONFIG.ROLES.STAFF]);

    const students = getAllFromSheet(CONFIG.SHEETS.STUDENTS);
    const activeStudents = students.filter(s => s.STATUS === 'ACTIVE');
    const trainers = getAllFromSheet(CONFIG.SHEETS.TRAINERS);
    const batches = getAllFromSheet(CONFIG.SHEETS.BATCHES);
    const activeBatches = batches.filter(b => b.STATUS === 'ACTIVE');
    const courses = getAllFromSheet(CONFIG.SHEETS.COURSES).filter(c => c.STATUS === 'ACTIVE');
    const fees = getAllFromSheet(CONFIG.SHEETS.FEES);
    const applications = getAllFromSheet(CONFIG.SHEETS.APPLICATIONS);

    // Fee metrics (calculated from DB values)
    const totalFees = fees.reduce((sum, f) => sum + (parseFloat(f.TOTAL_AMOUNT) || 0), 0);
    const totalPaid = fees.reduce((sum, f) => sum + (parseFloat(f.PAID_AMOUNT) || 0), 0);
    const totalPending = fees.reduce((sum, f) => sum + (parseFloat(f.PENDING_AMOUNT) || 0), 0);

    // Attendance metrics
    const allAttendance = getAllFromSheet(CONFIG.SHEETS.CLASS_ATTENDANCE);
    const presentCount = allAttendance.filter(a => a.STATUS === 'PRESENT' || a.STATUS === 'LATE').length;
    const overallAttendance = allAttendance.length > 0
      ? Math.round((presentCount / allAttendance.length) * 100) : 0;

    // Assessment metrics
    const studentAssessments = getAllFromSheet(CONFIG.SHEETS.STUDENT_ASSESSMENTS);
    const passedAssessments = studentAssessments.filter(sa => sa.STATUS === 'PASSED').length;
    const assessmentPassRate = studentAssessments.length > 0
      ? Math.round((passedAssessments / studentAssessments.length) * 100) : 0;

    // Placement metrics
    const placements = getAllFromSheet(CONFIG.SHEETS.PLACEMENT_PROFILES);
    const eligibleCount = placements.filter(p => p.PLACEMENT_ELIGIBLE === 'true').length;

    // Application outcomes
    const selectedApps = applications.filter(a =>
      ['SELECTED', 'OFFER_RECEIVED', 'JOINED'].includes(a.STATUS)
    ).length;

    // Recent activities for dashboard feed
    const recentStudents = students
      .sort((a, b) => new Date(b.CREATED_AT) - new Date(a.CREATED_AT))
      .slice(0, 5);

    return successResponse({
      stats: {
        totalStudents: students.length,
        activeStudents: activeStudents.length,
        totalTrainers: trainers.length,
        totalBatches: batches.length,
        activeBatches: activeBatches.length,
        totalCourses: courses.length,
        overallAttendance,
        assessmentPassRate,
        placementEligible: eligibleCount,
        totalApplications: applications.length,
        successfulPlacements: selectedApps
      },
      fees: {
        totalFees: Math.round(totalFees),
        totalPaid: Math.round(totalPaid),
        totalPending: Math.round(totalPending),
        collectionRate: totalFees > 0 ? Math.round((totalPaid / totalFees) * 100) : 0
      },
      recentStudents,
      applications: {
        total: applications.length,
        applied: applications.filter(a => a.STATUS === 'APPLIED').length,
        shortlisted: applications.filter(a => a.STATUS === 'SHORTLISTED').length,
        selected: selectedApps
      }
    });
  } catch (e) {
    return errorResponse(e.message, 'ADMIN_DASHBOARD_ERROR');
  }
}

function handleGetReports(params) {
  try {
    const { user } = requireAuth(params, [CONFIG.ROLES.ADMIN, CONFIG.ROLES.STAFF]);
    const reportType = params.reportType || 'overview';

    switch (reportType) {
      case 'attendance':
        return getAttendanceReport(params);
      case 'fees':
        return getFeeReport(params);
      case 'assessment':
        return getAssessmentReport(params);
      case 'placements':
        return getPlacementReport(params);
      default:
        return getOverviewReport(params);
    }
  } catch (e) {
    return errorResponse(e.message, 'REPORTS_ERROR');
  }
}

function getAttendanceReport(params) {
  const students = getAllFromSheet(CONFIG.SHEETS.STUDENTS).filter(s => s.STATUS === 'ACTIVE');
  const attendance = getAllFromSheet(CONFIG.SHEETS.CLASS_ATTENDANCE);

  const report = students.map(s => {
    const sAttendance = attendance.filter(a => a.STUDENT_ID === s.STUDENT_ID);
    const present = sAttendance.filter(a => a.STATUS === 'PRESENT' || a.STATUS === 'LATE').length;
    const percent = sAttendance.length > 0 ? Math.round((present / sAttendance.length) * 100) : 0;
    return {
      studentId: s.STUDENT_ID, name: s.FULL_NAME, admissionNumber: s.ADMISSION_NUMBER,
      total: sAttendance.length, present, absent: sAttendance.length - present, percent
    };
  });
  return successResponse(report);
}

function getFeeReport(params) {
  const fees = getAllFromSheet(CONFIG.SHEETS.FEES);
  const students = getAllFromSheet(CONFIG.SHEETS.STUDENTS);
  const courses = getAllFromSheet(CONFIG.SHEETS.COURSES);

  const report = fees.map(f => {
    const student = students.find(s => s.STUDENT_ID === f.STUDENT_ID);
    const course = courses.find(c => c.COURSE_ID === f.COURSE_ID);
    return {
      ...f,
      studentName: student ? student.FULL_NAME : 'Unknown',
      admissionNumber: student ? student.ADMISSION_NUMBER : '',
      courseTitle: course ? course.TITLE : '',
      courseShortCode: course ? course.SHORT_CODE : '',
      courseDefaultFee: course && course.DEFAULT_FEE ? parseFloat(course.DEFAULT_FEE) : 0,
      totalAmount: parseFloat(f.TOTAL_AMOUNT) || 0,
      paidAmount: parseFloat(f.PAID_AMOUNT) || 0,
      pendingAmount: parseFloat(f.PENDING_AMOUNT) || 0,
      registrationFee: parseFloat(f.REGISTRATION_FEE) || 0,
      tuitionFee: parseFloat(f.TUITION_FEE) || 0,
      discountAmount: parseFloat(f.DISCOUNT_AMOUNT) || 0,
      otherCharges: parseFloat(f.OTHER_CHARGES) || 0,
      notes: f.NOTES || ''
    };
  });
  return successResponse(report);
}

function getAssessmentReport(params) {
  const studentAssessments = getAllFromSheet(CONFIG.SHEETS.STUDENT_ASSESSMENTS);
  const assessments = getAllFromSheet(CONFIG.SHEETS.ASSESSMENTS);
  const students = getAllFromSheet(CONFIG.SHEETS.STUDENTS);

  const report = studentAssessments.map(sa => {
    const assessment = assessments.find(a => a.ASSESSMENT_ID === sa.ASSESSMENT_ID);
    const student = students.find(s => s.STUDENT_ID === sa.STUDENT_ID);
    return {
      ...sa,
      assessmentTitle: assessment ? assessment.TITLE : 'Unknown',
      studentName: student ? student.FULL_NAME : 'Unknown',
      admissionNumber: student ? student.ADMISSION_NUMBER : ''
    };
  });
  return successResponse(report);
}

function getPlacementReport(params) {
  const profiles = getAllFromSheet(CONFIG.SHEETS.PLACEMENT_PROFILES);
  const students = getAllFromSheet(CONFIG.SHEETS.STUDENTS);
  const applications = getAllFromSheet(CONFIG.SHEETS.APPLICATIONS);

  const report = profiles.map(p => {
    const student = students.find(s => s.STUDENT_ID === p.STUDENT_ID);
    const apps = applications.filter(a => a.STUDENT_ID === p.STUDENT_ID);
    return {
      ...p,
      studentName: student ? student.FULL_NAME : 'Unknown',
      admissionNumber: student ? student.ADMISSION_NUMBER : '',
      applicationCount: apps.length,
      latestStatus: apps.length > 0 ? apps.sort((a, b) => new Date(b.APPLIED_AT) - new Date(a.APPLIED_AT))[0].STATUS : 'NONE'
    };
  });
  return successResponse(report);
}

function getOverviewReport(params) {
  return successResponse({
    totalStudents: getAllFromSheet(CONFIG.SHEETS.STUDENTS).length,
    totalCourses: getAllFromSheet(CONFIG.SHEETS.COURSES).length,
    totalBatches: getAllFromSheet(CONFIG.SHEETS.BATCHES).length,
    totalPayments: getAllFromSheet(CONFIG.SHEETS.PAYMENTS).length
  });
}
