import React from 'react';

const statusMap: Record<string, { label: string; className: string }> = {
  ACTIVE: { label: 'Active', className: 'badge-success' },
  INACTIVE: { label: 'Inactive', className: 'badge-gray' },
  COMPLETED: { label: 'Completed', className: 'badge-success' },
  IN_PROGRESS: { label: 'In Progress', className: 'badge-primary' },
  NOT_STARTED: { label: 'Not Started', className: 'badge-gray' },
  PENDING: { label: 'Pending', className: 'badge-warning' },
  SUBMITTED: { label: 'Submitted', className: 'badge-primary' },
  UNDER_REVIEW: { label: 'Under Review', className: 'badge-warning' },
  APPROVED: { label: 'Approved', className: 'badge-success' },
  REJECTED: { label: 'Rejected', className: 'badge-danger' },
  PAID: { label: 'Paid', className: 'badge-success' },
  PARTIAL: { label: 'Partial', className: 'badge-warning' },
  OVERDUE: { label: 'Overdue', className: 'badge-danger' },
  CANCELLED: { label: 'Cancelled', className: 'badge-gray' },
  PRESENT: { label: 'Present', className: 'badge-success' },
  ABSENT: { label: 'Absent', className: 'badge-danger' },
  LATE: { label: 'Late', className: 'badge-warning' },
  EXCUSED: { label: 'Excused', className: 'badge-gray' },
  APPLIED: { label: 'Applied', className: 'badge-primary' },
  SHORTLISTED: { label: 'Shortlisted', className: 'badge-primary' },
  INTERVIEW_SCHEDULED: { label: 'Interview', className: 'badge-warning' },
  SELECTED: { label: 'Selected', className: 'badge-success' },
  OFFER_RECEIVED: { label: 'Offer', className: 'badge-success' },
  JOINED: { label: 'Joined', className: 'badge-success' },
  WITHDRAWN: { label: 'Withdrawn', className: 'badge-gray' },
  PASSED: { label: 'Passed', className: 'badge-success' },
  FAILED: { label: 'Failed', className: 'badge-danger' },
  HIGH: { label: 'High', className: 'badge-danger' },
  NORMAL: { label: 'Normal', className: 'badge-gray' },
  LOW: { label: 'Low', className: 'badge-primary' },
  URGENT: { label: 'Urgent', className: 'badge-danger' },
};

interface StatusBadgeProps {
  status: string;
  custom?: { label: string; className: string };
}

export default function StatusBadge({ status, custom }: StatusBadgeProps) {
  const config = custom || statusMap[status] || { label: status, className: 'badge-gray' };
  return <span className={`badge ${config.className}`}>{config.label}</span>;
}
