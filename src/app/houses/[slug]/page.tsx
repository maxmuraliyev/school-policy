import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  Shield,
  Trophy,
  Users,
  Award,
  ArrowRight,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
} from 'lucide-react';
import prisma from '@/lib/prisma';
import { calculateHouseScores, getActiveSeason } from '@/lib/points';
import { getServerI18n } from '@/lib/i18n';
import HouseBadge from '@/components/HouseBadge';
import StatusBadge from '@/components/StatusBadge';
import SectionHeader from '@/components/SectionHeader';
import EmptyState from '@/components/EmptyState';

export const revalidate = 0;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function HouseDetailPage({ params }: PageProps) {
  const { lang, t } = await getServerI18n();
  const { slug } = await params;

  const house = await prisma.house.findUnique({
    where: { slug },
  });

  if (!house) {
    notFound();
  }

  const season = await getActiveSeason();
  const allHouses = await calculateHouseScores({ seasonId: season?.id });
  const houseStats = allHouses.find((h) => h.id === house.id);
  const isAstra = house.slug === 'astra';

  // Total student count
  const studentCount = await prisma.student.count({
    where: { houseId: house.id, status: 'ACTIVE' },
  });

  // Recent approved point transactions for this house
  const recentTransactions = await prisma.pointTransaction.findMany({
    where: {
      houseId: house.id,
      status: { in: ['APPROVED', 'REVERSED'] },
      ...(season ? { seasonId: season.id } : {}),
    },
    include: {
      category: true,
      student: true,
      competition: true,
    },
    orderBy: { earnedAt: 'desc' },
    take: 8,
  });

  // Top student contributors for this house
  const studentTxs = await prisma.pointTransaction.findMany({
    where: {
      houseId: house.id,
      status: { in: ['APPROVED', 'REVERSED'] },
      studentId: { not: null },
      ...(season ? { seasonId: season.id } : {}),
    },
    include: { student: true, category: true },
  });

  const studentMap = new Map<
    string,
    {
      student: NonNullable<(typeof studentTxs)[0]['student']>;
      total: number;
      topCategory: string;
      categories: Record<string, number>;
    }
  >();

  studentTxs.forEach((tx) => {
    if (!tx.student) return;
    const cur = studentMap.get(tx.student.id) || {
      student: tx.student,
      total: 0,
      topCategory: 'General',
      categories: {},
    };
    cur.total += tx.points;
    cur.categories[tx.category.name] = (cur.categories[tx.category.name] || 0) + tx.points;
    studentMap.set(tx.student.id, cur);
  });

  const topContributors = Array.from(studentMap.values())
    .map((item) => ({
      id: item.student.id,
      name: `${item.student.firstName} ${item.student.lastName}`,
      code: item.student.studentCode,
      grade: item.student.grade,
      className: item.student.className,
      totalPoints: item.total,
      topCategory: Object.entries(item.categories).sort((a, b) => b[1] - a[1])[0]?.[0] || 'General',
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, 5);

  // House verified achievements
  const achievements = await prisma.achievement.findMany({
    where: {
      student: { houseId: house.id },
      status: 'APPROVED',
    },
    include: { student: true, category: true },
    orderBy: { achievementDate: 'desc' },
    take: 4,
  });

  // House staff / mentors
  const leaders = await prisma.user.findMany({
    where: { houseId: house.id, isActive: true },
    take: 3,
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem', paddingBottom: '5rem' }}>
      {/* 1. Hero Header Banner */}
      <section
        style={{
          background: isAstra
            ? 'linear-gradient(180deg, rgba(30, 27, 75, 0.8) 0%, var(--bg-canvas) 100%)'
            : 'linear-gradient(180deg, rgba(6, 78, 59, 0.8) 0%, var(--bg-canvas) 100%)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '3rem 0',
        }}
      >
        <div className="container">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: '2rem',
            }}
          >
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <div
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: 'var(--radius-lg)',
                  background: isAstra ? 'var(--astra-gradient)' : 'var(--terra-gradient)',
                  border: `2px solid ${isAstra ? 'rgba(129, 140, 248, 0.5)' : 'rgba(52, 211, 153, 0.5)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: isAstra ? 'var(--shadow-astra)' : 'var(--shadow-terra)',
                  flexShrink: 0,
                }}
              >
                <Shield size={38} color="#ffffff" />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                  <h1 className="heading-1" style={{ color: '#ffffff' }}>{house.name}</h1>
                  <span
                    className="badge"
                    style={{
                      background: houseStats?.rank === 1 ? 'var(--gold-bg)' : 'rgba(255, 255, 255, 0.08)',
                      color: houseStats?.rank === 1 ? '#fde68a' : 'var(--text-secondary)',
                      border: houseStats?.rank === 1 ? '1px solid var(--gold-border)' : '1px solid var(--border-subtle)',
                    }}
                  >
                    {houseStats?.rank === 1
                      ? (lang === 'uz' ? '1-O‘rin • Yetakchi' : 'Rank #1 • Leader')
                      : (lang === 'uz' ? '2-O‘rin • Ta’qibchi' : 'Rank #2 • Challenger')}
                  </span>
                </div>
                <div style={{ fontSize: '1rem', color: isAstra ? '#a5b4fc' : '#6ee7b7', fontWeight: 600 }}>
                  {lang === 'uz' ? 'Ramzi:' : 'Mascot:'} <strong>The {house.symbol}</strong> &bull; {lang === 'uz' ? 'Shiori:' : 'Motto:'} <em>&ldquo;{house.motto}&rdquo;</em>
                </div>
              </div>
            </div>

            {/* Score Box */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '2rem',
                background: 'var(--bg-surface-elevated)',
                padding: '1.25rem 2rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-medium)',
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  {lang === 'uz' ? 'Jami Ballar' : 'Cumulative Points'}
                </div>
                <div className="font-stats" style={{ fontSize: '2.5rem', fontWeight: 900, color: '#ffffff' }}>
                  {(houseStats?.totalPoints || 0).toLocaleString()}
                </div>
              </div>
              <div style={{ borderLeft: '1px solid var(--border-subtle)', paddingLeft: '1.5rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  {lang === 'uz' ? 'O‘quvchilar' : 'Active Roster'}
                </div>
                <div className="font-stats" style={{ fontSize: '1.75rem', fontWeight: 900, color: isAstra ? '#a5b4fc' : '#6ee7b7' }}>
                  {studentCount} {lang === 'uz' ? 'O‘quvchi' : 'Students'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Main Body Grid */}
      <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem' }}>
        {/* Leadership & Philosophy */}
        <section style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem' }} className="grid-split">
          <div className="arena-card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '0.75rem', fontWeight: 800 }}>
              {lang === 'uz' ? 'Guruh Nizomi va Shiori' : 'House Charter & Identity'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              {house.description}
            </p>

            {/* Quick Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', textAlign: 'center' }}>
              <div className="panel-elevated" style={{ padding: '1rem 0.5rem' }}>
                <div className="font-stats" style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff' }}>
                  +{houseStats?.monthlyPoints || 0}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  {t('thisMonth')}
                </div>
              </div>
              <div className="panel-elevated" style={{ padding: '1rem 0.5rem' }}>
                <div className="font-stats" style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff' }}>
                  +{houseStats?.weeklyPoints || 0}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  {t('thisWeek')}
                </div>
              </div>
              <div className="panel-elevated" style={{ padding: '1rem 0.5rem' }}>
                <div className="font-stats" style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--astra-accent)' }}>
                  {houseStats?.totalTransactions || 0}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  {lang === 'uz' ? 'Tasdiqlangan Yozuvlar' : 'Approved Awards'}
                </div>
              </div>
            </div>
          </div>

          {/* House Leadership Box */}
          <div className="arena-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.25rem', color: '#ffffff', fontWeight: 800 }}>
              {lang === 'uz' ? 'Guruh Rahbariyati' : 'House Leadership'}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {leaders.length > 0 ? (
                leaders.map((leader) => (
                  <div
                    key={leader.id}
                    className="panel-elevated"
                    style={{
                      padding: '0.85rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.925rem', color: '#ffffff' }}>
                        {leader.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {leader.email}
                      </div>
                    </div>
                    <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>
                      {leader.roleName.replace(/_/g, ' ')}
                    </span>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {lang === 'uz' ? 'Joriy o‘quv mavsumi uchun murabbiylar tayinlanmoqda.' : 'Leadership appointments in progress for this academic term.'}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 3. Category Points Breakdown */}
        <section>
          <SectionHeader
            tag={lang === 'uz' ? 'Ko‘rsatkichlar' : 'Performance Portfolio'}
            title={`${house.name} ${lang === 'uz' ? 'Yo‘nalishlari' : 'Disciplines'}`}
            description={lang === 'uz' ? 'Rasmiy yo‘nalishlar bo‘yicha to‘plangan ballar taqsimoti' : 'Detailed points earned across each official scoring category'}
          />

          <div
            className="arena-card"
            style={{
              padding: '2rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {houseStats?.categories.map((cat) => (
              <div key={cat.id} className="panel-elevated" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: cat.color }} />
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#ffffff' }}>{cat.name}</span>
                  </div>
                  <strong className="font-stats" style={{ color: isAstra ? '#a5b4fc' : '#6ee7b7', fontSize: '1rem' }}>
                    {cat.points} PTS
                  </strong>
                </div>
                <div className="category-bar-track">
                  <div
                    className="category-bar-fill"
                    style={{
                      width: `${Math.min(100, (cat.points / ((houseStats.totalPoints || 1) * 0.35)) * 100)}%`,
                      background: cat.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Top MVP Contributors & Verified Achievements */}
        <section style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '2rem' }} className="grid-split">
          {/* Top Students */}
          <div>
            <SectionHeader
              tag={lang === 'uz' ? 'Faxriy Ro‘yxat' : 'Honor Roll'}
              title={lang === 'uz' ? 'Eng Faol O‘quvchilar' : 'Top Student Contributors'}
              description={lang === 'uz' ? 'Ushbu guruhga eng ko‘p ball keltirgan o‘quvchilar' : 'Highest point earners representing this house'}
              actionText={lang === 'uz' ? 'Barcha O‘quvchilar' : 'View All Roster'}
              actionHref={`/students?house=${house.slug}`}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {topContributors.length > 0 ? (
                topContributors.map((c, idx) => (
                  <Link
                    key={c.id}
                    href={`/students/${c.id}`}
                    className="arena-card arena-card-interactive"
                    style={{
                      padding: '1rem 1.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderLeft: `3px solid ${isAstra ? 'var(--astra-primary)' : 'var(--terra-primary)'}`,
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: idx === 0 ? 'var(--gold)' : 'var(--text-muted)' }}>
                          #{idx + 1}
                        </span>
                        <strong style={{ fontSize: '0.95rem', color: '#ffffff' }}>{c.name}</strong>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                        {t('grade')} {c.grade} &bull; {c.className} &bull; {c.topCategory}
                      </div>
                    </div>

                    <span className="font-stats" style={{ fontSize: '1.1rem', fontWeight: 800, color: isAstra ? '#c7d2fe' : '#a7f3d0' }}>
                      {c.totalPoints.toLocaleString()} PTS
                    </span>
                  </Link>
                ))
              ) : (
                <EmptyState
                  title={lang === 'uz' ? 'Ballar hali mavjud emas' : 'No student points yet'}
                  description={lang === 'uz' ? 'O‘quvchilar ballari bu yerda ko‘rinadi.' : 'Points earned by students will display here.'}
                />
              )}
            </div>
          </div>

          {/* Verified Achievements */}
          <div>
            <SectionHeader
              tag={lang === 'uz' ? 'Yutuqlar' : 'Honors & Citations'}
              title={lang === 'uz' ? 'So‘nggi Yutuqlar' : 'Recent Achievements'}
              description={lang === 'uz' ? 'Tasdiqlangan sertifikat va diplomlar' : 'Official certificates and citations awarded'}
              actionText={t('honors')}
              actionHref="/achievements"
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {achievements.length > 0 ? (
                achievements.map((ach) => (
                  <div
                    key={ach.id}
                    className="arena-card"
                    style={{
                      padding: '1rem 1.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1rem',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                        <span className="badge badge-gold" style={{ fontSize: '0.65rem' }}>
                          {ach.level}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {ach.category.name}
                        </span>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#ffffff' }}>
                        {ach.title}
                      </div>
                      {ach.student && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                          {ach.student.firstName} {ach.student.lastName}
                        </div>
                      )}
                    </div>

                    <span className="font-stats" style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--gold)', flexShrink: 0 }}>
                      +{ach.pointsAwarded || 0} PTS
                    </span>
                  </div>
                ))
              ) : (
                <EmptyState
                  title={lang === 'uz' ? 'Yutuqlar hali mavjud emas' : 'No achievements listed'}
                  description={lang === 'uz' ? 'Tasdiqlangan yutuqlar bu yerda paydo bo‘ladi.' : 'Verified student honors will appear here.'}
                />
              )}
            </div>
          </div>
        </section>

        {/* 5. House Activity Ledger */}
        <section>
          <SectionHeader
            tag={lang === 'uz' ? 'Ballar Jurnali' : 'Activity Trail'}
            title={`${house.name} ${lang === 'uz' ? 'Tasdiqlangan Yozuvlari' : 'Verified Transactions'}`}
            description={lang === 'uz' ? 'Ushbu guruh hisobiga qo‘shilgan ballar xronologiyasi' : 'Chronological ledger of recent points credited to this house'}
          />

          <div className="arena-card" style={{ padding: '1.5rem' }}>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{lang === 'uz' ? 'Kod' : 'Code'}</th>
                    <th>{t('points')}</th>
                    <th>{t('category')}</th>
                    <th>{t('reason')}</th>
                    <th>{lang === 'uz' ? 'O‘quvchi / Jamoa' : 'Student / Team'}</th>
                    <th>{t('date')}</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.length > 0 ? (
                    recentTransactions.map((tx) => (
                      <tr key={tx.id}>
                        <td>
                          <span className="font-stats" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {tx.transactionCode}
                          </span>
                        </td>
                        <td>
                          <strong
                            className="font-stats"
                            style={{
                              color: tx.points >= 0 ? (isAstra ? '#818cf8' : '#34d399') : '#f87171',
                              fontSize: '0.95rem',
                            }}
                          >
                            {tx.points >= 0 ? `+${tx.points}` : tx.points}
                          </strong>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            {tx.category.name}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            {tx.reason}
                          </span>
                        </td>
                        <td>
                          <span style={{ color: 'var(--text-secondary)' }}>
                            {tx.student ? `${tx.student.firstName} ${tx.student.lastName}` : (tx.competition?.title || (lang === 'uz' ? 'Guruh Jamoasi' : 'House Team'))}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {new Date(tx.earnedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        {lang === 'uz' ? `${house.name} uchun hali ball yozuvlari mavjud emas.` : `No transactions recorded for ${house.name} yet.`}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
