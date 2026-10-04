import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { toCSV } from '@/lib/csv';

export async function GET() {
  try {
    const students = await prisma.student.findMany({
      include: {
        house: true,
        transactions: {
          where: { status: 'APPROVED' },
          select: { points: true },
        },
      },
      orderBy: [{ house: { name: 'asc' } }, { lastName: 'asc' }],
    });

    const headers = [
      'student_code',
      'first_name',
      'last_name',
      'grade',
      'class',
      'house',
      'status',
      'total_points',
    ];

    const rows = students.map((s) => {
      const totalPoints = s.transactions.reduce((sum, tx) => sum + tx.points, 0);
      return [
        s.studentCode,
        s.firstName,
        s.lastName,
        s.grade,
        s.className,
        s.house.name,
        s.status,
        totalPoints,
      ];
    });

    const csvString = toCSV(headers, rows);

    return new NextResponse(csvString, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="students_roster_export.csv"',
      },
    });
  } catch (error: unknown) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Failed to export students' }, { status: 500 });
  }
}
