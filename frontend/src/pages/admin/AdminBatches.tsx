import React, { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { adminApi } from '../../api/client';
import { Batch, Course } from '../../types';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import { Calendar, Plus, Clock, Users, MapPin, X } from 'lucide-react';

export default function AdminBatches() {
  const { data, loading, refetch } = useApi<Batch[]>(() =>
    adminApi.getBatches()
  );
  const { data: coursesData } = useApi<Course[]>(() => adminApi.getCourses());

  const [modalOpen, setModalOpen] = useState(false);
  const [batchName, setBatchName] = useState('');
  const [courseId, setCourseId] = useState('');
  const [trainerId, setTrainerId] = useState('TRN000001');
  const [startDate, setStartDate] = useState('');
  const [schedule, setSchedule] = useState('Monday, Wednesday, Friday');
  const [timing, setTiming] = useState('10:00 AM - 1:00 PM');
  const [mode, setMode] = useState('Online');
  const [maxStudents, setMaxStudents] = useState('30');
  const [saving, setSaving] = useState(false);

  const batches = data || [];
  const courses = coursesData || [];

  const handleOpenModal = () => {
    setBatchName('');
    setCourseId(courses[0]?.courseId || '');
    setStartDate(new Date().toISOString().split('T')[0]);
    setModalOpen(true);
  };

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminApi.createBatch({
        batchName,
        courseId,
        trainerId,
        startDate,
        schedule,
        timing,
        mode,
        maxStudents
      });
      setModalOpen(false);
      refetch();
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
            Batches & Faculty Allocation
          </h2>
          <p style={{ color: 'var(--gray-600)', fontSize: '0.9rem' }}>
            Schedule batches, assign certified trainers, and set maximum student capacities.
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <Plus size={18} />
          <span>Launch New Batch</span>
        </button>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-500)' }}>
          Loading batches from Google Sheets...
        </div>
      ) : batches.length === 0 ? (
        <div className="card" style={{ padding: 32 }}>
          <EmptyState
            icon={<Calendar size={48} color="var(--gray-400)" />}
            title="No batches launched"
            description="Create your first academy batch to enroll students and schedule live classes."
            action={
              <button onClick={handleOpenModal} className="btn btn-primary">
                + Launch First Batch
              </button>
            }
          />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
          {batches.map((batch) => {
            const courseMatch = courses.find((c) => c.courseId === batch.courseId);
            return (
              <div key={batch.batchId} className="card card-hover">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <span className="badge badge-primary">{batch.batchId}</span>
                  <StatusBadge status={batch.status} />
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: 4 }}>
                  {batch.batchName}
                </h3>
                <div style={{ fontSize: '0.85rem', color: '#1d4ed8', fontWeight: 600, marginBottom: 12 }}>
                  {courseMatch ? courseMatch.title : batch.courseId}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.85rem', color: 'var(--gray-600)', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Clock size={16} />
                    <span>Timing: <strong>{batch.timing}</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Calendar size={16} />
                    <span>Schedule: {batch.schedule}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Users size={16} />
                    <span>Trainer: {batch.trainerId} • Max Students: {batch.maxStudents}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MapPin size={16} />
                    <span>Mode: {batch.mode}</span>
                  </div>
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)', paddingTop: 12, borderTop: '1px solid var(--gray-100)' }}>
                  Start Date: <strong>{batch.startDate ? new Date(batch.startDate).toLocaleDateString() : '—'}</strong>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Batch Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <h3 className="modal-title">Launch New Batch</h3>
              <button className="modal-close" onClick={() => setModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateBatch} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Batch Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. BHA - Batch 2026 A"
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Course *</label>
                  <select
                    className="form-select"
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    required
                  >
                    <option value="">-- Select Course --</option>
                    {courses.map((c) => (
                      <option key={c.courseId} value={c.courseId}>
                        {c.shortCode ? `${c.shortCode} - ${c.title}` : c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Trainer ID *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="TRN000001"
                    value={trainerId}
                    onChange={(e) => setTrainerId(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Start Date *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Max Students</label>
                  <input
                    type="number"
                    className="form-input"
                    value={maxStudents}
                    onChange={(e) => setMaxStudents(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Schedule Days</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Monday, Wednesday, Friday"
                  value={schedule}
                  onChange={(e) => setSchedule(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Timing</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 10:00 AM - 1:00 PM"
                  value={timing}
                  onChange={(e) => setTiming(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary"
                >
                  {saving ? 'Creating...' : 'Create Batch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
