import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getTelegramConfig, sendTelegramMessage } from '@/lib/telegram';

export async function GET() {
  try {
    const config = await getTelegramConfig();
    const count = await prisma.telegramSubscriber.count({
      where: { isActive: true },
    });

    return NextResponse.json({
      botUsername: config.botUsername,
      isEnabled: config.isEnabled,
      channelConfigured: Boolean(config.channelId),
      activeSubscribersCount: count,
    });
  } catch (error) {
    console.error('Error fetching Telegram info:', error);
    return NextResponse.json({ error: 'Failed to retrieve telegram info' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let {
      telegramUsername,
      chatId,
      name,
      subscribedToPoints = true,
      subscribedToAnnouncements = true,
    } = body;

    // Sanitize input
    if (telegramUsername) {
      telegramUsername = String(telegramUsername).trim().replace(/^@/, '');
    }

    if (chatId) {
      chatId = String(chatId).trim();
    } else if (telegramUsername) {
      // Fallback: if user only supplied their handle, prefix with @
      chatId = `@${telegramUsername}`;
    }

    if (!chatId) {
      return NextResponse.json(
        { error: 'Telegram foydalanuvchi nomi yoki Chat ID kiritilishi shart' },
        { status: 400 }
      );
    }

    const subscriber = await prisma.telegramSubscriber.upsert({
      where: { chatId },
      update: {
        telegramUsername: telegramUsername || null,
        name: name ? String(name).trim() : null,
        subscribedToPoints: Boolean(subscribedToPoints),
        subscribedToAnnouncements: Boolean(subscribedToAnnouncements),
        isActive: true,
      },
      create: {
        chatId,
        telegramUsername: telegramUsername || null,
        name: name ? String(name).trim() : null,
        subscribedToPoints: Boolean(subscribedToPoints),
        subscribedToAnnouncements: Boolean(subscribedToAnnouncements),
        isActive: true,
      },
    });

    // Attempt to send an instant welcome verification ping if bot is configured
    const config = await getTelegramConfig();
    let welcomeSent = false;
    if (config.botToken && config.isEnabled) {
      const welcomeMsg = [
        `🎉 <b>TABRIKLAYMIZ! OBUNA MUVOFAQIYATLI</b>`,
        `━━━━━━━━━━━━━━━━━━`,
        `Siz <b>Angren Ixtisoslashtirilgan Maktabi</b> House System bildirishnomalariga muvaffaqiyatli obuna bo'ldingiz!`,
        ``,
        `🔔 <b>Sozlamalaringiz:</b>`,
        `• Yangi ballar: ${subscribedToPoints ? '✅ Yoqilgan' : '❌ O\'chirilgan'}`,
        `• Maktab e'lonlari: ${subscribedToAnnouncements ? '✅ Yoqilgan' : '❌ O\'chirilgan'}`,
        `━━━━━━━━━━━━━━━━━━`,
        `<i>Astra vs Terra jonli bellashuvini biz bilan kuzatib boring!</i>`,
      ].join('\n');

      const sendRes = await sendTelegramMessage(config.botToken, chatId, welcomeMsg);
      welcomeSent = sendRes.success;
    }

    return NextResponse.json({
      success: true,
      subscriber,
      welcomeSent,
      message: 'Muvaffaqiyatli obuna bo\'lindi!',
    });
  } catch (error) {
    console.error('Telegram subscribe error:', error);
    return NextResponse.json({ error: 'Obuna bo\'lishda xatolik yuz berdi' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const chatId = searchParams.get('chatId');

    if (!chatId) {
      return NextResponse.json({ error: 'Chat ID required' }, { status: 400 });
    }

    await prisma.telegramSubscriber.updateMany({
      where: { chatId },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true, message: 'Obuna bekor qilindi' });
  } catch (error) {
    console.error('Telegram unsubscribe error:', error);
    return NextResponse.json({ error: 'Failed to unsubscribe' }, { status: 500 });
  }
}
