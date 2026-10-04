'use client';

import React, { useState, useEffect } from 'react';
import {
  Award,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Shield,
  AlertCircle,
} from 'lucide-react';

interface AchItem {
  id: string;
  title: string;
  description: string;
  level: string;
  organization: string;
  achievementDate: string;
  evidenceUrl: string | null;
  status: string;
  pointsAwarded: number | null;
  student: { firstName: string; lastName: string; className: string } | null;
  house: { name: string; primaryColor: string };
  category: { name: string; color: string };
}

export default function AdminAchievementsPage() {
  const [achievements, setAchievements] = useState<AchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifyingAch, setVerifyingAch] = useState<AchItem | null>(null);
  const [awardPoints, setAwardPoints] = useState('30');
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchAchievements = () => {
    setLoading(true);
    fetch('/api/achievements?status=ALL')
      .then((res) => res.json())
      .then((data) => {
        if (data.achievements) setAchievements(data.achievements);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  const handleVerify = async (reject = false) => {
    if (!verifyingAch) return;
    setMsg(null);

    try {
      const res = await fetch(`/api/achievements/${verifyingAch.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          awardPoints: reject ? 0 : parseInt(awardPoints, 10),
          reject,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMsg({ type: 'error', text: data.error || 'Failed to process achievement' });
        return;
      }

      setMsg({
        type: 'success',
        text: reject
          ? `Achievement rejected.`
          : `Achievement verified! ${awardPoints} points awarded to ${verifyingAch.house.name}.`,
      });
      setVerifyingAch(null);
      fetchAchievements();
    } catch {
      setMsg({ type: 'error', text: 'Network error during achievement verification.' });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <span className="badge badge-gold" style={{ marginBottom: '0.5rem' }}>
          VERIFICATION HUB
        </span>
        <h1 style={{ fontSize: '2.25rem', color: '#fff' }}>Achievements Verification</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Review external Olympiad medals, sports accolades, and service distinctions. Approved achievements generate official house points.
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

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Student</th>
              <th>House</th>
              <th>Level</th>
              <th>Organization</th>
              <th>Status</th>
              <th>Points Awarded</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  Loading achievements...
                </td>
              </tr>
            ) : achievements.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No achievements recorded.
                </td>
              </tr>
            ) : (
              achievements.map((ach) => (
                <tr key={ach.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: '#fff' }}>{ach.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{ach.description}</div>
                  </td>
                  <td>
                    {ach.student ? (
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {ach.student.firstName} {ach.student.lastName} ({ach.student.className})
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>House Squad</span>
                    )}
                  </td>
                  <td>
                    <span
                      className="badge"
                      style={{
                        background: `${ach.house.primaryColor}22`,
                        color: ach.house.primaryColor,
                        border: `1px solid ${ach.house.primaryColor}44`,
                      }}
                    >
                      {ach.house.name}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>
                      {ach.level}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{ach.organization}</td>
                  <td>
                    <span
                      className={`badge ${
                        ach.status === 'APPROVED'
                          ? 'badge-success'
                          : ach.status === 'PENDING'
                          ? 'badge-warning'
                          : 'badge-danger'
                      }`}
                    >
                      {ach.status}
                    </span>
                  </td>
                  <td>
                    {ach.pointsAwarded ? (
                      <strong style={{ color: 'var(--gold)', fontSize: '1rem' }}>
                        +{ach.pointsAwarded} pts
                      </strong>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>&mdash;</span>
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => {
                        setVerifyingAch(ach);
                        setAwardPoints(ach.pointsAwarded ? String(ach.pointsAwarded) : '30');
                      }}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                    >
                      <span>Review</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* VERIFICATION MODAL */}
      {verifyingAch && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
            padding: '1rem',
          }}
        >
          <div className="glass-card" style={{ width: '100%', maxWidth: '520px', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.35rem', color: '#fff', marginBottom: '0.5rem' }}>
              Verify Achievement
            </h3>

            <div style={{ marginBottom: '1.25rem', fontSize: '0.9rem' }}>
              <div style={{ fontWeight: 700, color: '#fff', fontSize: '1.05rem', marginBottom: '0.25rem' }}>
                {verifyingAch.title}
              </div>
              <div style={{ color: 'var(--text-secondary)' }}>
                {verifyingAch.description}
              </div>
              <div style={{ marginTop: '0.5rem', color: 'var(--text-muted)', fontSize: '0.825rem' }}>
                Recipient: <strong>{verifyingAch.student ? `${verifyingAch.student.firstName} ${verifyingAch.student.lastName}` : verifyingAch.house.name}</strong> &bull; House: <strong>{verifyingAch.house.name}</strong>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Points to Award House</label>
              <input
                type="number"
                min="0"
                max="100"
                value={awardPoints}
                onChange={(e) => setAwardPoints(e.target.value)}
                className="form-input"
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Standard scale: School (20), Regional (40), National (60), International (80).
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => handleVerify(true)}
                className="btn btn-danger btn-sm"
              >
                Reject Achievement
              </button>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setVerifyingAch(null)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleVerify(false)}
                  className="btn btn-primary btn-sm"
                >
                  Verify & Award Points
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
