import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { calculateHouseScores, getActiveSeason } from '@/lib/points';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || (!user.isAdmin && !user.isSuperAdmin)) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const season = await getActiveSeason();
    const houseScores = await calculateHouseScores({ seasonId: season?.id });

    // Category distribution across both houses
    const categories = await prisma.category.findMany({
      include: {
        transactions: {
          where: { status: 'APPROVED', ...(season ? { seasonId: season.id } : {}) },
          select: { points: true, houseId: true },
        },
      },
      orderBy: { displayOrder: 'asc' },
    });

    let overallTotalPoints = 0;
    const categoryStats = categories.map((cat) => {
      const totalPoints = cat.transactions.reduce((sum, tx) => sum + tx.points, 0);
      overallTotalPoints += totalPoints;
      return {
        id: cat.id,
        name: cat.name,
        color: cat.color,
        points: totalPoints,
        count: cat.transactions.length,
      };
    });

    // Fairness Signals (PRD Section 73)
    const fairnessWarnings: { type: string; level: 'WARNING' | 'INFO'; message: string }[] = [];

    // 1. Dominating Category (> 40% of all points)
    categoryStats.forEach((cat) => {
      if (overallTotalPoints > 0) {
        const share = (cat.points / overallTotalPoints) * 100;
        if (share > 40) {
          fairnessWarnings.push({
            type: 'CATEGORY_DOMINANCE',
            level: 'WARNING',
            message: `Category "${cat.name}" accounts for ${share.toFixed(1)}% of all awarded points. Consider diversifying future competitions.`,
          });
        }
      }
    });

    // 2. High student share check (> 15% of a house's total)
    for (const h of houseScores) {
      const topStudentTxs = await prisma.pointTransaction.groupBy({
        by: ['studentId'],
        where: {
          houseId: h.id,
          status: 'APPROVED',
          studentId: { not: null },
          ...(season ? { seasonId: season.id } : {}),
        },
        _sum: { points: true },
        orderBy: { _sum: { points: 'desc' } },
        take: 1,
      });

      if (topStudentTxs.length > 0 && topStudentTxs[0].studentId && h.totalPoints > 0) {
        const studentPts = topStudentTxs[0]._sum.points || 0;
        const studentShare = (studentPts / h.totalPoints) * 100;
        if (studentShare > 20) {
          const student = await prisma.student.findUnique({
            where: { id: topStudentTxs[0].studentId },
          });
          fairnessWarnings.push({
            type: 'STUDENT_CONCENTRATION',
            level: 'INFO',
            message: `${student?.firstName} ${student?.lastName} contributes ${studentShare.toFixed(1)}% of ${h.name}'s points.`,
          });
        }
      }
    }

    // 3. Teacher issuing distribution
    const teacherIssuance = await prisma.pointTransaction.groupBy({
      by: ['createdByName'],
      where: {
        status: 'APPROVED',
        ...(season ? { seasonId: season.id } : {}),
      },
      _sum: { points: true },
      _count: { id: true },
      orderBy: { _sum: { points: 'desc' } },
    });

    // 4. Pending items needing attention
    const [pendingPointsCount, pendingAchievementsCount] = await Promise.all([
      prisma.pointTransaction.count({ where: { status: 'PENDING' } }),
      prisma.achievement.count({ where: { status: 'PENDING' } }),
    ]);

    // Student counts per grade
    const gradeDistribution = await prisma.student.groupBy({
      by: ['grade', 'houseId'],
      where: { status: 'ACTIVE' },
      _count: { id: true },
    });

    return NextResponse.json({
      season: season ? { name: season.name, status: season.status } : null,
      houseScores,
      categoryStats,
      fairnessWarnings,
      teacherIssuance: teacherIssuance.map((t) => ({
        teacher: t.createdByName,
        totalPoints: t._sum.points || 0,
        txCount: t._count.id,
      })),
      pendingPointsCount,
      pendingAchievementsCount,
      gradeDistribution,
    });
  } catch (error: unknown) {
    console.error('Analytics GET error:', error);
    return NextResponse.json({ error: 'Failed to compute analytics' }, { status: 500 });
  }
}
