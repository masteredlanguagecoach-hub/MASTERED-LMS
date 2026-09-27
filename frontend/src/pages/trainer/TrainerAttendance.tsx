import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { trainerApi } from '../../api/client';
import { Student, Batch } from '../../types';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import { CalendarCheck, Save, CheckCircle2, UserCheck, UserX, Clock, Users } from 'lucide-react';

export default function TrainerAttendance() {
  const { data: batchesData } = useApi<Batch[]>(() => trainerApi.getBatches());
  const [selectedBatch, setSelectedBatch] = useState('');
  const [classDate, setClassDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'>>({});
  const [remarksMap, setRemarksMap] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const batches = batchesData || [];

  useEffect(() => {
    if (batches.length > 0 && !selectedBatch) {
      setSelectedBatch(batches[0].batchId);
    }
  }, [batches, selectedBatch]);

  const { data: studentsData, loading: loadingStudents } = useApi<Student[]>(
    () => (selectedBatch ? trainerApi.getBatchStudents(selectedBatch) : Promise.resolve({ success: true, data: [] })),
    [selectedBatch]
  );

  const students = studentsData || [];

  const setStatus = (studentId: string, status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED') => {
    setAttendanceMap((prev) => ({ ...prev, [studentId]: status }));
  };

  const setRemark = (studentId: string, text: string) => {
    setRemarksMap((prev) => ({ ...prev, [studentId]: text }));
  };

  const handleMarkAllPresent = () => {
    const nextMap: Record<string, 'PRESENT'> = {};
    students.forEach((s) => {
      nextMap[s.studentId] = 'PRESENT';
    });
    setAttendanceMap(nextMap);
  };

  const handleSaveAttendance = async () => {
    if (!selectedBatch || students.length === 0) return;

    setSaving(true);
    setSavedSuccess(false);

    try {
      const attendanceList = students.map((std) => ({
        studentId: std.studentId,
        status: attendanceMap[std.studentId] || 'PRESENT',
        remarks: remarksMap[std.studentId] || ''
      }));

      // Find or create attendance entry for this class
      await trainerApi.createClass({
        batchId: selectedBatch,
        classDate,
        startTime: '10:00 AM',
        title: `Regular Session • ${classDate}`,
        attendanceList: JSON.stringify(attendanceList)
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
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
            Daily Attendance & Attendance Compliance
          </h2>
          <p style={{ color: 'var(--gray-600)', fontSize: '0.9rem' }}>
            Mark student attendance per session. Updates aggregate attendance metrics and placement eligibility in real time.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={handleMarkAllPresent}
            disabled={students.length === 0}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <UserCheck size={18} />
            <span>Mark All Present</span>
          </button>

          <button
            onClick={handleSaveAttendance}
            disabled={saving || students.length === 0}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <Save size={18} />
            <span>{saving ? 'Writing to Sheets...' : 'Save & Publish Attendance'}</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div
          style={{
            padding: '12px 16px',
            background: '#dcfce7',
            border: '1px solid #86efac',
            borderRadius: 'var(--radius-md)',
            color: '#166534',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <CheckCircle2 size={18} />
          <span>Attendance successfully synced with CLASS_ATTENDANCE sheet!</span>
        </div>
      )}

      {/* Date & Batch Selectors */}
      <div className="card" style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ minWidth: 220 }}>
          <label className="form-label">Selected Batch</label>
          <select
            className="form-select"
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
          >
            {batches.length === 0 ? (
              <option value="">No authorized batches</option>
            ) : (
              batches.map((b) => (
                <option key={b.batchId} value={b.batchId}>
                  {b.batchName} ({b.batchId})
                </option>
              ))
            )}
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
        {loadingStudents ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-500)' }}>
            Loading students enrolled in {selectedBatch}...
          </div>
        ) : students.length === 0 ? (
          <div style={{ padding: 32 }}>
            <EmptyState
              icon={<Users size={48} color="var(--gray-400)" />}
              title="No students found in batch"
              description="No active students are currently enrolled in this batch."
            />
          </div>
        ) : (
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
                      <td>
                        <span
                          style={{
                            fontWeight: 700,
                            fontFamily: 'monospace',
                            color: '#1d4ed8',
                            background: '#eff6ff',
                            padding: '2px 8px',
                            borderRadius: 4
                          }}
                        >
                          {std.admissionNumber}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{std.fullName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{std.studentId}</div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            onClick={() => setStatus(std.studentId, 'PRESENT')}
                            className={`btn btn-sm ${currentStatus === 'PRESENT' ? 'btn-success' : 'btn-outline'}`}
                            style={{
                              padding: '4px 10px',
                              borderRadius: 'var(--radius-sm)',
                              background: currentStatus === 'PRESENT' ? '#16a34a' : 'transparent',
                              color: currentStatus === 'PRESENT' ? '#fff' : 'var(--gray-700)',
                              borderColor: currentStatus === 'PRESENT' ? '#16a34a' : 'var(--gray-300)'
                            }}
                          >
                            Present
                          </button>

                          <button
                            type="button"
                            onClick={() => setStatus(std.studentId, 'ABSENT')}
                            className={`btn btn-sm ${currentStatus === 'ABSENT' ? 'btn-danger' : 'btn-outline'}`}
                            style={{
                              padding: '4px 10px',
                              borderRadius: 'var(--radius-sm)',
                              background: currentStatus === 'ABSENT' ? '#dc2626' : 'transparent',
                              color: currentStatus === 'ABSENT' ? '#fff' : 'var(--gray-700)',
                              borderColor: currentStatus === 'ABSENT' ? '#dc2626' : 'var(--gray-300)'
                            }}
                          >
                            Absent
                          </button>

                          <button
                            type="button"
                            onClick={() => setStatus(std.studentId, 'LATE')}
                            className={`btn btn-sm ${currentStatus === 'LATE' ? 'btn-warning' : 'btn-outline'}`}
                            style={{
                              padding: '4px 10px',
                              borderRadius: 'var(--radius-sm)',
                              background: currentStatus === 'LATE' ? '#d97706' : 'transparent',
                              color: currentStatus === 'LATE' ? '#fff' : 'var(--gray-700)',
                              borderColor: currentStatus === 'LATE' ? '#d97706' : 'var(--gray-300)'
                            }}
                          >
                            Late
                          </button>

                          <button
                            type="button"
                            onClick={() => setStatus(std.studentId, 'EXCUSED')}
                            className={`btn btn-sm ${currentStatus === 'EXCUSED' ? 'btn-secondary' : 'btn-outline'}`}
                            style={{
                              padding: '4px 10px',
                              borderRadius: 'var(--radius-sm)',
                              background: currentStatus === 'EXCUSED' ? 'var(--gray-600)' : 'transparent',
                              color: currentStatus === 'EXCUSED' ? '#fff' : 'var(--gray-700)',
                              borderColor: currentStatus === 'EXCUSED' ? 'var(--gray-600)' : 'var(--gray-300)'
                            }}
                          >
                            Excused
                          </button>
                        </div>
                      </td>
                      <td>
                        <input
                          type="text"
                          className="form-input"
                          style={{ padding: '6px 10px', fontSize: '0.85rem' }}
                          placeholder="Optional remarks..."
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
        )}
      </div>
    </div>
  );
}
