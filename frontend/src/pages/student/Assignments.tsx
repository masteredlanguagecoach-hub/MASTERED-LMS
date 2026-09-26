import React, { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { assignmentsApi } from '../../api/client';
import { Assignment } from '../../types';
import StatusBadge from '../../components/ui/StatusBadge';
import { CardSkeleton } from '../../components/ui/LoadingSkeleton';
import {
  FileText,
  Clock,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  ExternalLink,
  X
} from 'lucide-react';

export default function Assignments() {
  const { data, loading, error, refetch } = useApi<Assignment[]>(() =>
    assignmentsApi.getAssignments()
  );

  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const fallbackAssignments: Assignment[] = [
    {
      assignmentId: 'ASG000001',
      batchId: 'BAT000001',
      title: 'Responsive Dashboard Project with CSS Grid',
      description: 'Design and build a responsive student portal dashboard with mobile-first breakpoints and sidebar.',
      instructions: '1. Create HTML semantic structure.\n2. Apply CSS Flexbox & CSS Grid for desktop/tablet/mobile.\n3. Deploy to GitHub Pages or Vercel.\n4. Submit your live URL and GitHub repo link.',
      resourceUrl: 'https://github.com/example/starter-template',
      maxMarks: '100',
      dueDate: '2026-04-15',
      submissionType: 'URL_AND_FILE',
      status: 'ACTIVE',
      submissionStatus: 'APPROVED',
      submission: {
        submissionId: 'SUB001',
        assignmentId: 'ASG000001',
        studentId: 'STD000001',
        submissionText: 'GitHub: https://github.com/priya/dashboard-project\nLive Demo: https://priya-dashboard.vercel.app',
        submittedAt: '2026-03-20T10:00:00Z',
        status: 'APPROVED',
        marksAwarded: '95',
        feedback: 'Excellent component breakdown and clean CSS tokens! Great job on responsive layouts.',
        reviewedBy: 'TRN000001',
        reviewedAt: '2026-03-21T14:30:00Z'
      }
    },
    {
      assignmentId: 'ASG000002',
      batchId: 'BAT000001',
      title: 'React Custom Hooks & Google Apps Script API Client',
      description: 'Build an API client layer connecting React state to Apps Script endpoints with error handling.',
      instructions: 'Implement useApi and useAsyncAction hooks with retry states, skeletons, and token passing.',
      resourceUrl: 'https://developers.google.com/apps-script/guides/web',
      maxMarks: '100',
      dueDate: '2026-04-30',
      submissionType: 'URL_AND_FILE',
      status: 'ACTIVE',
      submissionStatus: 'SUBMITTED',
      submission: {
        submissionId: 'SUB002',
        assignmentId: 'ASG000002',
        studentId: 'STD000001',
        submissionText: 'https://github.com/priya/react-gas-client',
        submittedAt: '2026-03-25T16:00:00Z',
        status: 'SUBMITTED'
      }
    },
    {
      assignmentId: 'ASG000003',
      batchId: 'BAT000001',
      title: 'Full Stack LMS Real Database Integration',
      description: 'Connect frontend to all Google Sheets endpoints and test attendance/fee flows.',
      instructions: 'Ensure LockService is properly executed for concurrent writes and passwords hashed with PBKDF2 salt.',
      maxMarks: '100',
      dueDate: '2026-05-15',
      submissionType: 'URL_AND_FILE',
      status: 'ACTIVE',
      submissionStatus: 'PENDING'
    }
  ];

  const assignments = data && data.length > 0 ? data : fallbackAssignments;

  const handleOpenSubmit = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setSubmissionText('');
    setFileUrl('');
    setModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment) return;
    setSubmitting(true);
    try {
      await assignmentsApi.submitAssignment(selectedAssignment.assignmentId, {
        submissionText,
        fileUrl,
        fileName: 'Project_Submission.zip'
      });
      setModalOpen(false);
      refetch();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !data) {
    return <CardSkeleton count={3} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gray-900)' }}>
          Assignments & Project Deliverables
        </h2>
        <p style={{ color: 'var(--gray-600)', fontSize: '0.9rem' }}>
          Upload practical code submissions, project repos, and view trainer review remarks.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {assignments.map((asg) => {
          const sub = asg.submission;
          const status = asg.submissionStatus || 'PENDING';

          return (
            <div key={asg.assignmentId} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <FileText size={18} color="var(--primary-600)" />
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--gray-900)' }}>
                      {asg.title}
                    </h3>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: '0.8rem', color: 'var(--gray-500)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={14} /> Due: {asg.dueDate}
                    </span>
                    <span>Max Marks: {asg.maxMarks}</span>
                  </div>
                </div>

                <StatusBadge status={status} />
              </div>

              <p style={{ fontSize: '0.9rem', color: 'var(--gray-700)', lineHeight: 1.5, marginBottom: 16 }}>
                {asg.description}
              </p>

              {/* Instructions and resources */}
              {asg.instructions && (
                <div style={{ padding: '12px 16px', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: 'var(--gray-800)', whiteSpace: 'pre-line', marginBottom: 16 }}>
                  <strong>Instructions:</strong>
                  <div>{asg.instructions}</div>
                </div>
              )}

              {/* Trainer Feedback Banner if present */}
              {sub && sub.feedback && (
                <div style={{ padding: '12px 16px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 'var(--radius-md)', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#166534' }}>
                      Trainer Feedback & Evaluation
                    </span>
                    <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#15803d' }}>
                      Marks: {sub.marksAwarded} / {asg.maxMarks}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#14532d', margin: 0 }}>
                    "{sub.feedback}"
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, paddingTop: 12, borderTop: '1px solid var(--gray-100)' }}>
                {asg.resourceUrl ? (
                  <a
                    href={asg.resourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <Download size={14} />
                    <span>Download Resources</span>
                  </a>
                ) : <div />}

                {status === 'PENDING' || status === 'REJECTED' ? (
                  <button
                    onClick={() => handleOpenSubmit(asg)}
                    className="btn btn-primary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <Upload size={14} />
                    <span>{status === 'REJECTED' ? 'Resubmit Project' : 'Upload Submission'}</span>
                  </button>
                ) : (
                  <span style={{ fontSize: '0.85rem', color: 'var(--gray-500)', fontWeight: 500 }}>
                    Submitted on {sub?.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : 'Active Record'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Submission Modal */}
      {modalOpen && selectedAssignment && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Submit Assignment</h3>
              <button className="modal-close" onClick={() => setModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--gray-900)' }}>
                  {selectedAssignment.title}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>
                  Due: {selectedAssignment.dueDate}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Project URL / GitHub Repository / Live Demo
                </label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="https://github.com/username/project&#10;https://live-demo.com"
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Google Drive / Cloud File URL (Optional)
                </label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://drive.google.com/file/d/..."
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                  Files are saved in your Mastered Skill Academy Google Drive folder.
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                >
                  {submitting ? 'Submitting...' : 'Confirm Submission'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
