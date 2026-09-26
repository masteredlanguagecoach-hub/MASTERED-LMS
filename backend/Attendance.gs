// ============================================================
// Attendance.gs — Attendance handlers
// Mastered Skill Academy LMS
// ============================================================

function handleGetAttendance(params) {
  try {
    const { user } = requireAuth(params, null);
    let studentId = params.studentId;

    if (user.ROLE === CONFIG.ROLES.STUDENT) {
      const student = findByField(CONFIG.SHEETS.STUDENTS, 'USER_ID', user.USER_ID);
      if (!student) return errorResponse('Student not found', 'NOT_FOUND');
      studentId = student.STUDENT_ID; // Always derive from session
    } else {
      if (!studentId) return errorResponse('studentId required', 'MISSING_FIELD');
    }

    const attendance = findAllByField(CONFIG.SHEETS.CLASS_ATTENDANCE, 'STUDENT_ID', studentId);
    const classes = getAllFromSheet(CONFIG.SHEETS.CLASSES);

    // Enrich attendance with class details
    const enriched = attendance.map(a => {
      const cls = classes.find(c => c.CLASS_ID === a.CLASS_ID);
      return { ...a, class: cls || null };
    }).sort((a, b) => {
      const dateA = a.class ? new Date(a.class.CLASS_DATE) : new Date(0);
      const dateB = b.class ? new Date(b.class.CLASS_DATE) : new Date(0);
      return dateB - dateA;
    });

    // Calculate overall stats
    const total = enriched.length;
    const present = enriched.filter(a => a.STATUS === 'PRESENT' || a.STATUS === 'LATE').length;
    const absent = enriched.filter(a => a.STATUS === 'ABSENT').length;
    const excused = enriched.filter(a => a.STATUS === 'EXCUSED').length;
    const late = enriched.filter(a => a.STATUS === 'LATE').length;
    const attendancePercent = total > 0 ? Math.round((present / total) * 100) : 0;

    // Module-wise attendance
    const moduleAttendance = {};
    enriched.forEach(a => {
      if (a.class && a.class.MODULE_ID) {
        const mid = a.class.MODULE_ID;
        if (!moduleAttendance[mid]) moduleAttendance[mid] = { total: 0, present: 0, absent: 0 };
        moduleAttendance[mid].total++;
        if (a.STATUS === 'PRESENT' || a.STATUS === 'LATE') moduleAttendance[mid].present++;
        if (a.STATUS === 'ABSENT') moduleAttendance[mid].absent++;
      }
    });

    // Add module names
    const modules = getAllFromSheet(CONFIG.SHEETS.MODULES);
    const moduleStats = Object.entries(moduleAttendance).map(([mid, stats]) => {
      const mod = modules.find(m => m.MODULE_ID === mid);
      return {
        moduleId: mid,
        moduleName: mod ? mod.TITLE : 'Unknown',
        ...stats,
        percent: stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0
      };
    });

    const minAttendance = getNumericSetting('MIN_ATTENDANCE_PERCENT', CONFIG.MIN_ATTENDANCE_PERCENT);

    return successResponse({
      summary: { total, present, absent, excused, late, attendancePercent, minRequired: minAttendance },
      moduleWise: moduleStats,
      history: enriched
    });
  } catch (e) {
    return errorResponse(e.message, 'GET_ATTENDANCE_ERROR');
  }
}

function handleGetClassAttendance(params) {
  try {
    const { user } = requireAuth(params, [CONFIG.ROLES.TRAINER, CONFIG.ROLES.ADMIN]);
    validateRequired(params, ['classId']);
    const attendance = findAllByField(CONFIG.SHEETS.CLASS_ATTENDANCE, 'CLASS_ID', params.classId);
    return successResponse(attendance);
  } catch (e) {
    return errorResponse(e.message, 'GET_CLASS_ATTENDANCE_ERROR');
  }
}
