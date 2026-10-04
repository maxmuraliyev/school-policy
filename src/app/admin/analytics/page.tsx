'use client';

import React, { useState, useEffect } from 'react';
import { Activity, AlertTriangle, CheckCircle2, TrendingUp, Users, Scale, Award } from 'lucide-react';

interface AnalyticsData {
  season: { name: string; status: string } | null;
  houseScores: { id: string; name: string; totalPoints: number; primaryColor: string }[];
  categoryStats: { id: string; name: string; color: string; points: number; count: number }[];
  fairnessWarnings: { type: string; level: 'WARNING' | 'INFO'; message: string }[];
  teacherIssuance: { teacher: string; totalPoints: number; txCount: number }[];
  pendingPointsCount: number;
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then((res) => res.json())
      .then((resData) => {
        setData(resData);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading || !data) {
    return (
      <div style={{ padding: '5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Generating real-time institutional fairness analytics...
      </div>
    );
  }

  const totalPoints = data.categoryStats.reduce((sum, c) => sum + c.points, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <span className="badge badge-gold" style={{ marginBottom: '0.5rem' }}>
          FAIRNESS AUDITING
        </span>
        <h1 style={{ fontSize: '2.25rem', color: '#fff' }}>Fairness & Scoring Analytics</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Real-time algorithmic checks for category domination, student point concentration, and faculty distribution patterns.
        </p>
      </div>

      {/* FAIRNESS ALERTS PANEL (PRD Section 73) */}
      <div className="glass-card" style={{ padding: '2rem', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: 'var(--gold)', marginBottom: '1.25rem' }}>
          <AlertTriangle size={22} />
          <h2 style={{ fontSize: '1.35rem', color: '#fff' }}>Algorithmic Integrity Signals</h2>
        </div>

        {data.fairnessWarnings.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--terra-primary)', fontSize: '0.95rem' }}>
            <CheckCircle2 size={18} />
            <span>All integrity checks passed. No category dominance or unhealthy point concentration detected.</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {data.fairnessWarnings.map((w, idx) => (
              <div
                key={idx}
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  background: w.level === 'WARNING' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(99, 102, 241, 0.12)',
                  border: `1px solid ${w.level === 'WARNING' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(99, 102, 241, 0.3)'}`,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                }}
              >
                {w.level === 'WARNING' ? (
                  <AlertTriangle size={18} color="var(--danger)" style={{ marginTop: '2px', flexShrink: 0 }} />
                ) : (
                  <Activity size={18} color="var(--astra-accent)" style={{ marginTop: '2px', flexShrink: 0 }} />
                )}
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>
                    {w.type.replace(/_/g, ' ')}
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    {w.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CATEGORY SHARE DISTRIBUTION */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.3rem', color: '#fff', marginBottom: '1.25rem' }}>
            Category Points Distribution
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {data.categoryStats.map((cat) => {
              const share = totalPoints > 0 ? (cat.points / totalPoints) * 100 : 0;
              return (
                <div key={cat.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.35rem' }}>
                    <span style={{ fontWeight: 600, color: '#fff' }}>{cat.name}</span>
                    <span style={{ color: cat.color, fontWeight: 700 }}>
                      {cat.points} pts ({share.toFixed(1)}%)
                    </span>
                  </div>
                  <div
                    style={{
                      height: '8px',
                      borderRadius: 'var(--radius-full)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${share}%`,
                        background: cat.color,
                        borderRadius: 'var(--radius-full)',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* TEACHER ISSUANCE VOLUME (PRD Section 73) */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.3rem', color: '#fff', marginBottom: '1.25rem' }}>
            Faculty Issuance Volume
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Monitoring point creation patterns across teachers to ensure parity.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {data.teacherIssuance.map((t, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>{t.teacher}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {t.txCount} point submissions
                  </div>
                </div>

                <div style={{ fontWeight: 800, color: 'var(--gold)', fontSize: '1rem' }}>
                  {t.totalPoints.toLocaleString()} pts
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
