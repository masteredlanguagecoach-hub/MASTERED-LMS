import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { studentApi } from '../../api/client';
import { DashboardData } from '../../types';
import ProgressRing from '../../components/ui/ProgressRing';
import ProgressBar from '../../components/ui/ProgressBar';
import StatusBadge from '../../components/ui/StatusBadge';
import { DashboardSkeleton } from '../../components/ui/LoadingSkeleton';
import {
  BookOpen,
  CalendarCheck,
  FileText,
  Award,
  CreditCard,
  GraduationCap,
  Calendar,
  Clock,
  ArrowRight,
  Video,
  CheckCircle2,
  AlertCircle,
  Bell
} from 'lucide-react';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useApi<DashboardData>(() =>
    studentApi.getDashboard()
  );

  // Fallback demo data matching the database structure if backend URL is not yet connected
  const fallbackData: DashboardData = {
    student: {
      studentId: 'STD000001',
      fullName: 'Priya Sharma',
      admissionNumber: 'STD000001',
      email: 'student@masteredskill.academy'
    },
    course: {
      courseId: 'CRS000001',
      title: 'Full Stack Web Development'
    },
    batch: {
      batchId: 'BAT000001',
      batchName: 'FSWD - Batch 2026 A',
      timing: '10:00 AM - 1:00 PM'
    },
    progress: {
      courseProgress: 45,
      modulesCompleted: 2,
      totalModules: 4,
      lessonsCompleted: 9,
      totalLessons: 20,
      currentModule: {
        moduleId: 'MOD000003',
        title: 'React Frontend Development'
      }
    },
    attendance: {
      percent: 88,
      total: 25,
      present: 22
    },
    classes: {
      today: [
        {
          classId: 'CLS000012',
          batchId: 'BAT000001',
          classDate: new Date().toISOString(),
          startTime: '10:00 AM',
          endTime: '1:00 PM',
          title: 'React Hooks & State Architecture',
          meetingLink: 'https://meet.google.com/abc-defg-hij',
          status: 'SCHEDULED'
        }
      ],
      upcoming: [
        {
          classId: 'CLS000013',
          batchId: 'BAT000001',
          classDate: new Date(Date.now() + 86400000 * 2).toISOString(),
          startTime: '10:00 AM',
          endTime: '1:00 PM',
          title: 'Context API & Redux Toolkit',
          status: 'SCHEDULED'
        }
      ]
    },
    pendingAssignments: 2,
    pendingAssessments: 1,
    fee: {
      totalAmount: 45000,
      paidAmount: 15000,
      pendingAmount: 30000,
      status: 'PARTIAL'
    },
    placement: {
      eligible: false,
      readinessPercent: 68
    },
    notifications: [
      {
        notificationId: 'NTF001',
        userId: 'USR000003',
        title: 'New Assignment: React Portfolio Project',
        body: 'Submit your deployed portfolio link before Sunday 11:59 PM.',
        type: 'ASSIGNMENT',
        isRead: 'false',
        createdAt: new Date().toISOString()
      },
      {
        notificationId: 'NTF002',
        userId: 'USR000003',
        title: 'Assessment 2 Scheduled',
        body: 'JavaScript Essentials MCQ test opens tomorrow at 10 AM.',
        type: 'ASSESSMENT',
        isRead: 'false',
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
      }
    ]
  };

  const d = data || fallbackData;

  if (loading && !data) {
    return <DashboardSkeleton />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Welcome Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, var(--primary-900) 0%, var(--primary-700) 100%)',
          color: 'var(--white)',
          padding: '28px 32px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ maxWidth: 640 }}>
          <div style={{ display: 'inline-flex', padding: '4px 12px', background: 'rgba(255,255,255,0.12)', borderRadius: 999, fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.04em', marginBottom: 12 }}>
            ADMISSION NO: {d.student.admissionNumber}
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: 8 }}>
            Welcome back, {d.student.fullName}!
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem' }}>
            Course: <strong>{d.course?.title || 'Full Stack Web Development'}</strong> • Batch: <strong>{d.batch?.batchName || 'FSWD 2026'}</strong>
          </p>
        </div>

        {/* Current Module Tag */}
        {d.progress.currentModule && (
          <div
            style={{
              marginTop: 20,
              padding: '12px 18px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: 'var(--radius-md)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12
            }}
          >
            <BookOpen size={18} color="#93c5fd" />
            <span style={{ fontSize: '0.85rem' }}>
              Current Active Module: <strong>{d.progress.currentModule.title}</strong>
            </span>
            <button
              onClick={() => navigate('/modules')}
              className="btn btn-sm"
              style={{ background: '#3b82f6', color: '#fff', marginLeft: 8 }}
            >
              Resume Learning
            </button>
          </div>
        )}
      </div>

      {/* KPI Overview Cards */}
      <div className="dashboard-grid">
        {/* Course Progress */}
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'var(--primary-100)', color: 'var(--primary-600)' }}>
            <BookOpen size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <div className="stat-card-value">{d.progress.courseProgress}%</div>
            <div className="stat-card-label">Course Progress</div>
            <div style={{ marginTop: 8 }}>
              <ProgressBar percent={d.progress.courseProgress} height={6} />
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: 4 }}>
              {d.progress.modulesCompleted} of {d.progress.totalModules} modules done
            </div>
          </div>
        </div>

        {/* Attendance */}
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: '#dcfce7', color: '#16a34a' }}>
            <CalendarCheck size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <div className="stat-card-value">{d.attendance.percent}%</div>
            <div className="stat-card-label">Attendance Rate</div>
            <div style={{ marginTop: 8 }}>
              <ProgressBar percent={d.attendance.percent} variant={d.attendance.percent >= 75 ? 'success' : 'danger'} height={6} />
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: 4 }}>
              {d.attendance.present} of {d.attendance.total} sessions attended
            </div>
          </div>
        </div>

        {/* Pending Items */}
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
            <FileText size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <div className="stat-card-value">{d.pendingAssignments + d.pendingAssessments}</div>
            <div className="stat-card-label">Pending Tasks</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)', marginTop: 8 }}>
              {d.pendingAssignments} Assignments • {d.pendingAssessments} Assessments
            </div>
            <button
              onClick={() => navigate('/assignments')}
              className="btn btn-sm btn-outline"
              style={{ marginTop: 8, padding: '4px 10px', fontSize: '0.75rem' }}
            >
              View Tasks
            </button>
          </div>
        </div>

        {/* Fee Status */}
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: '#f3e8ff', color: '#9333ea' }}>
            <CreditCard size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="stat-card-value">₹{(d.fee?.pendingAmount || 0).toLocaleString()}</div>
              <StatusBadge status={d.fee?.status || 'PENDING'} />
            </div>
            <div className="stat-card-label">Pending Fee Balance</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: 4 }}>
              Paid ₹{(d.fee?.paidAmount || 0).toLocaleString()} / ₹{(d.fee?.totalAmount || 0).toLocaleString()}
            </div>
            <button
              onClick={() => navigate('/fees')}
              className="btn btn-sm btn-secondary"
              style={{ marginTop: 8, padding: '4px 10px', fontSize: '0.75rem' }}
            >
              Payment History
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Today's Class & Placement Readiness */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
        {/* Today & Upcoming Classes */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Calendar size={20} color="var(--primary-600)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Today & Upcoming Classes</h3>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>
              Batch: {d.batch?.timing || 'Online'}
            </span>
          </div>

          {d.classes.today.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {d.classes.today.map((cls) => (
                <div
                  key={cls.classId}
                  style={{
                    padding: 16,
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid var(--primary-200)',
                    background: 'var(--primary-50)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <span className="badge badge-primary">TODAY'S LIVE CLASS</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', color: 'var(--gray-600)' }}>
                      <Clock size={14} />
                      <span>{cls.startTime} - {cls.endTime || 'End'}</span>
                    </div>
                  </div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--gray-900)', marginBottom: 8 }}>
                    {cls.title}
                  </h4>
                  {cls.meetingLink && (
                    <a
                      href={cls.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary btn-sm"
                      style={{ marginTop: 4 }}
                    >
                      <Video size={16} />
                      <span>Join Live Class</span>
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--gray-500)', fontSize: '0.9rem' }}>
              No classes scheduled for today. Review completed lessons!
            </div>
          )}

          {/* Upcoming list */}
          {d.classes.upcoming.length > 0 && (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--gray-200)' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--gray-500)', marginBottom: 8, textTransform: 'uppercase' }}>
                Next Sessions:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {d.classes.upcoming.map((u) => (
                  <div key={u.classId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                    <span style={{ fontWeight: 500, color: 'var(--gray-800)' }}>{u.title}</span>
                    <span style={{ color: 'var(--gray-500)', fontSize: '0.75rem' }}>
                      {new Date(u.classDate).toLocaleDateString()} • {u.startTime}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Placement Readiness Ring & Status */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <GraduationCap size={20} color="var(--primary-600)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Placement Readiness</h3>
            </div>
            <StatusBadge
              status={d.placement?.eligible ? 'ACTIVE' : 'PENDING'}
              custom={{
                label: d.placement?.eligible ? 'ELIGIBLE' : 'IN PROGRESS',
                className: d.placement?.eligible ? 'badge-success' : 'badge-warning'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '12px 0' }}>
            <ProgressRing
              percent={d.placement?.readinessPercent || 0}
              size={110}
              strokeWidth={10}
              color={d.placement?.eligible ? '#22c55e' : '#3b82f6'}
              label={`${d.placement?.readinessPercent || 0}%`}
              subLabel="Score"
            />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle2 size={16} color={d.attendance.percent >= 75 ? '#22c55e' : '#9ca3af'} />
                <span>Attendance ≥ 75% ({d.attendance.percent}%)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle2 size={16} color="#22c55e" />
                <span>Assessments Passed</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertCircle size={16} color="#f59e0b" />
                <span>Resume & Mock Interview</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/placements')}
            className="btn btn-outline btn-full btn-sm"
            style={{ marginTop: 12 }}
          >
            <span>View Placement Roadmap & Jobs</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Notifications and Announcements Feed */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Bell size={20} color="var(--primary-600)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Recent Academy Announcements</h3>
          </div>
          <button
            onClick={() => navigate('/notifications')}
            className="btn btn-secondary btn-sm"
          >
            View All
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {d.notifications.map((notif) => (
            <div
              key={notif.notificationId}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--gray-50)',
                border: '1px solid var(--gray-200)'
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'var(--primary-100)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary-600)',
                  flexShrink: 0
                }}
              >
                <Bell size={16} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--gray-900)' }}>
                    {notif.title}
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                    {new Date(notif.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--gray-600)' }}>
                  {notif.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
