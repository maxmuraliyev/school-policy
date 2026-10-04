'use client';

import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import TelegramSubscribeModal from './TelegramSubscribeModal';

export default function TelegramBanner() {
  const { lang } = useLanguage();
  const isUz = lang === 'uz';
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="telegram-banner">
        <div className="telegram-banner-glow" />

        <div className="telegram-banner-content">
          <div className="telegram-banner-left">
            <div className="telegram-icon-box">
              <Send size={24} />
            </div>
            <div>
              <div className="telegram-badge-row">
                <span className="telegram-pill">Telegram Bot</span>
                <span className="telegram-sub-label">
                  {isUz ? 'Jonli bildirishnomalar' : 'Live alerts'}
                </span>
              </div>
              <h4 className="telegram-banner-title">
                {isUz
                  ? "Barcha yangi ballar va e'lonlar Telegramingizda!"
                  : 'Get all house points & announcements directly on Telegram!'}
              </h4>
              <p className="telegram-banner-desc">
                {isUz
                  ? "Astra va Terra bellashuvlarini bir zumda kuzatib boring. Har safar yangi ball berilganda xabar oling."
                  : 'Track the Astra vs Terra clash in real time. Get notified whenever new points are awarded or announcements are posted.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="telegram-btn-primary"
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
