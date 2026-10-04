import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const competition = await prisma.competition.findUnique({
      where: { slug },
      include: {
        category: true,
        participants: {
          include: {
            student: { include: { house: true } },
            team: { include: { members: { include: { student: true } } } },
            house: true,
          },
        },
        results: {
          include: {
            student: { include: { house: true } },
            team: true,
            house: true,
          },
          orderBy: { rank: 'asc' },
        },
        transactions: {
          where: { status: 'APPROVED' },
          include: { house: true },
        },
      },
    });

    if (!competition) {
      return NextResponse.json({ error: 'Competition not found' }, { status: 404 });
    }

    // Get relevant scoring rules for this category
    const scoringRules = await prisma.scoringRule.findMany({
      where: {
        OR: [{ categoryId: competition.categoryId }, { categoryId: null }],
        isActive: true,
      },
      orderBy: { defaultPoints: 'desc' },
    });

    return NextResponse.json({
      competition,
      scoringRules,
    });
  } catch (error: unknown) {
    console.error('Competition detail error:', error);
    return NextResponse.json({ error: 'Failed to fetch competition' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Please log in' }, { status: 401 });
    }

    if (!user.permissions.includes('competition.update') && !user.isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to edit competitions' },
        { status: 403 }
      );
    }

    const { slug } = await params;
    const competition = await prisma.competition.findUnique({ where: { slug } });
    if (!competition) {
      return NextResponse.json({ error: 'Competition not found' }, { status: 404 });
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
      status,
      maxParticipants,
    } = body;

    const updated = await prisma.competition.update({
      where: { slug },
      data: {
        title: title !== undefined ? String(title).trim() : undefined,
        description: description !== undefined ? String(description).trim() : undefined,
        categoryId: categoryId !== undefined ? categoryId : undefined,
        competitionType: competitionType !== undefined ? competitionType : undefined,
        format: format !== undefined ? format : undefined,
        organizer: organizer !== undefined ? String(organizer).trim() : undefined,
        venue: venue !== undefined ? String(venue).trim() : undefined,
        startsAt: startsAt ? new Date(startsAt) : undefined,
        endsAt: endsAt ? new Date(endsAt) : undefined,
        rules: rules !== undefined ? String(rules).trim() : undefined,
        status: status !== undefined ? status : undefined,
        maxParticipants: maxParticipants !== undefined ? parseInt(String(maxParticipants), 10) : undefined,
      },
      include: { category: true },
    });

    await logAuditEvent({
      userId: user.id,
      userName: user.name,
      action: 'COMPETITION_UPDATE',
      entityType: 'Competition',
      entityId: competition.id,
      oldData: competition,
      newData: updated,
      reason: `Updated competition "${competition.title}" status/details`,
    });

    return NextResponse.json({ success: true, competition: updated });
  } catch (error: unknown) {
    console.error('Competition update error:', error);
    return NextResponse.json({ error: 'Failed to update competition' }, { status: 500 });
  }
}
