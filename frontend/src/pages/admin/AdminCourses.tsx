import React, { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { adminApi } from '../../api/client';
import { Course } from '../../types';
import StatusBadge from '../../components/ui/StatusBadge';
import { Layers, Plus, BookOpen, Clock, X } from 'lucide-react';

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
  const [saving, setSaving] = useState(false);

  const fallbackCourses: Course[] = [
    {
      courseId: 'CRS000001',
      title: 'Full Stack Web Development',
      shortCode: 'FSWD',
      description: 'Comprehensive software engineering program covering HTML5, CSS3, JavaScript ES6+, React, Node.js, and Google Apps Script database APIs.',
      durationWeeks: '24',
      durationHours: '480',
      level: 'Beginner to Advanced',
      status: 'ACTIVE'
    },
    {
      courseId: 'CRS000002',
      title: 'Cloud DevOps & Infrastructure',
      shortCode: 'CDOPS',
      description: 'Linux systems, Docker containers, CI/CD automated pipelines, cloud architectures, and monitoring.',
      durationWeeks: '16',
      durationHours: '320',
      level: 'Intermediate',
      status: 'ACTIVE'
    }
  ];

  const courses = data && data.length > 0 ? data : fallbackCourses;

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminApi.createCourse({
        title,
        shortCode,
        description,
        durationWeeks,
        durationHours
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
            Define academy curriculum, duration, module breakdowns and sequence locks.
          </p>
        </div>

        <button
          onClick={() => {
            setTitle('');
            setShortCode('');
            setDescription('');
            setModalOpen(true);
          }}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <Plus size={18} />
          <span>Create New Course</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
        {courses.map((course) => (
          <div key={course.courseId} className="card card-hover">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <span className="badge badge-primary">{course.shortCode}</span>
              <StatusBadge status={course.status} />
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: 8 }}>
              {course.title}
            </h3>

            <p style={{ fontSize: '0.9rem', color: 'var(--gray-600)', lineHeight: 1.5, marginBottom: 16 }}>
              {course.description}
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'var(--gray-500)', paddingTop: 12, borderTop: '1px solid var(--gray-100)' }}>
              <span>{course.durationWeeks} Weeks • {course.durationHours} Hours</span>
              <span>Level: {course.level}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Course Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Create Course</h3>
              <button className="modal-close" onClick={() => setModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCourse} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Course Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Full Stack Web Development"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Short Code</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. FSWD"
                  value={shortCode}
                  onChange={(e) => setShortCode(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Description</label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Duration Weeks</label>
                  <input
                    type="number"
                    className="form-input"
                    value={durationWeeks}
                    onChange={(e) => setDurationWeeks(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Duration Hours</label>
                  <input
                    type="number"
                    className="form-input"
                    value={durationHours}
                    onChange={(e) => setDurationHours(e.target.value)}
                    required
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
