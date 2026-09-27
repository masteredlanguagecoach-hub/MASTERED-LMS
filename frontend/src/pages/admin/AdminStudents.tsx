import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { adminApi } from '../../api/client';
import { Student, Course, Batch, ImportPreviewResponse } from '../../types';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import {
  UserPlus,
  Search,
  Upload,
  Download,
  X,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  FileSpreadsheet,
  Users
} from 'lucide-react';

export default function AdminStudents() {
  const { data: studentsData, loading: studentsLoading, refetch: refetchStudents } = useApi<Student[]>(() =>
    adminApi.getStudents()
  );
  const { data: coursesData } = useApi<Course[]>(() => adminApi.getCourses());
  const { data: batchesData } = useApi<Batch[]>(() => adminApi.getBatches());

  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [batchFilter, setBatchFilter] = useState('');

  // Add Student Modal State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [admissionNumber, setAdmissionNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [courseId, setCourseId] = useState('');
  const [batchId, setBatchId] = useState('');
  const [joiningDate, setJoiningDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [assignedFee, setAssignedFee] = useState('');
  const [registrationFee, setRegistrationFee] = useState('0');
  const [discountAmount, setDiscountAmount] = useState('0');
  const [status, setStatus] = useState('ACTIVE');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSaving, setFormSaving] = useState(false);
  const [newAdmissionInfo, setNewAdmissionInfo] = useState<{ admissionNumber: string; tempPassword?: string } | null>(null);

  // Import Modal State
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [previewResult, setPreviewResult] = useState<ImportPreviewResponse | null>(null);
  const [confirmingImport, setConfirmingImport] = useState(false);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  const courses = coursesData || [];
  const batches = batchesData || [];
  const students = studentsData || [];

  // When course changes in modal, auto-suggest default fee & batch
  const handleCourseChange = (selectedCourseId: string) => {
    setCourseId(selectedCourseId);
    const selectedCourse = courses.find((c) => c.courseId === selectedCourseId);
    if (selectedCourse?.defaultFee) {
      setAssignedFee(String(selectedCourse.defaultFee));
    }
    const matchingBatches = batches.filter((b) => b.courseId === selectedCourseId);
    if (matchingBatches.length > 0) {
      setBatchId(matchingBatches[0].batchId);
    } else {
      setBatchId('');
    }
  };

  const handleOpenAddModal = () => {
    setFormError(null);
    setNewAdmissionInfo(null);
    setAdmissionNumber('');
    setFullName('');
    setEmail('');
    setMobile('');
    setJoiningDate(new Date().toISOString().split('T')[0]);
    setRegistrationFee('0');
    setDiscountAmount('0');
    setStatus('ACTIVE');

    if (courses.length > 0) {
      const initialCourse = courses[0];
      setCourseId(initialCourse.courseId);
      if (initialCourse.defaultFee) {
        setAssignedFee(String(initialCourse.defaultFee));
      } else {
        setAssignedFee('45000');
      }
      const initialBatch = batches.find((b) => b.courseId === initialCourse.courseId);
      setBatchId(initialBatch ? initialBatch.batchId : (batches[0]?.batchId || ''));
    } else {
      setCourseId('');
      setBatchId('');
      setAssignedFee('45000');
    }
    setAddModalOpen(true);
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!admissionNumber.trim()) {
      setFormError('Admission Number is required.');
      return;
    }
    if (!courseId) {
      setFormError('Please select a course.');
      return;
    }
    if (!batchId) {
      setFormError('Please select a batch.');
      return;
    }

    setFormSaving(true);
    try {
      const res = await adminApi.createStudent({
        admissionNumber: admissionNumber.trim().toUpperCase(),
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        mobile: mobile.trim(),
        courseId,
        batchId,
        joiningDate,
        assignedFee,
        totalFee: assignedFee,
        registrationFee,
        discount: discountAmount,
        status
      });

      if (res.success && res.data) {
        setNewAdmissionInfo(res.data as { admissionNumber: string; tempPassword?: string });
        refetchStudents();
      } else {
        setFormError(res.message || 'Failed to create student. Admission Number may already exist.');
      }
    } catch (err: unknown) {
      const error = err as Error;
      setFormError(error.message || 'Network error while registering student.');
    } finally {
      setFormSaving(false);
    }
  };

  // Download CSV Template
  const handleDownloadTemplate = () => {
    const headers = [
      'Admission Number',
      'Full Name',
      'Mobile',
      'Email',
      'Course',
      'Batch',
      'Joining Date',
      'Assigned Fee',
      'Registration Fee',
      'Discount',
      'Status'
    ];
    const sampleRow = [
      'MSA000101',
      'Rahul Kumar',
      '9876543210',
      'rahul.kumar@example.com',
      courses[0]?.shortCode || courses[0]?.title || 'BHA',
      batches[0]?.batchName || 'BAT000001',
      new Date().toISOString().split('T')[0],
      courses[0]?.defaultFee || '45000',
      '5000',
      '0',
      'ACTIVE'
    ];
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), sampleRow.join(',')].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'mastered_students_import_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Parse CSV File into row objects
  const parseCSV = (csvText: string): Record<string, string>[] => {
    const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''));
    const rows: Record<string, string>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      // Basic comma split respecting quoted values
      const values: string[] = [];
      let inQuotes = false;
      let currentVal = '';

      for (let c = 0; c < line.length; c++) {
        const char = line[c];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(currentVal.trim().replace(/^["']|["']$/g, ''));
          currentVal = '';
        } else {
          currentVal += char;
        }
      }
      values.push(currentVal.trim().replace(/^["']|["']$/g, ''));

      if (values.some((v) => v.length > 0)) {
        const rowObj: Record<string, string> = {};
        headers.forEach((h, colIdx) => {
          rowObj[h] = values[colIdx] || '';
        });
        rows.push(rowObj);
      }
    }
    return rows;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError(null);
    setImportSuccess(null);
    setPreviewResult(null);
    setImportLoading(true);

    try {
      const text = await file.text();
      const rows = parseCSV(text);

      if (rows.length === 0) {
        setImportError('Uploaded file appears empty or could not be parsed as CSV.');
        setImportLoading(false);
        return;
      }

      const res = await adminApi.validateStudentImport(rows);
      if (res.success && res.data) {
        setPreviewResult(res.data as ImportPreviewResponse);
      } else {
        setImportError(res.message || 'Validation failed on server.');
      }
    } catch (err: unknown) {
      const error = err as Error;
      setImportError('Failed to read or validate file: ' + error.message);
    } finally {
      setImportLoading(false);
    }
  };

  const handleConfirmImport = async () => {
    const validCount = previewResult?.validCount ?? previewResult?.validRows ?? 0;
    if (!previewResult || validCount === 0) return;

    const validRows = (previewResult.rows || previewResult.preview || []).filter((r: any) => r.isValid).map((r: any) => r.data || r);
    setConfirmingImport(true);
    setImportError(null);

    try {
      const res = await adminApi.confirmStudentImport(validRows);
      if (res.success) {
        setImportSuccess(`Successfully imported ${validCount} student(s)!`);
        setPreviewResult(null);
        refetchStudents();
      } else {
        setImportError(res.message || 'Failed to complete bulk import.');
      }
    } catch (err: unknown) {
      const error = err as Error;
      setImportError('Error confirming import: ' + error.message);
    } finally {
      setConfirmingImport(false);
    }
  };

  // Filter students
  const filteredStudents = students.filter((s) => {
    const matchSearch =
      (s.admissionNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.mobile || '').includes(searchTerm);
    const matchCourse = courseFilter ? s.courseId === courseFilter : true;
    const matchBatch = batchFilter ? s.batchId === batchFilter : true;
    return matchSearch && matchCourse && matchBatch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gray-900)' }}>
            Student Management & Admissions
          </h2>
          <p style={{ color: 'var(--gray-600)', fontSize: '0.9rem' }}>
            Primary identifier: Admission Number. Manage enrolments, bulk import, and individual credentials.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={handleDownloadTemplate}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}
            title="Download CSV import template"
          >
            <Download size={16} />
            <span>Download Demo Sheet</span>
          </button>

          <button
            onClick={() => {
              setPreviewResult(null);
              setImportError(null);
              setImportSuccess(null);
              setImportModalOpen(true);
            }}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}
          >
            <FileSpreadsheet size={16} />
            <span>Import Students</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem' }}
          >
            <UserPlus size={18} />
            <span>+ Add Student</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '16px', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: 260, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Search size={18} color="var(--gray-400)" />
          <input
            type="text"
            className="form-input"
            style={{ border: 'none', padding: 0 }}
            placeholder="Search by Admission No (e.g. MSA000001), Full Name, Email, or Mobile..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {courses.length > 0 && (
          <select
            className="form-select"
            style={{ width: 'auto', minWidth: 160, fontSize: '0.85rem' }}
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

        {batches.length > 0 && (
          <select
            className="form-select"
            style={{ width: 'auto', minWidth: 160, fontSize: '0.85rem' }}
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

        <div style={{ fontSize: '0.85rem', color: 'var(--gray-500)', fontWeight: 600 }}>
          Total: {filteredStudents.length}
        </div>
      </div>

      {/* Student List Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {studentsLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--gray-500)' }}>
            Loading student records from Google Sheets...
          </div>
        ) : filteredStudents.length === 0 ? (
          <div style={{ padding: '32px' }}>
            <EmptyState
              icon={<Users size={48} color="var(--gray-400)" />}
              title="No students found"
              description={
                students.length === 0
                  ? 'No students registered in the system yet. Click "+ Add Student" or "Import Students" to register.'
                  : 'No student matches your current filter criteria.'
              }
              action={
                students.length === 0 ? (
                  <button onClick={handleOpenAddModal} className="btn btn-primary" style={{ marginTop: 12 }}>
                    <UserPlus size={16} style={{ marginRight: 6 }} /> Register First Student
                  </button>
                ) : undefined
              }
            />
          </div>
        ) : (
          <div className="table-wrap" style={{ border: 'none', borderRadius: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Admission No</th>
                  <th>Full Name</th>
                  <th>Contact Details</th>
                  <th>Course & Batch</th>
                  <th>Joining Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((std) => {
                  const courseMatch = courses.find((c) => c.courseId === std.courseId);
                  const batchMatch = batches.find((b) => b.batchId === std.batchId);

                  return (
                    <tr key={std.studentId || std.admissionNumber}>
                      <td>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '4px 10px',
                            background: '#eff6ff',
                            color: '#1d4ed8',
                            borderRadius: '4px',
                            fontWeight: 700,
                            fontFamily: 'monospace',
                            fontSize: '0.9rem'
                          }}
                        >
                          {std.admissionNumber}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{std.fullName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>ID: {std.studentId}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem' }}>{std.email}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{std.mobile}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                          {courseMatch ? courseMatch.shortCode || courseMatch.title : std.courseId}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                          {batchMatch ? batchMatch.batchName : std.batchId}
                        </div>
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>
                        {std.enrollmentDate ? new Date(std.enrollmentDate).toLocaleDateString() : '—'}
                      </td>
                      <td>
                        <StatusBadge status={std.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Student Modal */}
      {addModalOpen && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 560 }}>
            <div className="modal-header">
              <h3 className="modal-title">+ Add Student (Admission)</h3>
              <button className="modal-close" onClick={() => setAddModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            {newAdmissionInfo ? (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <CheckCircle2 size={48} color="#16a34a" style={{ margin: '0 auto 12px' }} />
                <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--gray-900)' }}>
                  Admission Registered Successfully!
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--gray-600)', marginTop: 4 }}>
                  Student profile, login credentials, batch assignment, and individual fee ledger have been created.
                </p>

                <div
                  style={{
                    margin: '20px 0',
                    padding: 16,
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 'var(--radius-md)',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ fontSize: '0.9rem', marginBottom: 8 }}>
                    <strong>Admission No:</strong>{' '}
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#1d4ed8' }}>
                      {newAdmissionInfo.admissionNumber}
                    </span>
                  </div>
                  {newAdmissionInfo.tempPassword && (
                    <div style={{ fontSize: '0.9rem' }}>
                      <strong>Temporary Password:</strong>{' '}
                      <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#0f172a' }}>
                        {newAdmissionInfo.tempPassword}
                      </span>
                    </div>
                  )}
                </div>

                <button className="btn btn-primary" onClick={() => setAddModalOpen(false)}>
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateStudent} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {formError && (
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
                    <span>{formError}</span>
                  </div>
                )}

                {/* Admission Number (Mandatory primary identifier) */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontWeight: 700, color: '#1e3a8a' }}>
                    Admission Number * (Primary Identifier)
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. MSA000001"
                    value={admissionNumber}
                    onChange={(e) => setAdmissionNumber(e.target.value.toUpperCase())}
                    required
                    style={{ fontFamily: 'monospace', fontWeight: 600, letterSpacing: '0.5px' }}
                  />
                  <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: 2 }}>
                    Must be unique across the academy database.
                  </div>
                </div>

                {/* Full Name */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Priya Sharma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>

                {/* Email & Mobile */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Email *</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="student@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Mobile *</label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="9876543210"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Course & Batch */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Course *</label>
                    <select
                      className="form-select"
                      value={courseId}
                      onChange={(e) => handleCourseChange(e.target.value)}
                      required
                    >
                      <option value="">-- Select Course --</option>
                      {courses.map((c) => (
                        <option key={c.courseId} value={c.courseId}>
                          {c.shortCode ? `${c.shortCode} - ${c.title}` : c.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Batch *</label>
                    <select
                      className="form-select"
                      value={batchId}
                      onChange={(e) => setBatchId(e.target.value)}
                      required
                    >
                      <option value="">-- Select Batch --</option>
                      {batches
                        .filter((b) => (courseId ? b.courseId === courseId : true))
                        .map((b) => (
                          <option key={b.batchId} value={b.batchId}>
                            {b.batchName}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                {/* Joining Date & Status */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Joining Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={joiningDate}
                      onChange={(e) => setJoiningDate(e.target.value)}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                  </div>
                </div>

                {/* Fee Breakdown (Student Assigned Fee) */}
                <div
                  style={{
                    padding: 12,
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10
                  }}
                >
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--gray-800)' }}>
                    Student Assigned Fee (Specific to this Student)
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-600)' }}>
                        Total Assigned Fee (₹)
                      </label>
                      <input
                        type="number"
                        className="form-input"
                        value={assignedFee}
                        onChange={(e) => setAssignedFee(e.target.value)}
                        required
                        style={{ marginTop: 2 }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-600)' }}>
                        Reg Fee (₹)
                      </label>
                      <input
                        type="number"
                        className="form-input"
                        value={registrationFee}
                        onChange={(e) => setRegistrationFee(e.target.value)}
                        style={{ marginTop: 2 }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-600)' }}>
                        Discount (₹)
                      </label>
                      <input
                        type="number"
                        className="form-input"
                        value={discountAmount}
                        onChange={(e) => setDiscountAmount(e.target.value)}
                        style={{ marginTop: 2 }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setAddModalOpen(false)}
                    disabled={formSaving}
                  >
                    Cancel
                  </button>
                  <button type="submit" disabled={formSaving} className="btn btn-primary">
                    {formSaving ? 'Enrolling...' : 'Register Admission'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {importModalOpen && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 780 }}>
            <div className="modal-header">
              <h3 className="modal-title">Bulk Student Import (CSV / XLSX)</h3>
              <button
                className="modal-close"
                onClick={() => {
                  setImportModalOpen(false);
                  setPreviewResult(null);
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {importSuccess && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '12px 16px',
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    color: '#15803d',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.9rem'
                  }}
                >
                  <CheckCircle2 size={18} />
                  <span>{importSuccess}</span>
                </div>
              )}

              {importError && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '12px 16px',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#b91c1c',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.9rem'
                  }}
                >
                  <AlertCircle size={18} />
                  <span>{importError}</span>
                </div>
              )}

              {/* Upload Drop Zone */}
              {!previewResult && !importSuccess && (
                <div
                  style={{
                    border: '2px dashed #cbd5e1',
                    borderRadius: 'var(--radius-lg)',
                    padding: '36px 20px',
                    textAlign: 'center',
                    background: '#f8fafc',
                    cursor: 'pointer'
                  }}
                  onClick={() => document.getElementById('csvFileInput')?.click()}
                >
                  <Upload size={36} color="var(--primary)" style={{ margin: '0 auto 10px' }} />
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--gray-800)' }}>
                    Upload Students CSV / Spreadsheet File
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginTop: 4 }}>
                    Columns expected: Admission Number, Full Name, Mobile, Email, Course, Batch, Joining Date, Assigned Fee
                  </div>
                  <input
                    id="csvFileInput"
                    type="file"
                    accept=".csv,text/csv"
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ marginTop: 16, fontSize: '0.85rem' }}
                    disabled={importLoading}
                  >
                    {importLoading ? 'Validating on Google Sheets...' : 'Choose CSV File'}
                  </button>
                </div>
              )}

              {/* Validation Summary & Preview Table */}
              {previewResult && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Summary Counters */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                    <div style={{ padding: 12, background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--gray-900)' }}>
                        {previewResult.totalRows}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 600 }}>Total Rows</div>
                    </div>

                    <div style={{ padding: 12, background: '#f0fdf4', borderRadius: 'var(--radius-md)', border: '1px solid #bbf7d0', textAlign: 'center' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#16a34a' }}>
                        {previewResult.validCount ?? previewResult.validRows ?? 0}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>Valid Rows</div>
                    </div>

                    <div style={{ padding: 12, background: '#fef2f2', borderRadius: 'var(--radius-md)', border: '1px solid #fecaca', textAlign: 'center' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#dc2626' }}>
                        {previewResult.invalidCount ?? previewResult.invalidRows ?? 0}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 600 }}>Invalid Rows</div>
                    </div>

                    <div style={{ padding: 12, background: '#fffbeb', borderRadius: 'var(--radius-md)', border: '1px solid #fde68a', textAlign: 'center' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#d97706' }}>
                        {previewResult.duplicateCount ?? previewResult.duplicateRows ?? 0}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#d97706', fontWeight: 600 }}>Duplicates</div>
                    </div>
                  </div>

                  {/* Preview Table */}
                  <div style={{ maxHeight: 260, overflowY: 'auto', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-md)' }}>
                    <table style={{ width: '100%', fontSize: '0.8rem' }}>
                      <thead>
                        <tr>
                          <th style={{ padding: '6px 10px' }}>Row</th>
                          <th style={{ padding: '6px 10px' }}>Status</th>
                          <th style={{ padding: '6px 10px' }}>Admission No</th>
                          <th style={{ padding: '6px 10px' }}>Name</th>
                          <th style={{ padding: '6px 10px' }}>Course / Batch</th>
                          <th style={{ padding: '6px 10px' }}>Issues / Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(previewResult.rows || previewResult.preview || []).map((row: any) => (
                          <tr key={row.rowIndex} style={{ background: row.isValid ? 'transparent' : '#fef2f2' }}>
                            <td style={{ padding: '6px 10px', fontWeight: 600 }}>#{row.rowIndex}</td>
                            <td style={{ padding: '6px 10px' }}>
                              {row.isValid ? (
                                <span style={{ color: '#16a34a', fontWeight: 700 }}>VALID</span>
                              ) : row.isDuplicate ? (
                                <span style={{ color: '#d97706', fontWeight: 700 }}>DUPLICATE</span>
                              ) : (
                                <span style={{ color: '#dc2626', fontWeight: 700 }}>INVALID</span>
                              )}
                            </td>
                            <td style={{ padding: '6px 10px', fontFamily: 'monospace', fontWeight: 600 }}>
                              {row.admissionNumber || '—'}
                            </td>
                            <td style={{ padding: '6px 10px' }}>{row.fullName}</td>
                            <td style={{ padding: '6px 10px' }}>
                              {row.course || row.courseTitle} / {row.batch || row.batchName}
                            </td>
                            <td style={{ padding: '6px 10px', color: (row.errors || []).length ? '#dc2626' : '#16a34a' }}>
                              {(row.errors || []).length > 0 ? (row.errors || []).join('; ') : 'Ready to import'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Confirm Actions */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setPreviewResult(null)}
                      disabled={confirmingImport}
                    >
                      Upload Different File
                    </button>

                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleConfirmImport}
                      disabled={confirmingImport || (previewResult.validCount ?? previewResult.validRows ?? 0) === 0}
                    >
                      {confirmingImport
                        ? 'Writing to Google Sheets...'
                        : `Confirm & Import ${previewResult.validCount ?? previewResult.validRows ?? 0} Valid Row(s)`}
                    </button>
                  </div>
                </div>
              )}

              {importSuccess && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setImportModalOpen(false);
                      setImportSuccess(null);
                    }}
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
