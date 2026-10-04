import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user || (!user.isAdmin && !user.isSuperAdmin && !user.isTeacher)) {
      return NextResponse.json({ error: 'Forbidden: Faculty access required' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { title, description, venue, eventType, startsAt, endsAt } = body;

    const existing = await prisma.event.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const updated = await prisma.event.update({
      where: { id },
      data: {
        title: title !== undefined ? String(title).trim() : undefined,
        description: description !== undefined ? String(description).trim() : undefined,
        venue: venue !== undefined ? String(venue).trim() : undefined,
        eventType: eventType !== undefined ? eventType : undefined,
        startsAt: startsAt !== undefined ? new Date(startsAt) : undefined,
        endsAt: endsAt !== undefined ? new Date(endsAt) : undefined,
      },
    });

    await logAuditEvent({
      userId: user.id,
      userName: user.name,
      action: 'EVENT_UPDATE',
      entityType: 'Event',
      entityId: id,
      oldData: existing,
      newData: updated,
      reason: `Updated event: ${updated.title}`,
    });

    return NextResponse.json({ success: true, event: updated });
  } catch (error: unknown) {
    console.error('Event PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user || (!user.isAdmin && !user.isSuperAdmin && !user.isTeacher)) {
      return NextResponse.json({ error: 'Forbidden: Faculty access required' }, { status: 403 });
    }

    const { id } = await params;
    const existing = await prisma.event.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    await prisma.event.delete({ where: { id } });

    await logAuditEvent({
      userId: user.id,
      userName: user.name,
      action: 'EVENT_DELETE',
      entityType: 'Event',
      entityId: id,
      oldData: existing,
      reason: `Deleted event: ${existing.title}`,
    });

    return NextResponse.json({ success: true, message: 'Event deleted successfully' });
  } catch (error: unknown) {
    console.error('Event DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }
}
