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
    const { name, level, defaultPoints, description } = body;

    const existing = await prisma.scoringRule.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Scoring rule not found' }, { status: 404 });
    }

    const updated = await prisma.scoringRule.update({
      where: { id },
      data: {
        name: name !== undefined ? String(name).trim() : undefined,
        level: level !== undefined ? String(level).trim() : undefined,
        defaultPoints: defaultPoints !== undefined ? parseInt(String(defaultPoints), 10) : undefined,
        description: description !== undefined ? String(description).trim() : undefined,
      },
    });

    await logAuditEvent({
      userId: user.id,
      userName: user.name,
      action: 'SCORING_RULE_UPDATE',
      entityType: 'ScoringRule',
      entityId: id,
      oldData: existing,
      newData: updated,
      reason: `Updated scoring rule ${updated.name}`,
    });

    return NextResponse.json({ success: true, scoringRule: updated });
  } catch (error: unknown) {
    console.error('Scoring rule PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update scoring rule' }, { status: 500 });
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
    const existing = await prisma.scoringRule.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Scoring rule not found' }, { status: 404 });
    }

    await prisma.scoringRule.delete({ where: { id } });

    await logAuditEvent({
      userId: user.id,
      userName: user.name,
      action: 'SCORING_RULE_DELETE',
      entityType: 'ScoringRule',
      entityId: id,
      oldData: existing,
      reason: `Deleted scoring rule ${existing.name}`,
    });

    return NextResponse.json({ success: true, message: 'Scoring rule deleted successfully' });
  } catch (error: unknown) {
    console.error('Scoring rule DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete scoring rule' }, { status: 500 });
  }
}
