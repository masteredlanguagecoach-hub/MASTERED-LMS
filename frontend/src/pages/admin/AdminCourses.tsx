import React, { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { adminApi } from '../../api/client';
import { Course } from '../../types';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import { Layers, Plus, BookOpen, Clock, X, DollarSign } from 'lucide-react';

export default function AdminCourses() {
  const { data, loading, refetch } = useApi<Course[]>(() =>
    adminApi.getCourses()
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [shortCode, setShortCode] = useState('');
  const [description, setDescription] = useState('');
  const [durationWeeks, setDurationWeeks] = useState('24');
  const [durationHours, setDurationHours] = useState('480');
  const [defaultFee, setDefaultFee] = useState('45000');
  const [level, setLevel] = useState('Beginner to Advanced');
  const [saving, setSaving] = useState(false);

  const courses = data || [];

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminApi.createCourse({
        title,
        shortCode,
        description,
        durationWeeks,
        durationHours,
        defaultFee,
        level
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
            Course Curriculum & Module Management
          </h2>
          <p style={{ color: 'var(--gray-600)', fontSize: '0.9rem' }}>
            Define academy curriculum, default fees, duration, and module breakdowns.
          </p>
        </div>

        <button
          onClick={() => {
            setTitle('');
            setShortCode('');
            setDescription('');
            setDefaultFee('45000');
            setModalOpen(true);
          }}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <Plus size={18} />
          <span>Create New Course</span>
        </button>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-500)' }}>
          Loading courses from Google Sheets...
        </div>
      ) : courses.length === 0 ? (
        <div className="card" style={{ padding: 32 }}>
          <EmptyState
            icon={<Layers size={48} color="var(--gray-400)" />}
            title="No courses registered"
            description="Create your first academy course to set up curriculum and modules."
            action={
              <button onClick={() => setModalOpen(true)} className="btn btn-primary">
                + Create First Course
              </button>
            }
          />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
          {courses.map((course) => (
            <div key={course.courseId} className="card card-hover">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <span className="badge badge-primary">{course.shortCode || 'COURSE'}</span>
                <StatusBadge status={course.status} />
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: 8 }}>
                {course.title}
              </h3>

              <p style={{ fontSize: '0.9rem', color: 'var(--gray-600)', lineHeight: 1.5, marginBottom: 16 }}>
                {course.description || 'No description provided.'}
              </p>

              <div style={{ marginBottom: 12, padding: '8px 12px', background: '#f8fafc', borderRadius: 6, fontSize: '0.85rem' }}>
                <strong>Course Default Fee:</strong>{' '}
                <span style={{ color: '#1d4ed8', fontWeight: 700 }}>
                  ₹{Number(course.defaultFee || 0).toLocaleString()}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', display: 'block', marginTop: 2 }}>
                  Baseline for new enrollments (independent of student assigned fees)
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'var(--gray-500)', paddingTop: 12, borderTop: '1px solid var(--gray-100)' }}>
                <span>{course.durationWeeks || '—'} Weeks • {course.durationHours || '—'} Hours</span>
                <span>Level: {course.level || 'Standard'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Course Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <h3 className="modal-title">Create Course</h3>
              <button className="modal-close" onClick={() => setModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCourse} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Course Title *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Full Stack Web Development"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Short Code *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. FSWD / BHA"
                    value={shortCode}
                    onChange={(e) => setShortCode(e.target.value.toUpperCase())}
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Default Fee (₹) *</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="45000"
                    value={defaultFee}
                    onChange={(e) => setDefaultFee(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Description *</label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Weeks</label>
                  <input
                    type="number"
                    className="form-input"
                    value={durationWeeks}
                    onChange={(e) => setDurationWeeks(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Hours</label>
                  <input
                    type="number"
                    className="form-input"
                    value={durationHours}
                    onChange={(e) => setDurationHours(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Level</label>
                  <input
                    type="text"
                    className="form-input"
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                  />
                </div>
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
                  {saving ? 'Creating...' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
