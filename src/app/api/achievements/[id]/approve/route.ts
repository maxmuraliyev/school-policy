import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { generateTransactionCode, getActiveSeason } from '@/lib/points';
import { logAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Please log in' }, { status: 401 });
    }

    if (!user.permissions.includes('achievement.approve') && !user.isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to verify achievements' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const achievement = await prisma.achievement.findUnique({
      where: { id },
      include: { student: true, house: true, category: true },
    });

    if (!achievement) {
      return NextResponse.json({ error: 'Achievement not found' }, { status: 404 });
    }

    const body = await req.json();
    const { awardPoints = 0, reject = false, rejectionReason } = body;

    if (reject) {
      const updated = await prisma.achievement.update({
        where: { id },
        data: { status: 'REJECTED' },
      });
      await logAuditEvent({
        userId: user.id,
        userName: user.name,
        action: 'ACHIEVEMENT_REJECT',
        entityType: 'Achievement',
        entityId: achievement.id,
        reason: rejectionReason || 'Did not meet verification criteria',
      });
      return NextResponse.json({ success: true, achievement: updated, message: 'Achievement rejected' });
    }

    const season = await getActiveSeason();
    const numericPoints = parseInt(String(awardPoints), 10);

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.achievement.update({
        where: { id },
        data: {
          status: 'APPROVED',
          pointsAwarded: numericPoints > 0 ? numericPoints : null,
          approvedById: user.id,
        },
      });

      let pointTx = null;
      if (numericPoints > 0 && season) {
        const count = await tx.pointTransaction.count();
        const code = `PT-${(100 + count + 1).toString().padStart(6, '0')}`;

        pointTx = await tx.pointTransaction.create({
          data: {
            transactionCode: code,
            houseId: achievement.houseId,
            studentId: achievement.studentId,
            achievementId: achievement.id,
            categoryId: achievement.categoryId,
            points: numericPoints,
            reason: `Achievement: ${achievement.title}`,
            description: `Verified external accomplishment: ${achievement.organization} (${achievement.level})`,
            createdById: user.id,
            createdByName: user.name,
            approvedById: user.id,
            approvedByName: user.name,
            approvedAt: new Date(),
            status: 'APPROVED',
            seasonId: season.id,
          },
        });
      }

      return { updated, pointTx };
    });

    await logAuditEvent({
      userId: user.id,
      userName: user.name,
      action: 'ACHIEVEMENT_APPROVE',
      entityType: 'Achievement',
      entityId: achievement.id,
      newData: { pointsAwarded: numericPoints },
      reason: `Verified achievement "${achievement.title}" and awarded ${numericPoints} points`,
    });

    return NextResponse.json({
      success: true,
      achievement: result.updated,
      pointTransaction: result.pointTx,
    });
  } catch (error: unknown) {
    console.error('Achievement approval error:', error);
    return NextResponse.json({ error: 'Failed to verify achievement' }, { status: 500 });
  }
}
