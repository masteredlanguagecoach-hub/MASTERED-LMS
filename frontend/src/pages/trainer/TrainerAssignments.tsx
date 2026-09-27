import React, { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { trainerApi } from '../../api/client';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import { FileText, CheckCircle2, XCircle, ExternalLink, MessageSquare, X } from 'lucide-react';

interface SubmissionReviewItem {
  submissionId: string;
  assignmentId: string;
  assignmentTitle: string;
  studentId: string;
  studentName: string;
  submissionText: string;
  submittedAt: string;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
  marksAwarded?: string;
  feedback?: string;
}

export default function TrainerAssignments() {
  const [selectedSub, setSelectedSub] = useState<SubmissionReviewItem | null>(null);
  const [status, setStatus] = useState<'APPROVED' | 'REJECTED' | 'UNDER_REVIEW'>('APPROVED');
  const [marks, setMarks] = useState('90');
  const [feedback, setFeedback] = useState('');
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const submissions: SubmissionReviewItem[] = [];

  const handleOpenReview = (sub: SubmissionReviewItem) => {
    setSelectedSub(sub);
    setStatus(sub.status === 'SUBMITTED' ? 'APPROVED' : sub.status as any);
    setMarks(sub.marksAwarded || '90');
    setFeedback(sub.feedback || 'Great work on structuring the API calls and error states.');
    setModalOpen(true);
  };

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;
    setSaving(true);
    try {
      await trainerApi.reviewAssignment(selectedSub.submissionId, status, feedback, marks);
      selectedSub.status = status;
      selectedSub.marksAwarded = marks;
      selectedSub.feedback = feedback;
      setModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gray-900)' }}>
          Student Assignment Submissions & Grading
        </h2>
        <p style={{ color: 'var(--gray-600)', fontSize: '0.9rem' }}>
          Evaluate project submissions, award scores out of 100, and publish constructive feedback.
        </p>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {submissions.length === 0 ? (
          <div style={{ padding: 32 }}>
            <EmptyState
              icon={<FileText size={48} color="var(--gray-400)" />}
              title="No submissions to review"
              description="Student assignment submissions for your assigned batches will appear here."
            />
          </div>
        ) : (
          <div className="table-wrap" style={{ border: 'none', borderRadius: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Assignment</th>
                  <th>Submitted Link</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub) => (
                  <tr key={sub.submissionId}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{sub.studentName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{sub.studentId}</div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{sub.assignmentTitle}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: 'var(--primary)' }}>
                        {sub.submissionText.substring(0, 45)}...
                      </span>
                    </td>
                    <td>{new Date(sub.submittedAt).toLocaleDateString()}</td>
                    <td><StatusBadge status={sub.status} /></td>
                    <td>
                      <button
                        onClick={() => handleOpenReview(sub)}
                        className="btn btn-primary btn-sm"
                      >
                        Review & Grade
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {modalOpen && selectedSub && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Review Submission • {selectedSub.studentName}</h3>
              <button className="modal-close" onClick={() => setModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveReview} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>Assignment:</div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--gray-900)' }}>
                  {selectedSub.assignmentTitle}
                </div>
              </div>

              <div style={{ padding: 12, background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', whiteSpace: 'pre-line' }}>
                <strong>Submission Details:</strong>
                <div>{selectedSub.submissionText}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Review Status</label>
                  <select
                    className="form-select"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                  >
                    <option value="APPROVED">APPROVED</option>
                    <option value="REJECTED">REJECTED (Resubmit)</option>
                    <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Marks Awarded (out of 100)</label>
                  <input
                    type="number"
                    max={100}
                    min={0}
                    className="form-input"
                    value={marks}
                    onChange={(e) => setMarks(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Faculty Feedback & Comments</label>
                <textarea
                  className="form-input"
                  rows={4}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Provide detailed feedback on code quality, responsiveness, and architecture..."
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
                  {saving ? 'Saving...' : 'Submit Evaluation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
