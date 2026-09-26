import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileNav from './MobileNav';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'Student Dashboard';
    if (path.includes('/modules')) return 'My Modules & Learning Path';
    if (path.includes('/attendance')) return 'Attendance Record';
    if (path.includes('/assessments')) return 'Assessments & Quizzes';
    if (path.includes('/assignments')) return 'Assignments & Submissions';
    if (path.includes('/fees')) return 'Fee Ledger & Installments';
    if (path.includes('/chat')) return 'Batch Collaboration & Chat';
    if (path.includes('/placements')) return 'Placement Readiness Portal';
    if (path.includes('/jobs')) return 'Jobs & Opportunities';
    if (path.includes('/applications')) return 'My Applications';
    if (path.includes('/notifications')) return 'Announcements & Notifications';
    if (path.includes('/profile')) return 'Student Profile';
    if (path.includes('/trainer/dashboard')) return 'Trainer Dashboard';
    if (path.includes('/trainer/batches')) return 'Authorized Batches';
    if (path.includes('/trainer/attendance')) return 'Class Attendance Registry';
    if (path.includes('/trainer/assignments')) return 'Student Assignment Reviews';
    if (path.includes('/admin/dashboard')) return 'Academy Operations Dashboard';
    if (path.includes('/admin/students')) return 'Student Management';
    if (path.includes('/admin/courses')) return 'Curriculum & Courses';
    if (path.includes('/admin/batches')) return 'Batches & Scheduling';
    if (path.includes('/admin/fees')) return 'Financial Records & Receipts';
    if (path.includes('/admin/jobs')) return 'Placement Drives & Job Postings';
    if (path.includes('/admin/reports')) return 'Reports & Intelligence';
    if (path.includes('/admin/settings')) return 'System Settings & Google Sheets DB';
    return 'Mastered Skill Academy';
  };

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} title={getPageTitle()} />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
