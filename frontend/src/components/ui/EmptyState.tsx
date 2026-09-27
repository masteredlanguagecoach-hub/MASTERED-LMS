import React, { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: any;
  title?: string;
  description?: string;
  message?: string;
  action?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon,
  title = 'No data found',
  description,
  message,
  action,
  actionLabel,
  onAction
}: EmptyStateProps) {
  const desc = description || message || 'Nothing here yet.';

  let renderedIcon = <Inbox size={48} />;
  if (React.isValidElement(icon)) {
    renderedIcon = icon;
  } else if (typeof icon === 'function') {
    const IconComp = icon;
    renderedIcon = <IconComp size={48} />;
  }

  return (
    <div className="empty-state">
      {renderedIcon}
      <h3>{title}</h3>
      <p style={{ fontSize: '0.9rem', maxWidth: 360 }}>{desc}</p>
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
      {!action && actionLabel && onAction && (
        <div style={{ marginTop: 16 }}>
          <button onClick={onAction} className="btn btn-primary btn-sm">
            {actionLabel}
          </button>
        </div>
      )}
    </div>
  );
}
