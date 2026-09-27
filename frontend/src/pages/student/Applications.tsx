import React from 'react';
import { useApi } from '../../hooks/useApi';
import { jobsApi } from '../../api/client';
import { Application } from '../../types';
import StatusBadge from '../../components/ui/StatusBadge';
import { CardSkeleton } from '../../components/ui/LoadingSkeleton';
import EmptyState from '../../components/ui/EmptyState';
import { Briefcase, Building, Calendar, ExternalLink, CheckCircle2, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Applications() {
  const navigate = useNavigate();
  const { data, loading, error } = useApi<Application[]>(() =>
    jobsApi.getApplications()
  );

  const applications = data || [];

  if (loading && !data) {
    return <CardSkeleton count={3} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gray-900)' }}>
            My Job & Internship Applications
          </h2>
          <p style={{ color: 'var(--gray-600)', fontSize: '0.9rem' }}>
            Real-time status tracking across screening, interview rounds, and offer rollouts.
          </p>
        </div>

        <button
          onClick={() => navigate('/jobs')}
          className="btn btn-primary btn-sm"
        >
          Explore More Openings
        </button>
      </div>

      {applications.length === 0 ? (
        <EmptyState
          title="No Applications Yet"
          description="You haven't submitted any job or internship applications yet. Browse the placement catalog to apply!"
          action={
            <button onClick={() => navigate('/jobs')} className="btn btn-primary">
              Browse Job Openings
            </button>
          }
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {applications.map((app) => {
            const title = app.jobDetails?.title || app.internshipDetails?.title || 'Engineering Role';
            const company = app.jobDetails?.company || app.internshipDetails?.company || 'Corporate Partner';
            const location = app.jobDetails?.location || app.internshipDetails?.location || 'India';
            const workMode = app.jobDetails?.workMode || app.internshipDetails?.workMode || 'Remote';

            return (
              <div key={app.applicationId} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span className="badge badge-primary">{app.type}</span>
                      <span className="badge badge-gray">{workMode}</span>
                    </div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--gray-900)' }}>
                      {title}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: '0.85rem', color: 'var(--gray-600)', marginTop: 4 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                        <Building size={16} /> {company}
                      </span>
                      <span>Location: {location}</span>
                    </div>
                  </div>

                  <StatusBadge status={app.status} />
                </div>

                {/* Interview Alert Banner if scheduled */}
                {app.interviewDate && (
                  <div
                    style={{
                      padding: '12px 16px',
                      background: '#fef3c7',
                      border: '1px solid #fde047',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      marginBottom: 12
                    }}
                  >
                    <Clock size={18} color="#d97706" />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#92400e' }}>
                        Interview Scheduled
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#78350f' }}>
                        {new Date(app.interviewDate).toLocaleString()} • Video Conference Link sent via email
                      </div>
                    </div>
                  </div>
                )}

                {/* Offer Details if present */}
                {app.offerDetails && (
                  <div
                    style={{
                      padding: '12px 16px',
                      background: '#dcfce7',
                      border: '1px solid #86efac',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: 12
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#166534' }}>
                      Official Offer Details
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#14532d', marginTop: 2 }}>
                      {app.offerDetails}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--gray-500)', paddingTop: 12, borderTop: '1px solid var(--gray-100)' }}>
                  <span>Applied on: <strong>{new Date(app.appliedAt).toLocaleDateString()}</strong></span>
                  <span>Application Reference: <strong>{app.applicationId}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
