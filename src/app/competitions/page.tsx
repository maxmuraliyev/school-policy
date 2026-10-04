import React from 'react';
import Link from 'next/link';
import {
  Award,
  Calendar,
  MapPin,
  Users,
  ArrowRight,
  Trophy,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import prisma from '@/lib/prisma';
import { getServerI18n } from '@/lib/i18n';
import StatusBadge from '@/components/StatusBadge';
import EmptyState from '@/components/EmptyState';

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{ status?: string; category?: string }>;
}

export default async function CompetitionsPage({ searchParams }: PageProps) {
  const { lang, t } = await getServerI18n();
  const { status, category } = await searchParams;
  const statusFilter = status || 'ALL';

  const whereClause: any = {};
  if (statusFilter !== 'ALL') {
    whereClause.status = statusFilter;
  }
  if (category) {
    whereClause.category = { slug: category };
  }

  const competitions = await prisma.competition.findMany({
    where: whereClause,
    include: {
      category: true,
      participants: { include: { student: true, house: true } },
      results: {
        include: { house: true, student: true, team: true },
        orderBy: { rank: 'asc' },
      },
    },
    orderBy: { startsAt: 'desc' },
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem', padding: '3rem 0 5rem 0' }}>
      <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        {/* Header & Status Filter Tabs */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
            gap: '1.5rem',
            paddingBottom: '1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span className="live-indicator" />
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--text-muted)',
                }}
              >
                {t('activeLeagueTournaments')}
              </span>
            </div>
            <h1 className="heading-1">{t('competitionsAndFixtures')}</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '650px', marginTop: '0.35rem' }}>
              {lang === 'uz'
                ? 'Guruhlar o‘rtasidagi futbol, matematika, robototexnika va intellektual bellashuvlar. Ballar rasmiy hakamlar hay’ati tasdig‘idan so‘ng beriladi.'
                : 'Inter-house football derbies, mathematics decathlons, robotics hackathons, and debate championships. Points are officially awarded upon verified jury adjudication.'}
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="filter-tabs">
            {[
              { label: t('allFixtures'), val: 'ALL' },
              { label: t('regOpen'), val: 'REGISTRATION_OPEN' },
              { label: t('ongoing'), val: 'ONGOING' },
              { label: t('completed'), val: 'COMPLETED' },
            ].map((item) => (
              <Link
                key={item.val}
                href={`/competitions?status=${item.val}`}
                className={`filter-tab ${statusFilter === item.val ? 'active' : ''}`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Competitions Grid */}
        {competitions.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem' }}>
            {competitions.map((comp) => {
              const isCompleted = comp.status === 'COMPLETED';
              const topWinner = comp.results.find((r) => r.rank === 1);

              return (
                <div
                  key={comp.id}
                  className="arena-card"
                  style={{
                    padding: '2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '1.5rem',
                    background: 'linear-gradient(180deg, var(--bg-surface-elevated) 0%, var(--bg-surface) 100%)',
                    border: isCompleted
                      ? '1px solid rgba(245, 158, 11, 0.25)'
                      : '1px solid var(--border-medium)',
                  }}
                >
                  <div>
                    {/* Top Row: Category dot & Status */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: comp.category.color }} />
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                          {comp.category.name}
                        </span>
                      </div>
                      <StatusBadge status={comp.status} />
                    </div>

                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.65rem' }}>
                      {comp.title}
                    </h2>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                      {comp.description}
                    </p>

                    {/* Metadata Pill Box */}
                    <div
                      style={{
                        padding: '1rem',
                        borderRadius: 'var(--radius-md)',
                        background: 'rgba(0, 0, 0, 0.25)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                        fontSize: '0.825rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffffff' }}>
                        <Calendar size={14} color="var(--astra-accent)" />
                        <span>
                          {new Date(comp.startsAt).toLocaleDateString(undefined, {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                        <MapPin size={14} color="var(--text-muted)" />
                        <span>{t('venueLabel')}: {comp.venue}</span>
                      </div>
                    </div>

                    {/* Winner Ribbon if Completed */}
                    {isCompleted && topWinner && (
                      <div
                        style={{
                          marginTop: '1rem',
                          padding: '0.75rem 1rem',
                          borderRadius: 'var(--radius-md)',
                          background: 'rgba(245, 158, 11, 0.08)',
                          border: '1px solid rgba(245, 158, 11, 0.25)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Trophy size={16} color="var(--gold)" />
                          <span style={{ fontSize: '0.825rem', fontWeight: 700, color: '#fde68a' }}>
                            {topWinner.house?.name} {lang === 'uz' ? 'G‘olibi' : 'Champion'}
                          </span>
                        </div>
                        <span className="font-stats" style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--gold)' }}>
                          +{topWinner.pointsAwarded} PTS
                        </span>
                      </div>
                    )}
                  </div>

                  <Link
                    href={`/competitions/${comp.slug}`}
                    className="btn btn-secondary"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <span>{lang === 'uz' ? 'Qoidalar va Ishtirokchilarni Ko‘rish' : 'View Rules, Roster & Details'}</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title={lang === 'uz' ? 'Musobaqalar topilmadi' : 'No fixtures found'}
            description={lang === 'uz' ? 'Tanlangan filtr bo‘yicha hozircha musobaqalar mavjud emas.' : 'There are currently no competitions matching the selected filter.'}
            actionText={lang === 'uz' ? 'Filtrni tozalash' : 'Clear Filter'}
            actionHref="/competitions"
          />
        )}
      </div>
    </div>
  );
}
