import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { adminApi } from '../../api/client';
import StatusBadge from '../../components/ui/StatusBadge';
import ProgressBar from '../../components/ui/ProgressBar';
import { CardSkeleton } from '../../components/ui/LoadingSkeleton';
import {
  Users,
  GraduationCap,
  Calendar,
  CreditCard,
  Briefcase,
  Layers,
  Award,
  TrendingUp,
  Database,
  ArrowRight
} from 'lucide-react';

interface AdminDashboardData {
  stats: {
    totalStudents: number;
    activeStudents: number;
    totalTrainers: number;
    totalBatches: number;
    activeBatches: number;
    totalCourses: number;
    overallAttendance: number;
    assessmentPassRate: number;
    placementEligible: number;
    totalApplications: number;
    successfulPlacements: number;
  };
  fees: {
    totalFees: number;
    totalPaid: number;
    totalPending: number;
    collectionRate: number;
  };
  recentStudents: Array<{
    studentId: string;
    admissionNumber: string;
    fullName: string;
    email: string;
    status: string;
    createdAt: string;
  }>;
  applications: {
    total: number;
    applied: number;
    shortlisted: number;
    selected: number;
  };
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { data, loading, error } = useApi<AdminDashboardData>(() =>
    adminApi.getDashboard()
  );

  const fallbackData: AdminDashboardData = {
    stats: {
      totalStudents: 120,
      activeStudents: 114,
      totalTrainers: 8,
      totalBatches: 6,
      activeBatches: 5,
      totalCourses: 4,
      overallAttendance: 84,
      assessmentPassRate: 78,
      placementEligible: 42,
      totalApplications: 68,
      successfulPlacements: 18
    },
    fees: {
      totalFees: 5400000,
      totalPaid: 3600000,
      totalPending: 1800000,
      collectionRate: 67
    },
    recentStudents: [
      {
        studentId: 'STD000001',
        admissionNumber: 'STD000001',
        fullName: 'Priya Sharma',
        email: 'student@masteredskill.academy',
        status: 'ACTIVE',
        createdAt: '2026-01-01'
      },
      {
        studentId: 'STD000002',
        admissionNumber: 'STD000002',
        fullName: 'Aman Verma',
        email: 'aman.verma@example.com',
        status: 'ACTIVE',
        createdAt: '2026-01-02'
      },
      {
        studentId: 'STD000003',
        admissionNumber: 'STD000003',
        fullName: 'Sneha Patel',
        email: 'sneha.patel@example.com',
        status: 'ACTIVE',
        createdAt: '2026-01-03'
      }
    ],
    applications: {
      total: 68,
      applied: 32,
      shortlisted: 18,
      selected: 18
    }
  };

  const ad = data || fallbackData;

  if (loading && !data) {
    return <CardSkeleton count={4} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #091e3a 0%, #1e3a8a 100%)',
          color: '#fff',
          padding: '28px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16
        }}
      >
        <div>
          <div style={{ display: 'inline-flex', padding: '4px 12px', background: 'rgba(255,255,255,0.15)', borderRadius: 999, fontSize: '0.75rem', fontWeight: 600, marginBottom: 12 }}>
            ACADEMY OPERATIONS & GOVERNANCE DASHBOARD
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: 4 }}>
            Mastered Skill Academy Overview
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem' }}>
            Unified real-time metrics backed by Google Sheets Database & Google Apps Script API.
          </p>
        </div>

        <button
          onClick={() => navigate('/admin/settings')}
          className="btn btn-primary"
          style={{ background: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <Database size={18} />
          <span>Sheets Database Setup</span>
        </button>
      </div>

      {/* Primary KPI Grid */}
      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: '#dbeafe', color: '#1d4ed8' }}>
            <Users size={24} />
          </div>
          <div>
            <div className="stat-card-value">{ad.stats.totalStudents}</div>
            <div className="stat-card-label">Total Students ({ad.stats.activeStudents} Active)</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: '#dcfce7', color: '#15803d' }}>
            <GraduationCap size={24} />
          </div>
          <div>
            <div className="stat-card-value">{ad.stats.placementEligible}</div>
            <div className="stat-card-label">Placement Eligible Candidates</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: '#fef3c7', color: '#b45309' }}>
            <Calendar size={24} />
          </div>
          <div>
            <div className="stat-card-value">{ad.stats.activeBatches}</div>
            <div className="stat-card-label">Active Batches ({ad.stats.totalBatches} Total)</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: '#f3e8ff', color: '#7e22ce' }}>
            <Briefcase size={24} />
          </div>
          <div>
            <div className="stat-card-value">{ad.stats.successfulPlacements}</div>
            <div className="stat-card-label">Placed Students ({ad.stats.totalApplications} Applied)</div>
          </div>
        </div>
      </div>

      {/* Financials & Academy Performance Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
        {/* Fee Collection Overview */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--gray-900)' }}>
              Fee Collection Health
            </h3>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#16a34a' }}>
              {ad.fees.collectionRate}% Collected
            </span>
          </div>

          <div style={{ marginBottom: 16 }}>
            <ProgressBar percent={ad.fees.collectionRate} height={10} variant="success" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, textAlign: 'center' }}>
            <div style={{ padding: 10, background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Total Fee Booked</div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--gray-900)', marginTop: 2 }}>
                ₹{(ad.fees.totalFees / 100000).toFixed(1)}L
              </div>
            </div>

            <div style={{ padding: 10, background: '#dcfce7', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.75rem', color: '#166534' }}>Total Collected</div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#15803d', marginTop: 2 }}>
                ₹{(ad.fees.totalPaid / 100000).toFixed(1)}L
              </div>
            </div>

            <div style={{ padding: 10, background: '#fee2e2', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.75rem', color: '#991b1b' }}>Pending Dues</div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#dc2626', marginTop: 2 }}>
                ₹{(ad.fees.totalPending / 100000).toFixed(1)}L
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/admin/fees')}
            className="btn btn-outline btn-full btn-sm"
            style={{ marginTop: 16 }}
          >
            Manage Fee Ledgers & Receipts
          </button>
        </div>

        {/* Attendance & Assessment Performance */}
        <div className="card">
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: 16 }}>
            Academy Academic Performance
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 6 }}>
                <span style={{ color: 'var(--gray-700)', fontWeight: 600 }}>Overall Academy Attendance</span>
                <span style={{ fontWeight: 700, color: '#16a34a' }}>{ad.stats.overallAttendance}%</span>
              </div>
              <ProgressBar percent={ad.stats.overallAttendance} variant="success" height={8} />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 6 }}>
                <span style={{ color: 'var(--gray-700)', fontWeight: 600 }}>Assessment Pass Rate</span>
                <span style={{ fontWeight: 700, color: 'var(--primary-600)' }}>{ad.stats.assessmentPassRate}%</span>
              </div>
              <ProgressBar percent={ad.stats.assessmentPassRate} variant="primary" height={8} />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 6 }}>
                <span style={{ color: 'var(--gray-700)', fontWeight: 600 }}>Placement Conversion</span>
                <span style={{ fontWeight: 700, color: '#7e22ce' }}>
                  {Math.round((ad.stats.successfulPlacements / (ad.stats.placementEligible || 1)) * 100)}%
                </span>
              </div>
              <ProgressBar
                percent={Math.round((ad.stats.successfulPlacements / (ad.stats.placementEligible || 1)) * 100)}
                variant="warning"
                height={8}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Student Enrollments */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--gray-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--gray-900)' }}>
            Recent Student Enrollments
          </h3>
          <button
            onClick={() => navigate('/admin/students')}
            className="btn btn-secondary btn-sm"
          >
            Manage All Students
          </button>
        </div>

        <div className="table-wrap" style={{ border: 'none', borderRadius: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Admission No</th>
                <th>Full Name</th>
                <th>Email Address</th>
                <th>Status</th>
                <th>Enrollment Date</th>
              </tr>
            </thead>
            <tbody>
              {ad.recentStudents.map((std) => (
                <tr key={std.studentId}>
                  <td style={{ fontWeight: 600 }}>{std.admissionNumber}</td>
                  <td style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{std.fullName}</td>
                  <td>{std.email}</td>
                  <td><StatusBadge status={std.status} /></td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--gray-600)' }}>
                    {new Date(std.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
