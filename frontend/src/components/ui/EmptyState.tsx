import React, { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: ReactNode;
  title?: string;
  description?: string;
  action?: ReactNode;
}

export default function EmptyState({
  icon,
  title = 'No data found',
  description = 'Nothing here yet.',
  action
}: EmptyStateProps) {
  return (
    <div className="empty-state">
      {icon || <Inbox size={48} />}
      <h3>{title}</h3>
      <p style={{ fontSize: '0.9rem', maxWidth: 320 }}>{description}</p>
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  );
}
