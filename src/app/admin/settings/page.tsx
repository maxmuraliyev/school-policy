'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Trophy,
  ShieldCheck,
  Save,
  CheckCircle2,
  AlertCircle,
  Lock,
  Send,
  Trash2,
  RefreshCw,
  Radio,
  ExternalLink,
} from 'lucide-react';

interface SettingItem {
  id: string;
  key: string;
  value: string;
  description: string | null;
  category: string;
}

interface SeasonItem {
  id: string;
  name: string;
  status: string;
  startsAt: string;
  endsAt: string;
}

interface TelegramSubscriberItem {
  id: string;
  chatId: string;
  telegramUsername: string | null;
  name: string | null;
  subscribedToPoints: boolean;
  subscribedToAnnouncements: boolean;
  isActive: boolean;
  createdAt: string;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingItem[]>([]);
  const [seasons, setSeasons] = useState<SeasonItem[]>([]);
  const [houses, setHouses] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // General settings
  const [schoolName, setSchoolName] = useState('');
  const [trophyTitle, setTrophyTitle] = useState('');
  const [seniorThreshold, setSeniorThreshold] = useState('50');
  const [selfApprovalAllowed, setSelfApprovalAllowed] = useState('false');

  // Telegram settings
  const [botToken, setBotToken] = useState('');
  const [botUsername, setBotUsername] = useState('');
  const [channelId, setChannelId] = useState('');
  const [telegramEnabled, setTelegramEnabled] = useState(true);
  const [subscribers, setSubscribers] = useState<TelegramSubscriberItem[]>([]);
  const [testChatId, setTestChatId] = useState('');
  const [testingTelegram, setTestingTelegram] = useState(false);
  const [testResult, setTestResult] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Season finalization
  const [selectedWinnerHouse, setSelectedWinnerHouse] = useState('');
  const [finalizing, setFinalizing] = useState(false);

  const fetchTelegramData = () => {
    fetch('/api/admin/telegram')
      .then((res) => res.json())
      .then((data) => {
        if (data.subscribers) setSubscribers(data.subscribers);
        if (data.config) {
          if (data.config.botUsername) setBotUsername(data.config.botUsername);
          if (data.config.channelId) setChannelId(data.config.channelId);
          setTelegramEnabled(data.config.isEnabled);
        }
      })
      .catch((err) => console.error('Failed to load telegram admin data:', err));
  };

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          setSettings(data.settings);
          const getVal = (k: string, fallback: string) =>
            data.settings.find((s: SettingItem) => s.key === k)?.value || fallback;
          setSchoolName(getVal('school_name', 'Horizon International Academy'));
          setTrophyTitle(getVal('trophy_title', 'The Silver & Gold House Chalice'));
          setSeniorThreshold(getVal('senior_approval_threshold', '50'));
          setSelfApprovalAllowed(getVal('self_approval_allowed', 'false'));

          // Load stored Telegram settings
          setBotToken(getVal('telegram_bot_token', ''));
          setBotUsername(getVal('telegram_bot_username', ''));
          setChannelId(getVal('telegram_channel_id', ''));
          setTelegramEnabled(getVal('telegram_notifications_enabled', 'true') === 'true');
        }
        if (data.seasons) setSeasons(data.seasons);
        setLoading(false);
      });

    fetch('/api/houses')
      .then((res) => res.json())
      .then((data) => {
        if (data.houses) {
          setHouses(data.houses);
          if (data.houses.length > 0) setSelectedWinnerHouse(data.houses[0].id);
        }
      });

    fetchTelegramData();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);

    try {
      // 1. Save general settings
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settingsUpdates: [
            { key: 'school_name', value: schoolName },
            { key: 'trophy_title', value: trophyTitle },
            { key: 'senior_approval_threshold', value: seniorThreshold },
            { key: 'self_approval_allowed', value: selfApprovalAllowed },
          ],
        }),
      });

      // 2. Save Telegram settings
      await fetch('/api/admin/telegram', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botToken,
          botUsername,
          channelId,
          isEnabled: telegramEnabled,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMsg({ type: 'error', text: data.error || 'Failed to update settings' });
        setSaving(false);
        return;
      }

      setMsg({ type: 'success', text: 'All system and Telegram settings saved successfully.' });
      setSaving(false);
      fetchTelegramData();
    } catch {
      setMsg({ type: 'error', text: 'Network error saving settings.' });
      setSaving(false);
    }
  };

  const handleTestTelegram = async () => {
    setTestingTelegram(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/admin/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'TEST_PING',
          targetChatId: testChatId.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setTestResult({ type: 'error', text: data.error || 'Failed to send test ping' });
      } else {
        setTestResult({ type: 'success', text: 'Test message sent successfully to Telegram!' });
      }
    } catch {
      setTestResult({ type: 'error', text: 'Network error communicating with Telegram.' });
    } finally {
      setTestingTelegram(false);
    }
  };

  const handleDeleteSubscriber = async (id: string) => {
    if (!confirm('Are you sure you want to remove this Telegram subscriber?')) return;

    try {
      const res = await fetch(`/api/admin/telegram?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSubscribers((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete subscriber:', err);
    }
  };

  const handleFinalizeSeason = async () => {
    const activeSeason = seasons.find((s) => s.status === 'ACTIVE');
    if (!activeSeason) return;

    const winnerName = houses.find((h) => h.id === selectedWinnerHouse)?.name;
    if (
      !confirm(
        `ARE YOU ABSOLUTELY SURE?\n\nYou are about to declare ${winnerName} as the official annual winner of the House Cup for season ${activeSeason.name}. After finalization, this season becomes read-only archival data.`
      )
    ) {
      return;
    }

    setFinalizing(true);
    setMsg(null);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          finalizeSeasonId: activeSeason.id,
          winningHouseId: selectedWinnerHouse,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMsg({ type: 'error', text: data.error || 'Failed to finalize season' });
        setFinalizing(false);
        return;
      }

      setMsg({
        type: 'success',
        text: `Official House Cup Finalized! ${winnerName} has been recorded in the permanent institutional annals.`,
      });
      setFinalizing(false);
      window.location.reload();
    } catch {
      setMsg({ type: 'error', text: 'Network error finalizing season' });
      setFinalizing(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
        Loading institutional settings...
      </div>
    );
  }

  const activeSeason = seasons.find((s) => s.status === 'ACTIVE');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800 }}>
          System & Telegram Settings
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Configure institutional governance, scoring validation policies, Telegram bot alerts, and season lifecycles.
        </p>
      </div>

      {msg && (
        <div
          style={{
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            background: msg.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${msg.type === 'success' ? 'var(--terra-primary)' : 'var(--danger)'}`,
            color: msg.type === 'success' ? '#10b981' : '#ef4444',
          }}
        >
          {msg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{msg.text}</div>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Core Institutional Branding */}
        <section className="admin-card" style={{ padding: '1.75rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Settings size={18} color="var(--school-blue-light)" />
            <span>Institutional Identity</span>
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            <div>
              <label className="form-label">School Name</label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="form-input"
                placeholder="Angren Ixtisoslashtirilgan Maktabi"
                required
              />
            </div>

            <div>
              <label className="form-label">Championship Trophy Title</label>
              <input
                type="text"
                value={trophyTitle}
                onChange={(e) => setTrophyTitle(e.target.value)}
                className="form-input"
                placeholder="Annual House Trophy"
                required
              />
            </div>
          </div>
        </section>

        {/* Telegram Bot & Notification Broadcast Settings */}
        <section className="admin-card" style={{ padding: '1.75rem', border: '1px solid rgba(0, 136, 204, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0088cc' }}>
              <Send size={18} />
              <span>Telegram Bot & Live Notification System</span>
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label className="form-label" style={{ margin: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={telegramEnabled}
                  onChange={(e) => setTelegramEnabled(e.target.checked)}
                  style={{ accentColor: '#0088cc', width: '16px', height: '16px' }}
                />
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Enable Live Alerts</span>
              </label>
            </div>
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            Whenever points are awarded or school announcements are published, the Telegram Bot will automatically broadcast alerts to all subscribed students and teachers.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <label className="form-label">Telegram Bot API Token</label>
              <input
                type="password"
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
                className="form-input"
                placeholder="123456789:ABCdefGhIJKlmNoPQRstuv..."
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Obtain from @BotFather on Telegram. Leave empty if using .env.
              </span>
            </div>

            <div>
              <label className="form-label">Telegram Bot Username</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={botUsername}
                  onChange={(e) => setBotUsername(e.target.value)}
                  className="form-input"
                  placeholder="AngrenHouseBot"
                />
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Without @ symbol. Allows students to open your bot with 1 click.
              </span>
            </div>

            <div>
              <label className="form-label">Fallback Broadcast Channel ID (Optional)</label>
              <input
                type="text"
                value={channelId}
                onChange={(e) => setChannelId(e.target.value)}
                className="form-input"
                placeholder="@angren_houses or -1001234567890"
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Public channel username or group ID for general school announcements.
              </span>
            </div>
          </div>

          {/* Test Telegram Ping */}
          <div
            style={{
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(0, 136, 204, 0.05)',
              border: '1px solid rgba(0, 136, 204, 0.2)',
              marginBottom: '1.5rem',
            }}
          >
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem', color: '#93c5fd' }}>
              Test Telegram Connection
            </h3>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <input
                type="text"
                value={testChatId}
                onChange={(e) => setTestChatId(e.target.value)}
                className="form-input"
                placeholder="Enter Chat ID or Username (e.g. 123456789 or @username)"
                style={{ flex: 1, minWidth: '220px' }}
              />
              <button
                type="button"
                onClick={handleTestTelegram}
                disabled={testingTelegram || !botToken}
                className="btn btn-secondary"
                style={{
                  background: 'rgba(0, 136, 204, 0.2)',
                  borderColor: 'rgba(0, 136, 204, 0.4)',
                  color: '#ffffff',
                }}
              >
                {testingTelegram ? <RefreshCw size={14} className="spin" /> : <Send size={14} />}
                <span>Send Test Ping</span>
              </button>
            </div>

            {testResult && (
              <div
                style={{
                  marginTop: '0.75rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: testResult.type === 'success' ? '#10b981' : '#ef4444',
                }}
              >
                {testResult.text}
              </div>
            )}
          </div>

          {/* Subscribers Table */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>
                Active Subscribers ({subscribers.length})
              </h3>
              <button
                type="button"
                onClick={fetchTelegramData}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
              >
                <RefreshCw size={12} />
                <span>Refresh</span>
              </button>
            </div>

            {subscribers.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No students or users have subscribed yet.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table" style={{ width: '100%', fontSize: '0.85rem' }}>
                  <thead>
                    <tr>
                      <th>Telegram User / ID</th>
                      <th>Name</th>
                      <th>Points</th>
                      <th>Announcements</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscribers.map((sub) => (
                      <tr key={sub.id}>
                        <td>
                          <strong>{sub.telegramUsername ? `@${sub.telegramUsername}` : sub.chatId}</strong>
                        </td>
                        <td>{sub.name || '—'}</td>
                        <td>{sub.subscribedToPoints ? '✅' : '❌'}</td>
                        <td>{sub.subscribedToAnnouncements ? '✅' : '❌'}</td>
                        <td>{new Date(sub.createdAt).toLocaleDateString()}</td>
                        <td>
                          <button
                            type="button"
                            onClick={() => handleDeleteSubscriber(sub.id)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--danger)',
                              cursor: 'pointer',
                              padding: '0.2rem',
                            }}
                            title="Remove subscriber"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* Governance & Integrity Rules */}
        <section className="admin-card" style={{ padding: '1.75rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={18} color="var(--gold)" />
            <span>Integrity & Approval Safeguards</span>
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            <div>
              <label className="form-label">Self-Approval Fairness Policy</label>
              <select
                value={selfApprovalAllowed}
                onChange={(e) => setSelfApprovalAllowed(e.target.value)}
                className="form-select"
              >
                <option value="false">Strict: Require 4-Eye Review (No Self-Approval)</option>
                <option value="true">Permissive: Teachers may approve own submissions</option>
              </select>
            </div>

            <div>
              <label className="form-label">High-Impact Verification Threshold (Pts)</label>
              <input
                type="number"
                value={seniorThreshold}
                onChange={(e) => setSeniorThreshold(e.target.value)}
                className="form-input"
                min="10"
                max="500"
                required
              />
            </div>
          </div>
        </section>

        {/* Save Bar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: '0.75rem 1.75rem' }}>
            <Save size={16} />
            <span>{saving ? 'Saving...' : 'Save All Settings'}</span>
          </button>
        </div>
      </form>

      {/* Season Finalization Section */}
      <section className="admin-card" style={{ padding: '1.75rem', marginTop: '1rem', borderTop: '3px solid var(--gold)' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gold)' }}>
          <Trophy size={18} />
          <span>Annual Championship Finalization</span>
        </h2>

        {activeSeason ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                Active Season Underway
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
                {activeSeason.name}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.8rem', marginBottom: '0.2rem' }}>
                  Declare Official Champion
                </label>
                <select
                  value={selectedWinnerHouse}
                  onChange={(e) => setSelectedWinnerHouse(e.target.value)}
                  className="form-select"
                  style={{ width: '180px', padding: '0.5rem' }}
                >
                  {houses.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleFinalizeSeason}
                disabled={finalizing}
                className="btn btn-primary"
                style={{
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  borderColor: 'transparent',
                  marginTop: '1.25rem',
                }}
              >
                <Trophy size={16} />
                <span>Declare Winner & Finalize Season</span>
              </button>
            </div>
          </div>
        ) : (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            No active season is currently open for finalization.
          </div>
        )}
      </section>
    </div>
  );
}
