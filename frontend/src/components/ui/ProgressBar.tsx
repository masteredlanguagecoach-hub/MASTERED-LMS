import React from 'react';

interface ProgressBarProps {
  percent: number;
  showLabel?: boolean;
  height?: number;
  variant?: 'primary' | 'success' | 'warning' | 'danger';
}

export default function ProgressBar({ percent, showLabel = false, height = 8, variant = 'primary' }: ProgressBarProps) {
  const safePercent = Math.min(100, Math.max(0, percent));
  return (
    <div>
      <div className="progress-bar-wrap" style={{ height }}>
        <div
          className={`progress-bar-fill ${variant !== 'primary' ? variant : ''}`}
          style={{ width: `${safePercent}%` }}
        />
      </div>
      {showLabel && (
        <div style={{ marginTop: 4, fontSize: '0.75rem', color: 'var(--gray-600)', textAlign: 'right' }}>
          {safePercent}%
        </div>
      )}
    </div>
  );
}
