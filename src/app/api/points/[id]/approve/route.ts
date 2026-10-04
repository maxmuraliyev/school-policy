import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { approveTransaction } from '@/lib/points';

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

    if (!user.permissions.includes('point.approve') && !user.isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to approve points' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const updated = await approveTransaction(id, { id: user.id, name: user.name });

    return NextResponse.json({
      success: true,
      message: 'Transaction approved successfully',
      transaction: updated,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to approve transaction';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
