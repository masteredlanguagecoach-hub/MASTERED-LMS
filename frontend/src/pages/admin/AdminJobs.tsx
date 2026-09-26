import React, { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { adminApi, jobsApi } from '../../api/client';
import { Job, Internship } from '../../types';
import StatusBadge from '../../components/ui/StatusBadge';
import { Briefcase, Plus, Building, MapPin, DollarSign, X } from 'lucide-react';

export default function AdminJobs() {
  const { data: jobs, refetch: refetchJobs } = useApi<Job[]>(() =>
    jobsApi.getJobs()
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('Bangalore / Hybrid');
  const [workMode, setWorkMode] = useState('Hybrid');
  const [salaryMin, setSalaryMin] = useState('₹5,00,000');
  const [salaryMax, setSalaryMax] = useState('₹7,50,000');
  const [openings, setOpenings] = useState('3');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [eligibilityCriteria, setEligibilityCriteria] = useState('Min 75% attendance');
  const [applicationDeadline, setApplicationDeadline] = useState('2026-06-30');
  const [saving, setSaving] = useState(false);

  const fallbackJobs: Job[] = [
    {
      jobId: 'JOB000001',
      title: 'Junior React Frontend Developer',
      company: 'Innovatech Digital Solutions',
      location: 'Bangalore, India',
      workMode: 'Hybrid',
      salaryMin: '₹5,50,000',
      salaryMax: '₹7,50,000 PA',
      openings: '3',
      description: 'Looking for a skilled frontend engineer proficient in React, TypeScript, and state management.',
      requirements: 'Strong command of React, CSS3 Flexbox/Grid, REST API consumption.',
      eligibilityCriteria: 'Minimum 75% attendance and passed Academy technical assessments.',
      applicationDeadline: '2026-05-30',
      status: 'ACTIVE',
      createdAt: '2026-03-01'
    }
  ];

  const jobList = jobs && jobs.length > 0 ? jobs : fallbackJobs;

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminApi.createJob({
        title,
        company,
        location,
        workMode,
        salaryMin,
        salaryMax,
        openings,
        description,
        requirements,
        eligibilityCriteria,
        applicationDeadline
      });
      setModalOpen(false);
      refetchJobs();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gray-900)' }}>
            Placement Drives & Corporate Postings
          </h2>
          <p style={{ color: 'var(--gray-600)', fontSize: '0.9rem' }}>
            Publish career opportunities, specify criteria, and monitor campus placement pipelines.
          </p>
        </div>

        <button
          onClick={() => {
            setTitle('');
            setCompany('');
            setDescription('');
            setRequirements('');
            setModalOpen(true);
          }}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <Plus size={18} />
          <span>Post New Job Opportunity</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
        {jobList.map((job) => (
          <div key={job.jobId} className="card card-hover">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <span className="badge badge-primary">{job.workMode}</span>
              <StatusBadge status={job.status} />
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--gray-900)' }}>
              {job.title}
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.85rem', color: 'var(--gray-600)', margin: '8px 0 12px' }}>
              <span style={{ fontWeight: 600 }}>{job.company}</span>
              <span>•</span>
              <span>{job.location}</span>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--gray-700)', lineHeight: 1.5, marginBottom: 12 }}>
              {job.description}
            </p>

            <div style={{ padding: '10px 14px', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', marginBottom: 12 }}>
              <div><strong>Salary:</strong> {job.salaryMin} - {job.salaryMax}</div>
              <div style={{ marginTop: 2 }}><strong>Openings:</strong> {job.openings} positions</div>
              <div style={{ marginTop: 2 }}><strong>Eligibility:</strong> {job.eligibilityCriteria}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--gray-500)', paddingTop: 10, borderTop: '1px solid var(--gray-100)' }}>
              <span>Deadline: <strong>{job.applicationDeadline}</strong></span>
              <span>ID: {job.jobId}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Create Job Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Post New Career Opportunity</h3>
              <button className="modal-close" onClick={() => setModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateJob} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Job Title</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Junior React Developer"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Hiring Company</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. TechCorp Solutions"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    className="form-input"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Work Mode</label>
                  <select
                    className="form-select"
                    value={workMode}
                    onChange={(e) => setWorkMode(e.target.value)}
                  >
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Openings</label>
                  <input
                    type="number"
                    className="form-input"
                    value={openings}
                    onChange={(e) => setOpenings(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Salary Min</label>
                  <input
                    type="text"
                    className="form-input"
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Salary Max</label>
                  <input
                    type="text"
                    className="form-input"
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Role Description</label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Skill Requirements</label>
                <input
                  type="text"
                  className="form-input"
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Application Deadline</label>
                <input
                  type="date"
                  className="form-input"
                  value={applicationDeadline}
                  onChange={(e) => setApplicationDeadline(e.target.value)}
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
                  {saving ? 'Posting...' : 'Publish Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
