'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Trophy,
  PlusCircle,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

interface CompItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  categoryName: string;
  categoryColor: string;
  format: string;
  venue: string;
  status: string;
  startsAt: string;
  participantsCount: number;
  resultsCount: number;
  winners: { rank: number; houseName: string; recipient: string; pointsAwarded: number }[];
}

export default function AdminCompetitionsPage() {
  const [competitions, setCompetitions] = useState<CompItem[]>([]);
  const [loading, setLoading] = useState(true);

  // New Competition modal
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCatId, setNewCatId] = useState('');
  const [newVenue, setNewVenue] = useState('');
  const [newFormat, setNewFormat] = useState('INDIVIDUAL');
  const [newStartsAt, setNewStartsAt] = useState('');
  const [newEndsAt, setNewEndsAt] = useState('');
  const [newRules, setNewRules] = useState('');

  // Record Results modal
  const [recordComp, setRecordComp] = useState<CompItem | null>(null);
  const [firstHouse, setFirstHouse] = useState('');
  const [firstStudent, setFirstStudent] = useState('');
  const [firstPoints, setFirstPoints] = useState('40');
  const [firstScoreText, setFirstScoreText] = useState('1st Place — Gold');

  const [secondHouse, setSecondHouse] = useState('');
  const [secondStudent, setSecondStudent] = useState('');
  const [secondPoints, setSecondPoints] = useState('25');
  const [secondScoreText, setSecondScoreText] = useState('2nd Place — Silver');

  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [houses, setHouses] = useState<{ id: string; name: string }[]>([]);
  const [students, setStudents] = useState<{ id: string; fullName: string; houseId: string }[]>([]);

  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchCompetitions = () => {
    setLoading(true);
    fetch('/api/competitions')
      .then((res) => res.json())
      .then((data) => {
        if (data.competitions) setCompetitions(data.competitions);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCompetitions();

    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) {
          setCategories(data.categories);
          if (data.categories.length > 0) setNewCatId(data.categories[0].id);
        }
      });

    fetch('/api/houses')
      .then((res) => res.json())
      .then((data) => {
        if (data.houses) {
          setHouses(data.houses);
          if (data.houses.length >= 2) {
            setFirstHouse(data.houses[0].id);
            setSecondHouse(data.houses[1].id);
          }
        }
      });

    fetch('/api/students?limit=100')
      .then((res) => res.json())
      .then((data) => {
        if (data.students) setStudents(data.students);
      });
  }, []);

  const handleCreateCompetition = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    try {
      const res = await fetch('/api/competitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          description: newDesc,
          categoryId: newCatId,
          venue: newVenue,
          format: newFormat,
          startsAt: newStartsAt || new Date().toISOString(),
          endsAt: newEndsAt || new Date(Date.now() + 3 * 3600 * 1000).toISOString(),
          rules: newRules,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMsg({ type: 'error', text: data.error || 'Failed to create competition' });
        return;
      }

      setMsg({ type: 'success', text: `Competition "${data.competition.title}" successfully created.` });
      setNewModalOpen(false);
      setNewTitle('');
      setNewDesc('');
      setNewVenue('');
      fetchCompetitions();
    } catch {
      setMsg({ type: 'error', text: 'Network error creating competition.' });
    }
  };

  const handleRecordResults = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordComp) return;
    setMsg(null);

    try {
      const resultsPayload = [
        {
          rank: 1,
          houseId: firstHouse,
          studentId: firstStudent || null,
          pointsAwarded: parseInt(firstPoints, 10),
          scoreText: firstScoreText,
        },
        {
          rank: 2,
          houseId: secondHouse,
          studentId: secondStudent || null,
          pointsAwarded: parseInt(secondPoints, 10),
          scoreText: secondScoreText,
        },
      ];

      const res = await fetch(`/api/competitions/${recordComp.slug}/results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          results: resultsPayload,
          markCompleted: true,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMsg({ type: 'error', text: data.error || 'Failed to record results' });
        return;
      }

      setMsg({
        type: 'success',
        text: `Results officially published for "${recordComp.title}". Generated ${data.transactions.length} approved house point transactions!`,
      });
      setRecordComp(null);
      fetchCompetitions();
    } catch {
      setMsg({ type: 'error', text: 'Network error publishing results.' });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <span className="badge badge-gold" style={{ marginBottom: '0.5rem' }}>
            TOURNAMENTS & DERBIES
          </span>
          <h1 style={{ fontSize: '2.25rem', color: '#fff' }}>Competitions Management</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Schedule school events, manage formats, and publish official results to automatically award house points.
          </p>
        </div>

        <button
          onClick={() => {
            setNewModalOpen(true);
            setMsg(null);
          }}
          className="btn btn-primary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <PlusCircle size={15} />
          <span>Schedule Competition</span>
        </button>
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

      {/* Competitions Table */}
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Venue</th>
              <th>Date</th>
              <th>Status</th>
              <th>Winners / Podium</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  Loading competitions...
                </td>
              </tr>
            ) : competitions.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No competitions scheduled yet.
                </td>
              </tr>
            ) : (
              competitions.map((comp) => (
                <tr key={comp.id}>
                  <td>
                    <Link href={`/competitions/${comp.slug}`} style={{ fontWeight: 700, color: '#fff' }}>
                      {comp.title}
                    </Link>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Format: {comp.format}
                    </div>
                  </td>
                  <td>
                    <span style={{ color: comp.categoryColor, fontWeight: 600, fontSize: '0.85rem' }}>
                      {comp.categoryName}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{comp.venue}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.825rem' }}>
                    {new Date(comp.startsAt).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        comp.status === 'COMPLETED'
                          ? 'badge-gold'
                          : comp.status === 'REGISTRATION_OPEN'
                          ? 'badge-astra'
                          : 'badge-neutral'
                      }`}
                    >
                      {comp.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td>
                    {comp.winners.length > 0 ? (
                      <div style={{ fontSize: '0.85rem' }}>
                        <strong style={{ color: '#fff' }}>1st: {comp.winners[0].recipient}</strong>{' '}
                        <span style={{ color: 'var(--gold)' }}>+{comp.winners[0].pointsAwarded} pts</span>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Pending match</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        onClick={() => {
                          setRecordComp(comp);
                          setMsg(null);
                        }}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                      >
                        <Award size={12} />
                        <span>{comp.status === 'COMPLETED' ? 'Update Results' : 'Record Results'}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* RECORD RESULTS MODAL (PRD Section 76 & 100) */}
      {recordComp && (
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
          <div className="glass-card" style={{ width: '100%', maxWidth: '580px', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '0.35rem' }}>
              Publish Official Results
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              Recording official results for <strong>{recordComp.title}</strong> will automatically generate verified point transactions for the winning houses.
            </p>

            <form onSubmit={handleRecordResults}>
              {/* 1st Place */}
              <div
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(245, 158, 11, 0.08)',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  marginBottom: '1rem',
                }}
              >
                <div style={{ fontWeight: 800, color: 'var(--gold)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  1ST PLACE (GOLD)
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div>
                    <label className="form-label">House</label>
                    <select
                      value={firstHouse}
                      onChange={(e) => setFirstHouse(e.target.value)}
                      className="form-select"
                    >
                      {houses.map((h) => (
                        <option key={h.id} value={h.id}>
                          {h.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Points Awarded</label>
                    <input
                      type="number"
                      required
                      value={firstPoints}
                      onChange={(e) => setFirstPoints(e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className="form-label">Student Recipient (Optional)</label>
                    <select
                      value={firstStudent}
                      onChange={(e) => setFirstStudent(e.target.value)}
                      className="form-select"
                    >
                      <option value="">House Squad / Team</option>
                      {students
                        .filter((s) => s.houseId === firstHouse)
                        .map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.fullName}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Score / Note</label>
                    <input
                      type="text"
                      value={firstScoreText}
                      onChange={(e) => setFirstScoreText(e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              {/* 2nd Place */}
              <div
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-subtle)',
                  marginBottom: '1.5rem',
                }}
              >
                <div style={{ fontWeight: 800, color: 'var(--silver)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  2ND PLACE (SILVER)
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div>
                    <label className="form-label">House</label>
                    <select
                      value={secondHouse}
                      onChange={(e) => setSecondHouse(e.target.value)}
                      className="form-select"
                    >
                      {houses.map((h) => (
                        <option key={h.id} value={h.id}>
                          {h.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Points Awarded</label>
                    <input
                      type="number"
                      required
                      value={secondPoints}
                      onChange={(e) => setSecondPoints(e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className="form-label">Student Recipient (Optional)</label>
                    <select
                      value={secondStudent}
                      onChange={(e) => setSecondStudent(e.target.value)}
                      className="form-select"
                    >
                      <option value="">House Squad / Team</option>
                      {students
                        .filter((s) => s.houseId === secondHouse)
                        .map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.fullName}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Score / Note</label>
                    <input
                      type="text"
                      value={secondScoreText}
                      onChange={(e) => setSecondScoreText(e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setRecordComp(null)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Publish Results & Generate Points
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SCHEDULE COMPETITION MODAL */}
      {newModalOpen && (
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
          <div className="glass-card" style={{ width: '100%', maxWidth: '540px', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.35rem', color: '#fff', marginBottom: '0.5rem' }}>
              Schedule Competition
            </h3>

            <form onSubmit={handleCreateCompetition}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Winter Chess Championship"
                  className="form-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    value={newCatId}
                    onChange={(e) => setNewCatId(e.target.value)}
                    className="form-select"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Format</label>
                  <select
                    value={newFormat}
                    onChange={(e) => setNewFormat(e.target.value)}
                    className="form-select"
                  >
                    <option value="INDIVIDUAL">Individual</option>
                    <option value="TEAM">Team</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Venue / Room</label>
                <input
                  type="text"
                  required
                  value={newVenue}
                  onChange={(e) => setNewVenue(e.target.value)}
                  placeholder="e.g. Great Examination Hall"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  required
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Competition scope, format details..."
                  className="form-textarea"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => setNewModalOpen(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Schedule Competition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
