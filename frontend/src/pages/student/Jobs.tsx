import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { jobsApi } from '../../api/client';
import { Job, Internship } from '../../types';
import StatusBadge from '../../components/ui/StatusBadge';
import { CardSkeleton } from '../../components/ui/LoadingSkeleton';
import {
  Briefcase,
  MapPin,
  Building,
  DollarSign,
  Users,
  Clock,
  ArrowRight,
  Send,
  X,
  FileCheck
} from 'lucide-react';

export default function Jobs() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'jobs' | 'internships'>('jobs');
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<{ id: string; title: string; company: string; type: 'JOB' | 'INTERNSHIP' } | null>(null);
  const [resumeUrl, setResumeUrl] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  const { data: jobsData, loading: loadingJobs } = useApi<Job[]>(() =>
    jobsApi.getJobs()
  );

  const { data: internshipsData, loading: loadingInternships } = useApi<Internship[]>(() =>
    jobsApi.getInternships()
  );

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
      responsibilities: 'Build interactive user experiences, collaborate with backend engineers, and maintain clean UI codebases.',
      requirements: 'Strong command of React, CSS3 Flexbox/Grid, REST API consumption.',
      eligibilityCriteria: 'Minimum 75% attendance and passed Academy technical assessments.',
      applicationDeadline: '2026-05-30',
      status: 'ACTIVE',
      createdAt: '2026-03-01'
    },
    {
      jobId: 'JOB000002',
      title: 'Full Stack Web Developer (Node.js & React)',
      company: 'CloudSphere Technologies',
      location: 'Hyderabad, India',
      workMode: 'On-site',
      salaryMin: '₹6,00,000',
      salaryMax: '₹8,50,000 PA',
      openings: '2',
      description: 'Design robust APIs and scalable web applications in modern full-stack workflows.',
      responsibilities: 'Implement serverless backend handlers, database schema design, and secure authentication.',
      requirements: 'Experience with Node.js, Express, databases, and React frontends.',
      eligibilityCriteria: 'Passed Technical Mock Interview.',
      applicationDeadline: '2026-06-15',
      status: 'ACTIVE',
      createdAt: '2026-03-10'
    }
  ];

  const fallbackInternships: Internship[] = [
    {
      internshipId: 'INT000001',
      title: 'Frontend UI/UX Engineering Intern',
      company: 'NexGen Cloud Labs',
      location: 'Remote',
      workMode: 'Remote',
      stipend: '₹25,000 / month',
      durationMonths: '6 Months',
      openings: '5',
      description: 'Six months paid internship with direct PPO (Pre-Placement Offer) potential for top performers.',
      requirements: 'Good eye for responsive design, CSS animations, and React fundamentals.',
      applicationDeadline: '2026-05-15',
      status: 'ACTIVE',
      createdAt: '2026-03-12'
    }
  ];

  const jobs = jobsData && jobsData.length > 0 ? jobsData : fallbackJobs;
  const internships = internshipsData && internshipsData.length > 0 ? internshipsData : fallbackInternships;

  const handleOpenApply = (id: string, title: string, company: string, type: 'JOB' | 'INTERNSHIP') => {
    setSelectedOpportunity({ id, title, company, type });
    setResumeUrl('https://drive.google.com/file/d/sample-resume/view');
    setCoverLetter('');
    setAppliedSuccess(false);
    setApplyModalOpen(true);
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOpportunity) return;
    setApplying(true);
    try {
      if (selectedOpportunity.type === 'JOB') {
        await jobsApi.applyForJob(selectedOpportunity.id, resumeUrl, coverLetter);
      } else {
        await jobsApi.applyForInternship(selectedOpportunity.id, resumeUrl, coverLetter);
      }
      setAppliedSuccess(true);
      setTimeout(() => {
        setApplyModalOpen(false);
        navigate('/applications');
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setApplying(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gray-900)' }}>
            Placement Drives & Opportunities
          </h2>
          <p style={{ color: 'var(--gray-600)', fontSize: '0.9rem' }}>
            Curated corporate job openings and internships exclusively for Mastered Skill Academy candidates.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => navigate('/applications')}
            className="btn btn-secondary btn-sm"
          >
            My Applications History
          </button>

          <div style={{ display: 'flex', background: 'var(--gray-200)', borderRadius: 'var(--radius-md)', padding: 3 }}>
            <button
              onClick={() => setActiveTab('jobs')}
              className={`btn btn-sm ${activeTab === 'jobs' ? 'btn-primary' : ''}`}
              style={{ borderRadius: 'var(--radius-sm)' }}
            >
              Full-time Jobs ({jobs.length})
            </button>
            <button
              onClick={() => setActiveTab('internships')}
              className={`btn btn-sm ${activeTab === 'internships' ? 'btn-primary' : ''}`}
              style={{ borderRadius: 'var(--radius-sm)' }}
            >
              Internships ({internships.length})
            </button>
          </div>
        </div>
      </div>

      {/* Jobs Listing */}
      {activeTab === 'jobs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {jobs.map((job) => (
            <div key={job.jobId} className="card card-hover">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span className="badge badge-primary">{job.workMode}</span>
                    <span className="badge badge-gray">{job.openings} Openings</span>
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--gray-900)' }}>
                    {job.title}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: '0.85rem', color: 'var(--gray-600)', marginTop: 4 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                      <Building size={16} /> {job.company}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={16} /> {job.location}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#16a34a', fontWeight: 700 }}>
                      <DollarSign size={16} /> {job.salaryMin} - {job.salaryMax}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenApply(job.jobId, job.title, job.company, 'JOB')}
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <span>Apply Now</span>
                  <ArrowRight size={16} />
                </button>
              </div>

              <p style={{ fontSize: '0.9rem', color: 'var(--gray-700)', lineHeight: 1.5, marginBottom: 12 }}>
                {job.description}
              </p>

              <div style={{ padding: '12px 16px', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div><strong>Requirements:</strong> {job.requirements}</div>
                <div><strong>Eligibility:</strong> {job.eligibilityCriteria}</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--gray-500)', marginTop: 12 }}>
                <span>Application Deadline: <strong>{job.applicationDeadline}</strong></span>
                <span>Opportunity ID: {job.jobId}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Internships Listing */}
      {activeTab === 'internships' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {internships.map((int) => (
            <div key={int.internshipId} className="card card-hover">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span className="badge badge-warning">{int.workMode}</span>
                    <span className="badge badge-gray">{int.durationMonths}</span>
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--gray-900)' }}>
                    {int.title}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: '0.85rem', color: 'var(--gray-600)', marginTop: 4 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                      <Building size={16} /> {int.company}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={16} /> {int.location}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#16a34a', fontWeight: 700 }}>
                      Stipend: {int.stipend}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenApply(int.internshipId, int.title, int.company, 'INTERNSHIP')}
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <span>Apply for Internship</span>
                  <ArrowRight size={16} />
                </button>
              </div>

              <p style={{ fontSize: '0.9rem', color: 'var(--gray-700)', lineHeight: 1.5, marginBottom: 12 }}>
                {int.description}
              </p>

              <div style={{ padding: '12px 16px', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
                <strong>Requirements:</strong> {int.requirements}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--gray-500)', marginTop: 12 }}>
                <span>Deadline: <strong>{int.applicationDeadline}</strong></span>
                <span>ID: {int.internshipId}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Application Modal */}
      {applyModalOpen && selectedOpportunity && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Submit Application</h3>
              <button className="modal-close" onClick={() => setApplyModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            {appliedSuccess ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <FileCheck size={48} color="#16a34a" style={{ margin: '0 auto 16px' }} />
                <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--gray-900)' }}>
                  Application Submitted!
                </h4>
                <p style={{ color: 'var(--gray-600)', fontSize: '0.9rem', marginTop: 8 }}>
                  Your profile and resume have been forwarded to the corporate recruitment team.
                </p>
              </div>
            ) : (
              <form onSubmit={handleApplySubmit}>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--gray-900)' }}>
                    {selectedOpportunity.title}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--gray-600)' }}>
                    Company: {selectedOpportunity.company}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Resume Link (Google Drive / Cloud URL)
                  </label>
                  <input
                    type="url"
                    className="form-input"
                    value={resumeUrl}
                    onChange={(e) => setResumeUrl(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Cover Note / Highlights (Optional)
                  </label>
                  <textarea
                    className="form-input"
                    rows={4}
                    placeholder="Briefly state why you're a great fit for this position..."
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setApplyModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={applying}
                    className="btn btn-primary"
                  >
                    {applying ? 'Submitting...' : 'Confirm Application'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
