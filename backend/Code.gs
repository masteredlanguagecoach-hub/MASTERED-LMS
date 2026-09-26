// ============================================================
// Code.gs — Main entry point and API router
// Mastered Skill Academy LMS
// ============================================================

/**
 * Handle GET requests (for JSONP / simple reads).
 */
function doGet(e) {
  return handleRequest(e);
}

/**
 * Handle POST requests (for all mutations).
 */
function doPost(e) {
  return handleRequest(e);
}

/**
 * Central request router.
 * All requests come with an 'action' parameter.
 */
function handleRequest(e) {
  try {
    // Parse parameters from both GET and POST
    let params = {};

    if (e.postData && e.postData.contents) {
      try {
        params = JSON.parse(e.postData.contents);
      } catch (_) {
        params = e.parameter || {};
      }
    } else {
      params = e.parameter || {};
    }

    // Also merge URL params
    if (e.parameter) {
      Object.assign(params, e.parameter);
    }

    const action = params.action || '';

    if (!action) {
      return jsonOutput(errorResponse('No action specified', 'MISSING_ACTION'));
    }

    let result;

    switch (action) {

      // ── Auth ──────────────────────────────────────────────
      case 'login':               result = handleLogin(params); break;
      case 'logout':              result = handleLogout(params); break;
      case 'getCurrentUser':      result = handleGetCurrentUser(params); break;
      case 'changePassword':      result = handleChangePassword(params); break;

      // ── Users (Admin) ─────────────────────────────────────
      case 'getUsers':            result = handleGetUsers(params); break;
      case 'createUser':          result = handleCreateUser(params); break;
      case 'updateUser':          result = handleUpdateUser(params); break;
      case 'resetPassword':       result = handleResetPassword(params); break;

      // ── Students ──────────────────────────────────────────
      case 'getStudentDashboard': result = handleGetStudentDashboard(params); break;
      case 'getStudents':         result = handleGetStudents(params); break;
      case 'createStudent':       result = handleCreateStudent(params); break;
      case 'updateStudent':       result = handleUpdateStudent(params); break;
      case 'getStudentProfile':   result = handleGetStudentProfile(params); break;

      // ── Courses & Batches ─────────────────────────────────
      case 'getCourses':          result = handleGetCourses(params); break;
      case 'createCourse':        result = handleCreateCourse(params); break;
      case 'getBatches':          result = handleGetBatches(params); break;
      case 'createBatch':         result = handleCreateBatch(params); break;
      case 'getBatchStudents':    result = handleGetBatchStudents(params); break;

      // ── Modules & Lessons ─────────────────────────────────
      case 'getModules':          result = handleGetModules(params); break;
      case 'getModuleDetails':    result = handleGetModuleDetails(params); break;
      case 'getLesson':           result = handleGetLesson(params); break;
      case 'completeLesson':      result = handleCompleteLesson(params); break;
      case 'createModule':        result = handleCreateModule(params); break;
      case 'createLesson':        result = handleCreateLesson(params); break;

      // ── Attendance ────────────────────────────────────────
      case 'getAttendance':       result = handleGetAttendance(params); break;
      case 'getClassAttendance':  result = handleGetClassAttendance(params); break;
      case 'markAttendance':      result = handleMarkAttendance(params); break;
      case 'createClass':         result = handleCreateClass(params); break;

      // ── Assessments ───────────────────────────────────────
      case 'getAssessments':      result = handleGetAssessments(params); break;
      case 'getAssessmentDetails':result = handleGetAssessmentDetails(params); break;
      case 'submitAssessment':    result = handleSubmitAssessment(params); break;
      case 'createAssessment':    result = handleCreateAssessment(params); break;

      // ── Assignments ───────────────────────────────────────
      case 'getAssignments':      result = handleGetAssignments(params); break;
      case 'submitAssignment':    result = handleSubmitAssignment(params); break;
      case 'reviewAssignment':    result = handleReviewAssignment(params); break;
      case 'createAssignment':    result = handleCreateAssignment(params); break;

      // ── Fees & Payments ───────────────────────────────────
      case 'getFees':             result = handleGetFees(params); break;
      case 'getInstallments':     result = handleGetInstallments(params); break;
      case 'getPayments':         result = handleGetPayments(params); break;
      case 'recordPayment':       result = handleRecordPayment(params); break;

      // ── Chat & Announcements ──────────────────────────────
      case 'getChatMessages':     result = handleGetChatMessages(params); break;
      case 'sendChatMessage':     result = handleSendChatMessage(params); break;
      case 'getAnnouncements':    result = handleGetAnnouncements(params); break;
      case 'publishAnnouncement': result = handlePublishAnnouncement(params); break;

      // ── Notifications ─────────────────────────────────────
      case 'getNotifications':            result = handleGetNotifications(params); break;
      case 'markNotificationRead':        result = handleMarkNotificationRead(params); break;
      case 'markAllNotificationsRead':    result = handleMarkAllNotificationsRead(params); break;

      // ── Placements ────────────────────────────────────────
      case 'getPlacements':           result = handleGetPlacements(params); break;
      case 'updatePlacementProfile':  result = handleUpdatePlacementProfile(params); break;

      // ── Jobs & Internships ────────────────────────────────
      case 'getJobs':             result = handleGetJobs(params); break;
      case 'getInternships':      result = handleGetInternships(params); break;
      case 'createJob':           result = handleCreateJob(params); break;
      case 'createInternship':    result = handleCreateInternship(params); break;

      // ── Applications ──────────────────────────────────────
      case 'applyForJob':         result = handleApplyForJob(params); break;
      case 'applyForInternship':  result = handleApplyForInternship(params); break;
      case 'getApplications':     result = handleGetApplications(params); break;
      case 'updateApplication':   result = handleUpdateApplication(params); break;

      // ── Trainer Portal ────────────────────────────────────
      case 'getTrainerDashboard': result = handleGetTrainerDashboard(params); break;
      case 'getTrainerBatches':   result = handleGetTrainerBatches(params); break;

      // ── Admin Dashboard ───────────────────────────────────
      case 'getAdminDashboard':   result = handleGetAdminDashboard(params); break;
      case 'getReports':          result = handleGetReports(params); break;

      // ── Database setup ────────────────────────────────────
      case 'initializeDatabase':  result = { success: true, data: initializeDatabase() }; break;
      case 'seedDemoData':        result = { success: true, data: seedDemoData() }; break;

      default:
        result = errorResponse('Unknown action: ' + action, 'UNKNOWN_ACTION');
    }

    return jsonOutput(result);

  } catch (e) {
    Logger.log('doPost error: ' + e.message + '\n' + e.stack);
    return jsonOutput(errorResponse('Server error: ' + e.message, 'SERVER_ERROR'));
  }
}
