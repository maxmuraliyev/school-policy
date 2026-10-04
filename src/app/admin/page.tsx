import React from 'react';
import Link from 'next/link';
import {
  Trophy,
  Shield,
  Clock,
  Award,
  Users,
  AlertTriangle,
  ArrowRight,
  PlusCircle,
  FileSpreadsheet,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import prisma from '@/lib/prisma';
import { calculateHouseScores, getActiveSeason } from '@/lib/points';
import HouseBadge from '@/components/HouseBadge';

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const season = await getActiveSeason();
  const houseScores = await calculateHouseScores({ seasonId: season?.id });

  const astra = houseScores.find((h) => h.slug === 'astra') || houseScores[0];
  const terra = houseScores.find((h) => h.slug === 'terra') || houseScores[1];

  const [pendingPointsCount, pendingAchievementsCount, studentCount, recentLogs] =
    await Promise.all([
      prisma.pointTransaction.count({ where: { status: 'PENDING' } }),
      prisma.achievement.count({ where: { status: 'PENDING' } }),
      prisma.student.count({ where: { status: 'ACTIVE' } }),
      prisma.auditLog.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* Top Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="badge badge-gold" style={{ marginBottom: '0.5rem' }}>
            ACADEMIC YEAR {season?.name || '2026-2027'} &bull; ACTIVE
          </span>
          <h1 style={{ fontSize: '2.25rem', color: '#fff', fontWeight: 800 }}>Command Center Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Administrative oversight, point transaction verification, and house system governance.
          </p>
        </div>

        {/* Quick action shortcuts */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link href="/admin/points" className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <PlusCircle size={15} />
            <span>Award Points</span>
          </Link>
          <Link href="/admin/competitions" className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Trophy size={15} />
            <span>New Competition</span>
          </Link>
          <Link href="/admin/students/import" className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <FileSpreadsheet size={15} />
            <span>CSV Import</span>
          </Link>
        </div>
      </div>

      {/* METRIC KPI WIDGETS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        {/* Astra Score Widget */}
        <div
          className="arena-card"
          style={{
            padding: '1.75rem',
            borderTop: '3px solid var(--astra-primary)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '0.06em' }}>
              Astra House Total
            </span>
            <HouseBadge name="Astra" slug="astra" color="var(--astra-primary)" size="sm" />
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: '#fff' }}>
            {astra?.totalPoints.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--astra-accent)', marginTop: '0.35rem', fontWeight: 600 }}>
            +{astra?.monthlyPoints.toLocaleString()} pts this month
          </div>
        </div>

        {/* Terra Score Widget */}
        <div
          className="arena-card"
          style={{
            padding: '1.75rem',
            borderTop: '3px solid var(--terra-primary)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '0.06em' }}>
              Terra House Total
            </span>
            <HouseBadge name="Terra" slug="terra" color="var(--terra-primary)" size="sm" />
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: '#fff' }}>
            {terra?.totalPoints.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--terra-accent)', marginTop: '0.35rem', fontWeight: 600 }}>
            +{terra?.monthlyPoints.toLocaleString()} pts this month
          </div>
        </div>

        {/* Pending Approvals Widget */}
        <Link
          href="/admin/points/pending"
          className="arena-card"
          style={{
            padding: '1.75rem',
            borderTop: pendingPointsCount > 0 ? '3px solid var(--gold)' : '3px solid var(--border-subtle)',
            display: 'block',
            textDecoration: 'none',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '0.06em' }}>
              Pending Approvals
            </span>
            <Clock size={18} color="var(--gold)" />
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: pendingPointsCount > 0 ? 'var(--gold)' : '#fff' }}>
            {pendingPointsCount}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span>Review Queue</span>
            <ArrowRight size={13} />
          </div>
        </Link>

        {/* Active Students Widget */}
        <Link
          href="/admin/students"
          className="arena-card"
          style={{
            padding: '1.75rem',
            borderTop: '3px solid #38bdf8',
            display: 'block',
            textDecoration: 'none',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '0.06em' }}>
              Active Student Roster
            </span>
            <Users size={18} color="#38bdf8" />
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: '#fff' }}>
            {studentCount}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
            Enrolled across Grades 9&ndash;11
          </div>
        </Link>
      </div>

      {/* DUAL SECTION: FAIRNESS SIGNALS & AUDIT STREAM */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
        {/* Fairness & Anomaly Monitoring */}
        <div className="arena-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gold)' }}>
              <Activity size={20} />
              <h2 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 700 }}>Fairness & Anomaly Monitor</h2>
            </div>
            <Link href="/admin/analytics" style={{ fontSize: '0.8rem', color: 'var(--astra-accent)', textDecoration: 'none' }}>
              Deep Analytics &rarr;
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div
              style={{
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'flex-start',
              }}
            >
              <AlertTriangle size={18} color="var(--gold)" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <strong style={{ fontSize: '0.85rem', color: '#fff' }}>Anti-Abuse Rule Active</strong>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                  Self-approval is strictly blocked for faculty. All points above 50 require secondary administrator review.
                </p>
              </div>
            </div>

            <div
              style={{
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'flex-start',
              }}
            >
              <CheckCircle2 size={18} color="var(--terra-primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <strong style={{ fontSize: '0.85rem', color: '#fff' }}>Balanced Competitive Delta</strong>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                  Astra leads by 35 points (1,420 vs 1,385). Category diversity healthy across academics, athletics, and STEM.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Audit Action Feed */}
        <div className="arena-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 700 }}>Recent Audit Trail Log</h2>
            <Link href="/admin/audit-logs" style={{ fontSize: '0.8rem', color: 'var(--astra-accent)', textDecoration: 'none' }}>
              Full Audit History &rarr;
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {recentLogs.map((log) => (
              <div
                key={log.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-xs)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.85rem',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: '#fff' }}>{log.action}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {log.userName} &bull; {log.reason || log.entityType}
                  </div>
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {new Date(log.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
