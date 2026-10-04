'use client';

import React, { useState, useEffect } from 'react';
import { Send, CheckCircle2, AlertCircle, X, Bell, ExternalLink, ShieldCheck } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[var(--surface-color)] border border-[var(--border-color)] rounded-2xl shadow-2xl p-6 sm:p-8 overflow-hidden text-[var(--foreground)]">
        {/* Glow accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#0088cc]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-xl bg-[#0088cc]/10 border border-[#0088cc]/30 flex items-center justify-center text-[#0088cc]">
            <Send size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight">
              {isUz ? 'Telegram bildirishnomalari' : 'Telegram Notifications'}
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400">
              {isUz
                ? 'House tizimi yangiliklari va ochkolarni bir zumda oling'
                : 'Receive instant house points and school news alerts'}
            </p>
          </div>
        </div>

        {/* Direct bot link if configured */}
        {botInfo?.botUsername && (
          <div className="mb-5 p-3.5 bg-[#0088cc]/10 border border-[#0088cc]/25 rounded-xl flex items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                {isUz ? 'Rasmiy Telegram botimiz:' : 'Our Official Telegram Bot:'}{' '}
                <strong className="text-[#0088cc]">@{botInfo.botUsername}</strong>
              </span>
            </div>
            <a
              href={`https://t.me/${botInfo.botUsername}?start=subscribe`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#0088cc] hover:bg-[#0077b3] text-white font-medium rounded-lg text-xs transition-colors shrink-0"
            >
              <span>{isUz ? 'Botni ochish' : 'Open Bot'}</span>
              <ExternalLink size={12} />
            </a>
          </div>
        )}

        {status && (
          <div
            className={`mb-5 p-4 rounded-xl flex items-start gap-3 text-sm ${
              status.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
            }`}
          >
            {status.type === 'success' ? (
              <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
            ) : (
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
            )}
            <p>{status.message}</p>
          </div>
        )}

        {status?.type === 'success' ? (
          <div className="flex flex-col gap-3">
            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition-all"
            >
              {isUz ? 'Yopish' : 'Close'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                {isUz ? 'Telegram Username yoki Chat ID *' : 'Telegram Username or Chat ID *'}
              </label>
              <input
                type="text"
                value={telegramHandle}
                onChange={(e) => setTelegramHandle(e.target.value)}
                placeholder="@username yoki 123456789"
                className="w-full px-3.5 py-2.5 bg-black/30 border border-zinc-700 focus:border-[#0088cc] focus:ring-1 focus:ring-[#0088cc] rounded-xl text-sm text-white placeholder-zinc-500 transition-all outline-none"
                required
              />
              <p className="mt-1 text-[11px] text-zinc-400">
                {isUz
                  ? "Botga /start bosing yoki o'z Telegram ID'ingizni @userinfobot orqali oling"
                  : 'Start the bot or find your numeric Telegram ID via @userinfobot'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                {isUz ? 'Ismingiz (Ixtiyoriy)' : 'Your Name (Optional)'}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isUz ? "Masalan: Jamshidbek" : "E.g. Jamshidbek"}
                className="w-full px-3.5 py-2.5 bg-black/30 border border-zinc-700 focus:border-[#0088cc] focus:ring-1 focus:ring-[#0088cc] rounded-xl text-sm text-white placeholder-zinc-500 transition-all outline-none"
              />
            </div>

            <div className="p-3.5 bg-black/20 border border-zinc-800 rounded-xl space-y-2.5">
              <span className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                {isUz ? 'Qaysi xabarlar kerak?' : 'Notification Topics'}
              </span>

              <label className="flex items-center gap-3 text-sm cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={subPoints}
                  onChange={(e) => setSubPoints(e.target.checked)}
                  className="rounded border-zinc-700 text-[#0088cc] focus:ring-[#0088cc] w-4 h-4 bg-zinc-900"
                />
                <span className="text-zinc-200">
                  {isUz ? 'Yangi berilgan ballar (Points)' : 'Point updates & awards'}
                </span>
              </label>

              <label className="flex items-center gap-3 text-sm cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={subAnnouncements}
                  onChange={(e) => setSubAnnouncements(e.target.checked)}
                  className="rounded border-zinc-700 text-[#0088cc] focus:ring-[#0088cc] w-4 h-4 bg-zinc-900"
                />
                <span className="text-zinc-200">
                  {isUz ? 'Maktab e\'lonlari va yangiliklar' : 'School announcements & news'}
                </span>
              </label>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
              >
                {isUz ? 'Bekor qilish' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-[#0088cc] hover:bg-[#0077b3] disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-[#0088cc]/20 flex items-center gap-2"
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
