import React from 'react';
import Link from 'next/link';
import {
  Trophy,
  Shield,
  ArrowRight,
  TrendingUp,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  Users,
  Compass,
  Medal,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import prisma from '@/lib/prisma';
import { calculateHouseScores, getActiveSeason } from '@/lib/points';
import { getServerI18n } from '@/lib/i18n';
import HouseBadge from '@/components/HouseBadge';
import StatusBadge from '@/components/StatusBadge';
import SectionHeader from '@/components/SectionHeader';
import EmptyState from '@/components/EmptyState';

export const revalidate = 0; // Dynamic server-rendered for real-time scores

export default async function HomePage() {
  const { lang, t } = await getServerI18n();
  let season = null;
  let houses: any[] = [];
  let recentActivities: any[] = [];
  let upcomingCompetition: any = null;
  let latestCompletedCompetition: any = null;
  let announcements: any[] = [];
  let totalStudents = 0;
  let totalCompetitionsCount = 0;
  let totalApprovedTxCount = 0;
  let dbError: string | null = null;

  try {
    season = await getActiveSeason();
    houses = await calculateHouseScores({ seasonId: season?.id });

    // 1. Live approved point transactions
    recentActivities = await prisma.pointTransaction.findMany({
      where: {
        status: { in: ['APPROVED', 'REVERSED'] },
        ...(season ? { seasonId: season.id } : {}),
      },
      include: {
        house: true,
        category: true,
        student: true,
        competition: true,
      },
      orderBy: { earnedAt: 'desc' },
      take: 6,
    });

    // 2. Upcoming featured competition
    upcomingCompetition = await prisma.competition.findFirst({
      where: {
        status: { in: ['REGISTRATION_OPEN', 'ONGOING', 'REGISTRATION_CLOSED'] },
        startsAt: { gte: new Date() },
      },
      include: { category: true, participants: true },
      orderBy: { startsAt: 'asc' },
    });

    // 3. Latest completed competition with results podium
    latestCompletedCompetition = await prisma.competition.findFirst({
      where: { status: 'COMPLETED' },
      include: {
        category: true,
        results: {
          include: { house: true, student: true, team: true },
          orderBy: { rank: 'asc' },
          take: 3,
        },
      },
      orderBy: { endsAt: 'desc' },
    });

    // 4. Official announcements
    announcements = await prisma.announcement.findMany({
      where: { status: 'PUBLISHED' },
      include: { house: true },
      orderBy: [{ isPinned: 'desc' }, { publishedAt: 'desc' }],
      take: 3,
    });

    // 5. Tournament metrics
    const [studCount, compCount, txCount] = await Promise.all([
      prisma.student.count({ where: { status: 'ACTIVE' } }),
      prisma.competition.count(),
      prisma.pointTransaction.count({ where: { status: 'APPROVED' } }),
    ]);
    totalStudents = studCount;
    totalCompetitionsCount = compCount;
    totalApprovedTxCount = txCount;
  } catch (err: unknown) {
    console.error('Database connection error in HomePage:', err);
    dbError = 'Database environment variables missing or unreachable';
    houses = [
      { id: 'h-astra', slug: 'astra', name: 'Astra House', shortName: 'Astra', totalPoints: 0, studentCount: 0, primaryColor: '#0047ba', categories: [] },
      { id: 'h-terra', slug: 'terra', name: 'Terra House', shortName: 'Terra', totalPoints: 0, studentCount: 0, primaryColor: '#059669', categories: [] },
    ];
  }

  const astra = houses.find((h) => h.slug === 'astra') || houses[0];
  const terra = houses.find((h) => h.slug === 'terra') || houses[1];

  const astraPoints = astra?.totalPoints || 0;
  const terraPoints = terra?.totalPoints || 0;
  const totalPointsBoth = astraPoints + terraPoints;
  const astraPercent = totalPointsBoth > 0 ? (astraPoints / totalPointsBoth) * 100 : 50;
  const terraPercent = 100 - astraPercent;

  const scoreDiff = Math.abs(astraPoints - terraPoints);
  const isAstraLeading = astraPoints >= terraPoints;
  const leadingHouse = isAstraLeading ? astra : terra;
  const trailingHouse = isAstraLeading ? terra : astra;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem', paddingBottom: '4rem' }}>
      {dbError && (
        <div className="container" style={{ paddingTop: '1.5rem' }}>
          <div
            style={{
              padding: '1.25rem 1.5rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              <AlertCircle size={20} />
              <span>Database Setup Required on Vercel</span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.6, margin: 0 }}>
              The application is deployed on Vercel, but <strong>DATABASE_URL</strong> is not configured yet in the Vercel Dashboard. Go to <strong>Vercel &gt; Settings &gt; Environment Variables</strong>, add <code>DATABASE_URL</code> and <code>DIRECT_URL</code> from your Supabase project, then click Redeploy.
            </p>
          </div>
        </div>
      )}
      {/* ============================================================ */}
      {/* 1. HERO BATTLE ARENA: ASTRA VS TERRA SHOWDOWN               */}
      {/* ============================================================ */}
      <section style={{ paddingTop: '2.5rem' }}>
        <div className="container">
          {/* League Season Header Capsule */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: '#ffffff',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0, 71, 186, 0.3)',
                  border: '1.5px solid var(--school-blue-light)',
                  flexShrink: 0,
                }}
              >
                <img
                  src="/logo.png"
                  alt="Angren Ixtisoslashtirilgan Maktabi Logo"
                  style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%' }}
                />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="live-indicator" />
                  <span
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      color: '#ffffff',
                    }}
                  >
                    {lang === 'uz' ? 'ANGREN IXTISOSLASHTIRILGAN MAKTABI' : 'ANGREN SPECIALIZED SCHOOL'}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--school-blue-accent)', fontWeight: 600 }}>
                  {season?.name || '2026–2027'} {t('officialSeason')}
                </div>
              </div>
            </div>
            <Link
              href="/leaderboard"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.825rem',
                fontWeight: 600,
                color: 'var(--astra-accent)',
              }}
            >
              <span>{t('fullAnalyticsBtn')}</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Main Rivalry Arena Duel Board */}
          <div className="duel-banner">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto 1fr',
                alignItems: 'center',
                gap: '2rem',
                marginBottom: '2rem',
              }}
              className="duel-grid"
            >
              {/* Astra House Corner */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--astra-gradient)',
                      border: '1px solid rgba(129, 140, 248, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: 'var(--shadow-astra)',
                      flexShrink: 0,
                    }}
                  >
                    <Shield size={26} color="#ffffff" />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em' }}>
                        {astra?.name || 'Astra House'}
                      </h2>
                      {isAstraLeading && (
                        <span className="badge badge-gold" style={{ fontSize: '0.65rem' }}>
                          {t('leaderBadge')}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.825rem', color: '#a5b4fc', fontWeight: 600 }}>
                      {lang === 'uz' ? 'Lochin • "Yuksak maqsadlar sari"' : 'The Falcon • "Aim Beyond"'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <div
                    className="font-stats"
                    style={{
                      fontSize: 'clamp(2.5rem, 5vw, 4.25rem)',
                      fontWeight: 900,
                      color: '#ffffff',
                      lineHeight: 1,
                    }}
                  >
                    {astraPoints.toLocaleString()}
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    {t('points')}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <span>{t('thisMonth')}: <strong style={{ color: '#ffffff' }}>+{astra?.monthlyPoints || 0}</strong></span>
                  <span>&bull;</span>
                  <span>{t('thisWeek')}: <strong style={{ color: '#ffffff' }}>+{astra?.weeklyPoints || 0}</strong></span>
                </div>
              </div>

              {/* Center Battle Core */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '1rem 1.5rem',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--bg-canvas)',
                  border: '1px solid var(--border-medium)',
                  textAlign: 'center',
                  minWidth: '180px',
                }}
              >
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 900,
                    letterSpacing: '0.12em',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                  }}
                >
                  {t('rivalryDuel')}
                </span>

                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.4rem 0.85rem',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--gold-bg)',
                    border: '1px solid var(--gold-border)',
                    color: '#fef08a',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                  }}
                >
                  <Trophy size={14} color="var(--gold)" />
                  <span>+{scoreDiff} {t('ptsLead')}</span>
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {leadingHouse?.name} {leadingHouse?.totalPoints === trailingHouse?.totalPoints ? t('tiedText') : t('leadsOver')} {trailingHouse?.name}
                </div>
              </div>

              {/* Terra House Corner */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  gap: '0.75rem',
                  textAlign: 'right',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexDirection: 'row-reverse' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--terra-gradient)',
                      border: '1px solid rgba(52, 211, 153, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: 'var(--shadow-terra)',
                      flexShrink: 0,
                    }}
                  >
                    <Shield size={26} color="#ffffff" />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      {!isAstraLeading && (
                        <span className="badge badge-gold" style={{ fontSize: '0.65rem' }}>
                          {t('leaderBadge')}
                        </span>
                      )}
                      <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em' }}>
                        {terra?.name || 'Terra House'}
                      </h2>
                    </div>
                    <div style={{ fontSize: '0.825rem', color: '#6ee7b7', fontWeight: 600 }}>
                      {lang === 'uz' ? 'Bo‘ri • "Birlashgan kuchmiz"' : 'The Wolf • "Stronger Together"'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    {t('points')}
                  </span>
                  <div
                    className="font-stats"
                    style={{
                      fontSize: 'clamp(2.5rem, 5vw, 4.25rem)',
                      fontWeight: 900,
                      color: '#ffffff',
                      lineHeight: 1,
                    }}
                  >
                    {terraPoints.toLocaleString()}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <span>{t('thisMonth')}: <strong style={{ color: '#ffffff' }}>+{terra?.monthlyPoints || 0}</strong></span>
                  <span>&bull;</span>
                  <span>{t('thisWeek')}: <strong style={{ color: '#ffffff' }}>+{terra?.weeklyPoints || 0}</strong></span>
                </div>
              </div>
            </div>

            {/* Duel Ratio Progress Bar */}
            <div style={{ marginTop: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                <span style={{ color: '#c7d2fe' }}>ASTRA {astraPercent.toFixed(1)}%</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>
                  {totalPointsBoth.toLocaleString()} {t('totalCumulativePoints')}
                </span>
                <span style={{ color: '#a7f3d0' }}>TERRA {terraPercent.toFixed(1)}%</span>
              </div>
              <div className="duel-meter-track">
                <div className="duel-meter-astra" style={{ width: `${astraPercent}%` }} />
                <div className="duel-meter-terra" style={{ width: `${terraPercent}%` }} />
              </div>
            </div>

            {/* Quick Navigation to House Pages */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '1.5rem',
                marginTop: '1.5rem',
                borderTop: '1px solid var(--border-subtle)',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <Link href="/houses/astra" className="btn btn-secondary btn-sm" style={{ borderLeft: '3px solid var(--astra-primary)' }}>
                <span>{t('enterAstraChapter')}</span>
                <ArrowRight size={14} />
              </Link>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {t('scoresCalculatedNote')}
              </div>
              <Link href="/houses/terra" className="btn btn-secondary btn-sm" style={{ borderRight: '3px solid var(--terra-primary)' }}>
                <span>{t('enterTerraChapter')}</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. RECENT SCORE ACTIVITY & FEATURED UPCOMING COMPETITION     */}
      {/* ============================================================ */}
      <section>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: '2rem' }} className="grid-split">
            {/* Live Point Activity Feed */}
            <div>
              <SectionHeader
                tag={t('realtimeLedger')}
                title={t('recentPointAwards')}
                description={t('recentAwardsDesc')}
                actionText={t('viewLedger')}
                actionHref="/leaderboard"
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {recentActivities.length > 0 ? (
                  recentActivities.map((tx) => {
                    const isAstra = tx.house.slug === 'astra';
                    const isPositive = tx.points >= 0;
                    return (
                      <div
                        key={tx.id}
                        className="arena-card"
                        style={{
                          padding: '1rem 1.25rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '1rem',
                          borderLeft: `3px solid ${isAstra ? 'var(--astra-primary)' : 'var(--terra-primary)'}`,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 0 }}>
                          <div
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: 'var(--radius-sm)',
                              background: isAstra ? 'var(--astra-bg)' : 'var(--terra-bg)',
                              border: `1px solid ${isAstra ? 'var(--astra-border)' : 'var(--terra-border)'}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: isAstra ? '#a5b4fc' : '#6ee7b7',
                              flexShrink: 0,
                            }}
                          >
                            <Trophy size={18} />
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: isAstra ? '#c7d2fe' : '#a7f3d0' }}>
                                {tx.house.name}
                              </span>
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>&bull;</span>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                {tx.category.name}
                              </span>
                            </div>
                            <div
                              style={{
                                fontSize: '0.925rem',
                                fontWeight: 700,
                                color: 'var(--text-primary)',
                                marginTop: '0.15rem',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {tx.reason}
                            </div>
                            {tx.student && (
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                                {t('earnedBy')} {tx.student.firstName} {tx.student.lastName} ({t('grade')} {tx.student.grade})
                              </div>
                            )}
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 }}>
                          <span
                            className="font-stats"
                            style={{
                              fontSize: '1.15rem',
                              fontWeight: 800,
                              color: isPositive ? (isAstra ? '#818cf8' : '#34d399') : '#f87171',
                            }}
                          >
                            {isPositive ? `+${tx.points}` : tx.points} PTS
                          </span>
                          <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                            {new Date(tx.earnedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <EmptyState title={t('noTransactionsYet')} description={t('noTransactionsDesc')} />
                )}
              </div>
            </div>

            {/* Upcoming Feature Clash Card */}
            <div>
              <SectionHeader
                tag={t('nextTournament')}
                title={t('upcomingMatch')}
                description={t('upcomingMatchSub')}
                actionText={t('allFixtures')}
                actionHref="/competitions"
              />

              {upcomingCompetition ? (
                <div
                  className="arena-card"
                  style={{
                    padding: '1.75rem',
                    background: 'linear-gradient(180deg, var(--bg-surface-elevated) 0%, var(--bg-surface) 100%)',
                    border: '1px solid var(--border-medium)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.25rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                    <StatusBadge status={upcomingCompetition.status} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                      {upcomingCompetition.category.name}
                    </span>
                  </div>

                  <div>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
                      {upcomingCompetition.title}
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      {upcomingCompetition.description}
                    </p>
                  </div>

                  {/* Date & Venue Box */}
                  <div
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(0, 0, 0, 0.25)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                      fontSize: '0.85rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffffff' }}>
                      <Calendar size={15} color="var(--astra-accent)" />
                      <span>
                        {new Date(upcomingCompetition.startsAt).toLocaleDateString(undefined, {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                      <MapPin size={15} color="var(--text-muted)" />
                      <span>{t('venueLabel')}: {upcomingCompetition.venue}</span>
                    </div>
                  </div>

                  <Link
                    href={`/competitions/${upcomingCompetition.slug}`}
                    className="btn btn-primary"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <span>{t('viewRulesAndParticipants')}</span>
                    <ArrowRight size={15} />
                  </Link>
                </div>
              ) : (
                <EmptyState
                  title={t('noUpcomingMatches')}
                  description={t('noUpcomingDesc')}
                  actionText={t('viewPastTournaments')}
                  actionHref="/competitions"
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. LATEST COMPLETED TOURNAMENT RESULTS PODIUM                */}
      {/* ============================================================ */}
      {latestCompletedCompetition && latestCompletedCompetition.results.length > 0 && (
        <section>
          <div className="container">
            <SectionHeader
              tag={t('officialMatchResults')}
              title={latestCompletedCompetition.title}
              description={`${t('concludedOn')} ${new Date(latestCompletedCompetition.endsAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}`}
              actionText={t('allResults')}
              actionHref="/competitions"
            />

            <div
              className="arena-card"
              style={{
                padding: '2rem',
                background: 'linear-gradient(180deg, var(--bg-surface-elevated) 0%, var(--bg-surface) 100%)',
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '1.25rem',
                }}
              >
                {latestCompletedCompetition.results.map((result: any) => {
                  const rankIconsMap: Record<number, { icon: any; color: string; label: string }> = {
                    1: { icon: Trophy, color: 'var(--gold)', label: t('firstPlace') },
                    2: { icon: Medal, color: 'var(--silver)', label: t('secondPlace') },
                    3: { icon: Medal, color: 'var(--bronze)', label: t('thirdPlace') },
                  };
                  const rankIcons = rankIconsMap[result.rank] || { icon: Award, color: 'var(--text-muted)', label: `Rank #${result.rank}` };
                  const RankIcon = rankIcons.icon;

                  return (
                    <div
                      key={result.id}
                      style={{
                        padding: '1.5rem',
                        borderRadius: 'var(--radius-lg)',
                        background: result.rank === 1 ? 'rgba(245, 158, 11, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                        border: result.rank === 1 ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid var(--border-subtle)',
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
                              textTransform: 'uppercase',
                              color: rankIcons.color,
                            }}
                          >
                            <RankIcon size={16} />
                            <span>{rankIcons.label}</span>
                          </span>
                          {result.house && <HouseBadge name={result.house.name} slug={result.house.slug} size="sm" />}
                        </div>

                        <h4 style={{ fontSize: '1.15rem', color: '#ffffff', marginBottom: '0.25rem' }}>
                          {result.team?.name || (result.student ? `${result.student.firstName} ${result.student.lastName}` : result.house?.name)}
                        </h4>
                        {result.notes && (
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            {result.notes}
                          </p>
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
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('houseContribution')}</span>
                        <span className="font-stats" style={{ fontSize: '1.1rem', fontWeight: 800, color: rankIcons.color }}>
                          +{result.pointsAwarded} PTS
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/* 4. HOUSE CATEGORY RADAR COMPARISON                          */}
      {/* ============================================================ */}
      <section>
        <div className="container">
          <SectionHeader
            tag={t('strategicBreakdown')}
            title={t('categoryMastery')}
            description={t('categoryMasterySub')}
            actionText={t('detailedAnalytics')}
            actionHref="/leaderboard"
          />

          <div
            className="arena-card"
            style={{
              padding: '2rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '2rem',
            }}
          >
            {(astra?.categories || []).map((cat: any) => {
              const terraCat = (terra?.categories || []).find((c: any) => c.slug === cat.slug);
              const astraCatPts = cat.points;
              const terraCatPts = terraCat?.points || 0;
              const catTotal = astraCatPts + terraCatPts;
              const astraCatPct = catTotal > 0 ? (astraCatPts / catTotal) * 100 : 50;

              return (
                <div key={cat.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: cat.color }} />
                      <strong style={{ fontSize: '0.9rem', color: '#ffffff' }}>{cat.name}</strong>
                    </div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                      <span style={{ color: '#a5b4fc' }}>{astraCatPts}</span>
                      <span style={{ color: 'var(--text-muted)', margin: '0 0.35rem' }}>:</span>
                      <span style={{ color: '#6ee7b7' }}>{terraCatPts}</span>
                    </div>
                  </div>

                  {/* Dual Bar Track */}
                  <div className="category-bar-track">
                    <div
                      style={{
                        display: 'flex',
                        height: '100%',
                        borderRadius: 'var(--radius-full)',
                        overflow: 'hidden',
                      }}
                    >
                      <div style={{ width: `${astraCatPct}%`, background: 'var(--astra-primary)' }} />
                      <div style={{ width: `${100 - astraCatPct}%`, background: 'var(--terra-primary)' }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. ANNOUNCEMENTS & OFFICIAL BULLETINS                        */}
      {/* ============================================================ */}
      <section>
        <div className="container">
          <SectionHeader
            tag={t('officialBulletin')}
            title={t('schoolDispatches')}
            description={t('schoolDispatchesSub')}
            actionText={t('viewBulletin')}
            actionHref="/announcements"
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {announcements.map((item) => (
              <div
                key={item.id}
                className="arena-card"
                style={{
                  padding: '1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1.25rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span className="badge badge-neutral">
                      {item.audienceType === 'ALL' ? t('schoolWide') : `${item.house?.name || item.audienceType} ${t('houseSpecific')}`}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(item.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.2rem', color: '#ffffff', marginBottom: '0.5rem', fontWeight: 800 }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {item.content.length > 140 ? `${item.content.slice(0, 140)}...` : item.content}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {t('postedBy')} {item.authorName}
                  </span>
                  <Link href="/announcements" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--astra-accent)' }}>
                    {t('readFullDispatch')}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 6. TOURNAMENT STATS RIBBON                                   */}
      {/* ============================================================ */}
      <section style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '3rem' }}>
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.5rem',
              textAlign: 'center',
            }}
          >
            <div className="panel-elevated" style={{ padding: '1.5rem' }}>
              <div className="font-stats" style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff', marginBottom: '0.25rem' }}>
                {totalPointsBoth.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                {t('contestedPoints')}
              </div>
            </div>

            <div className="panel-elevated" style={{ padding: '1.5rem' }}>
              <div className="font-stats" style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--astra-accent)', marginBottom: '0.25rem' }}>
                {totalStudents}
              </div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                {t('activeCompetitors')}
              </div>
            </div>

            <div className="panel-elevated" style={{ padding: '1.5rem' }}>
              <div className="font-stats" style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--gold)', marginBottom: '0.25rem' }}>
                {totalCompetitionsCount}
              </div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                {t('sanctionedMatches')}
              </div>
            </div>

            <div className="panel-elevated" style={{ padding: '1.5rem' }}>
              <div className="font-stats" style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--terra-primary)', marginBottom: '0.25rem' }}>
                {totalApprovedTxCount}
              </div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                {t('verifiedPointsEvents')}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
