import prisma from './prisma';

export interface AuditLogParams {
  userId?: string | null;
  userName: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  oldData?: unknown;
  newData?: unknown;
  reason?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export async function logAuditEvent({
  userId,
  userName,
  action,
  entityType,
  entityId,
  oldData,
  newData,
  reason,
  ipAddress,
  userAgent,
}: AuditLogParams) {
  try {
    let validUserId: string | null = null;
    if (userId) {
      const existingUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
      });
      if (existingUser) validUserId = existingUser.id;
    }

    await prisma.auditLog.create({
      data: {
        userId: validUserId,
        userName,
        action,
        entityType,
        entityId: entityId ? String(entityId) : null,
        oldData: oldData ? (typeof oldData === 'string' ? oldData : JSON.stringify(oldData)) : null,
        newData: newData ? (typeof newData === 'string' ? newData : JSON.stringify(newData)) : null,
        reason,
        ipAddress: ipAddress || '127.0.0.1',
        userAgent,
      },
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
}
