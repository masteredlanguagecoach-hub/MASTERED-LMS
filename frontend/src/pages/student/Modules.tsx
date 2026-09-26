import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { modulesApi } from '../../api/client';
import { Module } from '../../types';
import ProgressBar from '../../components/ui/ProgressBar';
import StatusBadge from '../../components/ui/StatusBadge';
import { CardSkeleton } from '../../components/ui/LoadingSkeleton';
import EmptyState from '../../components/ui/EmptyState';
import { BookOpen, Lock, CheckCircle2, PlayCircle, Clock, ChevronRight } from 'lucide-react';

export default function Modules() {
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useApi<Module[]>(() =>
    modulesApi.getModules()
  );

  // Fallback demo modules if backend API not yet populated
  const fallbackModules: Module[] = [
    {
      moduleId: 'MOD000001',
      courseId: 'CRS000001',
      title: 'HTML & CSS Fundamentals',
      description: 'Master semantic HTML5 structures, modern CSS styling, box model, and layout architectures.',
      sequence: 1,
      durationHours: '40',
      status: 'ACTIVE',
      totalLessons: 5,
      completedLessons: 5,
      progressPercent: 100,
      isLocked: false,
      moduleStatus: 'COMPLETED'
    },
    {
      moduleId: 'MOD000002',
      courseId: 'CRS000001',
      title: 'JavaScript Essentials & DOM',
      description: 'ES6+ syntax, asynchronous JavaScript, Promises, Fetch API, DOM manipulation and event delegation.',
      sequence: 2,
      durationHours: '60',
      status: 'ACTIVE',
      totalLessons: 6,
      completedLessons: 6,
      progressPercent: 100,
      isLocked: false,
      moduleStatus: 'COMPLETED'
    },
    {
      moduleId: 'MOD000003',
      courseId: 'CRS000001',
      title: 'React Frontend Development',
      description: 'Component architecture, state & props, hooks, routing, Context API, and form handling.',
      sequence: 3,
      durationHours: '80',
      status: 'ACTIVE',
      totalLessons: 8,
      completedLessons: 3,
      progressPercent: 37,
      isLocked: false,
      moduleStatus: 'IN_PROGRESS'
    },
    {
      moduleId: 'MOD000004',
      courseId: 'CRS000001',
      title: 'Backend, REST APIs & Google Sheets Integration',
      description: 'Google Apps Script serverless backend, RESTful API architecture, Sheets database queries and LockService.',
      sequence: 4,
      durationHours: '80',
      status: 'ACTIVE',
      totalLessons: 7,
      completedLessons: 0,
      progressPercent: 0,
      isLocked: true,
      moduleStatus: 'NOT_STARTED'
    }
  ];

  const modules = data && data.length > 0 ? data : fallbackModules;

  if (loading && !data) {
    return <CardSkeleton count={4} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gray-900)' }}>
            Course Modules & Learning Path
          </h2>
          <p style={{ color: 'var(--gray-600)', fontSize: '0.9rem' }}>
            Sequential progression system. Complete each required lesson to unlock subsequent modules.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
        {modules.map((mod) => {
          const isCompleted = mod.progressPercent === 100;
          const isLocked = mod.isLocked;

          return (
            <div
              key={mod.moduleId}
              className={`module-card ${isLocked ? 'locked' : ''}`}
              onClick={() => {
                if (!isLocked) {
                  navigate(`/modules/${mod.moduleId}`);
                }
              }}
              style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 220 }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <span className="badge badge-primary">MODULE {mod.sequence}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {isLocked ? (
                      <span className="badge badge-gray" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Lock size={12} /> Locked
                      </span>
                    ) : isCompleted ? (
                      <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <CheckCircle2 size={12} /> Completed
                      </span>
                    ) : (
                      <span className="badge badge-primary">
                        In Progress
                      </span>
                    )}
                  </div>
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: 8 }}>
                  {mod.title}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--gray-600)', lineHeight: 1.5, marginBottom: 16 }}>
                  {mod.description}
                </p>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--gray-600)', marginBottom: 6 }}>
                  <span>
                    {mod.completedLessons || 0} of {mod.totalLessons || 0} Lessons Completed
                  </span>
                  <span style={{ fontWeight: 600 }}>{mod.progressPercent || 0}%</span>
                </div>

                <ProgressBar
                  percent={mod.progressPercent || 0}
                  variant={isCompleted ? 'success' : 'primary'}
                  height={6}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--gray-100)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', color: 'var(--gray-500)' }}>
                    <Clock size={14} />
                    <span>{mod.durationHours || 40} Hours</span>
                  </div>

                  <span
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: isLocked ? 'var(--gray-400)' : 'var(--primary-600)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    {isLocked ? 'Prerequisites Required' : 'View Lessons'}
                    {!isLocked && <ChevronRight size={16} />}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
