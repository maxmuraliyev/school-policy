import { NextRequest, NextResponse } from 'next/server';
import { calculateHouseScores, getTopContributors, getActiveSeason } from '@/lib/points';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const timeFilter = (searchParams.get('timeFilter') as 'all' | 'month' | 'week' | 'custom') || 'all';
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const seasonId = searchParams.get('seasonId') || undefined;

    const startDate = startDateParam ? new Date(startDateParam) : undefined;
    const endDate = endDateParam ? new Date(endDateParam) : undefined;

    const season = await getActiveSeason();
    const houses = await calculateHouseScores({
      seasonId: seasonId || season?.id,
      timeFilter,
      startDate,
      endDate,
    });

    const topContributors = await getTopContributors(8, seasonId || season?.id);

    // Get 6 most recent approved transactions for public ticker
    const recentActivity = await prisma.pointTransaction.findMany({
      where: {
        status: 'APPROVED',
        ...(season ? { seasonId: season.id } : {}),
      },
      include: {
        house: true,
        category: true,
        student: true,
      },
      orderBy: { earnedAt: 'desc' },
      take: 6,
    });

    // Score difference calculation
    let leader = null;
    let scoreDifference = 0;
    if (houses.length >= 2) {
      scoreDifference = Math.abs(houses[0].totalPoints - houses[1].totalPoints);
      if (houses[0].totalPoints > houses[1].totalPoints) {
        leader = houses[0];
      } else if (houses[1].totalPoints > houses[0].totalPoints) {
        leader = houses[1];
      }
    }

    return NextResponse.json({
      season: season ? { id: season.id, name: season.name, status: season.status } : null,
      timeFilter,
      leader,
      scoreDifference,
      houses,
      topContributors,
      recentActivity: recentActivity.map((tx) => ({
        id: tx.id,
        code: tx.transactionCode,
        points: tx.points,
        houseName: tx.house.shortName,
        houseSlug: tx.house.slug,
        houseColor: tx.house.primaryColor,
        reason: tx.reason,
        categoryName: tx.category.name,
        categoryColor: tx.category.color,
        categoryIcon: tx.category.icon,
        studentName: tx.student ? `${tx.student.firstName} ${tx.student.lastName}` : null,
        earnedAt: tx.earnedAt,
      })),
    });
  } catch (error: unknown) {
    console.error('Leaderboard error:', error);
    return NextResponse.json({ error: 'Failed to compute leaderboard' }, { status: 500 });
  }
}
