import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { rejectTransaction } from '@/lib/points';

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
        { error: 'Forbidden: You do not have permission to review points' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const reason = body?.reason ? String(body.reason).trim() : 'Does not meet scoring criteria';

    const updated = await rejectTransaction(id, { id: user.id, name: user.name }, reason);

    return NextResponse.json({
      success: true,
      message: 'Transaction rejected',
      transaction: updated,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to reject transaction';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
