import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { modulesApi } from '../../api/client';
import { Module, Lesson } from '../../types';
import ProgressBar from '../../components/ui/ProgressBar';
import { CardSkeleton } from '../../components/ui/LoadingSkeleton';
import {
  ArrowLeft,
  CheckCircle2,
  Lock,
  PlayCircle,
  FileText,
  Clock,
  Video,
  ChevronRight
} from 'lucide-react';

interface ModuleDetailData {
  module: Module;
  lessons: Lesson[];
}

export default function ModuleDetail() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();

  const { data, loading, error, refetch } = useApi<ModuleDetailData>(
    () => modulesApi.getModuleDetails(moduleId || ''),
    [moduleId]
  );

  // Fallback demo data
  const fallbackLessons: Lesson[] = [
    {
      lessonId: 'LES000001',
      moduleId: moduleId || 'MOD000003',
      title: 'Introduction to React & Component Architecture',
      description: 'Understanding Virtual DOM, JSX syntax, functional components and props hierarchy.',
      sequence: 1,
      isRequired: 'true',
      status: 'ACTIVE',
      isCompleted: true,
      isLocked: false
    },
    {
      lessonId: 'LES000002',
      moduleId: moduleId || 'MOD000003',
      title: 'State Management with useState Hook',
      description: 'Managing reactive UI state, immutability principles, and event handling patterns.',
      sequence: 2,
      isRequired: 'true',
      status: 'ACTIVE',
      isCompleted: true,
      isLocked: false
    },
    {
      lessonId: 'LES000003',
      moduleId: moduleId || 'MOD000003',
      title: 'Side Effects and Lifecycle with useEffect',
      description: 'Asynchronous operations, API fetching, dependency array pitfalls, and cleanup functions.',
      sequence: 3,
      isRequired: 'true',
      status: 'ACTIVE',
      isCompleted: true,
      isLocked: false
    },
    {
      lessonId: 'LES000004',
      moduleId: moduleId || 'MOD000003',
      title: 'Advanced Hooks: useReducer, useMemo & useCallback',
      description: 'Optimizing performance, complex state transitions, and memoization strategies.',
      sequence: 4,
      isRequired: 'true',
      status: 'ACTIVE',
      isCompleted: false,
      isLocked: false // Current active lesson
    },
    {
      lessonId: 'LES000005',
      moduleId: moduleId || 'MOD000003',
      title: 'Context API and Global State Management',
      description: 'Creating theme and authentication providers without prop drilling.',
      sequence: 5,
      isRequired: 'true',
      status: 'ACTIVE',
      isCompleted: false,
      isLocked: true // Locked until lesson 4 is completed
    }
  ];

  const moduleInfo = data?.module || {
    moduleId: moduleId || 'MOD000003',
    courseId: 'CRS000001',
    title: 'React Frontend Development',
    description: 'Learn modern React with TypeScript, hooks, state management, and real database integrations.',
    sequence: 3,
    durationHours: '80',
    status: 'ACTIVE'
  };

  const lessons = data?.lessons && data.lessons.length > 0 ? data.lessons : fallbackLessons;
  const completedCount = lessons.filter(l => l.isCompleted).length;
  const progressPercent = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  if (loading && !data) {
    return <CardSkeleton count={5} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Back button & Module Header */}
      <div>
        <button
          onClick={() => navigate('/modules')}
          className="btn btn-secondary btn-sm"
          style={{ marginBottom: 16 }}
        >
          <ArrowLeft size={16} />
          <span>Back to All Modules</span>
        </button>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <span className="badge badge-primary" style={{ marginBottom: 8 }}>
                MODULE {moduleInfo.sequence}
              </span>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gray-900)', marginTop: 4 }}>
                {moduleInfo.title}
              </h2>
              <p style={{ color: 'var(--gray-600)', fontSize: '0.95rem', marginTop: 6, maxWidth: 700 }}>
                {moduleInfo.description}
              </p>
            </div>

            <div style={{ minWidth: 200, padding: 16, background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 6 }}>
                <span style={{ color: 'var(--gray-600)' }}>Progress</span>
                <span style={{ fontWeight: 700, color: 'var(--primary-600)' }}>{progressPercent}%</span>
              </div>
              <ProgressBar percent={progressPercent} height={8} />
              <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: 6 }}>
                {completedCount} of {lessons.length} Lessons Finished
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sequential Lesson List */}
      <div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: 16 }}>
          Lessons & Learning Material
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {lessons.map((lesson, idx) => {
            const isCompleted = lesson.isCompleted;
            const isLocked = lesson.isLocked;

            return (
              <div
                key={lesson.lessonId}
                className={`lesson-item ${isLocked ? 'locked' : ''} ${isCompleted ? 'completed' : ''}`}
                onClick={() => {
                  if (!isLocked) {
                    navigate(`/lessons/${lesson.lessonId}`);
                  }
                }}
                style={{ cursor: isLocked ? 'not-allowed' : 'pointer' }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: isCompleted ? '#22c55e' : isLocked ? 'var(--gray-200)' : 'var(--primary-100)',
                    color: isCompleted ? '#fff' : isLocked ? 'var(--gray-500)' : 'var(--primary-600)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    flexShrink: 0
                  }}
                >
                  {isCompleted ? <CheckCircle2 size={20} /> : isLocked ? <Lock size={16} /> : idx + 1}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: isLocked ? 'var(--gray-500)' : 'var(--gray-900)' }}>
                      {lesson.title}
                    </h4>
                    {lesson.isRequired === 'true' && (
                      <span className="badge badge-warning" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                        Required
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.85rem', color: isLocked ? 'var(--gray-400)' : 'var(--gray-600)', lineHeight: 1.4 }}>
                    {lesson.description}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {isCompleted ? (
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#16a34a' }}>
                      Completed
                    </span>
                  ) : isLocked ? (
                    <span style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>
                      Locked
                    </span>
                  ) : (
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      <PlayCircle size={16} />
                      <span>Start</span>
                    </button>
                  )}
                  {!isLocked && <ChevronRight size={18} color="var(--gray-400)" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
