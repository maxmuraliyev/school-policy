import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const houseId = searchParams.get('houseId');
    const grade = searchParams.get('grade');
    const className = searchParams.get('className');
    const status = searchParams.get('status') || 'ACTIVE';
    const search = searchParams.get('search');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (status !== 'ALL') {
      where.status = status;
    }
    if (houseId && houseId !== 'ALL') {
      where.houseId = houseId;
    }
    if (grade && grade !== 'ALL') {
      where.grade = parseInt(grade, 10);
    }
    if (className && className !== 'ALL') {
      where.className = className;
    }
    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { firstName: { contains: q } },
        { lastName: { contains: q } },
        { studentCode: { contains: q } },
      ];
    }

    const [total, students] = await Promise.all([
      prisma.student.count({ where }),
      prisma.student.findMany({
        where,
        include: {
          house: true,
          transactions: {
            where: { status: 'APPROVED' },
            select: { points: true },
          },
        },
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
        skip,
        take: limit,
      }),
    ]);

    const formatted = students.map((s) => ({
      id: s.id,
      studentCode: s.studentCode,
      firstName: s.firstName,
      lastName: s.lastName,
      fullName: `${s.firstName} ${s.lastName}`,
      grade: s.grade,
      className: s.className,
      houseId: s.house.id,
      houseName: s.house.name,
      houseSlug: s.house.slug,
      houseColor: s.house.primaryColor,
      photoUrl: s.photoUrl,
      bio: s.bio,
      status: s.status,
      profileVisibility: s.profileVisibility,
      totalPoints: s.transactions.reduce((sum, tx) => sum + tx.points, 0),
    }));

    return NextResponse.json({
      students: formatted,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    console.error('Students GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Please log in' }, { status: 401 });
    }

    if (!user.permissions.includes('student.create') && !user.isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to create students' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { firstName, lastName, grade, className, houseId, bio, photoUrl, profileVisibility } = body;

    if (!firstName || !lastName || !grade || !className || !houseId) {
      return NextResponse.json(
        { error: 'First name, last name, grade, class, and house are required.' },
        { status: 400 }
      );
    }

    const house = await prisma.house.findUnique({ where: { id: houseId } });
    if (!house) {
      return NextResponse.json({ error: 'House not found' }, { status: 404 });
    }

    // Generate unique studentCode
    const count = await prisma.student.count();
    const codeNum = 1000 + count + 1;
    let studentCode = `STU-${codeNum}`;
    let codeExists = await prisma.student.findUnique({ where: { studentCode } });
    let inc = 1;
    while (codeExists) {
      studentCode = `STU-${codeNum + inc}`;
      codeExists = await prisma.student.findUnique({ where: { studentCode } });
      inc++;
    }

    const student = await prisma.student.create({
      data: {
        studentCode,
        firstName: String(firstName).trim(),
        lastName: String(lastName).trim(),
        grade: parseInt(String(grade), 10),
        className: String(className).trim(),
        houseId,
        bio: bio ? String(bio).trim() : null,
        photoUrl: photoUrl ? String(photoUrl).trim() : null,
        profileVisibility: profileVisibility || 'PUBLIC',
        status: 'ACTIVE',
      },
      include: { house: true },
    });

    await logAuditEvent({
      userId: user.id,
      userName: user.name,
      action: 'STUDENT_CREATE',
      entityType: 'Student',
      entityId: student.id,
      newData: student,
      reason: `Created student ${student.firstName} ${student.lastName} (${studentCode}) assigned to ${house.name}`,
    });

    return NextResponse.json({ success: true, student });
  } catch (error: unknown) {
    console.error('Student create error:', error);
    return NextResponse.json({ error: 'Failed to create student' }, { status: 500 });
  }
}
