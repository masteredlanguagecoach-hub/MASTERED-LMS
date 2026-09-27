import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { trainerApi } from '../../api/client';
import StatusBadge from '../../components/ui/StatusBadge';
import { CardSkeleton } from '../../components/ui/LoadingSkeleton';
import {
  Users,
  CalendarCheck,
  FileText,
  Clock,
  Video,
  PlusCircle,
  Megaphone,
  ArrowRight
} from 'lucide-react';

interface TrainerDashboardData {
  trainer: {
    trainerId: string;
    fullName: string;
    specialization: string;
  };
  stats: {
    totalBatches: number;
    totalStudents: number;
    todayClasses: number;
    pendingReviews: number;
  };
  batches: Array<{
    batchId: string;
    batchName: string;
    timing: string;
    mode: string;
    status: string;
  }>;
  todayClasses: Array<{
    classId: string;
    batchId: string;
    title: string;
    startTime: string;
    meetingLink?: string;
  }>;
}

export default function TrainerDashboard() {
  const navigate = useNavigate();
  const { data, loading, error } = useApi<TrainerDashboardData>(() =>
    trainerApi.getDashboard()
  );

  const defaultData: TrainerDashboardData = {
    trainer: {
      trainerId: '',
      fullName: '',
      specialization: ''
    },
    stats: {
      totalBatches: 0,
      totalStudents: 0,
      todayClasses: 0,
      pendingReviews: 0
    },
    batches: [],
    todayClasses: []
  };

  const td = data || defaultData;

  if (loading && !data) {
    return <CardSkeleton count={3} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Welcome Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)',
          color: '#fff',
          padding: '28px 32px'
        }}
      >
        <div style={{ display: 'inline-flex', padding: '4px 12px', background: 'rgba(255,255,255,0.15)', borderRadius: 999, fontSize: '0.75rem', fontWeight: 600, marginBottom: 12 }}>
          FACULTY & TRAINER PORTAL • ID: {td.trainer.trainerId}
        </div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: 6 }}>
          Welcome, {td.trainer.fullName}
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem' }}>
          Specialization: <strong>{td.trainer.specialization}</strong>
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: '#dbeafe', color: '#1d4ed8' }}>
            <Users size={24} />
          </div>
          <div>
            <div className="stat-card-value">{td.stats.totalStudents}</div>
            <div className="stat-card-label">Active Students</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: '#fef3c7', color: '#b45309' }}>
            <Clock size={24} />
          </div>
          <div>
            <div className="stat-card-value">{td.stats.todayClasses}</div>
            <div className="stat-card-label">Today's Live Classes</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: '#fee2e2', color: '#b91c1c' }}>
            <FileText size={24} />
          </div>
          <div>
            <div className="stat-card-value">{td.stats.pendingReviews}</div>
            <div className="stat-card-label">Pending Reviews</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: '#dcfce7', color: '#15803d' }}>
            <CalendarCheck size={24} />
          </div>
          <div>
            <div className="stat-card-value">{td.stats.totalBatches}</div>
            <div className="stat-card-label">Authorized Batches</div>
          </div>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <button
          onClick={() => navigate('/trainer/attendance')}
          className="btn btn-primary"
          style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
        >
          <CalendarCheck size={20} />
          <span>Mark Class Attendance</span>
        </button>

        <button
          onClick={() => navigate('/trainer/assignments')}
          className="btn btn-secondary"
          style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
        >
          <FileText size={20} />
          <span>Review Submissions ({td.stats.pendingReviews})</span>
        </button>

        <button
          onClick={() => navigate('/trainer/batches')}
          className="btn btn-secondary"
          style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
        >
          <Users size={20} />
          <span>View Batch Students</span>
        </button>
      </div>

      {/* Today's Schedule */}
      <div className="card">
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: 16 }}>
          Today's Scheduled Faculty Sessions
        </h3>

        {td.todayClasses.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--gray-500)', fontSize: '0.9rem' }}>
            No live classes scheduled for today.
          </div>
        ) : (
          td.todayClasses.map((cls) => (
            <div
              key={cls.classId}
              style={{
                padding: '16px 20px',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--primary-200)',
                background: 'var(--primary-50)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 16
              }}
            >
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-700)', textTransform: 'uppercase' }}>
                  Batch ID: {cls.batchId} • Starts {cls.startTime}
                </div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--gray-900)', marginTop: 2 }}>
                  {cls.title}
                </h4>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={() => navigate('/trainer/attendance')}
                  className="btn btn-secondary btn-sm"
                >
                  Mark Attendance
                </button>

                {cls.meetingLink && (
                  <a
                    href={cls.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <Video size={16} />
                    <span>Launch Google Meet</span>
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
