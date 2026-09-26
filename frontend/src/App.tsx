import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppLayout from './components/layout/AppLayout';

// Auth Pages
import Login from './pages/auth/Login';

// Student Portal Pages
import StudentDashboard from './pages/student/Dashboard';
import Modules from './pages/student/Modules';
import ModuleDetail from './pages/student/ModuleDetail';
import LessonView from './pages/student/LessonView';
import Attendance from './pages/student/Attendance';
import Assessments from './pages/student/Assessments';
import AssessmentTake from './pages/student/AssessmentTake';
import Assignments from './pages/student/Assignments';
import Fees from './pages/student/Fees';
import BatchChat from './pages/student/BatchChat';
import Placements from './pages/student/Placements';
import Jobs from './pages/student/Jobs';
import Applications from './pages/student/Applications';
import Notifications from './pages/student/Notifications';
import Profile from './pages/student/Profile';

// Trainer Portal Pages
import TrainerDashboard from './pages/trainer/TrainerDashboard';
import TrainerBatches from './pages/trainer/TrainerBatches';
import TrainerAttendance from './pages/trainer/TrainerAttendance';
import TrainerAssignments from './pages/trainer/TrainerAssignments';

// Admin Portal Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminStudents from './pages/admin/AdminStudents';
import AdminCourses from './pages/admin/AdminCourses';
import AdminBatches from './pages/admin/AdminBatches';
import AdminFees from './pages/admin/AdminFees';
import AdminJobs from './pages/admin/AdminJobs';
import AdminReports from './pages/admin/AdminReports';
import AdminSettings from './pages/admin/AdminSettings';

// Route Guard Component
function ProtectedRoute({
  children,
  allowedRoles
}: {
  children: React.ReactNode;
  allowedRoles?: string[];
}) {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--gray-50)' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="skeleton" style={{ width: 48, height: 48, borderRadius: '50%', margin: '0 auto 16px' }} />
          <div style={{ fontSize: '0.9rem', color: 'var(--gray-600)', fontWeight: 500 }}>
            Verifying Mastered Skill Academy session...
          </div>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If role checking is needed and user role is not allowed
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    if (user.role === 'TRAINER') return <Navigate to="/trainer/dashboard" replace />;
    if (user.role === 'ADMIN' || user.role === 'STAFF') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Application Layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            {/* Student Portal Routes */}
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="modules" element={<Modules />} />
            <Route path="modules/:moduleId" element={<ModuleDetail />} />
            <Route path="lessons/:lessonId" element={<LessonView />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="assessments" element={<Assessments />} />
            <Route path="assessments/:assessmentId/take" element={<AssessmentTake />} />
            <Route path="assignments" element={<Assignments />} />
            <Route path="fees" element={<Fees />} />
            <Route path="chat" element={<BatchChat />} />
            <Route path="placements" element={<Placements />} />
            <Route path="jobs" element={<Jobs />} />
            <Route path="applications" element={<Applications />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="profile" element={<Profile />} />

            {/* Trainer Portal Routes */}
            <Route
              path="trainer/dashboard"
              element={
                <ProtectedRoute allowedRoles={['TRAINER', 'ADMIN']}>
                  <TrainerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="trainer/batches"
              element={
                <ProtectedRoute allowedRoles={['TRAINER', 'ADMIN']}>
                  <TrainerBatches />
                </ProtectedRoute>
              }
            />
            <Route
              path="trainer/attendance"
              element={
                <ProtectedRoute allowedRoles={['TRAINER', 'ADMIN']}>
                  <TrainerAttendance />
                </ProtectedRoute>
              }
            />
            <Route
              path="trainer/assignments"
              element={
                <ProtectedRoute allowedRoles={['TRAINER', 'ADMIN']}>
                  <TrainerAssignments />
                </ProtectedRoute>
              }
            />

            {/* Admin Portal Routes */}
            <Route
              path="admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/students"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
                  <AdminStudents />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/courses"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
                  <AdminCourses />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/batches"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
                  <AdminBatches />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/fees"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
                  <AdminFees />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/jobs"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
                  <AdminJobs />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/reports"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
                  <AdminReports />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/settings"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
                  <AdminSettings />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
