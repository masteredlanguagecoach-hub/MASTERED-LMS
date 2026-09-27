import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { assessmentsApi } from '../../api/client';
import { Assessment, AssessmentHistoryItem } from '../../types';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import { CardSkeleton } from '../../components/ui/LoadingSkeleton';
import { Award, Clock, CheckCircle2, XCircle, ArrowRight, History, BookOpen } from 'lucide-react';

export default function Assessments() {
  const navigate = useNavigate();

  const { data: assessmentsData, loading: assessmentsLoading } = useApi<Assessment[]>(() =>
    assessmentsApi.getAssessments()
  );

  const { data: historyData, loading: historyLoading } = useApi<AssessmentHistoryItem[]>(() =>
    assessmentsApi.getAssessmentHistory()
  );

  const assessments = assessmentsData || [];
  const history = historyData || [];

  if ((assessmentsLoading || historyLoading) && !assessmentsData && !historyData) {
    return <CardSkeleton count={3} />;
  }

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'A': return 'badge-success';
      case 'B': return 'badge-primary';
      case 'C': return 'badge-warning';
      case 'D': return 'badge-secondary';
      case 'E': return 'badge-danger';
      default: return 'badge-secondary';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gray-900)' }}>
          Assessments & Skill Tests
        </h2>
        <p style={{ color: 'var(--gray-600)', fontSize: '0.9rem' }}>
          Evaluate your technical proficiency. Passing assessments directly impacts your placement readiness score.
        </p>
      </div>

      {/* Online / Batch Assessments Grid */}
      {assessments.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--gray-800)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Award size={20} color="var(--primary-600)" />
            <span>Available Assessments</span>
          </h3>

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
      )}

      {/* Assessment History Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--gray-800)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <History size={20} color="var(--primary-600)" />
            <span>Assessment & Test History</span>
          </h3>
          <span style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>
            Category Rule: 10–8=A, 7–6=B, 5=C, 4=D, Absent=E
          </span>
        </div>

        {history.length === 0 ? (
          <div className="card">
            <EmptyState
              icon={<Award size={44} color="var(--gray-400)" />}
              title="No assessment records yet"
              description="Topic Tests, Presentations, Topic Mock Interviews, and Attendance records submitted by your trainer will be tracked here."
            />
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-wrap" style={{ border: 'none', borderRadius: 0 }}>
              <table>
                <thead>
                  <tr>
                    <th>Module & Topic</th>
                    <th>Assessment Type</th>
                    <th>Date</th>
                    <th>Marks (out of 10)</th>
                    <th>Category</th>
                    <th>Trainer</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item, idx) => (
                    <tr key={item.saId || idx}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--gray-900)' }}>
                          {item.moduleTitle || item.moduleId || 'Course Module'}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginTop: 2 }}>
                          Topic: <strong>{item.topic || 'General Topic'}</strong>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>
                          {item.assessmentType}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--gray-600)' }}>
                        {item.date ? new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                      <td>
                        {item.isAbsent ? (
                          <span style={{ color: '#dc2626', fontWeight: 700, fontSize: '0.9rem' }}>
                            Absent
                          </span>
                        ) : (
                          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--gray-900)' }}>
                            {item.marks !== null ? `${item.marks}/10` : '—'}
                          </span>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${getCategoryBadgeClass(item.category)}`} style={{ fontWeight: 800, padding: '4px 10px', fontSize: '0.85rem' }}>
                          Category {item.category || '—'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--gray-700)' }}>
                        {item.trainerName || item.trainer || 'Trainer'}
                      </td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--gray-600)', maxWidth: 220 }}>
                        {item.remarks || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
