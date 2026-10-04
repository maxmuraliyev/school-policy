import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Award,
  Calendar,
  Clock,
  MapPin,
  Users,
  Shield,
  CheckCircle2,
  ArrowLeft,
  BookOpen,
  Trophy,
  Medal,
} from 'lucide-react';
import prisma from '@/lib/prisma';
import HouseBadge from '@/components/HouseBadge';
import StatusBadge from '@/components/StatusBadge';
import SectionHeader from '@/components/SectionHeader';
import EmptyState from '@/components/EmptyState';

export const revalidate = 0;

export default async function CompetitionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const competition = await prisma.competition.findUnique({
    where: { slug },
    include: {
      category: true,
      participants: {
        include: {
          student: { include: { house: true } },
          team: { include: { members: { include: { student: true } } } },
          house: true,
        },
      },
      results: {
        include: {
          student: { include: { house: true } },
          team: true,
          house: true,
        },
        orderBy: { rank: 'asc' },
      },
      transactions: {
        where: { status: 'APPROVED' },
        include: { house: true },
      },
    },
  });

  if (!competition) {
    notFound();
  }

  const isCompleted = competition.status === 'COMPLETED';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', padding: '2.5rem 0 5rem 0' }}>
      <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        {/* Back Link */}
        <div>
          <Link
            href="/competitions"
            className="btn btn-ghost btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}
          >
            <ArrowLeft size={15} />
            <span>Back to All Competitions</span>
          </Link>
        </div>

        {/* 1. Main Match Fixture Hero Banner */}
        <div
          className="arena-card"
          style={{
            padding: '2.5rem',
            background: 'linear-gradient(180deg, var(--bg-surface-elevated) 0%, var(--bg-surface) 100%)',
            border: isCompleted ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid var(--border-medium)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <StatusBadge status={competition.status} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: competition.category.color }} />
                <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  {competition.category.name}
                </span>
              </div>
            </div>

            <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Organized by: <strong style={{ color: '#ffffff' }}>{competition.organizer}</strong>
            </span>
          </div>

          <h1 className="heading-1" style={{ color: '#ffffff', marginBottom: '1rem' }}>
            {competition.title}
          </h1>

          <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: '850px', marginBottom: '2rem' }}>
            {competition.description}
          </p>

          {/* Schedule & Metadata Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.25rem',
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div>
              <div style={{ fontSize: '0.725rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                Date & Schedule
              </div>
              <div style={{ fontWeight: 700, color: '#ffffff', marginTop: '0.25rem', fontSize: '0.925rem' }}>
                {new Date(competition.startsAt).toLocaleDateString(undefined, {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.725rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                Venue / Location
              </div>
              <div style={{ fontWeight: 700, color: '#ffffff', marginTop: '0.25rem', fontSize: '0.925rem' }}>
                {competition.venue}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.725rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                Format & Competition Type
              </div>
              <div style={{ fontWeight: 700, color: '#ffffff', marginTop: '0.25rem', fontSize: '0.925rem' }}>
                {competition.format} &bull; {competition.competitionType}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.725rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                Participants Enrolled
              </div>
              <div style={{ fontWeight: 700, color: '#ffffff', marginTop: '0.25rem', fontSize: '0.925rem' }}>
                {competition.participants.length}
                {competition.maxParticipants ? ` / ${competition.maxParticipants} max` : ' competitors'}
              </div>
            </div>
          </div>
        </div>

        {/* 2. Official Results & Podium Showcase (if Completed) */}
        {isCompleted && (
          <section>
            <SectionHeader
              tag="Jury Verification"
              title="Official Placement & Points Awarded"
              description="Points officially credited to house championship balances"
            />

            <div
              className="arena-card"
              style={{
                padding: '2rem',
                border: '1px solid rgba(245, 158, 11, 0.35)',
                background: 'linear-gradient(180deg, var(--bg-surface-elevated) 0%, var(--bg-surface) 100%)',
              }}
            >
              {/* Podium Cards */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: '1.25rem',
                  marginBottom: '2rem',
                }}
              >
                {competition.results.map((res) => {
                  const rankIcons = {
                    1: { icon: Trophy, color: 'var(--gold)', label: '1st Place &bull; Champion' },
                    2: { icon: Medal, color: 'var(--silver)', label: '2nd Place &bull; Silver' },
                    3: { icon: Medal, color: 'var(--bronze)', label: '3rd Place &bull; Bronze' },
                  }[res.rank] || { icon: Award, color: 'var(--text-muted)', label: `Rank #${res.rank}` };

                  const RankIcon = rankIcons.icon;

                  return (
                    <div
                      key={res.id}
                      style={{
                        padding: '1.5rem',
                        borderRadius: 'var(--radius-lg)',
                        background: res.rank === 1 ? 'rgba(245, 158, 11, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                        border: res.rank === 1 ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid var(--border-subtle)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '1rem',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              fontSize: '0.75rem',
                              fontWeight: 800,
                              color: rankIcons.color,
                            }}
                          >
                            <RankIcon size={16} />
                            <span dangerouslySetInnerHTML={{ __html: rankIcons.label }} />
                          </span>
                          <HouseBadge name={res.house.name} slug={res.house.slug} size="sm" />
                        </div>

                        <h4 style={{ fontSize: '1.15rem', color: '#ffffff', marginBottom: '0.25rem' }}>
                          {res.student
                            ? `${res.student.firstName} ${res.student.lastName}`
                            : res.team?.name || res.house.name}
                        </h4>
                        {res.scoreText && (
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            {res.scoreText}
                          </div>
                        )}
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          paddingTop: '0.75rem',
                          borderTop: '1px solid var(--border-subtle)',
                        }}
                      >
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Points Credited</span>
                        <span className="font-stats" style={{ fontSize: '1.2rem', fontWeight: 800, color: rankIcons.color }}>
                          +{res.pointsAwarded} PTS
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Verified Ledger Entries for This Competition */}
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Recipient / Competitor</th>
                      <th>House</th>
                      <th>Placement Score</th>
                      <th>Points Awarded</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {competition.results.map((res) => (
                      <tr key={res.id}>
                        <td>
                          <span style={{ fontWeight: 800, color: res.rank === 1 ? 'var(--gold)' : '#ffffff' }}>
                            #{res.rank}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, color: '#ffffff' }}>
                            {res.student
                              ? `${res.student.firstName} ${res.student.lastName}`
                              : res.team?.name || res.house.name}
                          </div>
                          {res.student && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              Code: {res.student.studentCode} ({res.student.className})
                            </div>
                          )}
                        </td>
                        <td>
                          <HouseBadge name={res.house.name} slug={res.house.slug} size="sm" />
                        </td>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {res.scoreText || 'Official Placement'}
                        </td>
                        <td>
                          <strong className="font-stats" style={{ color: 'var(--gold)', fontSize: '1.05rem' }}>
                            +{res.pointsAwarded} pts
                          </strong>
                        </td>
                        <td>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.825rem' }}>
                            {res.notes || 'Verified by Department Jury'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* 3. Competition Rules & Code of Conduct */}
        <section>
          <div className="arena-card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800 }}>
              <BookOpen size={20} color="var(--astra-accent)" />
              <span>Competition Rules & Regulations</span>
            </h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem' }}>
              {competition.rules ||
                'Standard Horizon Academy inter-house tournament regulations apply. Academic integrity and sportsmanship are strictly monitored. Any violation results in point forfeiture.'}
            </p>
          </div>
        </section>

        {/* 4. Registered Participants Roster */}
        <section>
          <SectionHeader
            tag="Lineup"
            title={`Registered Competitors (${competition.participants.length})`}
            description="Students and teams confirmed for this fixture"
          />

          <div className="arena-card" style={{ padding: '1.5rem' }}>
            {competition.participants.length === 0 ? (
              <EmptyState title="No competitors registered yet" description="Roster registration will open prior to match day." />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                {competition.participants.map((p) => (
                  <div
                    key={p.id}
                    className="panel-elevated"
                    style={{
                      padding: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderLeft: `3px solid ${p.house.slug === 'astra' ? 'var(--astra-primary)' : 'var(--terra-primary)'}`,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.925rem' }}>
                        {p.student
                          ? `${p.student.firstName} ${p.student.lastName}`
                          : p.team?.name || p.house.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                        {p.house.name} {p.student ? `&bull; Grade ${p.student.grade}` : ''}
                      </div>
                    </div>

                    <StatusBadge status={p.status} size="sm" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
