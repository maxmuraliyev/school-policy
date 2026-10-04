import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface SectionHeaderProps {
  tag?: string;
  title: string;
  description?: string;
  actionText?: string;
  actionHref?: string;
}

export default function SectionHeader({
  tag,
  title,
  description,
  actionText,
  actionHref,
}: SectionHeaderProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.75rem',
      }}
    >
      <div>
        {tag && (
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--astra-accent)',
              display: 'block',
              marginBottom: '0.35rem',
            }}
          >
            {tag}
          </span>
        )}
        <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          {title}
        </h2>
        {description && (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            {description}
          </p>
        )}
      </div>

      {actionText && actionHref && (
        <Link
          href={actionHref}
          className="btn btn-ghost btn-sm"
          style={{
            color: 'var(--text-primary)',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            paddingRight: '0.25rem',
          }}
        >
          <span>{actionText}</span>
          <ArrowRight size={15} />
        </Link>
      )}
    </div>
  );
}
