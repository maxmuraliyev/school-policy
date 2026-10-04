import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function GET() {
  try {
    const settings = await prisma.setting.findMany();
    const seasons = await prisma.season.findMany({ orderBy: { startsAt: 'desc' } });
    return NextResponse.json({ settings, seasons });
  } catch (error: unknown) {
    console.error('Settings GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || (!user.isAdmin && !user.isSuperAdmin)) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { settingsUpdates, finalizeSeasonId, winningHouseId } = body;

    // Handle Season Finalization (PRD Section 81: House Cup Declaration)
    if (finalizeSeasonId && winningHouseId) {
      if (!user.isAdmin && !user.isSuperAdmin) {
        return NextResponse.json(
          { error: 'Forbidden: Administrator credentials required to finalize an annual season' },
          { status: 403 }
        );
      }

      const season = await prisma.season.findUnique({ where: { id: finalizeSeasonId } });
      const house = await prisma.house.findUnique({ where: { id: winningHouseId } });

      if (!season || !house) {
        return NextResponse.json({ error: 'Season or House not found' }, { status: 404 });
      }

      const finalized = await prisma.season.update({
        where: { id: finalizeSeasonId },
        data: {
          status: 'ARCHIVED',
          winningHouseId,
        },
      });

      await logAuditEvent({
        userId: user.id,
        userName: user.name,
        action: 'SEASON_FINALIZE_HOUSE_CUP',
        entityType: 'Season',
        entityId: season.id,
        newData: { status: 'ARCHIVED', winningHouse: house.name },
        reason: `Finalized House Cup for ${season.name}. Official Winner: ${house.name}!`,
      });

      return NextResponse.json({
        success: true,
        message: `Season ${season.name} finalized. ${house.name} declared House Cup Winner!`,
        season: finalized,
      });
    }

    // Update settings key-value items
    if (Array.isArray(settingsUpdates)) {
      for (const update of settingsUpdates) {
        if (update.key && update.value !== undefined) {
          await prisma.setting.upsert({
            where: { key: update.key },
            update: { value: String(update.value) },
            create: {
              key: update.key,
              value: String(update.value),
              description: update.description || '',
              category: update.category || 'general',
            },
          });
        }
      }

      await logAuditEvent({
        userId: user.id,
        userName: user.name,
        action: 'SETTINGS_UPDATE',
        entityType: 'Setting',
        newData: settingsUpdates,
        reason: 'Updated system settings',
      });
    }

    return NextResponse.json({ success: true, message: 'Settings updated successfully' });
  } catch (error: unknown) {
    console.error('Settings update error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
