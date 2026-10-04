import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { parseCSV } from '@/lib/csv';
import { logAuditEvent } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Please log in' }, { status: 401 });
    }

    if (!user.permissions.includes('student.create') && !user.isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to import students' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { csvContent, dryRun = false } = body;

    if (!csvContent || typeof csvContent !== 'string') {
      return NextResponse.json({ error: 'CSV content string is required' }, { status: 400 });
    }

    const { headers, rows } = parseCSV(csvContent);

    // Validate expected columns
    const hasFirstName = headers.includes('first_name') || headers.includes('firstname');
    const hasLastName = headers.includes('last_name') || headers.includes('lastname');
    const hasGrade = headers.includes('grade');
    const hasClass = headers.includes('class') || headers.includes('class_name');
    const hasHouse = headers.includes('house') || headers.includes('house_name');

    if (!hasFirstName || !hasLastName || !hasGrade || !hasClass || !hasHouse) {
      return NextResponse.json(
        {
          error:
            'Invalid CSV format. Missing required columns. Required headers: first_name, last_name, grade, class, house',
        },
        { status: 400 }
      );
    }

    const houses = await prisma.house.findMany();
    const houseMap = new Map<string, string>();
    houses.forEach((h) => {
      houseMap.set(h.name.toLowerCase(), h.id);
      houseMap.set(h.shortName.toLowerCase(), h.id);
      houseMap.set(h.slug.toLowerCase(), h.id);
    });

    const errors: { row: number; reason: string }[] = [];
    const validRows: {
      firstName: string;
      lastName: string;
      grade: number;
      className: string;
      houseId: string;
      bio?: string;
    }[] = [];

    rows.forEach((row, idx) => {
      const rowNum = idx + 2; // account for header line
      const fn = row['first_name'] || row['firstname'];
      const ln = row['last_name'] || row['lastname'];
      const gr = row['grade'];
      const cl = row['class'] || row['class_name'];
      const hs = (row['house'] || row['house_name'] || '').toLowerCase();

      if (!fn) {
        errors.push({ row: rowNum, reason: 'Missing first name' });
        return;
      }
      if (!ln) {
        errors.push({ row: rowNum, reason: 'Missing last name' });
        return;
      }
      const gradeNum = parseInt(gr, 10);
      if (isNaN(gradeNum) || gradeNum < 1 || gradeNum > 13) {
        errors.push({ row: rowNum, reason: `Invalid grade value: "${gr}"` });
        return;
      }
      if (!cl) {
        errors.push({ row: rowNum, reason: 'Missing class name' });
        return;
      }
      const houseId = houseMap.get(hs);
      if (!houseId) {
        errors.push({
          row: rowNum,
          reason: `Unrecognized house: "${hs}". Supported: Astra, Terra`,
        });
        return;
      }

      validRows.push({
        firstName: fn,
        lastName: ln,
        grade: gradeNum,
        className: cl,
        houseId,
        bio: row['bio'] || undefined,
      });
    });

    // If dry run, return preview and validation results without inserting
    if (dryRun) {
      return NextResponse.json({
        dryRun: true,
        totalRows: rows.length,
        validCount: validRows.length,
        errorCount: errors.length,
        errors,
        preview: validRows.slice(0, 10),
      });
    }

    // If actual import, execute bulk creation
    let importedCount = 0;
    const currentCount = await prisma.student.count();

    for (let i = 0; i < validRows.length; i++) {
      const vr = validRows[i];
      const code = `STU-${1000 + currentCount + i + 1}`;

      await prisma.student.create({
        data: {
          studentCode: code,
          firstName: vr.firstName,
          lastName: vr.lastName,
          grade: vr.grade,
          className: vr.className,
          houseId: vr.houseId,
          bio: vr.bio || null,
          status: 'ACTIVE',
        },
      });
      importedCount++;
    }

    await logAuditEvent({
      userId: user.id,
      userName: user.name,
      action: 'STUDENTS_BULK_IMPORT',
      entityType: 'Student',
      newData: { importedCount, errorCount: errors.length },
      reason: `Bulk imported ${importedCount} students via CSV`,
    });

    return NextResponse.json({
      success: true,
      importedCount,
      errorCount: errors.length,
      errors,
    });
  } catch (error: unknown) {
    console.error('Import error:', error);
    return NextResponse.json({ error: 'Failed to process import' }, { status: 500 });
  }
}
