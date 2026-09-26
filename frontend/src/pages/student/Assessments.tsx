import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { assessmentsApi } from '../../api/client';
import { Assessment } from '../../types';
import StatusBadge from '../../components/ui/StatusBadge';
import { CardSkeleton } from '../../components/ui/LoadingSkeleton';
import { Award, Clock, HelpCircle, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

export default function Assessments() {
  const navigate = useNavigate();
  const { data, loading, error } = useApi<Assessment[]>(() =>
    assessmentsApi.getAssessments()
  );

  const fallbackAssessments: Assessment[] = [
    {
      assessmentId: 'ASM000001',
      batchId: 'BAT000001',
      moduleId: 'MOD000001',
      title: 'HTML & CSS Fundamentals MCQ Quiz',
      description: 'Test your understanding of box-model, semantic HTML tags, Flexbox and responsive media queries.',
      type: 'MCQ_TEST',
      totalMarks: '20',
      passMark: '12',
      durationMinutes: '30',
      maxAttempts: '2',
      status: 'ACTIVE',
      studentStatus: 'PASSED',
      score: '18',
      percentage: '90'
    },
    {
      assessmentId: 'ASM000002',
      batchId: 'BAT000001',
      moduleId: 'MOD000002',
      title: 'JavaScript Asynchronous Concepts Assessment',
      description: 'Promises, Async/Await, Event Loop, Closures and array transformation methods.',
      type: 'MCQ_TEST',
      totalMarks: '25',
      passMark: '15',
      durationMinutes: '45',
      maxAttempts: '2',
      status: 'ACTIVE',
      studentStatus: 'NOT_STARTED'
    },
    {
      assessmentId: 'ASM000003',
      batchId: 'BAT000001',
      moduleId: 'MOD000003',
      title: 'Technical Mock Interview - Frontend & React',
      description: '1-on-1 viva assessment with trainer assessing state architecture, optimization, and system design.',
      type: 'MOCK_INTERVIEW',
      totalMarks: '50',
      passMark: '35',
      durationMinutes: '40',
      maxAttempts: '1',
      status: 'ACTIVE',
      studentStatus: 'NOT_STARTED'
    }
  ];

  const assessments = data && data.length > 0 ? data : fallbackAssessments;

  if (loading && !data) {
    return <CardSkeleton count={3} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gray-900)' }}>
          Assessments & Skill Tests
        </h2>
        <p style={{ color: 'var(--gray-600)', fontSize: '0.9rem' }}>
          Evaluate your technical proficiency. Passing assessments directly impacts your placement readiness score.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
        {assessments.map((asm) => {
          const isPassed = asm.studentStatus === 'PASSED';
          const isFailed = asm.studentStatus === 'FAILED';
          const hasTaken = isPassed || isFailed;

          return (
            <div
              key={asm.assessmentId}
              className="card card-hover"
              style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <span className="badge badge-primary">{asm.type.replace('_', ' ')}</span>
                  <StatusBadge
                    status={asm.studentStatus || 'PENDING'}
                    custom={
                      hasTaken
                        ? {
                            label: `${asm.score}/${asm.totalMarks} (${asm.percentage}%)`,
                            className: isPassed ? 'badge-success' : 'badge-danger'
                          }
                        : {
                            label: 'Not Started',
                            className: 'badge-warning'
                          }
                    }
                  />
                </div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: 8 }}>
                  {asm.title}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--gray-600)', lineHeight: 1.5, marginBottom: 16 }}>
                  {asm.description}
                </p>
              </div>

              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    background: 'var(--gray-50)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.8rem',
                    color: 'var(--gray-600)',
                    marginBottom: 16
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={14} />
                    <span>{asm.durationMinutes || 30} Mins</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Award size={14} />
                    <span>Total: {asm.totalMarks} Marks</span>
                  </div>
                  <div>
                    <span>Pass: {asm.passMark || Math.round(Number(asm.totalMarks) * 0.6)} Marks</span>
                  </div>
                </div>

                {hasTaken ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      padding: 10,
                      borderRadius: 'var(--radius-md)',
                      background: isPassed ? '#dcfce7' : '#fee2e2',
                      color: isPassed ? '#166534' : '#991b1b',
                      fontWeight: 600,
                      fontSize: '0.85rem'
                    }}
                  >
                    {isPassed ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                    <span>{isPassed ? 'Assessment Passed' : 'Attempt Failed — Review Concepts'}</span>
                  </div>
                ) : (
                  <button
                    onClick={() => navigate(`/assessments/${asm.assessmentId}/take`)}
                    className="btn btn-primary btn-full"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  >
                    <span>Start Assessment</span>
                    <ArrowRight size={16} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
