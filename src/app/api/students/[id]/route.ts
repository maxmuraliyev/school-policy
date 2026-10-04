import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        house: true,
        transactions: {
          where: { status: 'APPROVED' },
          include: { category: true, competition: true },
          orderBy: { earnedAt: 'desc' },
        },
        achievements: {
          include: { category: true },
          orderBy: { achievementDate: 'desc' },
        },
        participants: {
          include: { competition: true },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Category breakdown
    const categoryTotals: Record<string, { name: string; color: string; points: number }> = {};
    let totalPoints = 0;

    student.transactions.forEach((tx) => {
      totalPoints += tx.points;
      if (!categoryTotals[tx.category.id]) {
        categoryTotals[tx.category.id] = {
          name: tx.category.name,
          color: tx.category.color,
          points: 0,
        };
      }
      categoryTotals[tx.category.id].points += tx.points;
    });

    return NextResponse.json({
      student: {
        id: student.id,
        studentCode: student.studentCode,
        firstName: student.firstName,
        lastName: student.lastName,
        fullName: `${student.firstName} ${student.lastName}`,
        grade: student.grade,
        className: student.className,
        houseId: student.house.id,
        houseName: student.house.name,
        houseSlug: student.house.slug,
        houseColor: student.house.primaryColor,
        photoUrl: student.photoUrl,
        bio: student.bio,
        status: student.status,
        profileVisibility: student.profileVisibility,
        joinedAt: student.joinedAt,
        graduationYear: student.graduationYear,
        totalPoints,
        categoryBreakdown: Object.values(categoryTotals),
        transactions: student.transactions.map((t) => ({
          id: t.id,
          code: t.transactionCode,
          points: t.points,
          reason: t.reason,
          earnedAt: t.earnedAt,
          categoryName: t.category.name,
          categoryColor: t.category.color,
          competitionTitle: t.competition?.title || null,
        })),
        achievements: student.achievements,
        competitions: student.participants.map((p) => ({
          id: p.competition.id,
          title: p.competition.title,
          slug: p.competition.slug,
          status: p.competition.status,
          startsAt: p.competition.startsAt,
        })),
      },
    });
  } catch (error: unknown) {
    console.error('Student detail error:', error);
    return NextResponse.json({ error: 'Failed to fetch student' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Please log in' }, { status: 401 });
    }

    if (!user.permissions.includes('student.update') && !user.isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to edit students' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json();

    const student = await prisma.student.findUnique({
      where: { id },
      include: { house: true },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const {
      firstName,
      lastName,
      grade,
      className,
      houseId,
      transferReason,
      bio,
      profileVisibility,
      status,
    } = body;

    // Check if house transfer is requested
    if (houseId && houseId === student.houseId && transferReason) {
      return NextResponse.json(
        { error: 'Student is already a member of this house. Please select a different destination house.' },
        { status: 400 }
      );
    }

    const isTransfer = houseId && houseId !== student.houseId;
    if (isTransfer) {
      if (!user.permissions.includes('student.transfer') && !user.isAdmin && !user.isSuperAdmin) {
        return NextResponse.json(
          { error: 'Forbidden: You do not have permission to transfer students between houses' },
          { status: 403 }
        );
      }
      if (!transferReason || String(transferReason).trim().length < 5) {
        return NextResponse.json(
          { error: 'A mandatory reason (at least 5 characters) is required for a house transfer.' },
          { status: 400 }
        );
      }

      const newHouse = await prisma.house.findUnique({ where: { id: houseId } });
      if (!newHouse) {
        return NextResponse.json({ error: 'Target house not found' }, { status: 404 });
      }

      const updated = await prisma.student.update({
        where: { id },
        data: {
          houseId,
          firstName: firstName !== undefined ? String(firstName).trim() : undefined,
          lastName: lastName !== undefined ? String(lastName).trim() : undefined,
          grade: grade !== undefined ? parseInt(String(grade), 10) : undefined,
          className: className !== undefined ? String(className).trim() : undefined,
          bio: bio !== undefined ? String(bio).trim() : undefined,
          profileVisibility: profileVisibility !== undefined ? profileVisibility : undefined,
          status: status !== undefined ? status : undefined,
        },
        include: { house: true },
      });

      // Audit house transfer specifically (PRD Section 36)
      await logAuditEvent({
        userId: user.id,
        userName: user.name,
        action: 'STUDENT_TRANSFER',
        entityType: 'Student',
        entityId: student.id,
        oldData: { houseId: student.houseId, houseName: student.house.name },
        newData: { houseId: updated.houseId, houseName: updated.house.name },
        reason: transferReason,
      });

      return NextResponse.json({ success: true, student: updated, message: 'Student transferred successfully' });
    }

    // Restore archived student to active status
    const isRestoring = status === 'ACTIVE' && student.status === 'ARCHIVED';

    // Normal student update
    const updated = await prisma.student.update({
      where: { id },
      data: {
        firstName: firstName !== undefined ? String(firstName).trim() : undefined,
        lastName: lastName !== undefined ? String(lastName).trim() : undefined,
        grade: grade !== undefined ? parseInt(String(grade), 10) : undefined,
        className: className !== undefined ? String(className).trim() : undefined,
        bio: bio !== undefined ? String(bio).trim() : undefined,
        profileVisibility: profileVisibility !== undefined ? profileVisibility : undefined,
        status: status !== undefined ? status : undefined,
        archivedAt: isRestoring ? null : undefined,
      },
      include: { house: true },
    });

    await logAuditEvent({
      userId: user.id,
      userName: user.name,
      action: isRestoring ? 'STUDENT_RESTORE' : 'STUDENT_UPDATE',
      entityType: 'Student',
      entityId: student.id,
      oldData: student,
      newData: updated,
      reason: isRestoring
        ? `Restored student ${student.firstName} ${student.lastName} from archive`
        : `Updated student ${student.firstName} ${student.lastName}`,
    });

    return NextResponse.json({
      success: true,
      student: updated,
      message: isRestoring ? 'Student restored to active roster' : 'Student updated successfully',
    });
  } catch (error: unknown) {
    console.error('Student update error:', error);
    return NextResponse.json({ error: 'Failed to update student' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Please log in' }, { status: 401 });
    }

    if (!user.permissions.includes('student.archive') && !user.isAdmin && !user.isSuperAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to archive students' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const student = await prisma.student.findUnique({ where: { id } });
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Soft delete per PRD Section 42
    const archived = await prisma.student.update({
      where: { id },
      data: {
        status: 'ARCHIVED',
        archivedAt: new Date(),
      },
    });

    await logAuditEvent({
      userId: user.id,
      userName: user.name,
      action: 'STUDENT_ARCHIVE',
      entityType: 'Student',
      entityId: student.id,
      oldData: { status: student.status },
      newData: { status: 'ARCHIVED', archivedAt: archived.archivedAt },
      reason: `Archived student ${student.firstName} ${student.lastName} (${student.studentCode})`,
    });

    return NextResponse.json({ success: true, message: 'Student archived successfully' });
  } catch (error: unknown) {
    console.error('Student delete error:', error);
    return NextResponse.json({ error: 'Failed to archive student' }, { status: 500 });
  }
}
