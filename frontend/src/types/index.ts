// ============================================================
// types/index.ts — Shared TypeScript types
// Mastered Skill Academy LMS
// ============================================================

export type UserRole = 'ADMIN' | 'TRAINER' | 'STUDENT' | 'STAFF';

export interface User {
  userId: string;
  admissionNumber: string;
  fullName: string;
  email: string;
  mobile: string;
  role: UserRole;
  profileImageUrl?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: User | null;
  isLoading: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T | null;
  message?: string;
  error?: string;
  code?: string;
}

export interface Student {
  studentId: string;
  userId: string;
  admissionNumber: string;
  fullName: string;
  email: string;
  mobile: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  guardianName?: string;
  guardianMobile?: string;
  profileImageUrl?: string;
  courseId: string;
  batchId: string;
  enrollmentDate: string;
  status: string;
}

export interface Course {
  courseId: string;
  title: string;
  shortCode: string;
  description: string;
  durationWeeks: string;
  durationHours: string;
  level: string;
  thumbnailUrl?: string;
  status: string;
  defaultFee?: number | string;
}

export interface Batch {
  batchId: string;
  batchName: string;
  courseId: string;
  trainerId: string;
  startDate: string;
  endDate: string;
  schedule: string;
  timing: string;
  venue: string;
  mode: string;
  maxStudents: string;
  status: string;
}

export interface Module {
  moduleId: string;
  courseId: string;
  title: string;
  description: string;
  sequence: number;
  durationHours: string;
  status: string;
  // Enriched fields
  totalLessons?: number;
  completedLessons?: number;
  progressPercent?: number;
  isLocked?: boolean;
  moduleStatus?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface Lesson {
  lessonId: string;
  moduleId: string;
  title: string;
  description: string;
  content?: string;
  videoUrl?: string;
  pdfUrl?: string;
  audioUrl?: string;
  resourceUrl?: string;
  sequence: number;
  isRequired: string;
  status: string;
  // Enriched
  isCompleted?: boolean;
  isLocked?: boolean;
  startedAt?: string;
  completedAt?: string;
}

export interface AttendanceSummary {
  total: number;
  present: number;
  absent: number;
  excused: number;
  late: number;
  attendancePercent: number;
  minRequired: number;
}

export interface AttendanceRecord {
  attendanceId: string;
  classId: string;
  batchId: string;
  studentId: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  markedAt: string;
  remarks?: string;
  class?: ClassRecord;
}

export interface ClassRecord {
  classId: string;
  batchId: string;
  moduleId?: string;
  trainerId?: string;
  classDate: string;
  startTime: string;
  endTime?: string;
  title: string;
  meetingLink?: string;
  recordingUrl?: string;
  status: string;
}

export interface Assessment {
  assessmentId: string;
  batchId: string;
  moduleId?: string;
  title: string;
  description?: string;
  type: string;
  totalMarks: string;
  passMark?: string;
  durationMinutes?: string;
  maxAttempts: string;
  startDate?: string;
  dueDate?: string;
  status: string;
  // Enriched
  studentStatus?: string;
  score?: string | null;
  percentage?: string | null;
}

export interface Question {
  questionId: string;
  questionText: string;
  type: string;
  options?: string;
  marks: string;
}

export interface Assignment {
  assignmentId: string;
  batchId: string;
  moduleId?: string;
  trainerId?: string;
  title: string;
  description?: string;
  instructions?: string;
  resourceUrl?: string;
  maxMarks: string;
  dueDate: string;
  submissionType: string;
  status: string;
  // Enriched
  submissionStatus?: string;
  submission?: Submission | null;
}

export interface Submission {
  submissionId: string;
  assignmentId: string;
  studentId: string;
  submissionText?: string;
  fileUrl?: string;
  fileName?: string;
  submittedAt: string;
  status: 'PENDING' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
  marksAwarded?: string;
  feedback?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface FeeRecord {
  feeId: string;
  studentId: string;
  batchId: string;
  courseId: string;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  discountAmount?: number;
  progressPercent: number;
  status: 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'CANCELLED';
}

export interface Installment {
  installmentId: string;
  feeId: string;
  studentId: string;
  installmentNumber: string;
  amount: string;
  dueDate: string;
  paidDate?: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
  remarks?: string;
}

export interface Payment {
  paymentId: string;
  feeId: string;
  installmentId?: string;
  studentId: string;
  amount: string;
  paymentDate: string;
  paymentMode: string;
  transactionId?: string;
  status: string;
}

export interface ChatMessage {
  messageId: string;
  batchId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  messageText: string;
  fileUrl?: string;
  fileName?: string;
  messageType: string;
  replyTo?: string;
  status: string;
  createdAt: string;
}

export interface Announcement {
  announcementId: string;
  batchId: string;
  title: string;
  content: string;
  type: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  publishedBy: string;
  publishedAt: string;
  expiresAt?: string;
  status: string;
}

export interface Notification {
  notificationId: string;
  userId: string;
  title: string;
  body: string;
  type: string;
  entityType?: string;
  entityId?: string;
  isRead: string;
  readAt?: string;
  createdAt: string;
}

export interface PlacementProfile {
  placementId: string;
  studentId: string;
  resumeUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  skills?: string;
  mockInterviewDone: string;
  mockScore?: string;
  placementEligible: string;
  readinessPercent: string;
  status?: string;
}

export interface PlacementReadiness {
  eligible: boolean;
  readinessPercent: number;
  criteria: Array<{
    name: string;
    value: string;
    required: string;
    met: boolean;
  }>;
  attendancePercent: number;
  assessmentCompletion: number;
}

export interface Job {
  jobId: string;
  title: string;
  company: string;
  companyLogoUrl?: string;
  location: string;
  workMode: string;
  salaryMin?: string;
  salaryMax?: string;
  openings: string;
  description: string;
  responsibilities?: string;
  requirements?: string;
  eligibilityCriteria?: string;
  applicationDeadline?: string;
  status: string;
  createdAt: string;
}

export interface Internship {
  internshipId: string;
  title: string;
  company: string;
  companyLogoUrl?: string;
  location: string;
  workMode: string;
  stipend?: string;
  durationMonths?: string;
  openings: string;
  description: string;
  requirements?: string;
  applicationDeadline?: string;
  status: string;
  createdAt: string;
}

export interface Application {
  applicationId: string;
  studentId: string;
  jobId?: string;
  internshipId?: string;
  type: 'JOB' | 'INTERNSHIP';
  resumeUrl?: string;
  coverLetter?: string;
  status: 'APPLIED' | 'SHORTLISTED' | 'INTERVIEW_SCHEDULED' | 'INTERVIEW_COMPLETED' | 'SELECTED' | 'OFFER_RECEIVED' | 'JOINED' | 'REJECTED' | 'WITHDRAWN';
  appliedAt: string;
  interviewDate?: string;
  offerDetails?: string;
  joinedDate?: string;
  jobDetails?: Job;
  internshipDetails?: Internship;
}

export interface DashboardData {
  student: {
    studentId: string;
    fullName: string;
    admissionNumber: string;
    email: string;
    profileImageUrl?: string;
  };
  course: { courseId: string; title: string } | null;
  batch: { batchId: string; batchName: string; timing: string } | null;
  progress: {
    courseProgress: number;
    modulesCompleted: number;
    totalModules: number;
    lessonsCompleted: number;
    totalLessons: number;
    currentModule: { moduleId: string; title: string } | null;
  };
  attendance: { percent: number; total: number; present: number };
  classes: { today: ClassRecord[]; upcoming: ClassRecord[] };
  pendingAssignments: number;
  pendingAssessments: number;
  fee: {
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
    status: string;
  } | null;
  placement: { eligible: boolean; readinessPercent: number } | null;
  notifications: Notification[];
}

export type AssessmentCategory = 'A' | 'B' | 'C' | 'D' | 'E';

export type AssessmentType = 'Topic Test' | 'Presentation' | 'Topic Mock Interview' | 'Topic Attendance';

export interface AssessmentHistoryItem {
  saId?: string;
  id?: string;
  studentId: string;
  admissionNumber?: string;
  studentName?: string;
  courseId?: string;
  courseTitle?: string;
  courseName?: string;
  batchId?: string;
  batchName?: string;
  moduleId?: string;
  moduleTitle?: string;
  moduleName?: string;
  topic?: string;
  assessmentType: AssessmentType | string;
  date: string;
  marks: number | null;
  totalMarks: number;
  category: AssessmentCategory;
  isAbsent: boolean;
  trainerId?: string;
  trainerName?: string;
  trainer?: string;
  remarks?: string;
}

export interface AssessmentTypeSummary {
  count: number;
  completedCount?: number;
  totalMarks: number;
  avgMarks: number;
  averageScore?: number;
  categories: Record<AssessmentCategory, number>;
  categoryCounts?: Record<string, number>;
}

export interface AssessmentSummaryGroup {
  topicTests: AssessmentTypeSummary;
  presentations: AssessmentTypeSummary;
  mockInterviews: AssessmentTypeSummary;
}

export type PlacementStatus =
  | 'NOT_READY'
  | 'NEAR_COMPLETION'
  | 'ELIGIBLE'
  | 'INTERVIEW_ASSIGNED'
  | 'INTERVIEWED'
  | 'SHORTLISTED'
  | 'SELECTED'
  | 'OFFER_RECEIVED'
  | 'PLACED'
  | 'NOT_SELECTED'
  | 'ON_HOLD'
  | 'WITHDRAWN';

export interface PlacementCandidate {
  studentId: string;
  admissionNumber: string;
  fullName: string;
  name?: string;
  email: string;
  mobile: string;
  courseId: string;
  courseTitle: string;
  courseName?: string;
  batchId: string;
  batchName: string;
  progress: number;
  isCompleted: boolean;
  isNearCompletion: boolean;
  attendancePercent: number;
  attendance?: number;
  assessmentPerformance: {
    averageMark: number;
    totalCompleted: number;
    categoryCounts: Record<AssessmentCategory, number>;
  };
  placementStatus: PlacementStatus;
  placementEligible: boolean;
  interviewCount: number;
  lastInterviewDate?: string;
  lastInterviewResult?: string;
  lastInterviewCompany?: string;
  lastInterview?: any;
}

export interface InterviewRecord {
  interviewId: string;
  studentId: string;
  admissionNumber: string;
  company: string;
  position: string;
  round?: string;
  interviewType: string;
  interviewDate: string;
  interviewTime?: string;
  location?: string;
  assignedBy: string;
  assignedDate: string;
  status: 'ASSIGNED' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW' | string;
  result: 'PENDING' | 'SELECTED' | 'REJECTED' | 'WAITING' | 'OFFERED' | string;
  feedback?: string;
  remarks?: string;
}

export interface PlacementStatusHistoryItem {
  historyId: string;
  studentId: string;
  admissionNumber: string;
  previousStatus: string;
  newStatus: string;
  changedBy: string;
  changedDate: string;
  timestamp?: string;
  remarks?: string;
  notes?: string;
}

export interface FeeChangeHistoryItem {
  fchId: string;
  historyId?: string;
  studentId: string;
  feeId: string;
  oldFee: string;
  newFee: string;
  previousTotalFee?: number | string;
  newTotalFee?: number | string;
  changedBy: string;
  changedDate: string;
  timestamp?: string;
  reason?: string;
  notes?: string;
}

export interface ImportPreviewRow {
  rowIndex: number;
  admissionNumber: string;
  fullName: string;
  mobile: string;
  email: string;
  courseId: string;
  courseTitle: string;
  batchId: string;
  batchName: string;
  joiningDate: string;
  assignedFee: number;
  registrationFee: number;
  discount: number;
  status: string;
  isValid: boolean;
  isDuplicate: boolean;
  errors: string[];
}

export interface ImportPreviewResponse {
  totalRows: number;
  validRows: number;
  validCount?: number;
  invalidRows: number;
  invalidCount?: number;
  duplicateRows: number;
  duplicateCount?: number;
  preview: ImportPreviewRow[];
  rows?: ImportPreviewRow[];
}
