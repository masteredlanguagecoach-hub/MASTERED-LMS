import React from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ width = '100%', height = 16, borderRadius, className, style }: SkeletonProps) {
  return (
    <div
      className={`skeleton ${className || ''}`}
      style={{ width, height, borderRadius, ...style }}
    />
  );
}

export function DashboardSkeleton() {
  return (
    <div>
      <div className="dashboard-grid">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card" style={{ display: 'flex', gap: 16 }}>
            <Skeleton width={48} height={48} borderRadius='10px' />
            <div style={{ flex: 1 }}>
              <Skeleton height={28} width='60%' style={{ marginBottom: 8 }} />
              <Skeleton height={14} width='80%' />
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        <div className="card"><Skeleton height={200} /></div>
        <div className="card"><Skeleton height={200} /></div>
      </div>
    </div>
  );
}

export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {[...Array(count)].map((_, i) => (
        <div key={i} className="card">
          <Skeleton height={20} width='50%' style={{ marginBottom: 12 }} />
          <Skeleton height={14} style={{ marginBottom: 8 }} />
          <Skeleton height={14} width='70%' />
        </div>
      ))}
    </div>
  );
}
