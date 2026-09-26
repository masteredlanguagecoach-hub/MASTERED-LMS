import React from 'react';

interface ProgressRingProps {
  percent: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  subLabel?: string;
}

export default function ProgressRing({
  percent,
  size = 100,
  strokeWidth = 8,
  color = 'var(--primary-500)',
  label,
  subLabel
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <svg width={size} height={size} className="progress-ring">
        <circle
          className="progress-ring-bg"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <circle
          className="progress-ring-fill"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
        {label && (
          <text
            x="50%"
            y="50%"
            dominantBaseline="middle"
            textAnchor="middle"
            style={{ transform: 'rotate(90deg)', transformOrigin: 'center', fontSize: size < 80 ? 14 : 18, fontWeight: 700, fill: 'var(--gray-900)' }}
          >
            {label}
          </text>
        )}
        {subLabel && (
          <text
            x="50%"
            y="62%"
            dominantBaseline="middle"
            textAnchor="middle"
            style={{ transform: 'rotate(90deg)', transformOrigin: 'center', fontSize: 10, fill: 'var(--gray-500)' }}
          >
            {subLabel}
          </text>
        )}
      </svg>
    </div>
  );
}
