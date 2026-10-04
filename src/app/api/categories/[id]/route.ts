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
    if (!user || (!user.isAdmin && !user.isSuperAdmin)) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { name, description, color, icon } = body;

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        name: name !== undefined ? String(name).trim() : undefined,
        description: description !== undefined ? String(description).trim() : undefined,
        color: color !== undefined ? String(color).trim() : undefined,
        icon: icon !== undefined ? String(icon).trim() : undefined,
      },
    });

    await logAuditEvent({
      userId: user.id,
      userName: user.name,
      action: 'CATEGORY_UPDATE',
      entityType: 'Category',
      entityId: id,
      oldData: existing,
      newData: updated,
      reason: `Updated category ${updated.name}`,
    });

    return NextResponse.json({ success: true, category: updated });
  } catch (error: unknown) {
    console.error('Category PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user || (!user.isAdmin && !user.isSuperAdmin)) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { id } = await params;
    const existing = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { transactions: true, competitions: true },
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // If transactions or competitions exist, soft-delete by deactivating
    if (existing._count.transactions > 0 || existing._count.competitions > 0) {
      await prisma.category.update({
        where: { id },
        data: { isActive: false },
      });
    } else {
      await prisma.scoringRule.deleteMany({ where: { categoryId: id } });
      await prisma.category.delete({ where: { id } });
    }

    await logAuditEvent({
      userId: user.id,
      userName: user.name,
      action: 'CATEGORY_DELETE',
      entityType: 'Category',
      entityId: id,
      oldData: existing,
      reason: `Deleted/deactivated category ${existing.name}`,
    });

    return NextResponse.json({ success: true, message: 'Category removed successfully' });
  } catch (error: unknown) {
    console.error('Category DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
