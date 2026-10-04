import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Shield,
  Trophy,
  Award,
  Calendar,
  Clock,
  ArrowLeft,
  CheckCircle2,
  BookOpen,
  Medal,
} from 'lucide-react';
import prisma from '@/lib/prisma';
import HouseBadge from '@/components/HouseBadge';
import StatusBadge from '@/components/StatusBadge';
import SectionHeader from '@/components/SectionHeader';
import EmptyState from '@/components/EmptyState';

export const revalidate = 0;

export default async function StudentProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      house: true,
      transactions: {
        where: { status: { in: ['APPROVED', 'REVERSED'] } },
        include: { category: true, competition: true },
        orderBy: { earnedAt: 'desc' },
      },
      achievements: {
        where: { status: 'APPROVED' },
        include: { category: true },
        orderBy: { achievementDate: 'desc' },
      },
      participants: {
        include: { competition: { include: { category: true } } },
      },
    },
  });

  if (!student) {
    notFound();
  }

  // Calculate points by category
  const categoryMap: Record<string, { name: string; color: string; points: number }> = {};
  let totalPoints = 0;

  student.transactions.forEach((tx) => {
    totalPoints += tx.points;
    if (!categoryMap[tx.category.id]) {
      categoryMap[tx.category.id] = {
        name: tx.category.name,
        color: tx.category.color,
        points: 0,
      };
    }
    categoryMap[tx.category.id].points += tx.points;
  });

  const categoryBreakdown = Object.values(categoryMap);
  const isAstra = student.house.slug === 'astra';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', padding: '2.5rem 0 5rem 0' }}>
      <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        {/* Back Link */}
        <div>
          <Link
            href="/students"
            className="btn btn-ghost btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}
          >
            <ArrowLeft size={15} />
            <span>Back to Student Honor Roll</span>
          </Link>
        </div>

        {/* 1. Student Hero Profile Banner */}
        <div
          className="arena-card"
          style={{
            padding: '2.5rem',
            borderLeft: `5px solid ${isAstra ? 'var(--astra-primary)' : 'var(--terra-primary)'}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '2rem',
            background: 'linear-gradient(180deg, var(--bg-surface-elevated) 0%, var(--bg-surface) 100%)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <HouseBadge name={student.house.name} slug={student.house.slug} size="sm" />
              <span className="font-stats" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {student.studentCode}
              </span>
            </div>

            <h1 className="heading-1" style={{ color: '#ffffff', marginBottom: '0.35rem' }}>
              {student.firstName} {student.lastName}
            </h1>

            <div style={{ display: 'flex', gap: '0.65rem', fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              <span>Grade {student.grade}</span>
              <span>&bull;</span>
              <span>Class {student.className}</span>
              <span>&bull;</span>
              <span>Enrolled {new Date(student.joinedAt).getFullYear()}</span>
            </div>

            {student.bio && (
              <p style={{ maxWidth: '650px', color: 'var(--text-secondary)', lineHeight: 1.65, fontSize: '0.925rem' }}>
                {student.bio}
              </p>
            )}
          </div>

          {/* Points Contribution Stat Box */}
          <div
            className="panel-elevated"
            style={{
              padding: '1.75rem 2.25rem',
              textAlign: 'center',
              minWidth: '220px',
              border: `1px solid ${isAstra ? 'rgba(99, 102, 241, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`,
            }}
          >
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
              Points Contributed
            </div>
            <div
              className="font-stats"
              style={{
                fontSize: '3rem',
                fontWeight: 900,
                color: isAstra ? '#a5b4fc' : '#6ee7b7',
                lineHeight: 1.1,
                margin: '0.35rem 0',
              }}
            >
              +{totalPoints.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Points awarded to {student.house.shortName}
            </div>
          </div>
        </div>

        {/* 2. Category Contributions & Tournament Participation */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          {/* Category Breakdown */}
          <div className="arena-card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '1.5rem', fontWeight: 800 }}>
              Points by Discipline
            </h3>

            {categoryBreakdown.length === 0 ? (
              <EmptyState title="No points recorded" description="Verified points will appear here." />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {categoryBreakdown.map((cat) => (
                  <div key={cat.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.35rem' }}>
                      <span style={{ fontWeight: 600, color: '#ffffff' }}>{cat.name}</span>
                      <strong className="font-stats" style={{ color: cat.color }}>+{cat.points} PTS</strong>
                    </div>
                    <div className="category-bar-track">
                      <div
                        className="category-bar-fill"
                        style={{
                          width: `${totalPoints > 0 ? (cat.points / totalPoints) * 100 : 0}%`,
                          background: cat.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tournament Participation */}
          <div className="arena-card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '1.5rem', fontWeight: 800 }}>
              Sanctioned Matches Participated
            </h3>

            {student.participants.length === 0 ? (
              <EmptyState title="No tournament records" description="Registered competition matches will appear here." />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {student.participants.map((p) => (
                  <Link
                    key={p.id}
                    href={`/competitions/${p.competition.slug}`}
                    className="panel-elevated"
                    style={{
                      padding: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.925rem', color: '#ffffff' }}>
                        {p.competition.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                        {p.competition.category.name} &bull; {new Date(p.competition.startsAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>

                    <StatusBadge status={p.competition.status} size="sm" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 3. Verified Points Ledger */}
        <section>
          <SectionHeader
            tag="Audit History"
            title={`${student.firstName}'s Verified Points Ledger`}
            description="Complete record of verified points awarded to this student"
          />

          <div className="arena-card" style={{ padding: '1.5rem' }}>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Points</th>
                    <th>Category</th>
                    <th>Reason / Competition</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {student.transactions.length > 0 ? (
                    student.transactions.map((tx) => (
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
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {new Date(tx.earnedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        No transactions recorded for this student yet.
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
