import React, { useState } from 'react';
import { Menu, Bell, User as UserIcon, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onToggleSidebar: () => void;
  title?: string;
}

export default function Header({ onToggleSidebar, title }: HeaderProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="app-header">
      <button
        className="menu-toggle"
        onClick={onToggleSidebar}
        aria-label="Toggle Navigation Menu"
      >
        <Menu size={20} />
      </button>

      <div className="header-title">
        {title || 'Mastered Skill Academy'}
      </div>

      <div className="header-actions">
        {/* Backend status indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '0.75rem',
            padding: '4px 10px',
            borderRadius: 999,
            background: 'var(--primary-50)',
            color: 'var(--primary-700)',
            fontWeight: 500
          }}
          title="Google Sheets & Apps Script Architecture"
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#22c55e',
              display: 'inline-block'
            }}
          />
          <span className="truncate" style={{ maxWidth: 120 }}>Google Sheets DB</span>
        </div>

        <button
          className="notif-bell"
          onClick={() => navigate('/notifications')}
          title="Notifications"
        >
          <Bell size={18} />
        </button>

        <div
          onClick={() => navigate('/profile')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--gray-100)'
          }}
        >
          <div className="avatar avatar-sm">
            {user?.profileImageUrl ? (
              <img src={user.profileImageUrl} alt={user?.fullName} />
            ) : (
              user?.fullName?.charAt(0).toUpperCase() || <UserIcon size={14} />
            )}
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--gray-800)' }}>
            {user?.fullName?.split(' ')[0] || 'User'}
          </span>
        </div>
      </div>
    </header>
  );
}
