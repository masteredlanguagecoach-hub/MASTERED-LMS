import React from 'react';
import { useApi } from '../../hooks/useApi';
import { notificationsApi } from '../../api/client';
import { Notification } from '../../types';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import { Bell, CheckCheck, Clock, FileText, Award, Calendar, CreditCard } from 'lucide-react';

interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
}

export default function Notifications() {
  const { data, loading, error, refetch } = useApi<NotificationsResponse>(() =>
    notificationsApi.getNotifications()
  );

  const notifications = data?.notifications || [];

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'ASSESSMENT': return <Award size={18} color="#d97706" />;
      case 'ASSIGNMENT': return <FileText size={18} color="var(--primary-600)" />;
      case 'PLACEMENT': return <Award size={18} color="#16a34a" />;
      case 'FEE': return <CreditCard size={18} color="#9333ea" />;
      default: return <Bell size={18} color="var(--primary-600)" />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 880, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gray-900)' }}>
            Notifications & Alerts
          </h2>
          <p style={{ color: 'var(--gray-600)', fontSize: '0.9rem' }}>
            Direct academy system alerts regarding assignments, assessments, placement drives and fees.
          </p>
        </div>

        {notifications.length > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <CheckCheck size={16} />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No Notifications"
          message="You are all caught up! Academic alerts and announcements will appear here."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {notifications.map((notif) => {
          const isUnread = notif.isRead !== 'true';

          return (
            <div
              key={notif.notificationId}
              className="card"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 16,
                padding: '16px 20px',
                background: isUnread ? '#eff6ff' : 'var(--white)',
                border: isUnread ? '1.5px solid #bfdbfe' : '1px solid var(--gray-200)'
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: isUnread ? 'var(--white)' : 'var(--gray-100)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                {getIcon(notif.type)}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--gray-900)' }}>
                      {notif.title}
                    </h4>
                    {isUnread && (
                      <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>
                        NEW
                      </span>
                    )}
                  </div>

                  <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                    {new Date(notif.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--gray-700)', lineHeight: 1.5 }}>
                  {notif.body}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
}
