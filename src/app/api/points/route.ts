import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { generateTransactionCode, getActiveSeason, invalidateScoreCache } from '@/lib/points';
import { logAuditEvent } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const houseId = searchParams.get('houseId');
    const categoryId = searchParams.get('categoryId');
    const studentId = searchParams.get('studentId');
    const search = searchParams.get('search');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (status && status !== 'ALL') {
      where.status = status;
    }
    if (houseId && houseId !== 'ALL') {
      where.houseId = houseId;
    }
    if (categoryId && categoryId !== 'ALL') {
      where.categoryId = categoryId;
    }
    if (studentId) {
      where.studentId = studentId;
    }
    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { reason: { contains: q } },
        { transactionCode: { contains: q } },
        { description: { contains: q } },
        { student: { firstName: { contains: q } } },
        { student: { lastName: { contains: q } } },
      ];
    }

    const [total, transactions] = await Promise.all([
      prisma.pointTransaction.count({ where }),
      prisma.pointTransaction.findMany({
        where,
        include: {
          house: true,
          category: true,
          student: true,
          competition: true,
          achievement: true,
          reversalOf: true,
          reversedBy: true,
        },
        orderBy: { earnedAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      transactions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    console.error('Points GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch points' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Please log in' }, { status: 401 });
    }

    if (!user.permissions.includes('point.create') && !user.isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to submit point requests' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      houseId,
      points,
      reason,
      categoryId,
      studentId,
      competitionId,
      achievementId,
      description,
      evidenceUrl,
      internalNotes,
      directApprove,
    } = body;

    if (!houseId || points === undefined || !reason || !categoryId) {
      return NextResponse.json(
        { error: 'Missing required fields: houseId, points, reason, and categoryId are required.' },
        { status: 400 }
      );
    }

    const numericPoints = parseInt(String(points), 10);
    if (isNaN(numericPoints) || numericPoints === 0) {
      return NextResponse.json(
        { error: 'Points must be a non-zero integer.' },
        { status: 400 }
      );
    }

    const house = await prisma.house.findUnique({ where: { id: houseId } });
    if (!house) {
      return NextResponse.json({ error: 'House not found' }, { status: 404 });
    }

    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    if (studentId) {
      const student = await prisma.student.findUnique({ where: { id: studentId } });
      if (!student) {
        return NextResponse.json({ error: 'Student not found' }, { status: 404 });
      }
      if (student.houseId !== houseId) {
        return NextResponse.json(
          { error: `Student belongs to a different house. Expected: ${house.name}` },
          { status: 400 }
        );
      }
    }

    const season = await getActiveSeason();
    if (!season) {
      return NextResponse.json({ error: 'No active academic season configured.' }, { status: 400 });
    }

    const code = await generateTransactionCode();

    // Check if user is admin and wants to approve immediately
    let initialStatus = 'PENDING';
    let approvedByName: string | null = null;
    let approvedById: string | null = null;
    let approvedAt: Date | null = null;

    if (directApprove && user.isAdmin) {
      initialStatus = 'APPROVED';
      approvedByName = user.name;
      approvedById = user.id;
      approvedAt = new Date();
    }

    const transaction = await prisma.pointTransaction.create({
      data: {
        transactionCode: code,
        houseId,
        studentId: studentId || null,
        competitionId: competitionId || null,
        achievementId: achievementId || null,
        categoryId,
        points: numericPoints,
        reason: String(reason).trim(),
        description: description ? String(description).trim() : null,
        evidenceUrl: evidenceUrl ? String(evidenceUrl).trim() : null,
        internalNotes: internalNotes ? String(internalNotes).trim() : null,
        createdById: user.id,
        createdByName: user.name,
        approvedById,
        approvedByName,
        approvedAt,
        status: initialStatus,
        seasonId: season.id,
      },
      include: {
        house: true,
        category: true,
        student: true,
      },
    });

    invalidateScoreCache();

    await logAuditEvent({
      userId: user.id,
      userName: user.name,
      action: 'POINT_CREATE',
      entityType: 'PointTransaction',
      entityId: transaction.id,
      newData: transaction,
      reason: `Submitted ${numericPoints} points for ${house.name}: ${reason} [Status: ${initialStatus}]`,
    });

    return NextResponse.json({ success: true, transaction });
  } catch (error: unknown) {
    console.error('Point creation error:', error);
    return NextResponse.json({ error: 'Failed to create point transaction' }, { status: 500 });
  }
}
