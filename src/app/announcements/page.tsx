import React from 'react';
import Link from 'next/link';
import { Bell, Calendar, User, Pin } from 'lucide-react';
import prisma from '@/lib/prisma';
import SectionHeader from '@/components/SectionHeader';
import HouseBadge from '@/components/HouseBadge';
import EmptyState from '@/components/EmptyState';
import TelegramBanner from '@/components/TelegramBanner';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AnnouncementsPage() {
  let announcements: any[] = [];
  try {
    announcements = await prisma.announcement.findMany({
      where: { status: 'PUBLISHED' },
      include: { house: true },
      orderBy: [{ isPinned: 'desc' }, { publishedAt: 'desc' }],
    });
  } catch (err) {
    console.error('Announcements fetch error:', err);
  }

  return (
    <div className="container" style={{ padding: '3rem 1.5rem 5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      <SectionHeader
        tag="OFFICIAL DISPATCHES"
        title="House System Announcements"
        description="Official communiqués from the School Principal, House Masters, and student leadership."
      />

      <TelegramBanner />

      {announcements.length === 0 ? (
        <EmptyState
          title="No Published Announcements"
          description="Official notices and house bulletins will be broadcast here when published."
          icon={<Bell size={40} color="var(--gold)" />}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {announcements.map((ann) => {
            const isAstra = ann.audienceType === 'ASTRA';
            const isTerra = ann.audienceType === 'TERRA';
            const borderCol = isAstra
              ? 'var(--astra-primary)'
              : isTerra
              ? 'var(--terra-primary)'
              : 'var(--gold)';

            return (
              <article
                key={ann.id}
                className="arena-card"
                style={{
                  padding: '2rem',
                  borderLeft: `4px solid ${borderCol}`,
                  position: 'relative',
                }}
              >
                {/* Meta Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                    {ann.house ? (
                      <HouseBadge
                        name={ann.house.name}
                        slug={ann.house.slug}
                        color={ann.house.primaryColor}
                        size="sm"
                      />
                    ) : (
                      <span
                        className="badge"
                        style={{
                          background: 'rgba(245, 158, 11, 0.12)',
                          color: 'var(--gold)',
                          border: '1px solid rgba(245, 158, 11, 0.3)',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                        }}
                      >
                        SCHOOL-WIDE
                      </span>
                    )}

                    {ann.isPinned && (
                      <span
                        className="badge"
                        style={{
                          background: 'rgba(245, 158, 11, 0.15)',
                          color: 'var(--gold)',
                          border: '1px solid rgba(245, 158, 11, 0.35)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          fontSize: '0.7rem',
                          fontWeight: 800,
                        }}
                      >
                        <Pin size={11} />
                        <span>PINNED BULLETIN</span>
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Calendar size={13} color="var(--text-muted)" />
                    <span>
                      {new Date(ann.publishedAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h2 style={{ fontSize: '1.65rem', color: '#fff', marginBottom: '1rem', lineHeight: 1.3, fontWeight: 700 }}>
                  {ann.title}
                </h2>

                {/* Content */}
                <div
                  style={{
                    color: 'var(--text-secondary)',
                    lineHeight: 1.7,
                    fontSize: '0.95rem',
                    whiteSpace: 'pre-line',
                    marginBottom: '1.5rem',
                  }}
                >
                  {ann.content}
                </div>

                {/* Author Footer */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid var(--border-subtle)',
                    fontSize: '0.85rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  <User size={14} color="var(--text-muted)" />
                  <span>
                    Dispatched by <strong style={{ color: '#fff' }}>{ann.authorName}</strong>
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
