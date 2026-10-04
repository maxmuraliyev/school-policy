import React from 'react';
import Link from 'next/link';
import { Award, Shield, CheckCircle2, Calendar, Building, User, ExternalLink } from 'lucide-react';
import prisma from '@/lib/prisma';
import SectionHeader from '@/components/SectionHeader';
import HouseBadge from '@/components/HouseBadge';
import EmptyState from '@/components/EmptyState';

export const revalidate = 0;

export default async function AchievementsPage() {
  const achievements = await prisma.achievement.findMany({
    where: { status: 'APPROVED' },
    include: {
      student: { include: { house: true } },
      house: true,
      category: true,
    },
    orderBy: { achievementDate: 'desc' },
  });

  return (
    <div className="container" style={{ padding: '3rem 1.5rem 5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      <SectionHeader
        tag="ACADEMIC & ATHLETIC HONORS"
        title="Verified Student Achievements"
        description="Official records of Olympiad medals, athletic distinctions, research publications, and community service milestones verified by school faculty."
      />

      {achievements.length === 0 ? (
        <EmptyState
          title="No Verified Achievements Yet"
          description="Faculty-approved Olympiad distinctions, medals, and certifications will appear on this official honor roll."
          icon={<Award size={40} color="var(--gold)" />}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {achievements.map((ach) => {
            const isAstra = ach.house.slug === 'astra';
            const levelColor =
              ach.level === 'INTERNATIONAL' || ach.level === 'NATIONAL'
                ? 'var(--gold)'
                : ach.level === 'STATE' || ach.level === 'REGIONAL'
                ? '#38bdf8'
                : 'var(--text-secondary)';

            return (
              <div
                key={ach.id}
                className="arena-card"
                style={{
                  padding: '1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderTop: `3px solid ${ach.house.primaryColor}`,
                  position: 'relative',
                  gap: '1.5rem',
                }}
              >
                <div>
                  {/* Top Badges */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <HouseBadge
                      name={ach.house.name}
                      slug={ach.house.slug}
                      color={ach.house.primaryColor}
                      size="sm"
                    />

                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span
                        className="badge"
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          letterSpacing: '0.06em',
                          background: 'rgba(255, 255, 255, 0.05)',
                          color: levelColor,
                          border: `1px solid ${levelColor}40`,
                          padding: '0.2rem 0.55rem',
                        }}
                      >
                        {ach.level} TIER
                      </span>

                      {ach.category && (
                        <span
                          className="badge"
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            background: 'rgba(255, 255, 255, 0.04)',
                            color: 'var(--text-muted)',
                            border: '1px solid var(--border-subtle)',
                            padding: '0.2rem 0.55rem',
                          }}
                        >
                          {ach.category.name}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 style={{ fontSize: '1.3rem', color: '#fff', marginBottom: '0.65rem', lineHeight: 1.35, fontWeight: 700 }}>
                    {ach.title}
                  </h3>

                  {/* Description */}
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                    {ach.description}
                  </p>

                  {/* Student & Organization Info */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                      padding: '0.85rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.85rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <User size={14} color="var(--text-muted)" />
                      <span style={{ color: 'var(--text-muted)' }}>Recipient:</span>
                      {ach.student ? (
                        <Link href={`/students/${ach.student.id}`} style={{ color: '#fff', fontWeight: 600, textDecoration: 'none' }}>
                          {ach.student.firstName} {ach.student.lastName} ({ach.student.className})
                        </Link>
                      ) : (
                        <span style={{ color: '#fff', fontWeight: 600 }}>House Squad</span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Building size={14} color="var(--text-muted)" />
                      <span style={{ color: 'var(--text-muted)' }}>Authority:</span>
                      <strong style={{ color: 'var(--text-secondary)' }}>{ach.organization}</strong>
                    </div>
                  </div>
                </div>

                {/* Footer Bar */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '1rem',
                    borderTop: '1px solid var(--border-subtle)',
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Calendar size={13} color="var(--text-muted)" />
                    <span>
                      {new Date(ach.achievementDate).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  {ach.pointsAwarded && (
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 800,
                        fontSize: '0.95rem',
                        color: ach.house.primaryColor,
                        background: `${ach.house.primaryColor}15`,
                        padding: '0.25rem 0.65rem',
                        borderRadius: 'var(--radius-xs)',
                        border: `1px solid ${ach.house.primaryColor}30`,
                      }}
                    >
                      +{ach.pointsAwarded} pts
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
