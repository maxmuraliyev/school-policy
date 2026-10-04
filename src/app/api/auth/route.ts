import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { signSessionToken, setAuthCookie, clearAuthCookie, getSessionUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username or email and password are required' },
        { status: 400 }
      );
    }

    const cleanUsername = String(username).trim();

    // Find user by username or email
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: cleanUsername },
          { email: cleanUsername.toLowerCase() },
        ],
      },
    });

    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: 'This staff account has been deactivated. Please contact an administrator.' },
        { status: 403 }
      );
    }

    // Check account lockout
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remainingMinutes = Math.ceil(
        (user.lockedUntil.getTime() - Date.now()) / (60 * 1000)
      );
      return NextResponse.json(
        {
          error: `Account is temporarily locked due to repeated failed logins. Please try again in ${remainingMinutes} minute(s).`,
        },
        { status: 423 }
      );
    }

    // Verify password
    const isValid = await bcrypt.compare(String(password), user.passwordHash);

    if (!isValid) {
      const attempts = user.failedLoginAttempts + 1;
      let lockedUntil: Date | null = null;

      if (attempts >= 5) {
        lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: attempts,
          lockedUntil,
        },
      });

      await logAuditEvent({
        userId: user.id,
        userName: user.name,
        action: 'FAILED_LOGIN',
        entityType: 'User',
        entityId: user.id,
        reason: `Failed password attempt (${attempts}/5)`,
        ipAddress: clientIp,
      });

      if (attempts >= 5) {
        return NextResponse.json(
          { error: 'Too many failed attempts. Account has been locked for 15 minutes.' },
          { status: 423 }
        );
      }

      return NextResponse.json(
        { error: `Invalid credentials. (${5 - attempts} attempts remaining before lockout)` },
        { status: 401 }
      );
    }

    // Login successful: reset failed attempts and record lastLoginAt
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      },
    });

    const token = await signSessionToken({
      userId: user.id,
      username: user.username,
      name: user.name,
      roleName: user.roleName,
      houseId: user.houseId,
    });

    await setAuthCookie(token);

    await logAuditEvent({
      userId: user.id,
      userName: user.name,
      action: 'LOGIN',
      entityType: 'User',
      entityId: user.id,
      reason: 'User logged in successfully',
      ipAddress: clientIp,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        roleName: user.roleName,
        houseId: user.houseId,
      },
    });
  } catch (error: unknown) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE() {
  await clearAuthCookie();
  return NextResponse.json({ success: true, message: 'Logged out successfully' });
}

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ user: null });
  }
  return NextResponse.json({ user });
}
