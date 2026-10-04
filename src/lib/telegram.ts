import prisma from '@/lib/prisma';

export interface TelegramConfig {
  botToken: string | null;
  botUsername: string | null;
  channelId: string | null;
  isEnabled: boolean;
}

/**
 * Retrieves Telegram configuration from database settings or environment variables.
 */
export async function getTelegramConfig(): Promise<TelegramConfig> {
  let dbSettings: Record<string, string> = {};
  try {
    const settingsList = await prisma.setting.findMany({
      where: {
        key: {
          in: [
            'telegram_bot_token',
            'telegram_bot_username',
            'telegram_channel_id',
            'telegram_notifications_enabled',
          ],
        },
      },
    });
    for (const item of settingsList) {
      dbSettings[item.key] = item.value;
    }
  } catch (err) {
    console.error('Failed to read Telegram settings from database:', err);
  }

  const botToken =
    dbSettings['telegram_bot_token']?.trim() ||
    process.env.TELEGRAM_BOT_TOKEN?.trim() ||
    null;

  const botUsername =
    dbSettings['telegram_bot_username']?.trim()?.replace(/^@/, '') ||
    process.env.TELEGRAM_BOT_USERNAME?.trim()?.replace(/^@/, '') ||
    null;

  const channelId =
    dbSettings['telegram_channel_id']?.trim() ||
    process.env.TELEGRAM_CHANNEL_ID?.trim() ||
    null;

  const isEnabled =
    dbSettings['telegram_notifications_enabled'] !== undefined
      ? dbSettings['telegram_notifications_enabled'] === 'true'
      : Boolean(botToken);

  return {
    botToken,
    botUsername,
    channelId,
    isEnabled: isEnabled && Boolean(botToken),
  };
}

/**
 * Sends a message via Telegram Bot API to a specific chat/user ID.
 */
export async function sendTelegramMessage(
  token: string,
  chatId: string,
  htmlText: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: htmlText,
        parse_mode: 'HTML',
        disable_web_page_preview: false,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.ok) {
      console.warn(`Telegram send failure to ${chatId}:`, data.description || 'Unknown error');
      return { success: false, error: data.description || 'Failed to send' };
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`Telegram API network exception for ${chatId}:`, msg);
    return { success: false, error: msg };
  }
}

/**
 * Broadcasts a formatted notification to all active subscribers and optional channel.
 */
export async function broadcastToSubscribers(options: {
  topic: 'POINT' | 'ANNOUNCEMENT';
  houseSlug?: string | null;
  messageHtml: string;
}) {
  try {
    const config = await getTelegramConfig();
    if (!config.isEnabled || !config.botToken) {
      return { sentCount: 0, reason: 'Telegram notifications disabled or token not set' };
    }

    // Query active subscribers with appropriate topic subscription
    const subscribers = await prisma.telegramSubscriber.findMany({
      where: {
        isActive: true,
        ...(options.topic === 'POINT' ? { subscribedToPoints: true } : {}),
        ...(options.topic === 'ANNOUNCEMENT' ? { subscribedToAnnouncements: true } : {}),
      },
    });

    let sentCount = 0;
    const recipients = new Set<string>();

    for (const sub of subscribers) {
      if (sub.chatId) recipients.add(sub.chatId);
    }

    // Include broadcast channel if configured
    if (config.channelId) {
      recipients.add(config.channelId);
    }

    for (const chatId of recipients) {
      const result = await sendTelegramMessage(config.botToken, chatId, options.messageHtml);
      if (result.success) {
        sentCount++;
      } else if (
        result.error &&
        (result.error.includes('bot was blocked') ||
          result.error.includes('user is deactivated') ||
          result.error.includes('chat not found'))
      ) {
        // Deactivate subscriber if they blocked bot or chat is invalid
        await prisma.telegramSubscriber
          .updateMany({
            where: { chatId },
            data: { isActive: false },
          })
          .catch(() => {});
      }
    }

    return { sentCount, total: recipients.size };
  } catch (err) {
    console.error('Telegram broadcast error:', err);
    return { sentCount: 0, error: String(err) };
  }
}

/**
 * Sends a rich notification when points are awarded or approved.
 */
export async function sendPointAwardedNotification(pointTx: {
  points: number;
  houseName: string;
  houseSlug?: string;
  studentName?: string | null;
  categoryName?: string;
  reason: string;
  approvedByName?: string | null;
}) {
  const sign = pointTx.points >= 0 ? '+' : '';
  const houseIcon = pointTx.houseSlug === 'astra' ? '🦅' : pointTx.houseSlug === 'terra' ? '🐺' : '🏆';

  const messageHtml = [
    `<b>${houseIcon} YANGI BALLAR / POINTS AWARDED</b>`,
    `━━━━━━━━━━━━━━━━━━`,
    `🏛 <b>House:</b> ${pointTx.houseName}`,
    `📊 <b>Ballar:</b> <code>${sign}${pointTx.points}</code> ball`,
    pointTx.studentName ? `👤 <b>O'quvchi:</b> ${pointTx.studentName}` : null,
    pointTx.categoryName ? `📂 <b>Kategoriya:</b> ${pointTx.categoryName}` : null,
    `📝 <b>Sabab:</b> ${pointTx.reason}`,
    pointTx.approvedByName ? `✅ <b>Tasdiqladi:</b> ${pointTx.approvedByName}` : null,
    `━━━━━━━━━━━━━━━━━━`,
    `Angren Ixtisoslashtirilgan Maktabi House System`,
  ]
    .filter(Boolean)
    .join('\n');

  return broadcastToSubscribers({
    topic: 'POINT',
    houseSlug: pointTx.houseSlug,
    messageHtml,
  });
}

/**
 * Sends a notification when a new school announcement is published.
 */
export async function sendAnnouncementNotification(announcement: {
  title: string;
  content: string;
  audienceType: string;
  houseName?: string | null;
  authorName: string;
}) {
  const audienceLabel =
    announcement.audienceType === 'ASTRA'
      ? 'Astra House'
      : announcement.audienceType === 'TERRA'
      ? 'Terra House'
      : "Barcha o'quvchilar / All Houses";

  // Clean snippet up to 250 characters
  const cleanContent = announcement.content
    .replace(/<[^>]*>?/gm, '')
    .trim()
    .slice(0, 250);

  const messageHtml = [
    `📢 <b>MAKTAB E'LONI / NEW ANNOUNCEMENT</b>`,
    `━━━━━━━━━━━━━━━━━━`,
    `📌 <b>${announcement.title}</b>`,
    `🎯 <b>Kimlar uchun:</b> ${audienceLabel}`,
    `✍️ <b>Muallif:</b> ${announcement.authorName}`,
    ``,
    `<i>${cleanContent}${announcement.content.length > 250 ? '...' : ''}</i>`,
    `━━━━━━━━━━━━━━━━━━`,
    `Angren Ixtisoslashtirilgan Maktabi House System`,
  ].join('\n');

  return broadcastToSubscribers({
    topic: 'ANNOUNCEMENT',
    messageHtml,
  });
}
