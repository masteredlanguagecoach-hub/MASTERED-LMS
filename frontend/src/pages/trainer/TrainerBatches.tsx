import React, { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { trainerApi } from '../../api/client';
import { Batch, Student } from '../../types';
import StatusBadge from '../../components/ui/StatusBadge';
import { CardSkeleton } from '../../components/ui/LoadingSkeleton';
import { Users, Calendar, Clock, MapPin, Search, ChevronRight, X } from 'lucide-react';

export default function TrainerBatches() {
  const [selectedBatch, setSelectedBatch] = useState<string>('BAT000001');
  const [studentModalOpen, setStudentModalOpen] = useState(false);

  const { data: batchesData, loading } = useApi<Batch[]>(() =>
    trainerApi.getBatches()
  );

  const { data: studentsData, loading: loadingStudents } = useApi<Student[]>(
    () => trainerApi.getBatchStudents(selectedBatch),
    [selectedBatch]
  );

  const fallbackBatches: Batch[] = [
    {
      batchId: 'BAT000001',
      batchName: 'FSWD - Batch 2026 A',
      courseId: 'CRS000001',
      trainerId: 'TRN000001',
      startDate: '2026-01-06',
      endDate: '2026-06-30',
      schedule: 'Monday, Wednesday, Friday',
      timing: '10:00 AM - 1:00 PM',
      venue: 'Online',
      mode: 'Online',
      maxStudents: '30',
      status: 'ACTIVE'
    },
    {
      batchId: 'BAT000002',
      batchName: 'FSWD - Batch 2026 B',
      courseId: 'CRS000001',
      trainerId: 'TRN000001',
      startDate: '2026-02-01',
      endDate: '2026-07-31',
      schedule: 'Tuesday, Thursday, Saturday',
      timing: '2:00 PM - 5:00 PM',
      venue: 'Online',
      mode: 'Online',
      maxStudents: '25',
      status: 'ACTIVE'
    }
  ];

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

  const batches = batchesData && batchesData.length > 0 ? batchesData : fallbackBatches;
  const students = studentsData && studentsData.length > 0 ? studentsData : fallbackStudents;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gray-900)' }}>
          My Assigned Batches & Enrolled Students
        </h2>
        <p style={{ color: 'var(--gray-600)', fontSize: '0.9rem' }}>
          Strict RBAC enforces that trainers only view authorized batches assigned by Academy administration.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {batches.map((batch) => (
          <div key={batch.batchId} className="card card-hover">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <span className="badge badge-primary">{batch.batchId}</span>
              <StatusBadge status={batch.status} />
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: 8 }}>
              {batch.batchName}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.85rem', color: 'var(--gray-600)', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Clock size={16} />
                <span>Timing: <strong>{batch.timing}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Calendar size={16} />
                <span>Days: {batch.schedule}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <MapPin size={16} />
                <span>Mode: {batch.mode} ({batch.venue})</span>
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedBatch(batch.batchId);
                setStudentModalOpen(true);
              }}
              className="btn btn-outline btn-full"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <Users size={16} />
              <span>View Enrolled Students</span>
            </button>
          </div>
        ))}
      </div>

      {/* Student Roster Modal */}
      {studentModalOpen && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 680 }}>
            <div className="modal-header">
              <h3 className="modal-title">Enrolled Students • {selectedBatch}</h3>
              <button className="modal-close" onClick={() => setStudentModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="table-wrap" style={{ border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-md)' }}>
              <table>
                <thead>
                  <tr>
                    <th>Admission No</th>
                    <th>Student Name</th>
                    <th>Contact</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((std) => (
                    <tr key={std.studentId}>
                      <td style={{ fontWeight: 600 }}>{std.admissionNumber}</td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{std.fullName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{std.email}</div>
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>{std.mobile}</td>
                      <td><StatusBadge status={std.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
              <button
                className="btn btn-secondary"
                onClick={() => setStudentModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
