import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const competition = await prisma.competition.findUnique({
      where: { slug },
      include: { participants: true },
    });

    if (!competition) {
      return NextResponse.json({ error: 'Competition not found' }, { status: 404 });
    }

    if (competition.status !== 'REGISTRATION_OPEN') {
      return NextResponse.json(
        { error: `Registration is not open for this competition (Status: ${competition.status})` },
        { status: 400 }
      );
    }

    if (
      competition.maxParticipants &&
      competition.participants.length >= competition.maxParticipants
    ) {
      return NextResponse.json(
        { error: 'Registration capacity reached for this competition' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { studentId, houseId, notes } = body;

    if (!houseId) {
      return NextResponse.json({ error: 'House ID is required' }, { status: 400 });
    }

    if (studentId) {
      const student = await prisma.student.findUnique({ where: { id: studentId } });
      if (!student) {
        return NextResponse.json({ error: 'Student not found' }, { status: 404 });
      }

      // Check if already registered
      const existing = await prisma.competitionParticipant.findFirst({
        where: { competitionId: competition.id, studentId },
      });
      if (existing) {
        return NextResponse.json(
          { error: 'Student is already registered for this competition' },
          { status: 400 }
        );
      }
    }

    const participant = await prisma.competitionParticipant.create({
      data: {
        competitionId: competition.id,
        studentId: studentId || null,
        houseId,
        notes: notes ? String(notes).trim() : null,
        status: 'CONFIRMED',
      },
      include: { student: true, house: true },
    });

    return NextResponse.json({ success: true, participant });
  } catch (error: unknown) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Failed to register' }, { status: 500 });
  }
}
