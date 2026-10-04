'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Filter,
  Shield,
  Award,
  ArrowRight,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import HouseBadge from '@/components/HouseBadge';
import EmptyState from '@/components/EmptyState';

interface StudentItem {
  id: string;
  studentCode: string;
  firstName: string;
  lastName: string;
  grade: number;
  className: string;
  bio?: string;
  houseName: string;
  houseSlug: string;
  totalPoints: number;
}

export default function StudentsPage() {
  const { lang, t } = useLanguage();
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [houseFilter, setHouseFilter] = useState('ALL');
  const [gradeFilter, setGradeFilter] = useState('ALL');

  useEffect(() => {
    async function loadStudents() {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (searchQuery) queryParams.set('q', searchQuery);
        if (houseFilter !== 'ALL') queryParams.set('house', houseFilter);
        if (gradeFilter !== 'ALL') queryParams.set('grade', gradeFilter);

        const res = await fetch(`/api/students?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setStudents(data.students || []);
        }
      } catch (err) {
        console.error('Failed to load students:', err);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      loadStudents();
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery, houseFilter, gradeFilter]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem', padding: '3rem 0 5rem 0' }}>
      <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        {/* Header & Filters */}
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
                {t('officialHonorRoll')}
              </span>
            </div>
            <h1 className="heading-1">{t('studentDirectory')}</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '650px', marginTop: '0.35rem' }}>
              {lang === 'uz'
                ? 'Astra va Terra guruhlari o‘quvchilari. Ularning shaxsiy musobaqa natijalari, fan olimpiadalari va tasdiqlangan ballarini ko‘ring.'
                : 'Explore students across Astra House and Terra House. Inspect individual tournament records, academic decathlon results, and verified point contributions.'}
            </p>
          </div>

          {/* Search & Filter Controls */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <Search
                size={15}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.4rem', width: '100%', maxWidth: '240px', fontSize: '0.85rem' }}
              />
            </div>

            <select
              value={houseFilter}
              onChange={(e) => setHouseFilter(e.target.value)}
              className="form-select"
              style={{ width: '140px', fontSize: '0.85rem' }}
            >
              <option value="ALL">{t('allHouses')}</option>
              <option value="astra">Astra House</option>
              <option value="terra">Terra House</option>
            </select>

            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="form-select"
              style={{ width: '130px', fontSize: '0.85rem' }}
            >
              <option value="ALL">{t('allGrades')}</option>
              <option value="9">{t('grade')} 9</option>
              <option value="10">{t('grade')} 10</option>
              <option value="11">{t('grade')} 11</option>
              <option value="12">{t('grade')} 12</option>
            </select>
          </div>
        </div>

        {/* Students Cards Grid */}
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            {t('loading')}
          </div>
        ) : students.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1.5rem' }}>
            {students.map((student) => {
              const isAstra = student.houseSlug === 'astra';

              return (
                <Link
                  key={student.id}
                  href={`/students/${student.id}`}
                  className="arena-card arena-card-interactive"
                  style={{
                    padding: '1.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '1.25rem',
                    borderLeft: `4px solid ${isAstra ? 'var(--astra-primary)' : 'var(--terra-primary)'}`,
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                      <span className="font-stats" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        {student.studentCode}
                      </span>
                      <HouseBadge name={student.houseName} slug={student.houseSlug} size="sm" />
                    </div>

                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.35rem' }}>
                      {student.firstName} {student.lastName}
                    </h2>
                    <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                      {t('grade')} {student.grade} &bull; {student.className}
                    </div>

                    {student.bio && (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.75rem', lineHeight: 1.5 }}>
                        {student.bio}
                      </p>
                    )}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '1rem',
                      borderTop: '1px solid var(--border-subtle)',
                    }}
                  >
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {lang === 'uz' ? 'To‘plangan Ball' : 'Points Earned'}
                    </span>
                    <strong className="font-stats" style={{ fontSize: '1.15rem', color: isAstra ? '#a5b4fc' : '#6ee7b7' }}>
                      {(student.totalPoints || 0).toLocaleString()} PTS
                    </strong>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title={lang === 'uz' ? 'O‘quvchilar topilmadi' : 'No students found'}
            description={lang === 'uz' ? 'Qidiruv so‘rovi, guruh yoki sinf filtrini o‘zgartirib ko‘ring.' : 'Try adjusting your search query, house filter, or grade selection.'}
            actionText={lang === 'uz' ? 'Filtrlarni tozalash' : 'Reset Filters'}
            onActionClick={() => {
              setSearchQuery('');
              setHouseFilter('ALL');
              setGradeFilter('ALL');
            }}
          />
        )}
      </div>
    </div>
  );
}
