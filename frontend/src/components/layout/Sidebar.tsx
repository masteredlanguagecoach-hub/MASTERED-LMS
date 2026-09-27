import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  BookOpen,
  CalendarCheck,
  Award,
  FileText,
  CreditCard,
  MessageSquare,
  Briefcase,
  User,
  Bell,
  LogOut,
  Users,
  Layers,
  GraduationCap,
  Settings,
  BarChart3,
  Calendar
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const role = user?.role || 'STUDENT';

  return (
    <>
      <div
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-title">MASTERED SKILL</div>
            <div className="sidebar-logo-tagline">ACADEMY</div>
            <div style={{ fontSize: '0.65rem', color: '#93c5fd', marginTop: 3 }}>
              Learn • Grow • Get Placed
            </div>
          </div>
        </div>

        {user && (
          <div className="sidebar-user">
            <div className="avatar avatar-md">
              {user.profileImageUrl ? (
                <img src={user.profileImageUrl} alt={user.fullName} />
              ) : (
                user.fullName.charAt(0).toUpperCase()
              )}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name" title={user.fullName}>
                {user.fullName}
              </div>
              <div className="sidebar-user-role">
                {user.role} • {user.admissionNumber}
              </div>
            </div>
          </div>
        )}

        <nav className="sidebar-nav">
          {/* STUDENT NAVIGATION */}
          {role === 'STUDENT' && (
            <>
              <div className="sidebar-section-label">Learning</div>
              <NavLink
                to="/dashboard"
                onClick={onClose}
                className={({ isActive }) =>
                  `sidebar-nav-item ${isActive ? 'active' : ''}`
                }
              >
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </NavLink>

              <NavLink
                to="/modules"
                onClick={onClose}
                className={({ isActive }) =>
                  `sidebar-nav-item ${isActive ? 'active' : ''}`
                }
              >
                <BookOpen size={18} />
                <span>My Modules</span>
              </NavLink>

              <NavLink
                to="/attendance"
                onClick={onClose}
                className={({ isActive }) =>
                  `sidebar-nav-item ${isActive ? 'active' : ''}`
                }
              >
                <CalendarCheck size={18} />
                <span>Attendance</span>
              </NavLink>

              <NavLink
                to="/assessments"
                onClick={onClose}
                className={({ isActive }) =>
                  `sidebar-nav-item ${isActive ? 'active' : ''}`
                }
              >
                <Award size={18} />
                <span>Assessments</span>
              </NavLink>

              <NavLink
                to="/assignments"
                onClick={onClose}
                className={({ isActive }) =>
                  `sidebar-nav-item ${isActive ? 'active' : ''}`
                }
              >
                <FileText size={18} />
                <span>Assignments</span>
              </NavLink>

              <div className="sidebar-section-label">Financials</div>
              <NavLink
                to="/fees"
                onClick={onClose}
                className={({ isActive }) =>
                  `sidebar-nav-item ${isActive ? 'active' : ''}`
                }
              >
                <CreditCard size={18} />
                <span>Fees & Installments</span>
              </NavLink>

              <div className="sidebar-section-label">Community & Career</div>
              <NavLink
                to="/chat"
                onClick={onClose}
                className={({ isActive }) =>
                  `sidebar-nav-item ${isActive ? 'active' : ''}`
                }
              >
                <MessageSquare size={18} />
                <span>Batch Chat</span>
              </NavLink>

              <NavLink
                to="/placements"
                onClick={onClose}
                className={({ isActive }) =>
                  `sidebar-nav-item ${isActive ? 'active' : ''}`
                }
              >
                <GraduationCap size={18} />
                <span>Placements & Readiness</span>
              </NavLink>

              <NavLink
                to="/jobs"
                onClick={onClose}
                className={({ isActive }) =>
                  `sidebar-nav-item ${isActive ? 'active' : ''}`
                }
              >
                <Briefcase size={18} />
                <span>Jobs & Internships</span>
              </NavLink>

              <NavLink
                to="/notifications"
                onClick={onClose}
                className={({ isActive }) =>
                  `sidebar-nav-item ${isActive ? 'active' : ''}`
                }
              >
                <Bell size={18} />
                <span>Notifications</span>
              </NavLink>

              <NavLink
                to="/profile"
                onClick={onClose}
                className={({ isActive }) =>
                  `sidebar-nav-item ${isActive ? 'active' : ''}`
                }
              >
                <User size={18} />
                <span>My Profile</span>
              </NavLink>
            </>
          )}

          {/* TRAINER NAVIGATION */}
          {role === 'TRAINER' && (
            <>
              <div className="sidebar-section-label">Trainer Portal</div>
              <NavLink
                to="/trainer/dashboard"
                onClick={onClose}
                className={({ isActive }) =>
                  `sidebar-nav-item ${isActive ? 'active' : ''}`
                }
              >
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </NavLink>

              <NavLink
                to="/trainer/batches"
                onClick={onClose}
                className={({ isActive }) =>
                  `sidebar-nav-item ${isActive ? 'active' : ''}`
                }
              >
                <Users size={18} />
                <span>My Batches</span>
              </NavLink>

              <NavLink
                to="/trainer/attendance"
                onClick={onClose}
                className={({ isActive }) =>
                  `sidebar-nav-item ${isActive ? 'active' : ''}`
                }
              >
                <CalendarCheck size={18} />
                <span>Mark Attendance</span>
              </NavLink>

              <NavLink
                to="/trainer/assignments"
                onClick={onClose}
                className={({ isActive }) =>
                  `sidebar-nav-item ${isActive ? 'active' : ''}`
                }
              >
                <FileText size={18} />
                <span>Review Submissions</span>
              </NavLink>

              <NavLink
                to="/chat"
                onClick={onClose}
                className={({ isActive }) =>
                  `sidebar-nav-item ${isActive ? 'active' : ''}`
                }
              >
                <MessageSquare size={18} />
                <span>Batch Announcements</span>
              </NavLink>
            </>
          )}

          {/* ADMIN & STAFF NAVIGATION */}
          {(role === 'ADMIN' || role === 'STAFF') && (
            <>
              <div className="sidebar-section-label">Administration</div>
              <NavLink
                to="/admin/dashboard"
                onClick={onClose}
                className={({ isActive }) =>
                  `sidebar-nav-item ${isActive ? 'active' : ''}`
                }
              >
                <LayoutDashboard size={18} />
                <span>Admin Dashboard</span>
              </NavLink>

              <NavLink
                to="/admin/students"
                onClick={onClose}
                className={({ isActive }) =>
                  `sidebar-nav-item ${isActive ? 'active' : ''}`
                }
              >
                <Users size={18} />
                <span>Students</span>
              </NavLink>

              <NavLink
                to="/admin/courses"
                onClick={onClose}
                className={({ isActive }) =>
                  `sidebar-nav-item ${isActive ? 'active' : ''}`
                }
              >
                <Layers size={18} />
                <span>Courses & Modules</span>
              </NavLink>

              <NavLink
                to="/admin/batches"
                onClick={onClose}
                className={({ isActive }) =>
                  `sidebar-nav-item ${isActive ? 'active' : ''}`
                }
              >
                <Calendar size={18} />
                <span>Batches & Classes</span>
              </NavLink>

              <NavLink
                to="/admin/fees"
                onClick={onClose}
                className={({ isActive }) =>
                  `sidebar-nav-item ${isActive ? 'active' : ''}`
                }
              >
                <CreditCard size={18} />
                <span>Fee Collections</span>
              </NavLink>

              <NavLink
                to="/admin/jobs"
                onClick={onClose}
                className={({ isActive }) =>
                  `sidebar-nav-item ${isActive ? 'active' : ''}`
                }
              >
                <Briefcase size={18} />
                <span>Placement Jobs</span>
              </NavLink>

              <NavLink
                to="/admin/placements"
                onClick={onClose}
                className={({ isActive }) =>
                  `sidebar-nav-item ${isActive ? 'active' : ''}`
                }
              >
                <GraduationCap size={18} />
                <span>Placement Candidates</span>
              </NavLink>

              <NavLink
                to="/admin/reports"
                onClick={onClose}
                className={({ isActive }) =>
                  `sidebar-nav-item ${isActive ? 'active' : ''}`
                }
              >
                <BarChart3 size={18} />
                <span>Reports & Analytics</span>
              </NavLink>

              <NavLink
                to="/admin/settings"
                onClick={onClose}
                className={({ isActive }) =>
                  `sidebar-nav-item ${isActive ? 'active' : ''}`
                }
              >
                <Settings size={18} />
                <span>System & Google Sheets</span>
              </NavLink>
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <button
            onClick={handleLogout}
            className="sidebar-nav-item"
            style={{ width: '100%', color: '#fca5a5' }}
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
