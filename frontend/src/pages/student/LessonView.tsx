import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { modulesApi } from '../../api/client';
import { Lesson } from '../../types';
import {
  ArrowLeft,
  CheckCircle2,
  Video,
  FileText,
  Music,
  ExternalLink,
  ChevronRight,
  Clock,
  PlayCircle
} from 'lucide-react';

export default function LessonView() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const [completing, setCompleting] = useState(false);
  const [completedSuccess, setCompletedSuccess] = useState(false);

  const { data, loading, error } = useApi<Lesson>(
    () => modulesApi.getLesson(lessonId || ''),
    [lessonId]
  );

  // Fallback lesson data
  const fallbackLesson: Lesson = {
    lessonId: lessonId || 'LES000004',
    moduleId: 'MOD000003',
    title: 'Advanced Hooks: useReducer, useMemo & useCallback',
    description: 'Master performant React state architectures with useReducer and memoization hooks.',
    sequence: 4,
    isRequired: 'true',
    status: 'ACTIVE',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    audioUrl: '',
    resourceUrl: 'https://react.dev/reference/react/useReducer',
    content: `
### Overview
The \`useReducer\` hook is an alternative to \`useState\` that gives you better control over complex state management logic that involves multiple sub-values or when the next state depends on the previous one.

\`\`\`javascript
const [state, dispatch] = useReducer(reducer, initialArg, init?);
\`\`\`

### When to use useReducer vs useState:
1. When state transitions have complex business validation rules.
2. When multiple state variables change in response to a single user interaction.
3. When testing pure reducer functions in isolation.

### The useCallback and useMemo Hooks:
- \`useMemo\` caches the result of a calculation between re-renders.
- \`useCallback\` caches a function definition between re-renders, preventing unnecessary child component re-renders when passing callbacks.
    `
  };

  const lesson = data || fallbackLesson;

  const handleMarkComplete = async () => {
    setCompleting(true);
    try {
      const res = await modulesApi.completeLesson(lesson.lessonId, 30);
      setCompletedSuccess(true);
      setTimeout(() => {
        navigate(`/modules/${lesson.moduleId}`);
      }, 1200);
    } catch (err) {
      console.error(err);
    } finally {
      setCompleting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 960, margin: '0 auto' }}>
      {/* Top back button & breadcrumb */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={() => navigate(`/modules/${lesson.moduleId}`)}
          className="btn btn-secondary btn-sm"
        >
          <ArrowLeft size={16} />
          <span>Back to Module</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: 'var(--gray-500)' }}>
          <span>Lesson {lesson.sequence}</span>
          <span>•</span>
          <span style={{ color: lesson.isRequired === 'true' ? 'var(--warning-600)' : 'var(--gray-500)', fontWeight: 500 }}>
            {lesson.isRequired === 'true' ? 'Mandatory Lesson' : 'Optional'}
          </span>
        </div>
      </div>

      {/* Lesson Title Card */}
      <div className="card">
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--gray-900)', marginBottom: 8 }}>
          {lesson.title}
        </h1>
        <p style={{ fontSize: '0.95rem', color: 'var(--gray-600)', lineHeight: 1.5 }}>
          {lesson.description}
        </p>
      </div>

      {/* Media: Video Player */}
      {lesson.videoUrl && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--gray-200)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Video size={18} color="var(--primary-600)" />
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Video Lecture</span>
          </div>
          <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', background: '#000' }}>
            <iframe
              src={lesson.videoUrl}
              title={lesson.title}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* Text Content */}
      {lesson.content && (
        <div className="card">
          <div style={{ paddingBottom: 16, marginBottom: 16, borderBottom: '1px solid var(--gray-200)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileText size={18} color="var(--primary-600)" />
            <span style={{ fontWeight: 600, fontSize: '1rem' }}>Study Notes & Code Snippets</span>
          </div>
          <div style={{ fontSize: '0.95rem', color: 'var(--gray-800)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
            {lesson.content}
          </div>
        </div>
      )}

      {/* External Resources & PDF downloads */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
        {lesson.pdfUrl && (
          <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <FileText size={24} color="#ef4444" />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Lecture Slides & PDF</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Downloadable Resource</div>
              </div>
            </div>
            <a
              href={lesson.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm"
            >
              Download
            </a>
          </div>
        )}

        {lesson.resourceUrl && (
          <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <ExternalLink size={24} color="var(--primary-600)" />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Documentation Reference</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>External Link</div>
              </div>
            </div>
            <a
              href={lesson.resourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline btn-sm"
            >
              Open
            </a>
          </div>
        )}
      </div>

      {/* Lesson Completion Action Button */}
      <div
        className="card"
        style={{
          background: completedSuccess ? '#f0fdf4' : 'var(--primary-50)',
          border: `1.5px solid ${completedSuccess ? '#86efac' : 'var(--primary-200)'}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16
        }}
      >
        <div>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--gray-900)' }}>
            {completedSuccess ? 'Lesson Marked as Completed!' : 'Finished this lesson?'}
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--gray-600)', marginTop: 2 }}>
            Completing this lesson updates your module progress and unlocks the next lesson.
          </p>
        </div>

        <button
          onClick={handleMarkComplete}
          disabled={completing || completedSuccess}
          className={`btn ${completedSuccess ? 'btn-secondary' : 'btn-primary'} btn-lg`}
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          {completedSuccess ? (
            <>
              <CheckCircle2 size={20} color="#16a34a" />
              <span>Completed</span>
            </>
          ) : completing ? (
            'Saving Progress...'
          ) : (
            <>
              <CheckCircle2 size={20} />
              <span>Mark as Completed</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
