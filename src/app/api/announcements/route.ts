import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const audience = searchParams.get('audience'); // ALL, ASTRA, TERRA
    const houseId = searchParams.get('houseId');
    const user = await getSessionUser();

    const where: Record<string, unknown> = {};

    // Public visitors only see PUBLISHED
    if (!user || (!user.isAdmin && !user.isTeacher)) {
      where.status = 'PUBLISHED';
    }

    if (audience && audience !== 'ANY') {
      where.audienceType = audience;
    }

    if (houseId) {
      where.OR = [{ houseId }, { houseId: null }];
    }

    const announcements = await prisma.announcement.findMany({
      where,
      include: { house: true },
      orderBy: [{ isPinned: 'desc' }, { publishedAt: 'desc' }],
    });

    return NextResponse.json({ announcements });
  } catch (error: unknown) {
    console.error('Announcements GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Please log in' }, { status: 401 });
    }

    if (!user.permissions.includes('announcement.create') && !user.isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to post announcements' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { title, content, audienceType = 'ALL', houseId, isPinned = false } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    let slug = String(title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const existingSlug = await prisma.announcement.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const announcement = await prisma.announcement.create({
      data: {
        title: String(title).trim(),
        slug,
        content: String(content).trim(),
        audienceType,
        houseId: houseId || null,
        authorId: user.id,
        authorName: user.name,
        isPinned: Boolean(isPinned),
        status: 'PUBLISHED',
      },
      include: { house: true },
    });

    await logAuditEvent({
      userId: user.id,
      userName: user.name,
      action: 'ANNOUNCEMENT_CREATE',
      entityType: 'Announcement',
      entityId: announcement.id,
      newData: announcement,
      reason: `Created announcement "${announcement.title}" (${audienceType})`,
    });

    import('@/lib/telegram').then(({ sendAnnouncementNotification }) => {
      sendAnnouncementNotification({
        title: announcement.title,
        content: announcement.content,
        audienceType: announcement.audienceType,
        houseName: announcement.house?.name,
        authorName: announcement.authorName,
      }).catch((err) => console.error('Telegram announcement notification error:', err));
    }).catch(() => {});

    return NextResponse.json({ success: true, announcement });
  } catch (error: unknown) {
    console.error('Announcement create error:', error);
    return NextResponse.json({ error: 'Failed to create announcement' }, { status: 500 });
  }
}
