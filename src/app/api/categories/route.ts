import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            transactions: { where: { status: 'APPROVED' } },
            competitions: true,
          },
        },
      },
      orderBy: { displayOrder: 'asc' },
    });

    return NextResponse.json({ categories });
  } catch (error: unknown) {
    console.error('Categories GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || (!user.isAdmin && !user.isSuperAdmin)) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { name, description, icon = 'Award', color = '#3B82F6', displayOrder = 0 } = body;

    if (!name || !description) {
      return NextResponse.json({ error: 'Name and description are required' }, { status: 400 });
    }

    const slug = String(name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const category = await prisma.category.create({
      data: {
        name: String(name).trim(),
        slug,
        description: String(description).trim(),
        icon,
        color,
        displayOrder: parseInt(String(displayOrder), 10) || 0,
      },
    });

    await logAuditEvent({
      userId: user.id,
      userName: user.name,
      action: 'CATEGORY_CREATE',
      entityType: 'Category',
      entityId: category.id,
      newData: category,
      reason: `Created category "${category.name}"`,
    });

    return NextResponse.json({ success: true, category });
  } catch (error: unknown) {
    console.error('Category create error:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
