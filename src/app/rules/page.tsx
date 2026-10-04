import React from 'react';
import { BookOpen, Shield, Award, CheckCircle, Scale, Activity, AlertCircle } from 'lucide-react';
import prisma from '@/lib/prisma';
import { getServerI18n } from '@/lib/i18n';
import SectionHeader from '@/components/SectionHeader';

export const revalidate = 0;

export default async function RulesPage() {
  const { lang, t } = await getServerI18n();
  const rules = await prisma.scoringRule.findMany({
    include: { category: true },
    orderBy: { defaultPoints: 'desc' },
  });

  return (
    <div className="container" style={{ padding: '3rem 1.5rem 5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto' }}>
        <span className="badge badge-gold" style={{ marginBottom: '0.75rem' }}>
          {t('scoringCharterTag')}
        </span>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', marginBottom: '0.75rem', fontWeight: 800 }}>
          {t('pointsScaleTitle')}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6 }}>
          {t('pointsScaleSubtitle')}
        </p>
      </div>

      {/* CORE PRINCIPLES 3-COLUMN */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        <div className="arena-card" style={{ padding: '2rem', borderTop: '3px solid var(--astra-accent)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: 'var(--astra-accent)' }}>
            <Activity size={22} />
            <h3 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 700 }}>{t('rule1Title')}</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.9rem' }}>
            {t('rule1Desc')}
          </p>
        </div>

        <div className="arena-card" style={{ padding: '2rem', borderTop: '3px solid var(--gold)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: 'var(--gold)' }}>
            <Scale size={22} />
            <h3 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 700 }}>{t('rule2Title')}</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.9rem' }}>
            {t('rule2Desc')}
          </p>
        </div>

        <div className="arena-card" style={{ padding: '2rem', borderTop: '3px solid var(--terra-primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: 'var(--terra-primary)' }}>
            <CheckCircle size={22} />
            <h3 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 700 }}>{t('rule3Title')}</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.9rem' }}>
            {t('rule3Desc')}
          </p>
        </div>
      </div>

      {/* SCORING SCALE TABLE */}
      <section className="arena-card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.35rem', fontWeight: 700, color: '#fff' }}>
              {t('standardScalesTitle')}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              {t('standardScalesDesc')}
            </p>
          </div>

          <span
            className="badge"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.75rem',
            }}
          >
            {rules.length} {lang === 'uz' ? 'ta qoida faol' : 'Standard Rules Active'}
          </span>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('tierResult')}</th>
                <th>{t('category')}</th>
                <th>{t('compLevel')}</th>
                <th>{t('awardedPoints')}</th>
                <th>{t('guidelines')}</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((rule) => (
                <tr key={rule.id}>
                  <td style={{ fontWeight: 700, color: '#fff' }}>{rule.name}</td>
                  <td>
                    {rule.category ? (
                      <span style={{ color: rule.category.color, fontWeight: 600, fontSize: '0.85rem' }}>
                        {rule.category.name}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {lang === 'uz' ? 'Umumiy' : 'General'}
                      </span>
                    )}
                  </td>
                  <td>
                    <span className="badge badge-neutral" style={{ fontSize: '0.7rem', fontWeight: 700 }}>
                      {rule.level}
                    </span>
                  </td>
                  <td>
                    <span
                      style={{
                        fontWeight: 900,
                        fontSize: '1.05rem',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--gold)',
                      }}
                    >
                      +{rule.defaultPoints} {t('points')}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    {rule.description || (lang === 'uz' ? 'Standart tasdiqlangan kategoriya shkalasi' : 'Standard approved category scale')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
