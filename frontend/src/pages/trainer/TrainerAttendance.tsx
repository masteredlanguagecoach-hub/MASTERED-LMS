import React, { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { trainerApi, attendanceApi } from '../../api/client';
import { Student } from '../../types';
import StatusBadge from '../../components/ui/StatusBadge';
import { CalendarCheck, Save, CheckCircle2, UserCheck, UserX, Clock } from 'lucide-react';

export default function TrainerAttendance() {
  const [selectedBatch, setSelectedBatch] = useState('BAT000001');
  const [classDate, setClassDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'>>({
    STD000001: 'PRESENT',
    STD000002: 'PRESENT',
    STD000003: 'LATE'
  });
  const [remarksMap, setRemarksMap] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const { data: studentsData } = useApi<Student[]>(
    () => trainerApi.getBatchStudents(selectedBatch),
    [selectedBatch]
  );

  const fallbackStudents: Student[] = [
    {
      studentId: 'STD000001',
      userId: 'USR000003',
      admissionNumber: 'STD000001',
      fullName: 'Priya Sharma',
      email: 'student@masteredskill.academy',
      mobile: '9000000003',
      courseId: 'CRS000001',
      batchId: 'BAT000001',
      enrollmentDate: '2026-01-01',
      status: 'ACTIVE'
    },
    {
      studentId: 'STD000002',
      userId: 'USR000004',
      admissionNumber: 'STD000002',
      fullName: 'Aman Verma',
      email: 'aman.verma@example.com',
      mobile: '9000000004',
      courseId: 'CRS000001',
      batchId: 'BAT000001',
      enrollmentDate: '2026-01-02',
      status: 'ACTIVE'
    },
    {
      studentId: 'STD000003',
      userId: 'USR000005',
      admissionNumber: 'STD000003',
      fullName: 'Sneha Patel',
      email: 'sneha.patel@example.com',
      mobile: '9000000005',
      courseId: 'CRS000001',
      batchId: 'BAT000001',
      enrollmentDate: '2026-01-03',
      status: 'ACTIVE'
    }
  ];

  const students = studentsData && studentsData.length > 0 ? studentsData : fallbackStudents;

  const setStatus = (studentId: string, status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED') => {
    setAttendanceMap(prev => ({ ...prev, [studentId]: status }));
  };

  const setRemark = (studentId: string, text: string) => {
    setRemarksMap(prev => ({ ...prev, [studentId]: text }));
  };

  const handleMarkAllPresent = () => {
    const nextMap: Record<string, 'PRESENT'> = {};
    students.forEach(s => { nextMap[s.studentId] = 'PRESENT'; });
    setAttendanceMap(nextMap);
  };

  const handleSaveAttendance = async () => {
    setSaving(true);
    setSavedSuccess(false);

    const list = students.map(s => ({
      studentId: s.studentId,
      status: attendanceMap[s.studentId] || 'PRESENT',
      remarks: remarksMap[s.studentId] || ''
    }));

    try {
      await attendanceApi.markAttendance('CLS000012', list);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gray-900)' }}>
            Mark Class Attendance
          </h2>
          <p style={{ color: 'var(--gray-600)', fontSize: '0.9rem' }}>
            Uses backend LockService to write attendance transactions directly to Google Sheets database.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={handleMarkAllPresent}
            className="btn btn-secondary btn-sm"
          >
            Mark All as Present
          </button>
          <button
            onClick={handleSaveAttendance}
            disabled={saving}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <Save size={18} />
            <span>{saving ? 'Writing to Sheets...' : 'Save & Publish Attendance'}</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div style={{ padding: '12px 16px', background: '#dcfce7', border: '1px solid #86efac', borderRadius: 'var(--radius-md)', color: '#166534', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle2 size={18} />
          <span>Attendance successfully synced with CLASS_ATTENDANCE sheet!</span>
        </div>
      )}

      {/* Date & Batch Selectors */}
      <div className="card" style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ minWidth: 200 }}>
          <label className="form-label">Selected Batch</label>
          <select
            className="form-select"
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
          >
            <option value="BAT000001">FSWD - Batch 2026 A</option>
            <option value="BAT000002">FSWD - Batch 2026 B</option>
          </select>
        </div>

        <div style={{ minWidth: 200 }}>
          <label className="form-label">Session Date</label>
          <input
            type="date"
            className="form-input"
            value={classDate}
            onChange={(e) => setClassDate(e.target.value)}
          />
        </div>
      </div>

      {/* Attendance Registry Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-wrap" style={{ border: 'none', borderRadius: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Admission No</th>
                <th>Student Name</th>
                <th>Attendance Status</th>
                <th>Remarks / Notes</th>
              </tr>
            </thead>
            <tbody>
              {students.map((std) => {
                const currentStatus = attendanceMap[std.studentId] || 'PRESENT';

                return (
                  <tr key={std.studentId}>
                    <td style={{ fontWeight: 600 }}>{std.admissionNumber}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{std.fullName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{std.email}</div>
                    </td>
                    <td>
                      <div style={{ display: 'inline-flex', background: 'var(--gray-100)', borderRadius: 'var(--radius-md)', padding: 3, gap: 4 }}>
                        <button
                          type="button"
                          onClick={() => setStatus(std.studentId, 'PRESENT')}
                          className={`btn btn-sm ${currentStatus === 'PRESENT' ? 'btn-primary' : ''}`}
                          style={{
                            padding: '4px 10px',
                            fontSize: '0.75rem',
                            background: currentStatus === 'PRESENT' ? '#16a34a' : 'transparent',
                            color: currentStatus === 'PRESENT' ? '#fff' : 'var(--gray-700)'
                          }}
                        >
                          Present
                        </button>

                        <button
                          type="button"
                          onClick={() => setStatus(std.studentId, 'LATE')}
                          className={`btn btn-sm ${currentStatus === 'LATE' ? 'btn-primary' : ''}`}
                          style={{
                            padding: '4px 10px',
                            fontSize: '0.75rem',
                            background: currentStatus === 'LATE' ? '#d97706' : 'transparent',
                            color: currentStatus === 'LATE' ? '#fff' : 'var(--gray-700)'
                          }}
                        >
                          Late
                        </button>

                        <button
                          type="button"
                          onClick={() => setStatus(std.studentId, 'ABSENT')}
                          className={`btn btn-sm ${currentStatus === 'ABSENT' ? 'btn-primary' : ''}`}
                          style={{
                            padding: '4px 10px',
                            fontSize: '0.75rem',
                            background: currentStatus === 'ABSENT' ? '#dc2626' : 'transparent',
                            color: currentStatus === 'ABSENT' ? '#fff' : 'var(--gray-700)'
                          }}
                        >
                          Absent
                        </button>

                        <button
                          type="button"
                          onClick={() => setStatus(std.studentId, 'EXCUSED')}
                          className={`btn btn-sm ${currentStatus === 'EXCUSED' ? 'btn-primary' : ''}`}
                          style={{
                            padding: '4px 10px',
                            fontSize: '0.75rem',
                            background: currentStatus === 'EXCUSED' ? '#4b5563' : 'transparent',
                            color: currentStatus === 'EXCUSED' ? '#fff' : 'var(--gray-700)'
                          }}
                        >
                          Excused
                        </button>
                      </div>
                    </td>
                    <td>
                      <input
                        type="text"
                        placeholder="Optional remarks..."
                        className="form-input"
                        style={{ padding: '6px 10px', fontSize: '0.85rem' }}
                        value={remarksMap[std.studentId] || ''}
                        onChange={(e) => setRemark(std.studentId, e.target.value)}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
