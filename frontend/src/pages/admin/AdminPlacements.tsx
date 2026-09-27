import React, { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { adminApi, placementsApi } from '../../api/client';
import {
  PlacementCandidate,
  Course,
  Batch,
  PlacementStatus,
  InterviewRecord,
  PlacementStatusHistoryItem,
  AssessmentHistoryItem,
  AssessmentSummaryGroup
} from '../../types';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import {
  GraduationCap,
  Calendar,
  Briefcase,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  X,
  Clock,
  Building,
  UserCheck,
  TrendingUp,
  FileText,
  History
} from 'lucide-react';

const ALL_PLACEMENT_STATUSES: { value: PlacementStatus; label: string }[] = [
  { value: 'NOT_READY', label: 'Not Ready' },
  { value: 'NEAR_COMPLETION', label: 'Near Completion' },
  { value: 'ELIGIBLE', label: 'Eligible' },
  { value: 'INTERVIEW_ASSIGNED', label: 'Interview Assigned' },
  { value: 'INTERVIEWED', label: 'Interviewed' },
  { value: 'SHORTLISTED', label: 'Shortlisted' },
  { value: 'SELECTED', label: 'Selected' },
  { value: 'OFFER_RECEIVED', label: 'Offer Received' },
  { value: 'PLACED', label: 'Placed' },
  { value: 'NOT_SELECTED', label: 'Not Selected' },
  { value: 'ON_HOLD', label: 'On Hold' },
  { value: 'WITHDRAWN', label: 'Withdrawn' }
];

export default function AdminPlacements() {
  const { data: candidatesData, loading, refetch } = useApi<PlacementCandidate[]>(() =>
    placementsApi.getPlacementCandidates()
  );
  const { data: coursesData } = useApi<Course[]>(() => adminApi.getCourses());
  const { data: batchesData } = useApi<Batch[]>(() => adminApi.getBatches());

  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [batchFilter, setBatchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [progressFilter, setProgressFilter] = useState<'ALL' | 'NEAR_COMPLETION' | 'COMPLETED'>('ALL');

  // Assign Interview Modal
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<PlacementCandidate | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [positionTitle, setPositionTitle] = useState('');
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('');
  const [interviewerName, setInterviewerName] = useState('');
  const [roundNumber, setRoundNumber] = useState('1');
  const [interviewNotes, setInterviewNotes] = useState('');
  const [assigningSaving, setAssigningSaving] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [assignSuccess, setAssignSuccess] = useState<string | null>(null);

  // Update Status Modal
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<PlacementStatus>('ELIGIBLE');
  const [statusNotes, setStatusNotes] = useState('');
  const [statusSaving, setStatusSaving] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  // View Candidate Full Profile Modal
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileTab, setProfileTab] = useState<'summary' | 'history' | 'interviews' | 'timeline'>('summary');
  const [candidateProfileData, setCandidateProfileData] = useState<{
    candidate: PlacementCandidate;
    assessmentSummary?: AssessmentSummaryGroup;
    assessmentHistory?: AssessmentHistoryItem[];
    interviewHistory?: InterviewRecord[];
    statusHistory?: PlacementStatusHistoryItem[];
  } | null>(null);

  const candidates = candidatesData || [];
  const courses = coursesData || [];
  const batches = batchesData || [];

  // Metrics
  const totalCount = candidates.length;
  const completedCount = candidates.filter((c) => c.isCompleted || c.progress === 100).length;
  const nearCount = candidates.filter((c) => c.isNearCompletion || (c.progress >= 80 && c.progress < 100)).length;
  const inInterviewCount = candidates.filter((c) =>
    ['INTERVIEW_ASSIGNED', 'INTERVIEWED', 'SHORTLISTED'].includes(c.placementStatus)
  ).length;
  const placedCount = candidates.filter((c) =>
    ['SELECTED', 'OFFER_RECEIVED', 'PLACED'].includes(c.placementStatus)
  ).length;

  // Filter candidates
  const filteredCandidates = candidates.filter((c) => {
    const matchSearch =
      (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.admissionNumber || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchCourse = courseFilter ? c.courseId === courseFilter : true;
    const matchBatch = batchFilter ? c.batchId === batchFilter : true;
    const matchStatus = statusFilter ? c.placementStatus === statusFilter : true;

    let matchProgress = true;
    if (progressFilter === 'COMPLETED') {
      matchProgress = c.isCompleted || c.progress === 100;
    } else if (progressFilter === 'NEAR_COMPLETION') {
      matchProgress = c.isNearCompletion || (c.progress >= 80 && c.progress < 100);
    }

    return matchSearch && matchCourse && matchBatch && matchStatus && matchProgress;
  });

  // Open Assign Interview
  const handleOpenAssignInterview = (candidate: PlacementCandidate) => {
    setSelectedCandidate(candidate);
    setCompanyName('');
    setPositionTitle('');
    setInterviewDate(new Date().toISOString().split('T')[0]);
    setInterviewTime('11:00 AM');
    setInterviewerName('');
    setRoundNumber('1');
    setInterviewNotes('');
    setAssignError(null);
    setAssignSuccess(null);
    setAssignModalOpen(true);
  };

  const handleAssignInterviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidate) return;

    setAssigningSaving(true);
    setAssignError(null);
    try {
      const res = await placementsApi.assignInterview(selectedCandidate.studentId, {
        company: companyName,
        position: positionTitle,
        interviewDate,
        interviewTime,
        interviewerName,
        round: roundNumber,
        remarks: interviewNotes
      });

      if (res.success) {
        setAssignSuccess('Interview assigned successfully! Candidate status updated.');
        refetch();
        setTimeout(() => {
          setAssignModalOpen(false);
        }, 1500);
      } else {
        setAssignError(res.message || 'Failed to assign interview.');
      }
    } catch (err: unknown) {
      const error = err as Error;
      setAssignError(error.message || 'Error assigning interview.');
    } finally {
      setAssigningSaving(false);
    }
  };

  // Open Update Status
  const handleOpenUpdateStatus = (candidate: PlacementCandidate) => {
    setSelectedCandidate(candidate);
    setNewStatus(candidate.placementStatus as PlacementStatus);
    setStatusNotes('');
    setStatusError(null);
    setStatusModalOpen(true);
  };

  const handleUpdateStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidate) return;

    setStatusSaving(true);
    setStatusError(null);
    try {
      const res = await placementsApi.updatePlacementStatus(
        selectedCandidate.studentId,
        newStatus,
        statusNotes
      );

      if (res.success) {
        setStatusModalOpen(false);
        refetch();
      } else {
        setStatusError(res.message || 'Failed to update status.');
      }
    } catch (err: unknown) {
      const error = err as Error;
      setStatusError(error.message || 'Error updating status.');
    } finally {
      setStatusSaving(false);
    }
  };

  // Open Full Profile View
  const handleOpenCandidateProfile = async (candidate: PlacementCandidate) => {
    setSelectedCandidate(candidate);
    setCandidateProfileData(null);
    setProfileLoading(true);
    setProfileTab('summary');
    setProfileModalOpen(true);

    try {
      const res = await placementsApi.getPlacementProfile(candidate.studentId);
      if (res.success && res.data) {
        const pData = res.data as any;
        setCandidateProfileData({
          candidate,
          assessmentSummary: pData.assessmentSummary,
          assessmentHistory: pData.assessmentHistory || [],
          interviewHistory: pData.interviewHistory || [],
          statusHistory: pData.statusHistory || []
        });
      } else {
        setCandidateProfileData({ candidate });
      }
    } catch (err) {
      console.error(err);
      setCandidateProfileData({ candidate });
    } finally {
      setProfileLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Page Title */}
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gray-900)' }}>
          Placement Candidates & Recruitment Hub
        </h2>
        <p style={{ color: 'var(--gray-600)', fontSize: '0.9rem' }}>
          Dynamic engine tracking Near Completion (≥80%) and Course Completed (100%) students ready for career placement.
        </p>
      </div>

      {/* Metrics Counters */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--gray-500)', fontWeight: 600 }}>Total Eligible Candidates</div>
            <GraduationCap size={20} color="var(--primary)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--gray-900)', marginTop: 8 }}>
            {totalCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: 4 }}>
            Progress ≥ 80% or active in pipeline
          </div>
        </div>

        <div className="card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--gray-500)', fontWeight: 600 }}>Completed Course (100%)</div>
            <CheckCircle2 size={20} color="#16a34a" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#16a34a', marginTop: 8 }}>
            {completedCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: 4 }}>
            Fully finished all modules & lessons
          </div>
        </div>

        <div className="card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--gray-500)', fontWeight: 600 }}>Near Completion (≥80%)</div>
            <TrendingUp size={20} color="#2563eb" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#2563eb', marginTop: 8 }}>
            {nearCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: 4 }}>
            Approaching final milestone
          </div>
        </div>

        <div className="card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--gray-500)', fontWeight: 600 }}>In Interview Stages</div>
            <Clock size={20} color="#d97706" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#d97706', marginTop: 8 }}>
            {inInterviewCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: 4 }}>
            Assigned, interviewed, or shortlisted
          </div>
        </div>

        <div className="card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--gray-500)', fontWeight: 600 }}>Placed / Selected</div>
            <Briefcase size={20} color="#059669" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#059669', marginTop: 8 }}>
            {placedCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: 4 }}>
            Offers received or confirmed joined
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: 16, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: 260, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Search size={18} color="var(--gray-400)" />
          <input
            type="text"
            className="form-input"
            style={{ border: 'none', padding: 0 }}
            placeholder="Search by student name or admission number (e.g. MSA000001)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Progress Category Filter */}
        <select
          className="form-select"
          style={{ width: 'auto', minWidth: 160, fontSize: '0.85rem' }}
          value={progressFilter}
          onChange={(e) => setProgressFilter(e.target.value as any)}
        >
          <option value="ALL">All Eligible (≥80%)</option>
          <option value="COMPLETED">Completed (100%)</option>
          <option value="NEAR_COMPLETION">Near Completion (80-99%)</option>
        </select>

        {/* Course Filter */}
        {courses.length > 0 && (
          <select
            className="form-select"
            style={{ width: 'auto', minWidth: 140, fontSize: '0.85rem' }}
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
          >
            <option value="">All Courses</option>
            {courses.map((c) => (
              <option key={c.courseId} value={c.courseId}>
                {c.shortCode || c.title}
              </option>
            ))}
          </select>
        )}

        {/* Batch Filter */}
        {batches.length > 0 && (
          <select
            className="form-select"
            style={{ width: 'auto', minWidth: 140, fontSize: '0.85rem' }}
            value={batchFilter}
            onChange={(e) => setBatchFilter(e.target.value)}
          >
            <option value="">All Batches</option>
            {batches.map((b) => (
              <option key={b.batchId} value={b.batchId}>
                {b.batchName}
              </option>
            ))}
          </select>
        )}

        {/* Placement Status Filter */}
        <select
          className="form-select"
          style={{ width: 'auto', minWidth: 160, fontSize: '0.85rem' }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          {ALL_PLACEMENT_STATUSES.map((st) => (
            <option key={st.value} value={st.value}>
              {st.label}
            </option>
          ))}
        </select>
      </div>

      {/* Candidates Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-500)' }}>
            Evaluating placement candidate eligibility from Google Sheets...
          </div>
        ) : filteredCandidates.length === 0 ? (
          <div style={{ padding: 32 }}>
            <EmptyState
              icon={<GraduationCap size={48} color="var(--gray-400)" />}
              title="No placement candidates found"
              description="Students with course progress ≥ 80% will automatically appear here as candidates ready for recruitment."
            />
          </div>
        ) : (
          <div className="table-wrap" style={{ border: 'none', borderRadius: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Admission No</th>
                  <th>Candidate Name</th>
                  <th>Course & Batch</th>
                  <th>Course Progress</th>
                  <th>Attendance</th>
                  <th>Assessment Performance</th>
                  <th>Placement Status</th>
                  <th>Interviews</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCandidates.map((c) => (
                  <tr key={c.studentId || c.admissionNumber}>
                    <td>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '3px 8px',
                          background: '#eff6ff',
                          color: '#1d4ed8',
                          borderRadius: '4px',
                          fontWeight: 700,
                          fontFamily: 'monospace',
                          fontSize: '0.85rem'
                        }}
                      >
                        {c.admissionNumber}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{c.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>ID: {c.studentId}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{c.courseName || c.courseId}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{c.batchName || c.batchId}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div
                          style={{
                            flex: 1,
                            minWidth: 60,
                            height: 6,
                            background: '#e2e8f0',
                            borderRadius: 3,
                            overflow: 'hidden'
                          }}
                        >
                          <div
                            style={{
                              width: `${c.progress}%`,
                              height: '100%',
                              background: c.progress >= 100 ? '#16a34a' : '#2563eb'
                            }}
                          />
                        </div>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{c.progress}%</span>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--gray-500)', marginTop: 2 }}>
                        {c.progress >= 100 ? 'Completed' : 'Near Completion'}
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          fontWeight: 700,
                          color: ((c.attendance ?? c.attendancePercent) ?? 0) >= 75 ? '#16a34a' : ((c.attendance ?? c.attendancePercent) ?? 0) >= 60 ? '#d97706' : '#dc2626'
                        }}
                      >
                        {(c.attendance ?? c.attendancePercent) ?? 0}%
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                          {c.assessmentPerformance ? `${c.assessmentPerformance.averageMark}/10` : '—'}
                        </span>
                        {c.assessmentPerformance?.categoryCounts && (
                          <div style={{ display: 'flex', gap: 3 }}>
                            {c.assessmentPerformance.categoryCounts.A > 0 && (
                              <span
                                style={{
                                  padding: '1px 5px',
                                  fontSize: '0.65rem',
                                  borderRadius: 3,
                                  background: '#dcfce7',
                                  color: '#15803d',
                                  fontWeight: 700
                                }}
                              >
                                {c.assessmentPerformance.categoryCounts.A}A
                              </span>
                            )}
                            {c.assessmentPerformance.categoryCounts.B > 0 && (
                              <span
                                style={{
                                  padding: '1px 5px',
                                  fontSize: '0.65rem',
                                  borderRadius: 3,
                                  background: '#dbeafe',
                                  color: '#1d4ed8',
                                  fontWeight: 700
                                }}
                              >
                                {c.assessmentPerformance.categoryCounts.B}B
                              </span>
                            )}
                            {c.assessmentPerformance.categoryCounts.E > 0 && (
                              <span
                                style={{
                                  padding: '1px 5px',
                                  fontSize: '0.65rem',
                                  borderRadius: 3,
                                  background: '#fef2f2',
                                  color: '#b91c1c',
                                  fontWeight: 700
                                }}
                              >
                                {c.assessmentPerformance.categoryCounts.E}E
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={c.placementStatus} />
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{c.interviewCount} Scheduled</div>
                      {c.lastInterview && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--gray-500)' }}>
                          {c.lastInterview.company} • {c.lastInterview.result || c.lastInterview.status}
                        </div>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => handleOpenAssignInterview(c)}
                          className="btn btn-primary"
                          style={{ padding: '5px 9px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}
                          title="Assign interview"
                        >
                          <Calendar size={13} />
                          <span>Interview</span>
                        </button>

                        <button
                          onClick={() => handleOpenUpdateStatus(c)}
                          className="btn btn-secondary"
                          style={{ padding: '5px 9px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}
                          title="Update placement status"
                        >
                          <UserCheck size={13} />
                          <span>Status</span>
                        </button>

                        <button
                          onClick={() => handleOpenCandidateProfile(c)}
                          className="btn btn-secondary"
                          style={{ padding: '5px 9px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}
                          title="View profile & history"
                        >
                          <FileText size={13} />
                          <span>Profile</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assign Interview Modal */}
      {assignModalOpen && selectedCandidate && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <h3 className="modal-title">Assign Placement Interview</h3>
              <button className="modal-close" onClick={() => setAssignModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAssignInterviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {assignSuccess && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 14px',
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    color: '#15803d',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.85rem'
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>{assignSuccess}</span>
                </div>
              )}

              {assignError && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 14px',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#b91c1c',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.85rem'
                  }}
                >
                  <AlertCircle size={16} />
                  <span>{assignError}</span>
                </div>
              )}

              <div style={{ padding: 12, background: '#f8fafc', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
                <div>
                  <strong>Candidate:</strong> {selectedCandidate.name} (
                  <span style={{ fontFamily: 'monospace' }}>{selectedCandidate.admissionNumber}</span>)
                </div>
                <div style={{ marginTop: 4, color: 'var(--gray-600)' }}>
                  Course: {selectedCandidate.courseName} • Progress: {selectedCandidate.progress}% • Attendance:{' '}
                  {selectedCandidate.attendance}%
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Hiring Company *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Wipro / Infosys / Apollo"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Position / Role *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Associate Specialist"
                    value={positionTitle}
                    onChange={(e) => setPositionTitle(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Interview Date *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Interview Time *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 10:30 AM"
                    value={interviewTime}
                    onChange={(e) => setInterviewTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Interviewer / Contact Person</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. HR Manager / Tech Lead"
                    value={interviewerName}
                    onChange={(e) => setInterviewerName(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Round / Stage</label>
                  <select
                    className="form-select"
                    value={roundNumber}
                    onChange={(e) => setRoundNumber(e.target.value)}
                  >
                    <option value="1">Round 1 (Initial Screening)</option>
                    <option value="2">Round 2 (Technical Assessment)</option>
                    <option value="3">Round 3 (Managerial Round)</option>
                    <option value="4">Round 4 (HR / Final Round)</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Location / Meeting Link & Remarks</label>
                <textarea
                  className="form-input"
                  rows={2}
                  placeholder="e.g. Google Meet link or Academy Boardroom"
                  value={interviewNotes}
                  onChange={(e) => setInterviewNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setAssignModalOpen(false)}
                  disabled={assigningSaving}
                >
                  Cancel
                </button>
                <button type="submit" disabled={assigningSaving} className="btn btn-primary">
                  {assigningSaving ? 'Assigning...' : 'Confirm & Schedule Interview'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Placement Status Modal */}
      {statusModalOpen && selectedCandidate && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h3 className="modal-title">Update Placement Status</h3>
              <button className="modal-close" onClick={() => setStatusModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateStatusSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {statusError && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 14px',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#b91c1c',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.85rem'
                  }}
                >
                  <AlertCircle size={16} />
                  <span>{statusError}</span>
                </div>
              )}

              <div style={{ padding: 12, background: '#f8fafc', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
                <div>
                  <strong>Candidate:</strong> {selectedCandidate.name} ({selectedCandidate.admissionNumber})
                </div>
                <div style={{ marginTop: 4 }}>
                  Current Status: <StatusBadge status={selectedCandidate.placementStatus} />
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700 }}>
                  New Placement Status *
                </label>
                <select
                  className="form-select"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as PlacementStatus)}
                  required
                >
                  {ALL_PLACEMENT_STATUSES.map((st) => (
                    <option key={st.value} value={st.value}>
                      {st.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 600 }}>
                  Status Change Notes / Justification *
                </label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="e.g. Cleared technical interview with Wipro; offer letter issued for ₹4.5 LPA."
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  required
                />
                <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: 2 }}>
                  Will be recorded in the student's immutable Placement Status History timeline.
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setStatusModalOpen(false)}
                  disabled={statusSaving}
                >
                  Cancel
                </button>
                <button type="submit" disabled={statusSaving} className="btn btn-primary">
                  {statusSaving ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Candidate Full Profile & History Modal */}
      {profileModalOpen && selectedCandidate && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 840, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header">
              <h3 className="modal-title">
                Candidate Profile: {selectedCandidate.name} ({selectedCandidate.admissionNumber})
              </h3>
              <button className="modal-close" onClick={() => setProfileModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            {/* Profile Navigation Tabs */}
            <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--gray-200)', paddingBottom: 10, marginTop: 8 }}>
              <button
                type="button"
                className={`btn ${profileTab === 'summary' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                onClick={() => setProfileTab('summary')}
              >
                Assessment Summary
              </button>
              <button
                type="button"
                className={`btn ${profileTab === 'history' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                onClick={() => setProfileTab('history')}
              >
                Assessment History
              </button>
              <button
                type="button"
                className={`btn ${profileTab === 'interviews' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                onClick={() => setProfileTab('interviews')}
              >
                Interview History
              </button>
              <button
                type="button"
                className={`btn ${profileTab === 'timeline' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                onClick={() => setProfileTab('timeline')}
              >
                Status Timeline
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 0' }}>
              {profileLoading ? (
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-500)' }}>
                  Loading candidate data from Google Sheets...
                </div>
              ) : (
                <>
                  {/* TAB 1: Assessment Summary */}
                  {profileTab === 'summary' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                        {candidateProfileData?.assessmentSummary && (
                          <>
                            {/* Topic Tests */}
                            <div className="card" style={{ padding: 14 }}>
                              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--gray-800)' }}>
                                Topic Tests
                              </div>
                              <div style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: 6, color: '#2563eb' }}>
                                {candidateProfileData.assessmentSummary.topicTests.averageScore}/10
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: 2 }}>
                                {candidateProfileData.assessmentSummary.topicTests.completedCount} tests taken
                              </div>
                              <div style={{ display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap' }}>
                                {Object.entries((candidateProfileData.assessmentSummary.topicTests as any).categoryCounts || {}).map(
                                  ([cat, count]: [string, any]) =>
                                    Number(count) > 0 ? (
                                      <span
                                        key={cat}
                                        style={{
                                          padding: '1px 6px',
                                          fontSize: '0.7rem',
                                          borderRadius: 3,
                                          background: '#f1f5f9',
                                          fontWeight: 700
                                        }}
                                      >
                                        Cat {cat}: {count}
                                      </span>
                                    ) : null
                                )}
                              </div>
                            </div>

                            {/* Presentations */}
                            <div className="card" style={{ padding: 14 }}>
                              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--gray-800)' }}>
                                Presentations
                              </div>
                              <div style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: 6, color: '#7c3aed' }}>
                                {(candidateProfileData.assessmentSummary.presentations as any).averageScore || 0}/10
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: 2 }}>
                                {(candidateProfileData.assessmentSummary.presentations as any).completedCount || 0} delivered
                              </div>
                              <div style={{ display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap' }}>
                                {Object.entries((candidateProfileData.assessmentSummary.presentations as any).categoryCounts || {}).map(
                                  ([cat, count]: [string, any]) =>
                                    Number(count) > 0 ? (
                                      <span
                                        key={cat}
                                        style={{
                                          padding: '1px 6px',
                                          fontSize: '0.7rem',
                                          borderRadius: 3,
                                          background: '#f1f5f9',
                                          fontWeight: 700
                                        }}
                                      >
                                        Cat {cat}: {count}
                                      </span>
                                    ) : null
                                )}
                              </div>
                            </div>

                            {/* Mock Interviews */}
                            <div className="card" style={{ padding: 14 }}>
                              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--gray-800)' }}>
                                Mock Interviews
                              </div>
                              <div style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: 6, color: '#059669' }}>
                                {(candidateProfileData.assessmentSummary.mockInterviews as any).averageScore || 0}/10
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: 2 }}>
                                {(candidateProfileData.assessmentSummary.mockInterviews as any).completedCount || 0} completed (Mod 3-5)
                              </div>
                              <div style={{ display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap' }}>
                                {Object.entries((candidateProfileData.assessmentSummary.mockInterviews as any).categoryCounts || {}).map(
                                  ([cat, count]: [string, any]) =>
                                    Number(count) > 0 ? (
                                      <span
                                        key={cat}
                                        style={{
                                          padding: '1px 6px',
                                          fontSize: '0.7rem',
                                          borderRadius: 3,
                                          background: '#f1f5f9',
                                          fontWeight: 700
                                        }}
                                      >
                                        Cat {cat}: {count}
                                      </span>
                                    ) : null
                                )}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 2: Assessment History */}
                  {profileTab === 'history' && (
                    <div style={{ maxHeight: 380, overflowY: 'auto' }}>
                      {(!candidateProfileData?.assessmentHistory || candidateProfileData.assessmentHistory.length === 0) ? (
                        <div style={{ padding: 24, textAlign: 'center', color: 'var(--gray-500)' }}>
                          No assessment records evaluated yet.
                        </div>
                      ) : (
                        <table style={{ width: '100%', fontSize: '0.8rem' }}>
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Module / Topic</th>
                              <th>Type</th>
                              <th>Marks</th>
                              <th>Category</th>
                              <th>Trainer</th>
                              <th>Remarks</th>
                            </tr>
                          </thead>
                          <tbody>
                            {candidateProfileData.assessmentHistory.map((item, idx) => (
                              <tr key={item.id || idx}>
                                <td>{item.date ? new Date(item.date).toLocaleDateString() : '—'}</td>
                                <td>
                                  <div style={{ fontWeight: 600 }}>{item.topic}</div>
                                  <div style={{ fontSize: '0.7rem', color: 'var(--gray-500)' }}>{item.moduleName}</div>
                                </td>
                                <td>{item.assessmentType}</td>
                                <td style={{ fontWeight: 700 }}>
                                  {item.isAbsent ? (
                                    <span style={{ color: '#dc2626' }}>ABSENT</span>
                                  ) : (
                                    `${item.marks}/10`
                                  )}
                                </td>
                                <td>
                                  <span
                                    style={{
                                      display: 'inline-block',
                                      padding: '2px 8px',
                                      borderRadius: 4,
                                      fontWeight: 800,
                                      background:
                                        item.category === 'A'
                                          ? '#dcfce7'
                                          : item.category === 'B'
                                          ? '#dbeafe'
                                          : item.category === 'C'
                                          ? '#fef9c3'
                                          : item.category === 'D'
                                          ? '#ffedd5'
                                          : '#fee2e2',
                                      color:
                                        item.category === 'A'
                                          ? '#166534'
                                          : item.category === 'B'
                                          ? '#1e40af'
                                          : item.category === 'C'
                                          ? '#854d0e'
                                          : item.category === 'D'
                                          ? '#9a3412'
                                          : '#991b1b'
                                    }}
                                  >
                                    Category {item.category}
                                  </span>
                                </td>
                                <td>{item.trainerName || '—'}</td>
                                <td style={{ color: 'var(--gray-600)' }}>{item.remarks || '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}

                  {/* TAB 3: Interview History */}
                  {profileTab === 'interviews' && (
                    <div style={{ maxHeight: 380, overflowY: 'auto' }}>
                      {(!candidateProfileData?.interviewHistory || candidateProfileData.interviewHistory.length === 0) ? (
                        <div style={{ padding: 24, textAlign: 'center', color: 'var(--gray-500)' }}>
                          No placement interviews assigned yet. Click "Assign Interview" above.
                        </div>
                      ) : (
                        <table style={{ width: '100%', fontSize: '0.8rem' }}>
                          <thead>
                            <tr>
                              <th>Date & Time</th>
                              <th>Company</th>
                              <th>Position</th>
                              <th>Round</th>
                              <th>Status</th>
                              <th>Result</th>
                              <th>Remarks</th>
                            </tr>
                          </thead>
                          <tbody>
                            {candidateProfileData.interviewHistory.map((inv, idx) => (
                              <tr key={inv.interviewId || idx}>
                                <td>
                                  <div>{inv.interviewDate ? new Date(inv.interviewDate).toLocaleDateString() : '—'}</div>
                                  <div style={{ fontSize: '0.7rem', color: 'var(--gray-500)' }}>{inv.interviewTime}</div>
                                </td>
                                <td style={{ fontWeight: 600 }}>{inv.company}</td>
                                <td>{inv.position}</td>
                                <td>Round {inv.round || '1'}</td>
                                <td>
                                  <StatusBadge status={inv.status} />
                                </td>
                                <td>
                                  <span style={{ fontWeight: 700 }}>{inv.result || 'PENDING'}</span>
                                </td>
                                <td style={{ color: 'var(--gray-600)' }}>{inv.remarks || '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}

                  {/* TAB 4: Status Timeline */}
                  {profileTab === 'timeline' && (
                    <div style={{ maxHeight: 380, overflowY: 'auto', padding: '0 8px' }}>
                      {(!candidateProfileData?.statusHistory || candidateProfileData.statusHistory.length === 0) ? (
                        <div style={{ padding: 24, textAlign: 'center', color: 'var(--gray-500)' }}>
                          No status changes recorded in history yet.
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                          {candidateProfileData.statusHistory.map((hist, idx) => (
                            <div
                              key={hist.historyId || idx}
                              style={{
                                padding: 12,
                                background: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                borderRadius: 'var(--radius-md)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}
                            >
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <span style={{ color: 'var(--gray-500)', fontSize: '0.8rem' }}>{hist.previousStatus || 'START'}</span>
                                  <span style={{ color: 'var(--gray-400)' }}>→</span>
                                  <StatusBadge status={hist.newStatus} />
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--gray-600)', marginTop: 4 }}>
                                  {hist.notes || 'Status updated'}
                                </div>
                              </div>
                              <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                                <div>{hist.timestamp ? new Date(hist.timestamp).toLocaleDateString() : '—'}</div>
                                <div>By: {hist.changedBy || 'Admin'}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--gray-200)', paddingTop: 12 }}>
              <button className="btn btn-secondary" onClick={() => setProfileModalOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
