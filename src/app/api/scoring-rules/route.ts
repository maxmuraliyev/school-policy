import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function GET() {
  try {
    const rules = await prisma.scoringRule.findMany({
      include: { category: true },
      orderBy: { defaultPoints: 'desc' },
    });
    return NextResponse.json({ scoringRules: rules });
  } catch (error: unknown) {
    console.error('Scoring rules GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch scoring rules' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || (!user.isAdmin && !user.isSuperAdmin)) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { name, level = 'SCHOOL', place = 'CUSTOM', defaultPoints, description, categoryId } = body;

    if (!name || defaultPoints === undefined) {
      return NextResponse.json({ error: 'Name and default points are required' }, { status: 400 });
    }

    const rule = await prisma.scoringRule.create({
      data: {
        name: String(name).trim(),
        level,
        place,
        defaultPoints: parseInt(String(defaultPoints), 10),
        description: description ? String(description).trim() : null,
        categoryId: categoryId || null,
      },
      include: { category: true },
    });

    await logAuditEvent({
      userId: user.id,
      userName: user.name,
      action: 'SCORING_RULE_CREATE',
      entityType: 'ScoringRule',
      entityId: rule.id,
      newData: rule,
      reason: `Created scoring rule "${rule.name}" (${rule.defaultPoints} pts)`,
    });

    return NextResponse.json({ success: true, scoringRule: rule });
  } catch (error: unknown) {
    console.error('Scoring rule create error:', error);
    return NextResponse.json({ error: 'Failed to create scoring rule' }, { status: 500 });
  }
}
