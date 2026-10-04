'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Trophy, ShieldCheck, Save, CheckCircle2, AlertCircle, Lock } from 'lucide-react';

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

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingItem[]>([]);
  const [seasons, setSeasons] = useState<SeasonItem[]>([]);
  const [houses, setHouses] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form values
  const [schoolName, setSchoolName] = useState('');
  const [trophyTitle, setTrophyTitle] = useState('');
  const [seniorThreshold, setSeniorThreshold] = useState('50');
  const [selfApprovalAllowed, setSelfApprovalAllowed] = useState('false');

  // Season finalization
  const [selectedWinnerHouse, setSelectedWinnerHouse] = useState('');
  const [finalizing, setFinalizing] = useState(false);

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
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);

    try {
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

      const data = await res.json();

      if (!res.ok) {
        setMsg({ type: 'error', text: data.error || 'Failed to update settings' });
        setSaving(false);
        return;
      }

      setMsg({ type: 'success', text: 'System settings saved and logged to audit trail.' });
      setSaving(false);
    } catch {
      setMsg({ type: 'error', text: 'Network error saving settings.' });
      setSaving(false);
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

      // Refresh seasons
      fetch('/api/admin/settings')
        .then((r) => r.json())
        .then((d) => {
          if (d.seasons) setSeasons(d.seasons);
        });
    } catch {
      setMsg({ type: 'error', text: 'Network error during season finalization.' });
      setFinalizing(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading settings...</div>;
  }

  const activeSeason = seasons.find((s) => s.status === 'ACTIVE');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      <div>
        <span className="badge badge-gold" style={{ marginBottom: '0.5rem' }}>
          CONFIGURATION & SEASONS
        </span>
        <h1 style={{ fontSize: '2.25rem', color: '#fff' }}>System Settings & Governance</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Manage global institution parameters, approval thresholds, and annual House Cup finalization.
        </p>
      </div>

      {msg && (
        <div
          style={{
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            background: msg.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: `1px solid ${msg.type === 'success' ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.35)'}`,
            color: msg.type === 'success' ? '#6ee7b7' : '#fca5a5',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem',
          }}
        >
          {msg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* CORE SETTINGS FORM */}
      <form onSubmit={handleSaveSettings} className="glass-card" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.35rem', color: '#fff', marginBottom: '1.25rem' }}>General School Parameters</h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label">School / Institution Name</label>
            <input
              type="text"
              required
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Annual Trophy Title</label>
            <input
              type="text"
              required
              value={trophyTitle}
              onChange={(e) => setTrophyTitle(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Senior Admin Approval Threshold (Points)</label>
            <input
              type="number"
              required
              min="10"
              max="200"
              value={seniorThreshold}
              onChange={(e) => setSeniorThreshold(e.target.value)}
              className="form-input"
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Submissions above this value strictly require Administrator approval.
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">Allow Self-Approval for Faculty</label>
            <select
              value={selfApprovalAllowed}
              onChange={(e) => setSelfApprovalAllowed(e.target.value)}
              className="form-select"
            >
              <option value="false">Strict False (Forbidden per PRD Section 74)</option>
              <option value="true">Allowed (Relaxed rule)</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" disabled={saving} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Save size={16} />
            <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>

      {/* PRD Section 81: ANNUAL HOUSE CUP FINALIZATION */}
      <section className="glass-card" style={{ padding: '2rem', border: '1px solid rgba(245, 158, 11, 0.4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--gold)', marginBottom: '1rem' }}>
          <Trophy size={24} />
          <h2 style={{ fontSize: '1.4rem', color: '#fff' }}>Annual House Cup Finalization</h2>
        </div>

        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.925rem', marginBottom: '1.5rem', maxWidth: '850px' }}>
          Per <strong>PRD Section 81</strong>, the school administration may officially finalize the academic season. Finalizing archives the season, locks score mutations, records the champion house, and preserves the historical leaderboards forever.
        </p>

        {activeSeason ? (
          <div
            style={{
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
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
