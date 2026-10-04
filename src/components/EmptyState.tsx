import React from 'react';
import Link from 'next/link';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionText?: string;
  actionHref?: string;
  onActionClick?: () => void;
}

export default function EmptyState({
  title,
  description,
  icon,
  actionText,
  actionHref,
  onActionClick,
}: EmptyStateProps) {
  return (
    <div
      className="arena-card"
      style={{
        padding: '3rem 2rem',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-surface)',
        border: '1px dashed var(--border-medium)',
      }}
    >
      <div
        style={{
          width: '52px',
          height: '52px',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(255, 255, 255, 0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
          marginBottom: '1rem',
        }}
      >
        {icon || <Inbox size={26} />}
      </div>
      <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
        {title}
      </h3>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '420px', lineHeight: 1.6 }}>
        {description}
      </p>
      {actionText && (
        <div style={{ marginTop: '1.25rem' }}>
          {actionHref ? (
            <Link href={actionHref} className="btn btn-secondary btn-sm">
              {actionText}
            </Link>
          ) : (
            <button type="button" onClick={onActionClick} className="btn btn-secondary btn-sm">
              {actionText}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
