import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, XCircle, Award } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const normStatus = status.toUpperCase().replace(/\s+/g, '_');

  const configMap: Record<
    string,
    { label: string; bg: string; color: string; border: string; icon: React.ReactNode }
  > = {
    APPROVED: {
      label: 'Approved',
      bg: 'rgba(16, 185, 129, 0.12)',
      color: '#6ee7b7',
      border: 'rgba(16, 185, 129, 0.3)',
      icon: <CheckCircle2 size={12} />,
    },
    PENDING: {
      label: 'Pending Review',
      bg: 'rgba(245, 158, 11, 0.12)',
      color: '#fde68a',
      border: 'rgba(245, 158, 11, 0.3)',
      icon: <Clock size={12} />,
    },
    REJECTED: {
      label: 'Rejected',
      bg: 'rgba(239, 68, 68, 0.12)',
      color: '#fca5a5',
      border: 'rgba(239, 68, 68, 0.3)',
      icon: <XCircle size={12} />,
    },
    REVERSED: {
      label: 'Reversed',
      bg: 'rgba(148, 163, 184, 0.12)',
      color: '#cbd5e1',
      border: 'rgba(148, 163, 184, 0.3)',
      icon: <AlertTriangle size={12} />,
    },
    REGISTRATION_OPEN: {
      label: 'Open for Registration',
      bg: 'rgba(56, 189, 248, 0.15)',
      color: '#7dd3fc',
      border: 'rgba(56, 189, 248, 0.35)',
      icon: <CheckCircle2 size={12} />,
    },
    REGISTRATION_CLOSED: {
      label: 'Registration Closed',
      bg: 'rgba(148, 163, 184, 0.12)',
      color: '#94a3b8',
      border: 'rgba(148, 163, 184, 0.25)',
      icon: <Clock size={12} />,
    },
    ONGOING: {
      label: 'Live Tournament',
      bg: 'rgba(245, 158, 11, 0.15)',
      color: '#fbbf24',
      border: 'rgba(245, 158, 11, 0.4)',
      icon: <span className="live-indicator" style={{ width: 6, height: 6 }} />,
    },
    COMPLETED: {
      label: 'Official Results',
      bg: 'rgba(16, 185, 129, 0.15)',
      color: '#34d399',
      border: 'rgba(16, 185, 129, 0.35)',
      icon: <Award size={12} />,
    },
    CANCELLED: {
      label: 'Cancelled',
      bg: 'rgba(239, 68, 68, 0.12)',
      color: '#fca5a5',
      border: 'rgba(239, 68, 68, 0.3)',
      icon: <XCircle size={12} />,
    },
  };

  const current = configMap[normStatus] || {
    label: status.replace(/_/g, ' '),
    bg: 'rgba(255, 255, 255, 0.08)',
    color: 'var(--text-secondary)',
    border: 'var(--border-subtle)',
    icon: null,
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        fontSize: size === 'sm' ? '0.7rem' : '0.75rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        padding: size === 'sm' ? '0.2rem 0.5rem' : '0.25rem 0.65rem',
        borderRadius: 'var(--radius-full)',
        background: current.bg,
        color: current.color,
        border: `1px solid ${current.border}`,
        lineHeight: 1,
      }}
    >
      {current.icon}
      <span>{current.label}</span>
    </span>
  );
}
