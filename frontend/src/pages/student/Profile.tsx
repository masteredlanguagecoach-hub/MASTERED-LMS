import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import { studentApi, authApi } from '../../api/client';
import { Student, Course, Batch } from '../../types';
import StatusBadge from '../../components/ui/StatusBadge';
import { CardSkeleton } from '../../components/ui/LoadingSkeleton';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  BookOpen,
  Users,
  Shield,
  Lock,
  Save,
  CheckCircle2
} from 'lucide-react';

interface ProfileResponse {
  student: Student;
  course: Course;
  batch: Batch;
}

export default function Profile() {
  const { user } = useAuth();
  const { data, loading, error, refetch } = useApi<ProfileResponse>(() =>
    studentApi.getProfile()
  );

  const fallbackData: ProfileResponse = {
    student: {
      studentId: 'STD000001',
      userId: 'USR000003',
      admissionNumber: 'STD000001',
      fullName: 'Priya Sharma',
      email: 'student@masteredskill.academy',
      mobile: '9000000003',
      dateOfBirth: '2000-05-15',
      gender: 'Female',
      address: '123 Tech Enclave, Road No. 4',
      city: 'Hyderabad',
      state: 'Telangana',
      pinCode: '500001',
      guardianName: 'Ravi Sharma',
      guardianMobile: '9000000099',
      courseId: 'CRS000001',
      batchId: 'BAT000001',
      enrollmentDate: '2026-01-01',
      status: 'ACTIVE'
    },
    course: {
      courseId: 'CRS000001',
      title: 'Full Stack Web Development',
      shortCode: 'FSWD',
      description: 'Comprehensive 24-week professional software engineering career program.',
      durationWeeks: '24',
      durationHours: '480',
      level: 'Beginner to Advanced',
      status: 'ACTIVE'
    },
    batch: {
      batchId: 'BAT000001',
      batchName: 'FSWD - Batch 2026 A',
      courseId: 'CRS000001',
      trainerId: 'TRN000001',
      startDate: '2026-01-06',
      endDate: '2026-06-30',
      schedule: 'Monday, Wednesday, Friday',
      timing: '10:00 AM - 1:00 PM',
      venue: 'Online Interactive',
      mode: 'Online',
      maxStudents: '30',
      status: 'ACTIVE'
    }
  };

  const p = data || fallbackData;
  const std = p.student;

  // Form states for editable fields
  const [fullName, setFullName] = useState(std.fullName);
  const [mobile, setMobile] = useState(std.mobile);
  const [address, setAddress] = useState(std.address || '');
  const [city, setCity] = useState(std.city || '');
  const [state, setState] = useState(std.state || '');
  const [pinCode, setPinCode] = useState(std.pinCode || '');
  const [guardianName, setGuardianName] = useState(std.guardianName || '');
  const [guardianMobile, setGuardianMobile] = useState(std.guardianMobile || '');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await studentApi.updateProfile(std.studentId, {
        fullName,
        mobile,
        address,
        city,
        state,
        pinCode,
        guardianName,
        guardianMobile
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      refetch();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwSaving(true);
    setPwMsg(null);
    try {
      const res = await authApi.changePassword(currentPassword, newPassword);
      if (res.success) {
        setPwMsg({ type: 'success', text: 'Password successfully updated!' });
        setCurrentPassword('');
        setNewPassword('');
      } else {
        setPwMsg({ type: 'error', text: res.error || 'Failed to update password' });
      }
    } catch (err) {
      setPwMsg({ type: 'error', text: 'Server connection error' });
    } finally {
      setPwSaving(false);
    }
  };

  if (loading && !data) {
    return <CardSkeleton count={3} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 960, margin: '0 auto' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gray-900)' }}>
          My Student Profile
        </h2>
        <p style={{ color: 'var(--gray-600)', fontSize: '0.9rem' }}>
          Personal, academic, and contact details verified with Mastered Skill Academy registry.
        </p>
      </div>

      {/* Top Banner with Admission Number */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
        <div className="avatar avatar-xl" style={{ width: 72, height: 72, fontSize: '1.75rem' }}>
          {std.fullName.charAt(0).toUpperCase()}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span className="badge badge-primary">ADMISSION NO: {std.admissionNumber}</span>
            <StatusBadge status={std.status} />
          </div>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--gray-900)' }}>
            {std.fullName}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: '0.85rem', color: 'var(--gray-600)', marginTop: 4 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Mail size={14} /> {std.email}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Phone size={14} /> {std.mobile}
            </span>
          </div>
        </div>
      </div>

      {/* Academic Enrollment Information (Read Only) */}
      <div className="card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <BookOpen size={18} color="var(--primary-600)" />
          <span>Course & Batch Enrollment Information</span>
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          <div style={{ padding: 14, background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase' }}>
              Enrolled Course
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--gray-900)', marginTop: 4 }}>
              {p.course.title}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--gray-600)', marginTop: 2 }}>
              Code: {p.course.shortCode} • {p.course.durationWeeks} Weeks ({p.course.durationHours} Hours)
            </div>
          </div>

          <div style={{ padding: 14, background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase' }}>
              Assigned Batch
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--gray-900)', marginTop: 4 }}>
              {p.batch.batchName}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--gray-600)', marginTop: 2 }}>
              Timing: {p.batch.timing} • Mode: {p.batch.mode}
            </div>
          </div>

          <div style={{ padding: 14, background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase' }}>
              Enrollment Date
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--gray-900)', marginTop: 4 }}>
              {new Date(std.enrollmentDate).toLocaleDateString()}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--gray-600)', marginTop: 2 }}>
              Batch Schedule: {p.batch.schedule}
            </div>
          </div>
        </div>
      </div>

      {/* Editable Contact & Personal Details */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--gray-900)' }}>
            Personal & Guardian Contact Details
          </h3>
          {saveSuccess && (
            <span style={{ fontSize: '0.85rem', color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              <CheckCircle2 size={16} /> Profile Saved
            </span>
          )}
        </div>

        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Mobile Number</label>
              <input
                type="tel"
                className="form-input"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Guardian / Parent Name</label>
              <input
                type="text"
                className="form-input"
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Guardian Mobile Number</label>
              <input
                type="tel"
                className="form-input"
                value={guardianMobile}
                onChange={(e) => setGuardianMobile(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Residential Address</label>
            <input
              type="text"
              className="form-input"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">City</label>
              <input
                type="text"
                className="form-input"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">State</label>
              <input
                type="text"
                className="form-input"
                value={state}
                onChange={(e) => setState(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">PIN Code</label>
              <input
                type="text"
                className="form-input"
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Save size={16} />
              <span>{saving ? 'Updating...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Security & Password Change */}
      <div className="card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Lock size={18} color="var(--primary-600)" />
          <span>Security & Password Management</span>
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--gray-600)', marginBottom: 16 }}>
          Passwords are salted and hashed on the Google Apps Script backend using PBKDF2 stretching.
        </p>

        {pwMsg && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              background: pwMsg.type === 'success' ? '#dcfce7' : '#fee2e2',
              color: pwMsg.type === 'success' ? '#166534' : '#991b1b',
              fontSize: '0.85rem',
              marginBottom: 16
            }}
          >
            {pwMsg.text}
          </div>
        )}

        <form onSubmit={handleChangePassword} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, alignItems: 'flex-end' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Current Password</label>
            <input
              type="password"
              className="form-input"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">New Password</label>
            <input
              type="password"
              className="form-input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={pwSaving}
              className="btn btn-secondary"
              style={{ width: '100%', height: 44 }}
            >
              {pwSaving ? 'Updating...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
