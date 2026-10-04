import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import prisma from './prisma';

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'school-house-system-secret-key-2026-fallback-dev'
);

const COOKIE_NAME = 'shs_auth_session';

export interface TokenPayload {
  userId: string;
  username: string;
  name: string;
  roleName: string;
  houseId?: string | null;
}

export async function signSessionToken(payload: TokenPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET_KEY);
}

export async function verifySessionToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSessionUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = await verifySessionToken(token);
    if (!payload?.userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: payload.userId, isActive: true },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        roleName: true,
        houseId: true,
      },
    });

    if (!user) return null;

    // Get user permissions via Role
    const roleWithPerms = await prisma.role.findUnique({
      where: { name: user.roleName },
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    });

    const permissions = roleWithPerms?.permissions.map((rp) => rp.permission.code) || [];

    return {
      ...user,
      permissions,
      isSuperAdmin: user.roleName === 'SUPER_ADMIN',
      isAdmin: user.roleName === 'SUPER_ADMIN' || user.roleName === 'ADMIN',
      isTeacher: user.roleName === 'TEACHER' || user.roleName === 'HOUSE_MENTOR',
    };
  } catch {
    return null;
  }
}

export async function checkPermission(permissionCode: string): Promise<boolean> {
  const user = await getSessionUser();
  if (!user) return false;
  if (user.roleName === 'SUPER_ADMIN') return true;
  return user.permissions.includes(permissionCode);
}
