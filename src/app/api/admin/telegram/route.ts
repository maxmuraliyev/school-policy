import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { getTelegramConfig, sendTelegramMessage, broadcastToSubscribers } from '@/lib/telegram';
import { logAuditEvent } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');

    const where: Record<string, unknown> = {};
    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { chatId: { contains: q } },
        { telegramUsername: { contains: q } },
        { name: { contains: q } },
      ];
    }

    const [subscribers, total, config] = await Promise.all([
      prisma.telegramSubscriber.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.telegramSubscriber.count({ where }),
      getTelegramConfig(),
    ]);

    return NextResponse.json({
      subscribers,
      total,
      config: {
        botUsername: config.botUsername,
        channelId: config.channelId,
        isEnabled: config.isEnabled,
        hasBotToken: Boolean(config.botToken),
      },
    });
  } catch (error) {
    console.error('Admin telegram GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch telegram data' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, targetChatId, messageText } = body;

    const config = await getTelegramConfig();
    if (!config.botToken) {
      return NextResponse.json(
        { error: 'Telegram Bot Token is not configured yet. Please configure it in settings.' },
        { status: 400 }
      );
    }

    if (action === 'TEST_PING') {
      const target = targetChatId || config.channelId;
      if (!target) {
        return NextResponse.json(
          { error: 'Please specify a target chat ID or configure a channel ID' },
          { status: 400 }
        );
      }

      const testMsg = [
        `🔔 <b>TEST BILDIRISHNOMA / TEST PING</b>`,
        `━━━━━━━━━━━━━━━━━━`,
        `Bu Angren Ixtisoslashtirilgan Maktabi House System botining sinov xabaridir.`,
        `✅ Telegram Bot ulanishi muvaffaqiyatli ishlamoqda!`,
        `⏱ Vaqt: ${new Date().toLocaleString()}`,
        `━━━━━━━━━━━━━━━━━━`,
      ].join('\n');

      const res = await sendTelegramMessage(config.botToken, target, testMsg);
      if (!res.success) {
        return NextResponse.json({ error: res.error || 'Failed to send test message' }, { status: 400 });
      }

      return NextResponse.json({ success: true, message: 'Test message sent successfully!' });
    }

    if (action === 'BROADCAST_CUSTOM') {
      if (!messageText) {
        return NextResponse.json({ error: 'Message text is required' }, { status: 400 });
      }

      const formatted = [
        `📢 <b>MAKTAB XABARNOMASI / SCHOOL BROADCAST</b>`,
        `━━━━━━━━━━━━━━━━━━`,
        messageText,
        `━━━━━━━━━━━━━━━━━━`,
        `Angren Ixtisoslashtirilgan Maktabi House System`,
      ].join('\n');

      const res = await broadcastToSubscribers({
        topic: 'ANNOUNCEMENT',
        messageHtml: formatted,
      });

      return NextResponse.json({ success: true, ...res });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Admin telegram POST error:', error);
    return NextResponse.json({ error: 'Failed to execute telegram action' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { botToken, botUsername, channelId, isEnabled } = body;

    const updates: Array<{ key: string; value: string; description: string }> = [];

    if (botToken !== undefined) {
      updates.push({
        key: 'telegram_bot_token',
        value: String(botToken).trim(),
        description: 'Telegram Bot API Token',
      });
    }
    if (botUsername !== undefined) {
      updates.push({
        key: 'telegram_bot_username',
        value: String(botUsername).trim().replace(/^@/, ''),
        description: 'Telegram Bot Username handle',
      });
    }
    if (channelId !== undefined) {
      updates.push({
        key: 'telegram_channel_id',
        value: String(channelId).trim(),
        description: 'Telegram Channel or Group ID for notifications',
      });
    }
    if (isEnabled !== undefined) {
      updates.push({
        key: 'telegram_notifications_enabled',
        value: isEnabled ? 'true' : 'false',
        description: 'Enable or disable Telegram bot alerts',
      });
    }

    for (const item of updates) {
      await prisma.setting.upsert({
        where: { key: item.key },
        update: { value: item.value, description: item.description, category: 'telegram' },
        create: { key: item.key, value: item.value, description: item.description, category: 'telegram' },
      });
    }

    await logAuditEvent({
      userId: user.id,
      userName: user.name,
      action: 'SETTING_UPDATE',
      entityType: 'Setting',
      reason: 'Updated Telegram Bot and notification configurations',
    });

    return NextResponse.json({ success: true, message: 'Telegram settings saved successfully' });
  } catch (error) {
    console.error('Admin telegram PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update telegram settings' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Subscriber ID is required' }, { status: 400 });
    }

    await prisma.telegramSubscriber.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Subscriber removed' });
  } catch (error) {
    console.error('Admin telegram DELETE subscriber error:', error);
    return NextResponse.json({ error: 'Failed to delete subscriber' }, { status: 500 });
  }
}
