import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { placementsApi } from '../../api/client';
import {
  PlacementProfile,
  PlacementReadiness,
  AssessmentSummaryGroup,
  AssessmentHistoryItem,
  InterviewRecord,
  PlacementStatusHistoryItem
} from '../../types';
import ProgressRing from '../../components/ui/ProgressRing';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import { CardSkeleton } from '../../components/ui/LoadingSkeleton';
import {
  Briefcase,
  CheckCircle2,
  AlertCircle,
  Clock,
  Award,
  Calendar,
  Building,
  History,
  TrendingUp,
  FileCheck,
  Send,
  UserCheck
} from 'lucide-react';

interface EnrichedPlacementResponse {
  student: {
    studentId: string;
    admissionNumber: string;
    fullName: string;
    email: string;
    mobile: string;
    courseTitle?: string;
    batchName?: string;
  };
  profile: PlacementProfile | null;
  readiness: PlacementReadiness;
  assessmentSummary: AssessmentSummaryGroup;
  assessmentHistory: AssessmentHistoryItem[];
  interviews: InterviewRecord[];
  interviewCounts: {
    total: number;
    upcoming: number;
    completed: number;
    selected: number;
    rejected: number;
  };
  statusHistory: PlacementStatusHistoryItem[];
}

export default function Placements() {
  const navigate = useNavigate();

  const { data, loading, error, refetch } = useApi<EnrichedPlacementResponse>(() =>
    placementsApi.getPlacementProfile()
  );

  const [resumeUrl, setResumeUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [skills, setSkills] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (loading && !data) {
    return <CardSkeleton count={3} />;
  }

  if (!data) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gray-900)' }}>
            Placement Readiness & Career Portal
          </h2>
          <p style={{ color: 'var(--gray-600)', fontSize: '0.9rem' }}>
            Learn • Grow • Get Placed. Automated eligibility engine powered by SETTINGS criteria.
          </p>
        </div>
        <div className="card">
          <EmptyState
            icon={<Briefcase size={48} color="var(--gray-400)" />}
            title="Placement profile not initialized"
            description="Your placement readiness profile will be dynamically activated as you complete your modules."
          />
        </div>
      </div>
    );
  }

  const { profile, readiness, assessmentSummary, assessmentHistory, interviews, interviewCounts, statusHistory } = data;
  const isEligible = readiness?.eligible || false;
  const readinessPercent = readiness?.readinessPercent || 0;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await placementsApi.updateProfile({
        resumeUrl: resumeUrl || profile?.resumeUrl || '',
        linkedinUrl: linkedinUrl || profile?.linkedinUrl || '',
        githubUrl: githubUrl || profile?.githubUrl || '',
        portfolioUrl: portfolioUrl || profile?.portfolioUrl || '',
        skills: skills || profile?.skills || ''
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
      refetch();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

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

  const getResultBadge = (result: string) => {
    switch (result) {
      case 'SELECTED':
      case 'OFFERED':
        return <span className="badge badge-success">{result}</span>;
      case 'REJECTED':
        return <span className="badge badge-danger">Rejected</span>;
      case 'WAITING':
        return <span className="badge badge-warning">Waiting</span>;
      default:
        return <span className="badge badge-secondary">{result || 'Pending'}</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gray-900)' }}>
            Placement Readiness & Career Portal
          </h2>
          <p style={{ color: 'var(--gray-600)', fontSize: '0.9rem' }}>
            Learn • Grow • Get Placed. Automated eligibility engine powered by SETTINGS criteria.
          </p>
        </div>

        <button
          onClick={() => navigate('/jobs')}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <Briefcase size={18} />
          <span>Browse Available Jobs</span>
        </button>
      </div>

      {/* Readiness Overview Banner */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 32, padding: '28px 32px' }}>
        <ProgressRing
          percent={readinessPercent}
          size={120}
          strokeWidth={10}
          color={isEligible ? 'var(--success-500)' : 'var(--primary-600)'}
        />

        <div style={{ flex: 1, minWidth: 260 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <span className={`badge ${isEligible ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.85rem' }}>
              {isEligible ? 'PLACEMENT ELIGIBLE' : 'NEEDS COMPLETION'}
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>
              Admission: <strong>{data.student?.admissionNumber}</strong>
            </span>
          </div>

          <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--gray-900)', marginBottom: 6 }}>
            {isEligible
              ? 'Congratulations! You meet all academy placement benchmarks.'
              : 'Keep pushing! Complete attendance, modules and assessments.'}
          </h3>

          <p style={{ fontSize: '0.9rem', color: 'var(--gray-600)', lineHeight: 1.5 }}>
            Eligibility criteria is dynamically verified against your real attendance records, topic assessments, verified resume, and mock rounds.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 200, borderLeft: '1px solid var(--gray-200)', paddingLeft: 24 }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>Status</div>
          <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary-700)' }}>
            {(profile?.status || 'NEAR_COMPLETION').replace('_', ' ')}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginTop: 4 }}>
            Interviews Assigned: <strong>{interviewCounts.total}</strong>
          </div>
        </div>
      </div>

      {/* Assessment Summary & Performance Cards */}
      <div>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--gray-800)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Award size={20} color="var(--primary-600)" />
          <span>Assessment Summary</span>
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {/* Topic Tests Card */}
          <div className="card" style={{ borderTop: '4px solid var(--primary-600)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--gray-500)', fontWeight: 600 }}>Topic Tests</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--gray-900)', marginTop: 4 }}>
                  {assessmentSummary.topicTests.count} <span style={{ fontSize: '0.9rem', color: 'var(--gray-500)', fontWeight: 500 }}>Completed</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Average Score</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-600)' }}>
                  {assessmentSummary.topicTests.avgMarks} / 10
                </div>
              </div>
            </div>
            <div style={{ marginTop: 16, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {Object.entries(assessmentSummary.topicTests.categories).map(([cat, count]) => (
                <span key={cat} className={`badge ${getCategoryBadgeClass(cat)}`} style={{ fontSize: '0.75rem' }}>
                  {cat}: {count}
                </span>
              ))}
            </div>
          </div>

          {/* Presentations Card */}
          <div className="card" style={{ borderTop: '4px solid #0284c7' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--gray-500)', fontWeight: 600 }}>Presentations</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--gray-900)', marginTop: 4 }}>
                  {assessmentSummary.presentations.count} <span style={{ fontSize: '0.9rem', color: 'var(--gray-500)', fontWeight: 500 }}>Delivered</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Average Score</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0284c7' }}>
                  {assessmentSummary.presentations.avgMarks} / 10
                </div>
              </div>
            </div>
            <div style={{ marginTop: 16, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {Object.entries(assessmentSummary.presentations.categories).map(([cat, count]) => (
                <span key={cat} className={`badge ${getCategoryBadgeClass(cat)}`} style={{ fontSize: '0.75rem' }}>
                  {cat}: {count}
                </span>
              ))}
            </div>
          </div>

          {/* Topic Mock Interviews Card */}
          <div className="card" style={{ borderTop: '4px solid #7c3aed' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--gray-500)', fontWeight: 600 }}>Topic Mock Interviews</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--gray-900)', marginTop: 4 }}>
                  {assessmentSummary.mockInterviews.count} <span style={{ fontSize: '0.9rem', color: 'var(--gray-500)', fontWeight: 500 }}>Taken</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Average Score</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#7c3aed' }}>
                  {assessmentSummary.mockInterviews.avgMarks} / 10
                </div>
              </div>
            </div>
            <div style={{ marginTop: 16, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {Object.entries(assessmentSummary.mockInterviews.categories).map(([cat, count]) => (
                <span key={cat} className={`badge ${getCategoryBadgeClass(cat)}`} style={{ fontSize: '0.75rem' }}>
                  {cat}: {count}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Assessment History Table */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--gray-800)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <History size={20} color="var(--primary-600)" />
          <span>Assessment History</span>
        </h3>

        {assessmentHistory.length === 0 ? (
          <div className="card">
            <EmptyState
              icon={<Award size={40} color="var(--gray-400)" />}
              title="No assessment history"
              description="No marks recorded yet. They will appear here once submitted by your trainer."
            />
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-wrap" style={{ border: 'none', borderRadius: 0 }}>
              <table>
                <thead>
                  <tr>
                    <th>Module</th>
                    <th>Topic</th>
                    <th>Assessment</th>
                    <th>Marks</th>
                    <th>Category</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {assessmentHistory.map((asm, idx) => (
                    <tr key={asm.saId || idx}>
                      <td style={{ fontWeight: 600 }}>{asm.moduleTitle || asm.moduleId}</td>
                      <td>{asm.topic || '—'}</td>
                      <td>
                        <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>
                          {asm.assessmentType}
                        </span>
                      </td>
                      <td>
                        {asm.isAbsent ? (
                          <span style={{ color: '#dc2626', fontWeight: 700 }}>Absent</span>
                        ) : (
                          <span style={{ fontWeight: 700 }}>{asm.marks !== null ? `${asm.marks}/10` : '—'}</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${getCategoryBadgeClass(asm.category)}`} style={{ fontWeight: 800 }}>
                          {asm.category}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--gray-600)' }}>
                        {asm.date ? new Date(asm.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Interview History Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--gray-800)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Building size={20} color="var(--primary-600)" />
            <span>Interview History</span>
          </h3>

          {/* Top Interview Count Counters */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ padding: '4px 12px', background: 'var(--gray-100)', borderRadius: 'var(--radius-full)', fontSize: '0.85rem', fontWeight: 600 }}>
              Total: <strong>{interviewCounts.total}</strong>
            </div>
            <div style={{ padding: '4px 12px', background: '#eff6ff', color: '#1d4ed8', borderRadius: 'var(--radius-full)', fontSize: '0.85rem', fontWeight: 600 }}>
              Upcoming: <strong>{interviewCounts.upcoming}</strong>
            </div>
            <div style={{ padding: '4px 12px', background: '#dcfce7', color: '#166534', borderRadius: 'var(--radius-full)', fontSize: '0.85rem', fontWeight: 600 }}>
              Selected: <strong>{interviewCounts.selected}</strong>
            </div>
            <div style={{ padding: '4px 12px', background: '#fee2e2', color: '#991b1b', borderRadius: 'var(--radius-full)', fontSize: '0.85rem', fontWeight: 600 }}>
              Rejected: <strong>{interviewCounts.rejected}</strong>
            </div>
          </div>
        </div>

        {interviews.length === 0 ? (
          <div className="card">
            <EmptyState
              icon={<Building size={40} color="var(--gray-400)" />}
              title="No interview assignments yet"
              description="When the academy placement department assigns company interview rounds, they will appear here with scheduled timing and results."
            />
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-wrap" style={{ border: 'none', borderRadius: 0 }}>
              <table>
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Position & Type</th>
                    <th>Interview Date & Time</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Result</th>
                  </tr>
                </thead>
                <tbody>
                  {interviews.map((intv) => (
                    <tr key={intv.interviewId}>
                      <td style={{ fontWeight: 700, color: 'var(--gray-900)' }}>
                        {intv.company}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{intv.position}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{intv.interviewType}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{intv.interviewDate}</div>
                        {intv.interviewTime && <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{intv.interviewTime}</div>}
                      </td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--gray-600)' }}>
                        {intv.location || 'Online'}
                      </td>
                      <td>
                        <span className="badge badge-secondary">{intv.status}</span>
                      </td>
                      <td>
                        {getResultBadge(intv.result)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Placement Status Timeline / History */}
      {statusHistory && statusHistory.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--gray-800)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={20} color="var(--primary-600)" />
            <span>Placement Status Timeline</span>
          </h3>

          <div className="card" style={{ padding: '24px 28px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {statusHistory.map((item, idx) => (
                <div key={item.historyId || idx} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--primary-600)', marginTop: 4 }} />
                    {idx < statusHistory.length - 1 && (
                      <div style={{ width: 2, height: 40, background: 'var(--gray-200)', marginTop: 4 }} />
                    )}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <span className="badge badge-primary" style={{ fontWeight: 700 }}>
                        {item.newStatus.replace('_', ' ')}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>
                        {item.changedDate ? new Date(item.changedDate).toLocaleString('en-IN') : ''}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--gray-600)' }}>
                        by <strong>{item.changedBy}</strong>
                      </span>
                    </div>
                    {item.remarks && (
                      <p style={{ fontSize: '0.85rem', color: 'var(--gray-700)', marginTop: 4 }}>
                        {item.remarks}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Career Profile Links Form */}
      <div className="card">
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: 16 }}>
          Professional Profiles & Resume Repository
        </h3>

        {savedSuccess && (
          <div style={{ padding: '10px 14px', background: '#dcfce7', borderRadius: 'var(--radius-md)', color: '#166534', fontSize: '0.85rem', marginBottom: 16 }}>
            Placement profiles and resume link updated successfully!
          </div>
        )}

        <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Google Drive Resume URL</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://drive.google.com/file/d/..."
                defaultValue={profile?.resumeUrl || ''}
                onChange={(e) => setResumeUrl(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">LinkedIn Profile URL</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://linkedin.com/in/..."
                defaultValue={profile?.linkedinUrl || ''}
                onChange={(e) => setLinkedinUrl(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">GitHub Profile URL</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://github.com/..."
                defaultValue={profile?.githubUrl || ''}
                onChange={(e) => setGithubUrl(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Portfolio / Hosted Projects URL</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://yourportfolio.com"
                defaultValue={profile?.portfolioUrl || ''}
                onChange={(e) => setPortfolioUrl(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Core Technical & Placement Skills (comma-separated)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. React, TypeScript, JavaScript, SQL, Apps Script"
              defaultValue={profile?.skills || ''}
              onChange={(e) => setSkills(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving ? 'Saving...' : 'Save Placement Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
