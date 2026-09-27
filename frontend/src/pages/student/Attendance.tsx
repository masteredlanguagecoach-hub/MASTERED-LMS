import React from 'react';
import { useApi } from '../../hooks/useApi';
import { attendanceApi } from '../../api/client';
import ProgressRing from '../../components/ui/ProgressRing';
import ProgressBar from '../../components/ui/ProgressBar';
import StatusBadge from '../../components/ui/StatusBadge';
import { CardSkeleton } from '../../components/ui/LoadingSkeleton';
import { CalendarCheck, AlertTriangle, CheckCircle2, Clock, XCircle, HelpCircle } from 'lucide-react';

interface AttendanceResponse {
  summary: {
    total: number;
    present: number;
    absent: number;
    excused: number;
    late: number;
    attendancePercent: number;
    minRequired: number;
  };
  moduleWise: Array<{
    moduleId: string;
    moduleName: string;
    total: number;
    present: number;
    absent: number;
    percent: number;
  }>;
  history: Array<{
    attendanceId: string;
    classId: string;
    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
    markedAt: string;
    remarks?: string;
    class?: {
      title: string;
      classDate: string;
      startTime: string;
      endTime?: string;
    };
  }>;
}

export default function Attendance() {
  const { data, loading, error } = useApi<AttendanceResponse>(() =>
    attendanceApi.getAttendance()
  );

  const defaultData: AttendanceResponse = {
    summary: {
      total: 0,
      present: 0,
      absent: 0,
      excused: 0,
      late: 0,
      attendancePercent: 0,
      minRequired: 75
    },
    moduleWise: [],
    history: []
  };

  const att = data || defaultData;
  const isEligible = att.summary.attendancePercent >= att.summary.minRequired;

  if (loading && !data) {
    return <CardSkeleton count={3} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Title */}
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gray-900)' }}>
          Attendance Tracking
        </h2>
        <p style={{ color: 'var(--gray-600)', fontSize: '0.9rem' }}>
          Real-time dynamic attendance metrics calculated from Google Sheets class records.
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
        {/* Progress Ring Card */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <ProgressRing
            percent={att.summary.attendancePercent}
            size={110}
            strokeWidth={10}
            color={isEligible ? '#22c55e' : '#ef4444'}
            label={`${att.summary.attendancePercent}%`}
            subLabel="Overall"
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <StatusBadge
                status={isEligible ? 'PRESENT' : 'ABSENT'}
                custom={{
                  label: isEligible ? 'ELIGIBLE' : 'BELOW THRESHOLD',
                  className: isEligible ? 'badge-success' : 'badge-danger'
                }}
              />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--gray-900)' }}>
              {isEligible ? 'Placement Eligible' : 'Attendance Warning'}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--gray-600)', marginTop: 4 }}>
              Minimum requirement: <strong>{att.summary.minRequired}%</strong>
            </p>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="card">
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--gray-700)', marginBottom: 12 }}>
            SESSION ATTENDANCE COUNTS
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            <div style={{ padding: '8px 12px', background: '#dcfce7', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#16a34a' }}>
                {att.summary.present}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 600 }}>Present</div>
            </div>
            <div style={{ padding: '8px 12px', background: '#fee2e2', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#dc2626' }}>
                {att.summary.absent}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#991b1b', fontWeight: 600 }}>Absent</div>
            </div>
            <div style={{ padding: '8px 12px', background: '#fef3c7', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#d97706' }}>
                {att.summary.late}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#92400e', fontWeight: 600 }}>Late</div>
            </div>
            <div style={{ padding: '8px 12px', background: 'var(--gray-100)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--gray-700)' }}>
                {att.summary.excused}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)', fontWeight: 600 }}>Excused</div>
            </div>
          </div>
        </div>
      </div>

      {/* Module-Wise Attendance */}
      <div className="card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: 16 }}>
          Module-Wise Attendance Breakdown
        </h3>
        {att.moduleWise.length === 0 ? (
          <div style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>
            No module attendance records recorded yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {att.moduleWise.map((mod) => (
              <div key={mod.moduleId}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: 6 }}>
                  <span style={{ fontWeight: 600, color: 'var(--gray-800)' }}>{mod.moduleName}</span>
                  <span style={{ fontWeight: 700, color: mod.percent >= 75 ? '#16a34a' : '#dc2626' }}>
                    {mod.percent}% ({mod.present}/{mod.total} classes)
                  </span>
                </div>
                <ProgressBar
                  percent={mod.percent}
                  variant={mod.percent >= 75 ? 'success' : 'danger'}
                  height={8}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Attendance History Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--gray-200)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--gray-900)' }}>
            Class-Wise Session History
          </h3>
        </div>
        <div className="table-wrap" style={{ border: 'none', borderRadius: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Class Title</th>
                <th>Status</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {att.history.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: 'var(--gray-500)' }}>
                    No class attendance records marked yet.
                  </td>
                </tr>
              ) : (
                att.history.map((record) => (
                <tr key={record.attendanceId}>
                  <td>
                    <div style={{ fontWeight: 600 }}>
                      {record.class?.classDate
                        ? new Date(record.class.classDate).toLocaleDateString()
                        : 'Session Date'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                      {record.class?.startTime || '10:00 AM'}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 500, color: 'var(--gray-900)' }}>
                      {record.class?.title || 'Lecture Session'}
                    </span>
                  </td>
                  <td>
                    <StatusBadge status={record.status} />
                  </td>
                  <td>
                    <span style={{ fontSize: '0.85rem', color: 'var(--gray-600)' }}>
                      {record.remarks || '—'}
                    </span>
                  </td>
                </tr>
              ))
            )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
