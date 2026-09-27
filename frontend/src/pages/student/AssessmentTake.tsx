import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { assessmentsApi } from '../../api/client';
import { Assessment, Question } from '../../types';
import EmptyState from '../../components/ui/EmptyState';
import { CardSkeleton } from '../../components/ui/LoadingSkeleton';
import { ArrowLeft, Clock, CheckCircle2, AlertCircle, Send, HelpCircle } from 'lucide-react';

interface AssessmentDetailsData {
  assessment: Assessment;
  questions: Array<Question & { options?: string }>;
}

export default function AssessmentTake() {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const navigate = useNavigate();

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    totalMarks: number;
    percentage: number;
    status: string;
    passed: boolean;
  } | null>(null);

  const { data, loading, error } = useApi<AssessmentDetailsData>(
    () => assessmentsApi.getAssessmentDetails(assessmentId || ''),
    [assessmentId]
  );

  const [submitError, setSubmitError] = useState<string | null>(null);

  const questions = data?.questions || [];
  const assessmentTitle = data?.assessment?.title || 'Interactive Assessment';

  const handleSelectOption = (questionId: string, option: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await assessmentsApi.submitAssessment(
        assessmentId || '',
        answers,
        new Date().toISOString()
      );

      if (res.success && res.data) {
        setResult(res.data as any);
      } else {
        setSubmitError(res.error || 'Failed to submit assessment. Please try again.');
      }
    } catch (err: any) {
      console.error(err);
      setSubmitError(err.message || 'Server error occurred during submission.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !data) {
    return <CardSkeleton count={3} />;
  }

  if (!loading && questions.length === 0) {
    return (
      <div style={{ maxWidth: 640, margin: '40px auto' }}>
        <EmptyState
          icon={HelpCircle}
          title="No Assessment Questions Found"
          message="This assessment does not currently have any active questions configured in the database."
          actionLabel="Back to Assessments"
          onAction={() => navigate('/assessments')}
        />
      </div>
    );
  }

  if (result) {
    return (
      <div style={{ maxWidth: 640, margin: '40px auto', textAlign: 'center' }}>
        <div className="card" style={{ padding: '40px 32px' }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: result.passed ? '#dcfce7' : '#fee2e2',
              color: result.passed ? '#16a34a' : '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}
          >
            {result.passed ? <CheckCircle2 size={36} /> : <AlertCircle size={36} />}
          </div>

          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--gray-900)', marginBottom: 8 }}>
            {result.passed ? 'Congratulations! Test Passed' : 'Assessment Completed'}
          </h2>

          <p style={{ color: 'var(--gray-600)', fontSize: '0.95rem', marginBottom: 24 }}>
            Your assessment answers have been verified and recorded in the database.
          </p>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 24,
              padding: '16px 28px',
              background: 'var(--gray-50)',
              borderRadius: 'var(--radius-lg)',
              marginBottom: 32
            }}
          >
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--gray-900)' }}>
                {result.score} / {result.totalMarks}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>Total Marks</div>
            </div>
            <div style={{ width: 1, height: 40, background: 'var(--gray-300)' }} />
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: result.passed ? '#16a34a' : '#dc2626' }}>
                {result.percentage}%
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>Score Percentage</div>
            </div>
          </div>

          <div>
            <button
              onClick={() => navigate('/assessments')}
              className="btn btn-primary btn-lg"
            >
              Return to Assessments
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 840, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={() => navigate('/assessments')}
          className="btn btn-secondary btn-sm"
        >
          <ArrowLeft size={16} />
          <span>Exit Assessment</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.9rem', color: 'var(--gray-700)', fontWeight: 600 }}>
          <Clock size={16} color="var(--primary-600)" />
          <span>Questions Answered: {Object.keys(answers).length} / {questions.length}</span>
        </div>
      </div>

      <div className="card">
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gray-900)', marginBottom: 6 }}>
          {assessmentTitle}
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--gray-600)' }}>
          Please select one answer for each multiple-choice question before submitting.
        </p>
      </div>

      {submitError && (
        <div style={{ padding: '12px 16px', background: '#fee2e2', color: '#991b1b', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertCircle size={18} />
          <span>{submitError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {questions.map((q, idx) => {
          const opts = q.options ? q.options.split(',') : [];

          return (
            <div key={q.questionId} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <span className="badge badge-primary">QUESTION {idx + 1}</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--gray-500)' }}>
                  {q.marks} Marks
                </span>
              </div>

              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--gray-900)', marginBottom: 16 }}>
                {q.questionText}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {opts.map((option, optIdx) => {
                  const isSelected = answers[q.questionId] === option.trim();

                  return (
                    <label
                      key={optIdx}
                      onClick={() => handleSelectOption(q.questionId, option.trim())}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '12px 16px',
                        borderRadius: 'var(--radius-md)',
                        border: `1.5px solid ${isSelected ? 'var(--primary-500)' : 'var(--gray-200)'}`,
                        background: isSelected ? 'var(--primary-50)' : 'var(--white)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <input
                        type="radio"
                        name={q.questionId}
                        checked={isSelected}
                        onChange={() => handleSelectOption(q.questionId, option.trim())}
                        style={{ accentColor: 'var(--primary-600)', width: 16, height: 16 }}
                      />
                      <span style={{ fontSize: '0.9rem', color: isSelected ? 'var(--primary-900)' : 'var(--gray-800)', fontWeight: isSelected ? 600 : 400 }}>
                        {option.trim()}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}

        <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--gray-600)' }}>
            Completed {Object.keys(answers).length} of {questions.length} questions
          </span>
          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary btn-lg"
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <Send size={18} />
            <span>{submitting ? 'Grading Server-Side...' : 'Submit Answers'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
