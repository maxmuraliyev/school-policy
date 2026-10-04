import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { generateTransactionCode } from '@/lib/points';
import { logAuditEvent } from '@/lib/audit';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Please log in' }, { status: 401 });
    }

    if (!user.permissions.includes('competition.results') && !user.isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to publish competition results' },
        { status: 403 }
      );
    }

    const { slug } = await params;
    const competition = await prisma.competition.findUnique({
      where: { slug },
      include: { category: true, season: true },
    });

    if (!competition) {
      return NextResponse.json({ error: 'Competition not found' }, { status: 404 });
    }

    const body = await req.json();
    const { results, markCompleted = true } = body;

    // results is an array of:
    // { rank: number, houseId: string, studentId?: string, teamId?: string, scoreText?: string, pointsAwarded: number, notes?: string }
    if (!Array.isArray(results) || results.length === 0) {
      return NextResponse.json({ error: 'At least one competition result is required' }, { status: 400 });
    }

    // Wrap in Prisma transaction for atomic all-or-nothing guarantee (PRD Section 100)
    const outcome = await prisma.$transaction(async (tx) => {
      // 1. Delete any existing results for this competition to allow clean updates
      await tx.competitionResult.deleteMany({
        where: { competitionId: competition.id },
      });

      const createdResults = [];
      const createdPointTransactions = [];

      for (const res of results) {
        if (!res.houseId || res.rank === undefined || res.pointsAwarded === undefined) {
          throw new Error('Each result must contain rank, houseId, and pointsAwarded');
        }

        const compResult = await tx.competitionResult.create({
          data: {
            competitionId: competition.id,
            houseId: res.houseId,
            studentId: res.studentId || null,
            teamId: res.teamId || null,
            rank: parseInt(String(res.rank), 10),
            scoreText: res.scoreText ? String(res.scoreText).trim() : null,
            pointsAwarded: parseInt(String(res.pointsAwarded), 10),
            status: 'OFFICIAL',
            notes: res.notes ? String(res.notes).trim() : null,
            verifiedById: user.id,
          },
          include: { house: true, student: true },
        });
        createdResults.push(compResult);

        // If points awarded > 0, generate an official point transaction
        if (compResult.pointsAwarded > 0) {
          const rankLabel =
            compResult.rank === 1
              ? '1st Place'
              : compResult.rank === 2
              ? '2nd Place'
              : compResult.rank === 3
              ? '3rd Place'
              : `Rank ${compResult.rank}`;

          const recipientText = compResult.student
            ? `${compResult.student.firstName} ${compResult.student.lastName}`
            : compResult.house.name;

          const txCount = await tx.pointTransaction.count();
          const code = `PT-${(100 + txCount + 1).toString().padStart(6, '0')}`;

          const pointTx = await tx.pointTransaction.create({
            data: {
              transactionCode: code,
              houseId: compResult.houseId,
              studentId: compResult.studentId,
              competitionId: competition.id,
              categoryId: competition.categoryId,
              points: compResult.pointsAwarded,
              reason: `${rankLabel} — ${competition.title}`,
              description: `Official result awarded to ${recipientText}: ${compResult.scoreText || rankLabel}`,
              createdById: user.id,
              createdByName: user.name,
              approvedById: user.isAdmin ? user.id : null,
              approvedByName: user.isAdmin ? user.name : null,
              approvedAt: user.isAdmin ? new Date() : null,
              status: user.isAdmin ? 'APPROVED' : 'PENDING',
              seasonId: competition.seasonId,
            },
          });
          createdPointTransactions.push(pointTx);
        }
      }

      // If markCompleted, update competition status to COMPLETED
      if (markCompleted) {
        await tx.competition.update({
          where: { id: competition.id },
          data: { status: 'COMPLETED' },
        });
      }

      return { createdResults, createdPointTransactions };
    });

    await logAuditEvent({
      userId: user.id,
      userName: user.name,
      action: 'COMPETITION_RESULTS_PUBLISH',
      entityType: 'Competition',
      entityId: competition.id,
      newData: {
        resultsCount: outcome.createdResults.length,
        pointsCount: outcome.createdPointTransactions.length,
      },
      reason: `Published results for competition "${competition.title}" and generated point transactions`,
    });

    return NextResponse.json({
      success: true,
      results: outcome.createdResults,
      transactions: outcome.createdPointTransactions,
    });
  } catch (error: unknown) {
    console.error('Record results error:', error);
    const msg = error instanceof Error ? error.message : 'Failed to publish results';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
