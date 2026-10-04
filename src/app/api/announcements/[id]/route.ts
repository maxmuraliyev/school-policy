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
    const { title, content, audienceType, isPinned } = body;

    const existing = await prisma.announcement.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
    }

    const updated = await prisma.announcement.update({
      where: { id },
      data: {
        title: title !== undefined ? String(title).trim() : undefined,
        content: content !== undefined ? String(content).trim() : undefined,
        audienceType: audienceType !== undefined ? audienceType : undefined,
        isPinned: isPinned !== undefined ? Boolean(isPinned) : undefined,
      },
    });

    await logAuditEvent({
      userId: user.id,
      userName: user.name,
      action: 'ANNOUNCEMENT_UPDATE',
      entityType: 'Announcement',
      entityId: id,
      oldData: existing,
      newData: updated,
      reason: `Updated announcement: ${updated.title}`,
    });

    return NextResponse.json({ success: true, announcement: updated });
  } catch (error: unknown) {
    console.error('Announcement PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update announcement' }, { status: 500 });
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
    const existing = await prisma.announcement.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
    }

    await prisma.announcement.delete({ where: { id } });

    await logAuditEvent({
      userId: user.id,
      userName: user.name,
      action: 'ANNOUNCEMENT_DELETE',
      entityType: 'Announcement',
      entityId: id,
      oldData: existing,
      reason: `Deleted announcement: ${existing.title}`,
    });

    return NextResponse.json({ success: true, message: 'Announcement deleted successfully' });
  } catch (error: unknown) {
    console.error('Announcement DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete announcement' }, { status: 500 });
  }
}
