import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { calculateHouseScores, getActiveSeason } from '@/lib/points';
import { getSessionUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const house = await prisma.house.findUnique({
      where: { slug },
    });

    if (!house) {
      return NextResponse.json({ error: 'House not found' }, { status: 404 });
    }

    const season = await getActiveSeason();
    const allHouseScores = await calculateHouseScores({ seasonId: season?.id });
    const houseStats = allHouseScores.find((h) => h.id === house.id);

    // Active students count
    const studentCount = await prisma.student.count({
      where: { houseId: house.id, status: 'ACTIVE' },
    });

    // Recent 10 approved transactions
    const recentTransactions = await prisma.pointTransaction.findMany({
      where: {
        houseId: house.id,
        status: 'APPROVED',
        ...(season ? { seasonId: season.id } : {}),
      },
      include: {
        category: true,
        student: true,
        competition: true,
      },
      orderBy: { earnedAt: 'desc' },
      take: 10,
    });

    // Top 5 contributors in this house
    const houseTxs = await prisma.pointTransaction.findMany({
      where: {
        houseId: house.id,
        status: 'APPROVED',
        studentId: { not: null },
        ...(season ? { seasonId: season.id } : {}),
      },
      include: { student: true, category: true },
    });

    const studentMap = new Map<
      string,
      { student: NonNullable<(typeof houseTxs)[0]['student']>; total: number }
    >();

    houseTxs.forEach((tx) => {
      if (!tx.student) return;
      const cur = studentMap.get(tx.student.id) || { student: tx.student, total: 0 };
      cur.total += tx.points;
      studentMap.set(tx.student.id, cur);
    });

    const topContributors = Array.from(studentMap.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
      .map((item) => ({
        id: item.student.id,
        name: `${item.student.firstName} ${item.student.lastName}`,
        grade: item.student.grade,
        className: item.student.className,
        totalPoints: item.total,
      }));

    // Approved achievements
    const achievements = await prisma.achievement.findMany({
      where: { houseId: house.id, status: 'APPROVED' },
      include: { student: true, category: true },
      orderBy: { achievementDate: 'desc' },
      take: 5,
    });

    // Upcoming events for this house or all
    const events = await prisma.event.findMany({
      where: {
        OR: [{ houseId: house.id }, { houseId: null }],
        startsAt: { gte: new Date() },
      },
      orderBy: { startsAt: 'asc' },
      take: 4,
    });

    return NextResponse.json({
      house: {
        ...house,
        rank: houseStats?.rank || 1,
        totalPoints: houseStats?.totalPoints || 0,
        monthlyPoints: houseStats?.monthlyPoints || 0,
        weeklyPoints: houseStats?.weeklyPoints || 0,
        studentCount,
        categories: houseStats?.categories || [],
      },
      recentTransactions: recentTransactions.map((tx) => ({
        id: tx.id,
        code: tx.transactionCode,
        points: tx.points,
        reason: tx.reason,
        description: tx.description,
        earnedAt: tx.earnedAt,
        category: tx.category.name,
        categoryColor: tx.category.color,
        categoryIcon: tx.category.icon,
        studentName: tx.student ? `${tx.student.firstName} ${tx.student.lastName}` : null,
        competitionTitle: tx.competition?.title || null,
      })),
      topContributors,
      achievements,
      events,
    });
  } catch (error: unknown) {
    console.error('House detail error:', error);
    return NextResponse.json({ error: 'Failed to fetch house' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user || (!user.isAdmin && !user.isSuperAdmin)) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { slug } = await params;
    const body = await req.json();

    const existing = await prisma.house.findUnique({ where: { slug } });
    if (!existing) {
      return NextResponse.json({ error: 'House not found' }, { status: 404 });
    }

    const {
      name,
      shortName,
      motto,
      description,
      symbol,
      primaryColor,
      secondaryColor,
      accentColor,
      mentorName,
      mentorTitle,
      captainName,
      viceCaptainName,
    } = body;

    const updated = await prisma.house.update({
      where: { slug },
      data: {
        name: name !== undefined ? String(name).trim() : undefined,
        shortName: shortName !== undefined ? String(shortName).trim() : undefined,
        motto: motto !== undefined ? String(motto).trim() : undefined,
        description: description !== undefined ? String(description).trim() : undefined,
        symbol: symbol !== undefined ? String(symbol).trim() : undefined,
        primaryColor: primaryColor !== undefined ? String(primaryColor).trim() : undefined,
        secondaryColor: secondaryColor !== undefined ? String(secondaryColor).trim() : undefined,
        accentColor: accentColor !== undefined ? String(accentColor).trim() : undefined,
        mentorName: mentorName !== undefined ? String(mentorName).trim() : undefined,
        mentorTitle: mentorTitle !== undefined ? String(mentorTitle).trim() : undefined,
        captainName: captainName !== undefined ? String(captainName).trim() : undefined,
        viceCaptainName: viceCaptainName !== undefined ? String(viceCaptainName).trim() : undefined,
      },
    });

    await logAuditEvent({
      userId: user.id,
      userName: user.name,
      action: 'HOUSE_UPDATE',
      entityType: 'House',
      entityId: existing.id,
      oldData: existing,
      newData: updated,
      reason: `Updated ${existing.name} metadata`,
    });

    return NextResponse.json({ success: true, house: updated });
  } catch (error: unknown) {
    console.error('House update error:', error);
    return NextResponse.json({ error: 'Failed to update house' }, { status: 500 });
  }
}
