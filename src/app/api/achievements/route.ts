import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'APPROVED';
    const houseId = searchParams.get('houseId');
    const categoryId = searchParams.get('categoryId');

    const where: Record<string, unknown> = {};
    if (status !== 'ALL') {
      where.status = status;
    }
    if (houseId && houseId !== 'ALL') {
      where.houseId = houseId;
    }
    if (categoryId && categoryId !== 'ALL') {
      where.categoryId = categoryId;
    }

    const achievements = await prisma.achievement.findMany({
      where,
      include: {
        student: { include: { house: true } },
        house: true,
        category: true,
      },
      orderBy: { achievementDate: 'desc' },
    });

    return NextResponse.json({ achievements });
  } catch (error: unknown) {
    console.error('Achievements GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch achievements' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Please log in' }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      description,
      studentId,
      houseId,
      categoryId,
      level,
      organization,
      achievementDate,
      evidenceUrl,
    } = body;

    if (!title || !description || !studentId || !categoryId || !achievementDate) {
      return NextResponse.json(
        { error: 'Title, description, student, category, and achievement date are required.' },
        { status: 400 }
      );
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { house: true },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const targetHouseId = houseId || student.houseId;

    const achievement = await prisma.achievement.create({
      data: {
        title: String(title).trim(),
        description: String(description).trim(),
        studentId,
        houseId: targetHouseId,
        categoryId,
        level: level || 'SCHOOL',
        organization: organization ? String(organization).trim() : 'School Department',
        achievementDate: new Date(achievementDate),
        evidenceUrl: evidenceUrl ? String(evidenceUrl).trim() : null,
        status: user.isAdmin ? 'APPROVED' : 'PENDING',
        approvedById: user.isAdmin ? user.id : null,
      },
      include: { student: true, house: true, category: true },
    });

    await logAuditEvent({
      userId: user.id,
      userName: user.name,
      action: 'ACHIEVEMENT_SUBMIT',
      entityType: 'Achievement',
      entityId: achievement.id,
      newData: achievement,
      reason: `Submitted achievement "${achievement.title}" for ${student.firstName} ${student.lastName}`,
    });

    return NextResponse.json({ success: true, achievement });
  } catch (error: unknown) {
    console.error('Achievement create error:', error);
    return NextResponse.json({ error: 'Failed to submit achievement' }, { status: 500 });
  }
}
