import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || (!user.isAdmin && !user.isSuperAdmin)) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        roleName: true,
        houseId: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const roles = await prisma.role.findMany({
      include: {
        permissions: { include: { permission: true } },
      },
    });

    return NextResponse.json({ users, roles });
  } catch (error: unknown) {
    console.error('Users GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || !user.isSuperAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: Only Super Administrator can create new staff accounts' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { username, email, password, name, roleName, houseId } = body;

    if (!username || !email || !password || !name || !roleName) {
      return NextResponse.json(
        { error: 'Username, email, password, name, and role are required' },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ username: String(username).trim() }, { email: String(email).trim().toLowerCase() }],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'A user with this username or email already exists' },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(String(password), 10);

    const newUser = await prisma.user.create({
      data: {
        username: String(username).trim(),
        email: String(email).trim().toLowerCase(),
        passwordHash,
        name: String(name).trim(),
        roleName,
        houseId: houseId || null,
        isActive: true,
      },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        roleName: true,
        houseId: true,
        isActive: true,
      },
    });

    await logAuditEvent({
      userId: user.id,
      userName: user.name,
      action: 'USER_CREATE',
      entityType: 'User',
      entityId: newUser.id,
      newData: newUser,
      reason: `Created user ${newUser.name} with role ${newUser.roleName}`,
    });

    return NextResponse.json({ success: true, user: newUser });
  } catch (error: unknown) {
    console.error('User create error:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
