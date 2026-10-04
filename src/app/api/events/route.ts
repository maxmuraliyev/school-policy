import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { getActiveSeason } from '@/lib/points';
import { logAuditEvent } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const eventType = searchParams.get('type');
    const houseId = searchParams.get('houseId');

    const where: Record<string, unknown> = {};
    if (eventType && eventType !== 'ALL') {
      where.eventType = eventType;
    }
    if (houseId) {
      where.OR = [{ houseId }, { houseId: null }];
    }

    const events = await prisma.event.findMany({
      where,
      include: {
        category: true,
        house: true,
      },
      orderBy: { startsAt: 'asc' },
    });

    return NextResponse.json({ events });
  } catch (error: unknown) {
    console.error('Events GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Please log in' }, { status: 401 });
    }

    if (!user.permissions.includes('event.manage') && !user.isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to manage events' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      title,
      description,
      eventType = 'COMPETITION',
      categoryId,
      houseId,
      venue,
      startsAt,
      endsAt,
      isPublic = true,
    } = body;

    if (!title || !description || !venue || !startsAt || !endsAt) {
      return NextResponse.json(
        { error: 'Title, description, venue, start time, and end time are required' },
        { status: 400 }
      );
    }

    const season = await getActiveSeason();
    if (!season) {
      return NextResponse.json({ error: 'No active academic season found' }, { status: 400 });
    }

    const event = await prisma.event.create({
      data: {
        title: String(title).trim(),
        description: String(description).trim(),
        eventType,
        categoryId: categoryId || null,
        houseId: houseId || null,
        venue: String(venue).trim(),
        startsAt: new Date(startsAt),
        endsAt: new Date(endsAt),
        isPublic: Boolean(isPublic),
        seasonId: season.id,
      },
      include: { category: true, house: true },
    });

    await logAuditEvent({
      userId: user.id,
      userName: user.name,
      action: 'EVENT_CREATE',
      entityType: 'Event',
      entityId: event.id,
      newData: event,
      reason: `Created event "${event.title}"`,
    });

    return NextResponse.json({ success: true, event });
  } catch (error: unknown) {
    console.error('Event create error:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}
