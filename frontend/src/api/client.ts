// ============================================================
// api/client.ts — API client for Google Apps Script backend
// Mastered Skill Academy LMS
// ============================================================

import { ApiResponse } from '../types';

const GAS_URL = import.meta.env.VITE_GAS_URL || '';

if (!GAS_URL) {
  console.warn(
    'VITE_GAS_URL not set. Set it in .env.local to connect to the Google Apps Script backend.'
  );
}

/**
 * Core API call function.
 * All requests go to the GAS web app URL with a POST body containing the action.
 */
async function apiCall<T = any>(
  action: string,
  params: Record<string, unknown> = {}
): Promise<ApiResponse<T>> {
  const token = localStorage.getItem('lms_token');

  const body = {
    action,
    ...params,
    ...(token ? { token } : {})
  };

  try {
    if (!GAS_URL) {
      throw new Error('Backend URL not configured. Please set VITE_GAS_URL in .env.local');
    }

    const response = await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' }, // GAS requires text/plain for CORS
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data: ApiResponse<T> = await response.json();
    return data;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Network error';
    return { success: false, data: null, error: message, code: 'NETWORK_ERROR' };
  }
}

// ── Auth ──────────────────────────────────────────────────────
export const authApi = {
  login: (identifier: string, password: string) =>
    apiCall('login', { identifier, password }),

  logout: () => apiCall('logout'),

  getCurrentUser: () => apiCall('getCurrentUser'),

  changePassword: (currentPassword: string, newPassword: string) =>
    apiCall('changePassword', { currentPassword, newPassword })
};

// ── Student ───────────────────────────────────────────────────
export const studentApi = {
  getDashboard: () => apiCall('getStudentDashboard'),
  getProfile: (studentId?: string) => apiCall('getStudentProfile', studentId ? { studentId } : {}),
  updateProfile: (studentId: string, data: Record<string, string>) =>
    apiCall('updateStudent', { studentId, ...data })
};

// ── Modules & Lessons ─────────────────────────────────────────
export const modulesApi = {
  getModules: (courseId?: string) => apiCall('getModules', courseId ? { courseId } : {}),
  getModuleDetails: (moduleId: string) => apiCall('getModuleDetails', { moduleId }),
  getLesson: (lessonId: string) => apiCall('getLesson', { lessonId }),
  completeLesson: (lessonId: string, timeSpentMinutes?: number) =>
    apiCall('completeLesson', { lessonId, ...(timeSpentMinutes ? { timeSpentMinutes } : {}) })
};

// ── Attendance ────────────────────────────────────────────────
export const attendanceApi = {
  getAttendance: (studentId?: string) =>
    apiCall('getAttendance', studentId ? { studentId } : {}),
  getClassAttendance: (classId: string) => apiCall('getClassAttendance', { classId }),
  markAttendance: (classId: string, attendanceList: Array<{studentId: string; status: string; remarks?: string}>) =>
    apiCall('markAttendance', { classId, attendanceList: JSON.stringify(attendanceList) })
};

// ── Assessments ───────────────────────────────────────────────
export const assessmentsApi = {
  getAssessments: (batchId?: string) => apiCall('getAssessments', batchId ? { batchId } : {}),
  getAssessmentDetails: (assessmentId: string) => apiCall('getAssessmentDetails', { assessmentId }),
  submitAssessment: (assessmentId: string, answers: Record<string, string>, startedAt?: string) =>
    apiCall('submitAssessment', { assessmentId, answers: JSON.stringify(answers), startedAt }),
  recordAssessment: (data: {
    studentId: string;
    moduleId: string;
    topic?: string;
    assessmentType: string;
    marks?: number | null;
    isAbsent?: boolean;
    remarks?: string;
    saId?: string;
  }) => apiCall('recordAssessment', data as Record<string, unknown>),
  getAssessmentHistory: (params?: { studentId?: string; batchId?: string; courseId?: string; moduleId?: string }) =>
    apiCall('getAssessmentHistory', (params || {}) as Record<string, unknown>)
};

// ── Assignments ───────────────────────────────────────────────
export const assignmentsApi = {
  getAssignments: (batchId?: string) => apiCall('getAssignments', batchId ? { batchId } : {}),
  submitAssignment: (assignmentId: string, data: { submissionText?: string; fileUrl?: string; fileName?: string }) =>
    apiCall('submitAssignment', { assignmentId, ...data })
};

// ── Fees ──────────────────────────────────────────────────────
export const feesApi = {
  getFees: (studentId?: string) => apiCall('getFees', studentId ? { studentId } : {}),
  getInstallments: (studentId?: string) => apiCall('getInstallments', studentId ? { studentId } : {}),
  getPayments: (studentId?: string) => apiCall('getPayments', studentId ? { studentId } : {}),
  editStudentFee: (
    studentIdOrData: any,
    totalAmount?: any,
    registrationFee?: any,
    tuitionFee?: any,
    discountAmount?: any,
    otherCharges?: any,
    reason?: any,
    notes?: any
  ) => {
    let payload: Record<string, unknown>;
    if (typeof studentIdOrData === 'object' && studentIdOrData !== null) {
      payload = studentIdOrData;
    } else {
      payload = {
        studentId: studentIdOrData,
        totalAmount,
        registrationFee,
        tuitionFee,
        discountAmount,
        otherCharges,
        reason,
        notes
      };
    }
    return apiCall('editStudentFee', payload);
  },
  getFeeHistory: (studentId?: string) => apiCall('getFeeHistory', studentId ? { studentId } : {})
};

// ── Chat & Announcements ──────────────────────────────────────
export const chatApi = {
  getMessages: (batchId?: string, page?: number) =>
    apiCall('getChatMessages', { ...(batchId ? { batchId } : {}), ...(page ? { page } : {}) }),
  sendMessage: (batchId: string, messageText: string, fileUrl?: string) =>
    apiCall('sendChatMessage', { batchId, messageText, ...(fileUrl ? { fileUrl } : {}) }),
  getAnnouncements: (batchId?: string) =>
    apiCall('getAnnouncements', batchId ? { batchId } : {})
};

// ── Notifications ─────────────────────────────────────
export const notificationsApi = {
  getNotifications: () => apiCall('getNotifications'),
  markRead: (notificationId: string) => apiCall('markNotificationRead', { notificationId }),
  markAllRead: () => apiCall('markAllNotificationsRead')
};

// ── Placements ────────────────────────────────────────────────
export const placementsApi = {
  getPlacements: (studentId?: string) => apiCall('getPlacements', studentId ? { studentId } : {}),
  updateProfile: (data: Record<string, string>) => apiCall('updatePlacementProfile', data),
  getCandidates: (params?: {
    courseId?: string;
    batchId?: string;
    status?: string;
    completionFilter?: string;
    minProgress?: number;
    minAttendance?: number;
  }) => apiCall('getPlacementCandidates', (params || {}) as Record<string, unknown>),
  getPlacementCandidates: (params?: any) => apiCall('getPlacementCandidates', (params || {}) as Record<string, unknown>),
  getPlacementProfile: (studentId?: string) => apiCall('getPlacementProfile', studentId ? { studentId } : {}),
  updatePlacementStatus: (studentId: string, newStatus: string, remarks?: string) =>
    apiCall('updatePlacementStatus', { studentId, newStatus, remarks: remarks || '' }),
  assignInterview: (studentIdOrData: any, data?: any) => {
    const payload = typeof studentIdOrData === 'string'
      ? { studentId: studentIdOrData, ...(data || {}) }
      : (studentIdOrData || {});
    return apiCall('assignInterview', payload as Record<string, unknown>);
  },
  updateInterview: (
    interviewId: string,
    data: {
      status?: string;
      result?: string;
      feedback?: string;
      remarks?: string;
      interviewDate?: string;
      interviewTime?: string;
      location?: string;
    }
  ) => apiCall('updateInterview', { interviewId, ...data } as Record<string, unknown>),
  getInterviewHistory: (studentId?: string) => apiCall('getInterviewHistory', studentId ? { studentId } : {}),
  getPlacementStatusHistory: (studentId?: string) => apiCall('getPlacementStatusHistory', studentId ? { studentId } : {})
};

// ── Jobs & Internships ────────────────────────────────────────
export const jobsApi = {
  getJobs: () => apiCall('getJobs'),
  getInternships: () => apiCall('getInternships'),
  applyForJob: (jobId: string, resumeUrl?: string, coverLetter?: string) =>
    apiCall('applyForJob', { jobId, ...(resumeUrl ? { resumeUrl } : {}), ...(coverLetter ? { coverLetter } : {}) }),
  applyForInternship: (internshipId: string, resumeUrl?: string, coverLetter?: string) =>
    apiCall('applyForInternship', { internshipId, ...(resumeUrl ? { resumeUrl } : {}), ...(coverLetter ? { coverLetter } : {}) }),
  getApplications: (studentId?: string) =>
    apiCall('getApplications', studentId ? { studentId } : {})
};

// ── Trainer ───────────────────────────────────────────────────
export const trainerApi = {
  getDashboard: () => apiCall('getTrainerDashboard'),
  getBatches: () => apiCall('getTrainerBatches'),
  getBatchStudents: (batchId: string) => apiCall('getBatchStudents', { batchId }),
  createClass: (data: Record<string, string>) => apiCall('createClass', data),
  publishAnnouncement: (data: Record<string, string>) => apiCall('publishAnnouncement', data),
  createAssignment: (data: Record<string, string>) => apiCall('createAssignment', data),
  reviewAssignment: (submissionId: string, status: string, feedback?: string, marksAwarded?: string) =>
    apiCall('reviewAssignment', { submissionId, status, ...(feedback ? { feedback } : {}), ...(marksAwarded ? { marksAwarded } : {}) })
};

// ── Admin ─────────────────────────────────────────────────────
export const adminApi = {
  getDashboard: () => apiCall('getAdminDashboard'),
  getStudents: (batchId?: string) => apiCall('getStudents', batchId ? { batchId } : {}),
  createStudent: (data: Record<string, string>) => apiCall('createStudent', data),
  validateStudentImport: (rows: unknown[]) => apiCall('validateStudentImport', { rows }),
  confirmStudentImport: (validRows: unknown[]) => apiCall('confirmStudentImport', { validRows }),
  getCourses: () => apiCall('getCourses'),
  createCourse: (data: Record<string, string>) => apiCall('createCourse', data),
  updateCourse: (data: { courseId: string; defaultFee?: string; title?: string; shortCode?: string; description?: string }) =>
    apiCall('updateCourse', data as Record<string, unknown>),
  getBatches: (courseId?: string) => apiCall('getBatches', courseId ? { courseId } : {}),
  createBatch: (data: Record<string, string>) => apiCall('createBatch', data),
  createJob: (data: Record<string, string>) => apiCall('createJob', data),
  createInternship: (data: Record<string, string>) => apiCall('createInternship', data),
  updateApplication: (applicationId: string, status: string, data?: Record<string, string>) =>
    apiCall('updateApplication', { applicationId, status, ...data }),
  recordPayment: (data: Record<string, string>) => apiCall('recordPayment', data),
  getReports: (reportType: string) => apiCall('getReports', { reportType }),
  initializeDatabase: () => apiCall('initializeDatabase'),
  upgradeDatabase: () => apiCall('upgradeDatabase'),
  seedDemoData: () => apiCall('seedDemoData')
};

export default apiCall;
