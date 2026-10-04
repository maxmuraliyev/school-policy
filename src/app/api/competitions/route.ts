import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { getActiveSeason } from '@/lib/points';
import { logAuditEvent } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const categoryId = searchParams.get('categoryId');
    const seasonId = searchParams.get('seasonId');

    const where: Record<string, unknown> = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }
    if (categoryId && categoryId !== 'ALL') {
      where.categoryId = categoryId;
    }
    if (seasonId) {
      where.seasonId = seasonId;
    }

    const competitions = await prisma.competition.findMany({
      where,
      include: {
        category: true,
        participants: {
          include: { house: true },
        },
        results: {
          include: { house: true, student: true, team: true },
          orderBy: { rank: 'asc' },
        },
      },
      orderBy: { startsAt: 'asc' },
    });

    const formatted = competitions.map((c) => ({
      id: c.id,
      title: c.title,
      slug: c.slug,
      description: c.description,
      categoryName: c.category.name,
      categoryColor: c.category.color,
      categoryIcon: c.category.icon,
      competitionType: c.competitionType,
      format: c.format,
      organizer: c.organizer,
      venue: c.venue,
      startsAt: c.startsAt,
      endsAt: c.endsAt,
      registrationOpenAt: c.registrationOpenAt,
      registrationCloseAt: c.registrationCloseAt,
      status: c.status,
      maxParticipants: c.maxParticipants,
      participantsCount: c.participants.length,
      resultsCount: c.results.length,
      winners: c.results.slice(0, 3).map((r) => ({
        rank: r.rank,
        houseName: r.house.shortName,
        houseColor: r.house.primaryColor,
        scoreText: r.scoreText,
        pointsAwarded: r.pointsAwarded,
        recipient: r.student
          ? `${r.student.firstName} ${r.student.lastName}`
          : r.team?.name || r.house.name,
      })),
    }));

    return NextResponse.json({ competitions: formatted });
  } catch (error: unknown) {
    console.error('Competitions GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch competitions' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Please log in' }, { status: 401 });
    }

    if (!user.permissions.includes('competition.create') && !user.isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to create competitions' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      title,
      description,
      categoryId,
      competitionType,
      format,
      organizer,
      venue,
      startsAt,
      endsAt,
      rules,
      maxParticipants,
    } = body;

    if (!title || !description || !categoryId || !venue || !startsAt || !endsAt) {
      return NextResponse.json(
        { error: 'Title, description, category, venue, start time, and end time are required.' },
        { status: 400 }
      );
    }

    // Generate slug from title
    let slug = String(title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const existingSlug = await prisma.competition.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const season = await getActiveSeason();
    if (!season) {
      return NextResponse.json({ error: 'No active academic season found.' }, { status: 400 });
    }

    const competition = await prisma.competition.create({
      data: {
        title: String(title).trim(),
        slug,
        description: String(description).trim(),
        categoryId,
        competitionType: competitionType || 'INTER_HOUSE',
        format: format || 'INDIVIDUAL',
        organizer: organizer ? String(organizer).trim() : 'Academic Council',
        venue: String(venue).trim(),
        startsAt: new Date(startsAt),
        endsAt: new Date(endsAt),
        rules: rules ? String(rules).trim() : null,
        status: 'REGISTRATION_OPEN',
        maxParticipants: maxParticipants ? parseInt(String(maxParticipants), 10) : null,
        seasonId: season.id,
        createdById: user.id,
      },
      include: { category: true },
    });

    await logAuditEvent({
      userId: user.id,
      userName: user.name,
      action: 'COMPETITION_CREATE',
      entityType: 'Competition',
      entityId: competition.id,
      newData: competition,
      reason: `Created competition "${competition.title}"`,
    });

    return NextResponse.json({ success: true, competition });
  } catch (error: unknown) {
    console.error('Competition create error:', error);
    return NextResponse.json({ error: 'Failed to create competition' }, { status: 500 });
  }
}
