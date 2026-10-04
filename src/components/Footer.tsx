'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Scale, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function Footer() {
  const { lang, t } = useLanguage();

  return (
    <footer
      style={{
        marginTop: 'auto',
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-subtle)',
        padding: '3.5rem 0 2rem 0',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '2.5rem',
            paddingBottom: '2.5rem',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          {/* Brand & Mission */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: '#ffffff',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0, 71, 186, 0.35)',
                  border: '1.5px solid var(--school-blue-light)',
                  flexShrink: 0,
                }}
              >
                <Image
                  src="/logo.png"
                  alt="Angren Ixtisoslashtirilgan Maktabi Logo"
                  width={38}
                  height={38}
                  style={{ objectFit: 'contain', borderRadius: '50%' }}
                />
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.95rem', color: '#ffffff', lineHeight: 1.2 }}>
                {lang === 'uz' ? 'ANGREN IXTISOSLASHTIRILGAN MAKTABI' : 'ANGREN SPECIALIZED SCHOOL'}
              </div>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
              {t('footerMission')}
            </p>
          </div>

          {/* Tournament Quick Links */}
          <div>
            <h4
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--text-muted)',
                marginBottom: '1rem',
              }}
            >
              {t('footerSections')}
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <li>
                <Link href="/leaderboard" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>
                  {t('footerLeaderboard')}
                </Link>
              </li>
              <li>
                <Link href="/houses" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>
                  {t('footerHouses')}
                </Link>
              </li>
              <li>
                <Link href="/competitions" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>
                  {t('footerCompetitions')}
                </Link>
              </li>
              <li>
                <Link href="/students" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>
                  {t('footerStudents')}
                </Link>
              </li>
              <li>
                <Link href="/achievements" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>
                  {t('footerHonors')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Houses Chapters */}
          <div>
            <h4
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--text-muted)',
                marginBottom: '1rem',
              }}
            >
              {t('footerChapters')}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <Link
                href="/houses/astra"
                className="panel-elevated"
                style={{
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderLeft: '3px solid var(--astra-primary)',
                  textDecoration: 'none',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#93c5fd' }}>Astra House</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {lang === 'uz' ? 'Lochin • "Yuksak maqsadlar sari"' : 'The Falcon • "Aim Beyond"'}
                  </div>
                </div>
                <ArrowUpRight size={15} color="var(--text-muted)" />
              </Link>

              <Link
                href="/houses/terra"
                className="panel-elevated"
                style={{
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderLeft: '3px solid var(--terra-primary)',
                  textDecoration: 'none',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#6ee7b7' }}>Terra House</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {lang === 'uz' ? 'Bo‘ri • "Birlashgan kuchmiz"' : 'The Wolf • "Stronger Together"'}
                  </div>
                </div>
                <ArrowUpRight size={15} color="var(--text-muted)" />
              </Link>
            </div>
          </div>

          {/* Governance & Integrity */}
          <div>
            <h4
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--text-muted)',
                marginBottom: '1rem',
              }}
            >
              {t('footerGovernance')}
            </h4>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '0.75rem' }}>
              {t('footerGovernanceText')}
            </p>
            <Link
              href="/rules"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.825rem',
                fontWeight: 600,
                color: 'var(--school-blue-accent)',
                textDecoration: 'none',
              }}
            >
              <Scale size={14} />
              <span>{t('footerCharterLink')}</span>
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            paddingTop: '1.5rem',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
          }}
        >
          <div>
            {t('footerCopyright')}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <Link href="/about" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
              {t('footerCharter')}
            </Link>
            <Link href="/rules" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
              {t('footerScoringRules')}
            </Link>
            <Link href="/events" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
              {t('footerCalendar')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
