import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { reverseTransaction } from '@/lib/points';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Please log in' }, { status: 401 });
    }

    if (!user.permissions.includes('point.reverse') && !user.isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to reverse points' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const reason = body?.reason ? String(body.reason).trim() : '';

    if (!reason || reason.length < 5) {
      return NextResponse.json(
        { error: 'A clear explanation (at least 5 characters) is required to reverse a transaction.' },
        { status: 400 }
      );
    }

    const reversalTx = await reverseTransaction(id, { id: user.id, name: user.name }, reason);

    return NextResponse.json({
      success: true,
      message: 'Transaction successfully reversed with auditable counter-entry',
      reversalTransaction: reversalTx,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to reverse transaction';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
