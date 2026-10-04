'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Trophy,
  Shield,
  Filter,
  Calendar,
  Clock,
  Award,
  Users,
  Search,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Medal,
  ChevronRight,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import HouseBadge from '@/components/HouseBadge';
import StatusBadge from '@/components/StatusBadge';
import SectionHeader from '@/components/SectionHeader';
import EmptyState from '@/components/EmptyState';

interface HouseScore {
  id: string;
  name: string;
  slug: string;
  shortName: string;
  symbol: string;
  motto?: string;
  primaryColor: string;
  secondaryColor: string;
  totalPoints: number;
  rank: number;
  monthlyPoints: number;
  weeklyPoints: number;
  totalTransactions: number;
  categories: {
    id: string;
    name: string;
    slug: string;
    color: string;
    icon: string;
    points: number;
  }[];
}

interface Contributor {
  id: string;
  name: string;
  grade: number;
  className: string;
  houseName: string;
  houseSlug: string;
  totalPoints: number;
  topCategory: string;
}

interface TransactionItem {
  id: string;
  code: string;
  points: number;
  reason: string;
  earnedAt: string;
  houseName: string;
  houseSlug: string;
  categoryName: string;
  studentName?: string;
}

export default function LeaderboardPage() {
  const { lang, t } = useLanguage();
  const [houses, setHouses] = useState<HouseScore[]>([]);
  const [topContributors, setTopContributors] = useState<Contributor[]>([]);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<'all' | 'month' | 'week'>('all');
  const [selectedHouseFilter, setSelectedHouseFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/leaderboard?time=${timeFilter}`);
        if (res.ok) {
          const json = await res.json();
          setHouses(json.houses || []);
          setTopContributors(json.topContributors || []);
          setTransactions(json.recentTransactions || []);
        }
      } catch (err) {
        console.error('Failed to load leaderboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [timeFilter]);

  const astra = houses.find((h) => h.slug === 'astra');
  const terra = houses.find((h) => h.slug === 'terra');

  const filteredTransactions = transactions.filter((tx) => {
    const matchHouse = selectedHouseFilter === 'ALL' || tx.houseSlug === selectedHouseFilter;
    const matchSearch =
      !searchQuery ||
      tx.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tx.studentName && tx.studentName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchHouse && matchSearch;
  });

  return (
    <div style={{ padding: '2.5rem 0 5rem 0' }}>
      <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem' }}>
        {/* Header with Time Window Filter */}
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
                {t('liveChampionshipStandings')}
              </span>
            </div>
            <h1 className="heading-1">{t('tournamentLeaderboard')}</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '600px', marginTop: '0.35rem' }}>
              {lang === 'uz'
                ? 'Tasdiqlangan musobaqa natijalari, fan olimpiadalari, sport bellashuvlari va jamoat ishlari orqali hisoblangan ballar.'
                : 'Scores derived from verified competition outcomes, scholastic decathlons, athletics meets, and community service.'}
            </p>
          </div>

          {/* Time Filter Pills */}
          <div className="filter-tabs">
            <button
              onClick={() => setTimeFilter('all')}
              className={`filter-tab ${timeFilter === 'all' ? 'active' : ''}`}
            >
              {t('allSeason')}
            </button>
            <button
              onClick={() => setTimeFilter('month')}
              className={`filter-tab ${timeFilter === 'month' ? 'active' : ''}`}
            >
              {t('thisMonth')}
            </button>
            <button
              onClick={() => setTimeFilter('week')}
              className={`filter-tab ${timeFilter === 'week' ? 'active' : ''}`}
            >
              {t('thisWeek')}
            </button>
          </div>
        </div>

        {/* 1. Head-to-Head Podium Comparison Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          {houses.map((house) => {
            const isAstra = house.slug === 'astra';
            const isLeader = house.rank === 1;

            return (
              <div
                key={house.id}
                className="arena-card"
                style={{
                  padding: '2.25rem',
                  background: 'linear-gradient(180deg, var(--bg-surface-elevated) 0%, var(--bg-surface) 100%)',
                  border: isLeader
                    ? `2px solid ${isAstra ? 'rgba(99, 102, 241, 0.45)' : 'rgba(16, 185, 129, 0.45)'}`
                    : '1px solid var(--border-medium)',
                  boxShadow: isLeader ? (isAstra ? 'var(--shadow-astra)' : 'var(--shadow-terra)') : 'var(--shadow-sm)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div
                      style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: 'var(--radius-md)',
                        background: isAstra ? 'var(--astra-gradient)' : 'var(--terra-gradient)',
                        border: `1px solid ${isAstra ? 'rgba(129, 140, 248, 0.4)' : 'rgba(52, 211, 153, 0.4)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: isAstra ? 'var(--shadow-astra)' : 'var(--shadow-terra)',
                        flexShrink: 0,
                      }}
                    >
                      <Shield size={26} color="#ffffff" />
                    </div>
                    <div>
                      <h2 style={{ fontSize: '1.65rem', fontWeight: 900, color: '#ffffff' }}>{house.name}</h2>
                      <div style={{ fontSize: '0.825rem', color: isAstra ? '#a5b4fc' : '#6ee7b7', fontWeight: 600 }}>
                        {isAstra
                          ? (lang === 'uz' ? 'Lochin • "Yuksak maqsadlar sari"' : 'The Falcon • "Aim Beyond"')
                          : (lang === 'uz' ? 'Bo‘ri • "Birlashgan kuchmiz"' : 'The Wolf • "Stronger Together"')}
                      </div>
                    </div>
                  </div>

                  <span
                    className="badge"
                    style={{
                      background: isLeader ? 'var(--gold-bg)' : 'rgba(255, 255, 255, 0.08)',
                      color: isLeader ? '#fde68a' : 'var(--text-secondary)',
                      border: isLeader ? '1px solid var(--gold-border)' : '1px solid var(--border-subtle)',
                      fontSize: '0.75rem',
                    }}
                  >
                    {isLeader
                      ? (lang === 'uz' ? '1-O‘rin • Yetakchi' : 'Rank #1 • Leader')
                      : (lang === 'uz' ? '2-O‘rin • Ta’qibchi' : 'Rank #2 • Challenger')}
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '0.75rem',
                    padding: '1.25rem 0',
                    borderTop: '1px solid var(--border-subtle)',
                    borderBottom: '1px solid var(--border-subtle)',
                    marginBottom: '1.5rem',
                  }}
                >
                  <span
                    className="font-stats"
                    style={{
                      fontSize: 'clamp(2.5rem, 5vw, 3.75rem)',
                      fontWeight: 900,
                      color: '#ffffff',
                      lineHeight: 1,
                    }}
                  >
                    {house.totalPoints.toLocaleString()}
                  </span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    {t('points')}
                  </span>
                </div>

                {/* Sub-Metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', textAlign: 'center', marginBottom: '1.5rem' }}>
                  <div className="panel-elevated" style={{ padding: '0.75rem 0.5rem' }}>
                    <div className="font-stats" style={{ fontSize: '1.15rem', color: '#ffffff', fontWeight: 800 }}>
                      +{house.monthlyPoints}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                      {t('thisMonth')}
                    </div>
                  </div>
                  <div className="panel-elevated" style={{ padding: '0.75rem 0.5rem' }}>
                    <div className="font-stats" style={{ fontSize: '1.15rem', color: '#ffffff', fontWeight: 800 }}>
                      +{house.weeklyPoints}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                      {t('thisWeek')}
                    </div>
                  </div>
                  <div className="panel-elevated" style={{ padding: '0.75rem 0.5rem' }}>
                    <div className="font-stats" style={{ fontSize: '1.15rem', color: 'var(--astra-accent)', fontWeight: 800 }}>
                      {house.totalTransactions}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                      {lang === 'uz' ? 'Yozuvlar' : 'Awards'}
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
                      ? `${house.shortName} House Bo‘limini Ko‘rish`
                      : `Explore ${house.shortName} House Chapter`}
                  </span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            );
          })}
        </div>

        {/* 2. Category Performance Comparison Matrix */}
        <section>
          <SectionHeader
            tag={lang === 'uz' ? 'Yo‘nalishlar Bo‘yicha' : 'Discipline Breakdown'}
            title={lang === 'uz' ? 'Kategoriyalar Bo‘yicha Ballar' : 'Category Dominance Matrix'}
            description={lang === 'uz' ? 'Har bir rasmiy yo‘nalish bo‘yicha to‘plangan ballar taqqoslanishi' : 'Comparison of cumulative points accumulated across each official competition pillar'}
          />

          <div
            className="arena-card"
            style={{
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
            }}
          >
            {astra?.categories.map((cat) => {
              const terraCat = terra?.categories.find((c) => c.slug === cat.slug);
              const astraPts = cat.points;
              const terraPts = terraCat?.points || 0;
              const catTotal = astraPts + terraPts;
              const astraPct = catTotal > 0 ? (astraPts / catTotal) * 100 : 50;

              return (
                <div key={cat.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: cat.color }} />
                      <strong style={{ fontSize: '0.95rem', color: '#ffffff' }}>{cat.name}</strong>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.85rem' }}>
                      <div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginRight: '0.35rem' }}>Astra:</span>
                        <strong className="font-stats" style={{ color: '#c7d2fe' }}>{astraPts} PTS</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginRight: '0.35rem' }}>Terra:</span>
                        <strong className="font-stats" style={{ color: '#a7f3d0' }}>{terraPts} PTS</strong>
                      </div>
                    </div>
                  </div>

                  {/* Dual Bar Track */}
                  <div className="category-bar-track" style={{ height: '8px' }}>
                    <div
                      style={{
                        display: 'flex',
                        height: '100%',
                        borderRadius: 'var(--radius-full)',
                        overflow: 'hidden',
                      }}
                    >
                      <div style={{ width: `${astraPct}%`, background: 'var(--astra-primary)' }} />
                      <div style={{ width: `${100 - astraPct}%`, background: 'var(--terra-primary)' }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 3. Top Student MVP Contributors */}
        <section>
          <SectionHeader
            tag={lang === 'uz' ? 'Faxriy Ro‘yxat' : 'Honor Roll'}
            title={t('mvpStandings')}
            description={lang === 'uz' ? 'O‘z guruhiga eng ko‘p tasdiqlangan ball keltirgan eng faol o‘quvchilar' : 'Students with the highest verified point contributions to their respective house balances'}
            actionText={t('students')}
            actionHref="/students"
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {topContributors.slice(0, 6).map((c, index) => {
              const isAstra = c.houseSlug === 'astra';
              return (
                <Link
                  key={c.id}
                  href={`/students/${c.id}`}
                  className="arena-card arena-card-interactive"
                  style={{
                    padding: '1.5rem',
                    borderLeft: `3px solid ${isAstra ? 'var(--astra-primary)' : 'var(--terra-primary)'}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        color: index === 0 ? 'var(--gold)' : 'var(--text-muted)',
                        textTransform: 'uppercase',
                      }}
                    >
                      MVP #{index + 1}
                    </span>
                    <HouseBadge name={c.houseName} slug={c.houseSlug} size="sm" />
                  </div>

                  <h3 style={{ fontSize: '1.15rem', color: '#ffffff', marginBottom: '0.25rem' }}>
                    {c.name}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    {t('grade')} {c.grade} &bull; {c.className} &bull; {c.topCategory}
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
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {lang === 'uz' ? 'Tasdiqlangan Ballar' : 'Verified Points'}
                    </span>
                    <span className="font-stats" style={{ fontSize: '1.15rem', fontWeight: 800, color: isAstra ? '#a5b4fc' : '#6ee7b7' }}>
                      {c.totalPoints.toLocaleString()} PTS
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* 4. Searchable Score Transaction Ledger */}
        <section>
          <SectionHeader
            tag={lang === 'uz' ? 'Ochiq Jurnal' : 'Public Ledger'}
            title={t('recentPointAwards')}
            description={lang === 'uz' ? 'Barcha tasdiqlangan house ballarining shaffof va ochiq audit jurnali' : 'Transparent, immutable audit history of all awarded house points'}
          />

          <div className="arena-card" style={{ padding: '1.5rem' }}>
            {/* Filter and Search Bar */}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setSelectedHouseFilter('ALL')}
                  className={`btn btn-sm ${selectedHouseFilter === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
                >
                  {t('allHouses')}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedHouseFilter('astra')}
                  className={`btn btn-sm ${selectedHouseFilter === 'astra' ? 'btn-astra' : 'btn-secondary'}`}
                >
                  Astra
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedHouseFilter('terra')}
                  className={`btn btn-sm ${selectedHouseFilter === 'terra' ? 'btn-terra' : 'btn-secondary'}`}
                >
                  Terra
                </button>
              </div>

              <div style={{ position: 'relative', width: '100%', maxWidth: '280px' }}>
                <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '2.5rem', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            {/* Table */}
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{lang === 'uz' ? 'Kod' : 'Code'}</th>
                    <th>{t('house')}</th>
                    <th>{t('points')}</th>
                    <th>{t('category')}</th>
                    <th>{t('reason')}</th>
                    <th>{lang === 'uz' ? 'Berildi' : 'Awarded To'}</th>
                    <th>{t('date')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((tx) => (
                      <tr key={tx.id}>
                        <td>
                          <span className="font-stats" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {tx.code}
                          </span>
                        </td>
                        <td>
                          <HouseBadge name={tx.houseName} slug={tx.houseSlug} size="sm" />
                        </td>
                        <td>
                          <strong
                            className="font-stats"
                            style={{
                              color: tx.points >= 0 ? (tx.houseSlug === 'astra' ? '#818cf8' : '#34d399') : '#f87171',
                              fontSize: '0.925rem',
                            }}
                          >
                            {tx.points >= 0 ? `+${tx.points}` : tx.points}
                          </strong>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            {tx.categoryName}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            {tx.reason}
                          </span>
                        </td>
                        <td>
                          <span style={{ color: 'var(--text-secondary)' }}>
                            {tx.studentName || (lang === 'uz' ? 'Jamoa / Guruh' : 'Team / House Event')}
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
                      <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        {lang === 'uz' ? 'Qidiruv bo‘yicha ball yozuvlari topilmadi.' : 'No transactions found matching your search.'}
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
