import React from 'react';
import Link from 'next/link';
import { Shield, ArrowRight, Award, Users, Trophy, BookOpen, Compass } from 'lucide-react';
import { calculateHouseScores, getActiveSeason } from '@/lib/points';
import prisma from '@/lib/prisma';
import { getServerI18n } from '@/lib/i18n';
import HouseBadge from '@/components/HouseBadge';

export const revalidate = 0;

export default async function HousesPage() {
  const { lang, t } = await getServerI18n();
  const season = await getActiveSeason();
  const houses = await calculateHouseScores({ seasonId: season?.id });

  const studentCounts = await prisma.student.groupBy({
    by: ['houseId'],
    where: { status: 'ACTIVE' },
    _count: { id: true },
  });
  const countMap: Record<string, number> = {};
  studentCounts.forEach((c) => {
    countMap[c.houseId] = c._count.id;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem', padding: '3rem 0 5rem 0' }}>
      <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
        {/* Page Header */}
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--astra-accent)',
              display: 'block',
              marginBottom: '0.5rem',
            }}
          >
            {lang === 'uz' ? 'Guruhlar Bellashuvi' : 'House Chapters'}
          </span>
          <h1 className="heading-1">{lang === 'uz' ? 'House Guruhlari Chempionati' : 'House Championships'}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '0.5rem', lineHeight: 1.65 }}>
            {lang === 'uz'
              ? 'Angren ixtisoslashtirilgan maktabi o‘quvchilari Astra va Terra guruhlariga taqsimlangan. Barcha tasdiqlangan fan olimpiadalari, sport bellashuvlari va jamoat ishlari o‘z guruhi hisobiga ball keltiradi.'
              : 'Every student at Angren Specialized School is inducted into Astra or Terra. All verified academic decathlons, athletics matches, and civic contributions award points to their house banner.'}
          </p>
        </div>

        {/* The Two House Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          {houses.map((house) => {
            const isAstra = house.slug === 'astra';
            const memberCount = countMap[house.id] || 12;

            return (
              <div
                key={house.id}
                className="arena-card"
                style={{
                  padding: '2.5rem',
                  border: isAstra ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid rgba(16, 185, 129, 0.4)',
                  background: isAstra
                    ? 'linear-gradient(180deg, rgba(30, 27, 75, 0.5) 0%, var(--bg-surface) 100%)'
                    : 'linear-gradient(180deg, rgba(6, 78, 59, 0.5) 0%, var(--bg-surface) 100%)',
                  boxShadow: isAstra ? 'var(--shadow-astra)' : 'var(--shadow-terra)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '2rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div
                        style={{
                          width: '54px',
                          height: '54px',
                          borderRadius: 'var(--radius-md)',
                          background: isAstra ? 'var(--astra-gradient)' : 'var(--terra-gradient)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: isAstra ? 'var(--shadow-astra)' : 'var(--shadow-terra)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          flexShrink: 0,
                        }}
                      >
                        <Shield size={28} color="#ffffff" />
                      </div>
                      <div>
                        <h2 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#ffffff' }}>{house.name}</h2>
                        <span style={{ fontSize: '0.85rem', color: isAstra ? '#a5b4fc' : '#6ee7b7', fontWeight: 600 }}>
                          {isAstra
                            ? (lang === 'uz' ? 'Lochin • "Yuksak maqsadlar sari"' : 'The Falcon • "Aim Beyond"')
                            : (lang === 'uz' ? 'Bo‘ri • "Birlashgan kuchmiz"' : 'The Wolf • "Stronger Together"')}
                        </span>
                      </div>
                    </div>

                    <span
                      className="badge"
                      style={{
                        background: house.rank === 1 ? 'var(--gold-bg)' : 'rgba(255, 255, 255, 0.08)',
                        color: house.rank === 1 ? '#fde68a' : 'var(--text-secondary)',
                        border: house.rank === 1 ? '1px solid var(--gold-border)' : '1px solid var(--border-subtle)',
                        fontSize: '0.75rem',
                      }}
                    >
                      {house.rank === 1
                        ? (lang === 'uz' ? '1-O‘rin • Yetakchi' : 'Rank #1 • Leader')
                        : (lang === 'uz' ? '2-O‘rin • Ta’qibchi' : 'Rank #2 • Challenger')}
                    </span>
                  </div>

                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65, fontSize: '0.925rem', marginBottom: '1.75rem' }}>
                    {isAstra ? t('houseAstraDesc') : t('houseTerraDesc')}
                  </p>

                  {/* Score & Member stats */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '1rem',
                      textAlign: 'center',
                      padding: '1.25rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(0, 0, 0, 0.3)',
                      border: '1px solid var(--border-subtle)',
                      marginBottom: '1.75rem',
                    }}
                  >
                    <div>
                      <div className="font-stats" style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ffffff' }}>
                        {house.totalPoints.toLocaleString()}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                        {t('points')}
                      </div>
                    </div>

                    <div>
                      <div className="font-stats" style={{ fontSize: '1.5rem', fontWeight: 900, color: isAstra ? '#a5b4fc' : '#6ee7b7' }}>
                        {memberCount}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                        {lang === 'uz' ? 'Faol A’zolar' : 'Active Members'}
                      </div>
                    </div>

                    <div>
                      <div className="font-stats" style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--gold)' }}>
                        +{house.monthlyPoints}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                        {t('thisMonth')}
                      </div>
                    </div>
                  </div>

                  {/* Category Strengths Bar */}
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                      {lang === 'uz' ? 'Asosiy Yo‘nalishlar' : 'Key Disciplines'}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {house.categories.slice(0, 3).map((cat) => (
                        <div key={cat.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>{cat.name}</span>
                          <strong className="font-stats" style={{ color: '#ffffff' }}>{cat.points} PTS</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <Link
                  href={`/houses/${house.slug}`}
                  className={`btn ${isAstra ? 'btn-astra' : 'btn-terra'}`}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <span>
                    {lang === 'uz'
                      ? `${house.shortName} House Haqida Batafsil`
                      : `View Full ${house.shortName} Dossier & Roster`}
                  </span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
