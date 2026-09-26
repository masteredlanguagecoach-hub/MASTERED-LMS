import React, { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { placementsApi } from '../../api/client';
import { PlacementProfile, PlacementReadiness } from '../../types';
import ProgressRing from '../../components/ui/ProgressRing';
import StatusBadge from '../../components/ui/StatusBadge';
import { CardSkeleton } from '../../components/ui/LoadingSkeleton';
import {
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  Briefcase
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PlacementResponse {
  profile: PlacementProfile;
  readiness: PlacementReadiness;
  activities: Array<{
    activityId: string;
    type: string;
    description: string;
    date: string;
    outcome?: string;
  }>;
}

export default function Placements() {
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useApi<PlacementResponse>(() =>
    placementsApi.getPlacements()
  );

  const [resumeUrl, setResumeUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [skills, setSkills] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const fallbackData: PlacementResponse = {
    profile: {
      placementId: 'PLC000001',
      studentId: 'STD000001',
      resumeUrl: 'https://drive.google.com/file/d/sample-resume/view',
      linkedinUrl: 'https://linkedin.com/in/priyasharma',
      githubUrl: 'https://github.com/priyasharma',
      portfolioUrl: 'https://priyasharma.dev',
      skills: 'React, TypeScript, JavaScript, CSS3, Google Apps Script, REST APIs',
      mockInterviewDone: 'true',
      mockScore: '8.5 / 10',
      placementEligible: 'true',
      readinessPercent: '88'
    },
    readiness: {
      eligible: true,
      readinessPercent: 88,
      criteria: [
        { name: 'Class Attendance', value: '86%', required: '≥ 75%', met: true },
        { name: 'Assessment Completion', value: '80%', required: '≥ 70%', met: true },
        { name: 'Technical Resume Verified', value: 'Approved', required: 'Required', met: true },
        { name: 'Technical Mock Interview', value: 'Completed (8.5/10)', required: 'Required', met: true }
      ],
      attendancePercent: 86,
      assessmentCompletion: 80
    },
    activities: [
      {
        activityId: 'ACT001',
        type: 'MOCK_INTERVIEW',
        description: 'Frontend Systems & Data Structures Mock Round with Faculty',
        date: '2026-03-15',
        outcome: 'Cleared with recommendation for Junior Frontend Engineer roles'
      },
      {
        activityId: 'ACT002',
        type: 'RESUME_REVIEW',
        description: 'Placement Cell Resume Screening & ATS Formatting',
        date: '2026-03-10',
        outcome: 'Approved'
      }
    ]
  };

  const pl = data || fallbackData;
  const isEligible = pl.readiness.eligible;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await placementsApi.updateProfile({
        resumeUrl: resumeUrl || pl.profile.resumeUrl || '',
        linkedinUrl: linkedinUrl || pl.profile.linkedinUrl || '',
        githubUrl: githubUrl || pl.profile.githubUrl || '',
        portfolioUrl: portfolioUrl || pl.profile.portfolioUrl || '',
        skills: skills || pl.profile.skills || ''
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

  if (loading && !data) {
    return <CardSkeleton count={3} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
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
          percent={pl.readiness.readinessPercent}
          size={120}
          strokeWidth={12}
          color={isEligible ? '#22c55e' : '#3b82f6'}
          label={`${pl.readiness.readinessPercent}%`}
          subLabel="Readiness"
        />

        <div style={{ flex: 1, minWidth: 260 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span className={`badge ${isEligible ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.8rem' }}>
              {isEligible ? 'OFFICIALLY PLACEMENT ELIGIBLE' : 'REQUIREMENTS IN PROGRESS'}
            </span>
          </div>

          <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--gray-900)', marginBottom: 6 }}>
            {isEligible
              ? 'You are cleared for corporate campus drives!'
              : 'Complete remaining milestones to unlock applications.'}
          </h3>

          <p style={{ fontSize: '0.9rem', color: 'var(--gray-600)', lineHeight: 1.5 }}>
            Eligibility requires meeting configured thresholds for attendance, assessments, resume clearance, and faculty mock interviews.
          </p>
        </div>
      </div>

      {/* Readiness Criteria Checklist */}
      <div className="card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: 16 }}>
          Configurable Eligibility Criteria Checklist
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {pl.readiness.criteria.map((crit, idx) => (
            <div
              key={idx}
              style={{
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                border: `1.5px solid ${crit.met ? '#86efac' : 'var(--gray-200)'}`,
                background: crit.met ? '#f0fdf4' : 'var(--gray-50)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12
              }}
            >
              <div style={{ marginTop: 2 }}>
                {crit.met ? (
                  <CheckCircle2 size={20} color="#16a34a" />
                ) : (
                  <AlertCircle size={20} color="#f59e0b" />
                )}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--gray-900)' }}>
                  {crit.name}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--gray-600)', marginTop: 2 }}>
                  Your status: <strong>{crit.value}</strong>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: 2 }}>
                  Required: {crit.required}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Student Placement Profile Form */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--gray-900)' }}>
            Candidate Profile & Portfolio Links
          </h3>
          {savedSuccess && (
            <span style={{ fontSize: '0.85rem', color: '#16a34a', fontWeight: 600 }}>
              Profile updated successfully!
            </span>
          )}
        </div>

        <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Resume Link (Google Drive / Cloud)</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://drive.google.com/file/..."
                defaultValue={pl.profile.resumeUrl}
                onChange={(e) => setResumeUrl(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">LinkedIn Profile URL</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://linkedin.com/in/username"
                defaultValue={pl.profile.linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">GitHub Profile URL</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://github.com/username"
                defaultValue={pl.profile.githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Portfolio Website URL</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://yourportfolio.dev"
                defaultValue={pl.profile.portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Core Technical Skills (Comma separated)</label>
            <input
              type="text"
              className="form-input"
              placeholder="React, TypeScript, CSS Grid, Apps Script, Node.js"
              defaultValue={pl.profile.skills}
              onChange={(e) => setSkills(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary"
            >
              {saving ? 'Saving...' : 'Update Placement Profile'}
            </button>
          </div>
        </form>
      </div>

      {/* Placement Activities Log */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--gray-200)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--gray-900)' }}>
            Placement Cell Activities & Mock Evaluation History
          </h3>
        </div>

        <div className="table-wrap" style={{ border: 'none', borderRadius: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Activity Type</th>
                <th>Description</th>
                <th>Outcome / Feedback</th>
              </tr>
            </thead>
            <tbody>
              {pl.activities.map((act) => (
                <tr key={act.activityId}>
                  <td style={{ fontWeight: 600 }}>{new Date(act.date).toLocaleDateString()}</td>
                  <td><span className="badge badge-primary">{act.type.replace('_', ' ')}</span></td>
                  <td style={{ color: 'var(--gray-800)', fontSize: '0.9rem' }}>{act.description}</td>
                  <td style={{ fontWeight: 600, color: '#16a34a', fontSize: '0.85rem' }}>{act.outcome || 'Logged'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
