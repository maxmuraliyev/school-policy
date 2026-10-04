'use client';

import React, { useState, useEffect } from 'react';
import { Send, CheckCircle2, AlertCircle, X, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface TelegramSubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TelegramSubscribeModal({ isOpen, onClose }: TelegramSubscribeModalProps) {
  const { lang } = useLanguage();
  const isUz = lang === 'uz';

  const [telegramHandle, setTelegramHandle] = useState('');
  const [name, setName] = useState('');
  const [subPoints, setSubPoints] = useState(true);
  const [subAnnouncements, setSubAnnouncements] = useState(true);
  const [botInfo, setBotInfo] = useState<{ botUsername: string | null; isEnabled: boolean } | null>(null);

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/telegram/subscribe')
        .then((r) => r.json())
        .then((data) => setBotInfo(data))
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    const handle = telegramHandle.trim();
    if (!handle) {
      setStatus({
        type: 'error',
        message: isUz
          ? 'Iltimos, Telegram username yoki Chat ID kiriting'
          : 'Please enter your Telegram username or Chat ID',
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/telegram/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramUsername: handle.startsWith('@') ? handle.slice(1) : handle,
          chatId: handle,
          name: name.trim() || undefined,
          subscribedToPoints: subPoints,
          subscribedToAnnouncements: subAnnouncements,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setStatus({
          type: 'error',
          message: data.error || (isUz ? 'Obuna bo\'lishda xatolik yuz berdi' : 'Failed to subscribe'),
        });
        setLoading(false);
        return;
      }

      setStatus({
        type: 'success',
        message: isUz
          ? 'Muvaffaqiyatli obuna bo\'ldingiz! Yangi ballar va e\'lonlar telegramingizga yuboriladi.'
          : 'Successfully subscribed! Points and announcements will be sent to your Telegram.',
      });
      setLoading(false);
    } catch {
      setStatus({
        type: 'error',
        message: isUz ? 'Tarmoq xatosi yuz berdi' : 'Network error occurred',
      });
      setLoading(false);
    }
  };

  return (
    <div className="telegram-modal-backdrop" onClick={onClose}>
      <div className="telegram-modal-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button
          onClick={onClose}
          className="telegram-modal-close"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.25rem' }}>
          <div className="telegram-icon-box" style={{ width: '46px', height: '46px' }}>
            <Send size={22} />
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
              {isUz ? 'Telegram bildirishnomalari' : 'Telegram Notifications'}
            </h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>
              {isUz
                ? 'House tizimi yangiliklari va ochkolarni bir zumda oling'
                : 'Receive instant house points and school news alerts'}
            </p>
          </div>
        </div>

        {/* Direct bot link if configured */}
        {botInfo?.botUsername && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(0, 136, 204, 0.1)',
              border: '1px solid rgba(0, 136, 204, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              marginBottom: '1.25rem',
              fontSize: '0.85rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#34d399', display: 'inline-block' }} />
              <span>
                {isUz ? 'Rasmiy Telegram botimiz:' : 'Our Official Bot:'}{' '}
                <strong style={{ color: '#38bdf8' }}>@{botInfo.botUsername}</strong>
              </span>
            </div>
            <a
              href={`https://t.me/${botInfo.botUsername}?start=subscribe`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm"
              style={{
                background: '#0088cc',
                color: '#ffffff',
                border: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.75rem',
                textDecoration: 'none',
                padding: '0.35rem 0.65rem',
              }}
            >
              <span>{isUz ? 'Botni ochish' : 'Open Bot'}</span>
              <ExternalLink size={12} />
            </a>
          </div>
        )}

        {status && (
          <div
            style={{
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.65rem',
              fontSize: '0.875rem',
              marginBottom: '1.25rem',
              background: status.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: `1px solid ${status.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
              color: status.type === 'success' ? '#34d399' : '#f87171',
            }}
          >
            {status.type === 'success' ? (
              <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            ) : (
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            )}
            <div>{status.message}</div>
          </div>
        )}

        {status?.type === 'success' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button
              onClick={onClose}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem' }}
            >
              {isUz ? 'Yopish' : 'Close'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label className="form-label" style={{ fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                {isUz ? 'Telegram Username yoki Chat ID *' : 'Telegram Username or Chat ID *'}
              </label>
              <input
                type="text"
                value={telegramHandle}
                onChange={(e) => setTelegramHandle(e.target.value)}
                placeholder="@username yoki 123456789"
                className="form-input"
                required
              />
              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                {isUz
                  ? "Botga /start bosing yoki o'z Telegram ID'ingizni @userinfobot orqali oling"
                  : 'Start the bot or find your numeric Telegram ID via @userinfobot'}
              </span>
            </div>

            <div>
              <label className="form-label" style={{ fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                {isUz ? 'Ismingiz (Ixtiyoriy)' : 'Your Name (Optional)'}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isUz ? "Masalan: Jamshidbek" : "E.g. Jamshidbek"}
                className="form-input"
              />
            </div>

            <div
              style={{
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem',
              }}
            >
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                {isUz ? 'Qaysi xabarlar kerak?' : 'Notification Topics'}
              </span>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.875rem', cursor: 'pointer', userSelect: 'none' }}>
                <input
                  type="checkbox"
                  checked={subPoints}
                  onChange={(e) => setSubPoints(e.target.checked)}
                  style={{ accentColor: '#0088cc', width: '16px', height: '16px' }}
                />
                <span style={{ color: 'var(--text-primary)' }}>
                  {isUz ? 'Yangi berilgan ballar (Points)' : 'Point updates & awards'}
                </span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.875rem', cursor: 'pointer', userSelect: 'none' }}>
                <input
                  type="checkbox"
                  checked={subAnnouncements}
                  onChange={(e) => setSubAnnouncements(e.target.checked)}
                  style={{ accentColor: '#0088cc', width: '16px', height: '16px' }}
                />
                <span style={{ color: 'var(--text-primary)' }}>
                  {isUz ? 'Maktab e\'lonlari va yangiliklar' : 'School announcements & news'}
                </span>
              </label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
                style={{ padding: '0.65rem 1.25rem' }}
              >
                {isUz ? 'Bekor qilish' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="telegram-btn-primary"
                style={{ padding: '0.65rem 1.25rem' }}
              >
                {loading ? (
                  <span>{isUz ? 'Saqlanmoqda...' : 'Subscribing...'}</span>
                ) : (
                  <>
                    <Send size={15} />
                    <span>{isUz ? 'Obuna bo\'lish' : 'Subscribe'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
