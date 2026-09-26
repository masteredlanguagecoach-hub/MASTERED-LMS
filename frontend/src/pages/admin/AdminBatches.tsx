import React, { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { adminApi } from '../../api/client';
import { Batch } from '../../types';
import StatusBadge from '../../components/ui/StatusBadge';
import { Calendar, Plus, Clock, Users, MapPin, X } from 'lucide-react';

export default function AdminBatches() {
  const { data, loading, refetch } = useApi<Batch[]>(() =>
    adminApi.getBatches()
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [batchName, setBatchName] = useState('');
  const [courseId, setCourseId] = useState('CRS000001');
  const [trainerId, setTrainerId] = useState('TRN000001');
  const [startDate, setStartDate] = useState('');
  const [schedule, setSchedule] = useState('Monday, Wednesday, Friday');
  const [timing, setTiming] = useState('10:00 AM - 1:00 PM');
  const [mode, setMode] = useState('Online');
  const [maxStudents, setMaxStudents] = useState('30');
  const [saving, setSaving] = useState(false);

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
      venue: 'Online Interactive',
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
      venue: 'Online Interactive',
      mode: 'Online',
      maxStudents: '25',
      status: 'ACTIVE'
    }
  ];

  const batches = data && data.length > 0 ? data : fallbackBatches;

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
          onClick={() => {
            setBatchName('');
            setStartDate(new Date().toISOString().split('T')[0]);
            setModalOpen(true);
          }}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <Plus size={18} />
          <span>Launch New Batch</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
        {batches.map((batch) => (
          <div key={batch.batchId} className="card card-hover">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <span className="badge badge-primary">{batch.batchId}</span>
              <StatusBadge status={batch.status} />
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: 12 }}>
              {batch.batchName}
            </h3>

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
              Start Date: <strong>{new Date(batch.startDate).toLocaleDateString()}</strong>
            </div>
          </div>
        ))}
      </div>

      {/* Batch Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Launch New Batch</h3>
              <button className="modal-close" onClick={() => setModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateBatch} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Batch Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. FSWD - Batch 2026 C"
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Course</label>
                  <select
                    className="form-select"
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                  >
                    <option value="CRS000001">Full Stack Web Development</option>
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Trainer</label>
                  <select
                    className="form-select"
                    value={trainerId}
                    onChange={(e) => setTrainerId(e.target.value)}
                  >
                    <option value="TRN000001">Rajesh Kumar (TRN000001)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Start Date</label>
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
                <label className="form-label">Timing</label>
                <input
                  type="text"
                  className="form-input"
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
