import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, MessageSquare, GraduationCap, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function MobileNav() {
  const { user } = useAuth();

  // Show bottom nav primarily for students
  if (user?.role !== 'STUDENT') return null;

  return (
    <nav className="mobile-nav">
      <div className="mobile-nav-items">
        <NavLink
          to="/dashboard"
          className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
        >
          <LayoutDashboard size={20} />
          <span>Home</span>
        </NavLink>

        <NavLink
          to="/modules"
          className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
        >
          <BookOpen size={20} />
          <span>Modules</span>
        </NavLink>

        <NavLink
          to="/chat"
          className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
        >
          <MessageSquare size={20} />
          <span>Chat</span>
        </NavLink>

        <NavLink
          to="/placements"
          className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
        >
          <GraduationCap size={20} />
          <span>Placements</span>
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
        >
          <User size={20} />
          <span>Profile</span>
        </NavLink>
      </div>
    </nav>
  );
}
