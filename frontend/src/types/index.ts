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
