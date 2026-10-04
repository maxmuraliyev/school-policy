'use client';

import React, { useState } from 'react';
import { Send, Bell, Sparkles } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import TelegramSubscribeModal from './TelegramSubscribeModal';

export default function TelegramBanner() {
  const { lang } = useLanguage();
  const isUz = lang === 'uz';
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl border border-[#0088cc]/30 bg-gradient-to-r from-[#0088cc]/10 via-[#0088cc]/5 to-transparent p-5 sm:p-6 backdrop-blur-md">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#0088cc]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#0088cc]/15 border border-[#0088cc]/30 flex items-center justify-center text-[#0088cc] shrink-0 shadow-lg shadow-[#0088cc]/10">
              <Send size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#0088cc]/20 text-[#0088cc] border border-[#0088cc]/30">
                  Telegram Bot
                </span>
                <span className="text-xs text-zinc-400 font-medium">
                  {isUz ? 'Jonli bildirishnomalar' : 'Live alerts'}
                </span>
              </div>
              <h4 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {isUz
                  ? "Barcha yangi ballar va e'lonlar Telegramingizda!"
                  : 'Get all house points & announcements directly on Telegram!'}
              </h4>
              <p className="text-xs sm:text-sm text-zinc-400 mt-0.5 max-w-xl">
                {isUz
                  ? "Astra va Terra bellashuvlarini bir zumda kuzatib boring. Har safar yangi ball berilganda xabar oling."
                  : 'Track the Astra vs Terra clash in real time. Get notified whenever new points are awarded or announcements are posted.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="w-full sm:w-auto px-5 py-2.5 bg-[#0088cc] hover:bg-[#0077b3] text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-[#0088cc]/20 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <Send size={16} />
            <span>{isUz ? "Telegram'da obuna bo'lish" : 'Subscribe on Telegram'}</span>
          </button>
        </div>
      </div>

      <TelegramSubscribeModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
