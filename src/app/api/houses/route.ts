import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { calculateHouseScores } from '@/lib/points';

export async function GET() {
  try {
    const scores = await calculateHouseScores();
    const studentCounts = await prisma.student.groupBy({
      by: ['houseId'],
      where: { status: 'ACTIVE' },
      _count: { id: true },
    });

    const countMap: Record<string, number> = {};
    studentCounts.forEach((c) => {
      countMap[c.houseId] = c._count.id;
    });

    const housesWithMeta = scores.map((h) => ({
      ...h,
      studentCount: countMap[h.id] || 0,
    }));

    return NextResponse.json({ houses: housesWithMeta });
  } catch (error: unknown) {
    console.error('Houses GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch houses' }, { status: 500 });
  }
}
