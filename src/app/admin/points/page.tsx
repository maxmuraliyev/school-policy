'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  PlusCircle,
  Search,
  Filter,
  AlertTriangle,
  ArrowRight,
  Shield,
  Clock,
} from 'lucide-react';

interface PointTx {
  id: string;
  transactionCode: string;
  houseId: string;
  house: { name: string; shortName: string; primaryColor: string; slug: string };
  studentId: string | null;
  student: { id: string; firstName: string; lastName: string; className: string } | null;
  categoryId: string;
  category: { name: string; color: string };
  points: number;
  reason: string;
  status: string; // APPROVED, PENDING, REVERSED, REJECTED
  earnedAt: string;
  approvedByName: string | null;
  reversalOfId: string | null;
}

export default function AdminPointsLedgerPage() {
  const [transactions, setTransactions] = useState<PointTx[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [houseFilter, setHouseFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Reversal Modal
  const [reversingTx, setReversingTx] = useState<PointTx | null>(null);
  const [reversalReason, setReversalReason] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // New Point Modal
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [newHouseId, setNewHouseId] = useState('');
  const [newStudentId, setNewStudentId] = useState('');
  const [newCategoryId, setNewCategoryId] = useState('');
  const [newPoints, setNewPoints] = useState('');
  const [newReason, setNewReason] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [directApprove, setDirectApprove] = useState(true);

  // Houses & Categories & Students lookup
  const [houses, setHouses] = useState<{ id: string; name: string }[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [students, setStudents] = useState<{ id: string; fullName: string; houseId: string; className: string }[]>([]);

  const fetchTransactions = () => {
    setLoading(true);
    let url = '/api/points?limit=100';
    if (statusFilter !== 'ALL') url += `&status=${statusFilter}`;
    if (houseFilter !== 'ALL') url += `&houseId=${houseFilter}`;
    if (searchQuery.trim()) url += `&search=${encodeURIComponent(searchQuery.trim())}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.transactions) setTransactions(data.transactions);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTransactions();
  }, [statusFilter, houseFilter, searchQuery]);

  // Load lookup data for modal
  useEffect(() => {
    fetch('/api/houses')
      .then((res) => res.json())
      .then((data) => {
        if (data.houses) {
          setHouses(data.houses);
          if (data.houses.length > 0) setNewHouseId(data.houses[0].id);
        }
      });

    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) {
          setCategories(data.categories);
          if (data.categories.length > 0) setNewCategoryId(data.categories[0].id);
        }
      });

    fetch('/api/students?limit=100')
      .then((res) => res.json())
      .then((data) => {
        if (data.students) setStudents(data.students);
      });
  }, []);

  const handleReverse = async () => {
    if (!reversingTx) return;
    setActionError(null);

    try {
      const res = await fetch(`/api/points/${reversingTx.id}/reverse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reversalReason }),
      });
      const data = await res.json();

      if (!res.ok) {
        setActionError(data.error || 'Failed to reverse transaction');
        return;
      }

      setActionSuccess(`Transaction ${reversingTx.transactionCode} reversed with offsetting record.`);
      setReversingTx(null);
      setReversalReason('');
      fetchTransactions();
    } catch {
      setActionError('Network error while processing reversal.');
    }
  };

  const handleCreatePoint = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);

    try {
      const res = await fetch('/api/points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          houseId: newHouseId,
          studentId: newStudentId || null,
          categoryId: newCategoryId,
          points: parseInt(newPoints, 10),
          reason: newReason,
          description: newDescription,
          directApprove,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setActionError(data.error || 'Failed to award points');
        return;
      }

      setActionSuccess(`Points successfully recorded for ${houses.find((h) => h.id === newHouseId)?.name}!`);
      setNewModalOpen(false);
      setNewReason('');
      setNewDescription('');
      setNewPoints('');
      setNewStudentId('');
      fetchTransactions();
    } catch {
      setActionError('Network error while creating point transaction.');
    }
  };

  const filteredStudents = newHouseId
    ? students.filter((s) => s.houseId === newHouseId)
    : students;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <span className="badge badge-gold" style={{ marginBottom: '0.5rem' }}>
            SCORING SYSTEM
          </span>
          <h1 style={{ fontSize: '2.25rem', color: '#fff' }}>Point Transactions Ledger</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Complete audit record of every score transaction, approval, and reversal in the system.
          </p>
        </div>

        <button
          onClick={() => {
            setNewModalOpen(true);
            setActionError(null);
          }}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <PlusCircle size={18} />
          <span>Award House Points</span>
        </button>
      </div>

      {actionError && (
        <div
          style={{
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            color: '#fca5a5',
            fontSize: '0.9rem',
          }}
        >
          {actionError}
        </div>
      )}

      {actionSuccess && (
        <div
          style={{
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            color: '#6ee7b7',
            fontSize: '0.9rem',
          }}
        >
          {actionSuccess}
        </div>
      )}

      {/* FILTERS & SEARCH */}
      <div
        className="glass-card"
        style={{
          padding: '1.25rem',
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', flex: 1 }}>
          <div style={{ position: 'relative', minWidth: '220px', flex: 1 }}>
            <Search
              size={16}
              color="var(--text-muted)"
              style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              placeholder="Search reason or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '2.4rem' }}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-select"
            style={{ width: '160px' }}
          >
            <option value="ALL">All Statuses</option>
            <option value="APPROVED">Approved Only</option>
            <option value="PENDING">Pending Approval</option>
            <option value="REVERSED">Reversed Records</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <select
            value={houseFilter}
            onChange={(e) => setHouseFilter(e.target.value)}
            className="form-select"
            style={{ width: '150px' }}
          >
            <option value="ALL">All Houses</option>
            {houses.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
        </div>

        <Link href="/admin/points/pending" className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Clock size={15} />
          <span>Pending Queue</span>
        </Link>
      </div>

      {/* TRANSACTIONS TABLE */}
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>House</th>
              <th>Points</th>
              <th>Reason & Description</th>
              <th>Student / Team</th>
              <th>Category</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  Loading transaction ledger...
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No transactions match the selected filters.
                </td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr key={tx.id}>
                  <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {tx.transactionCode}
                  </td>
                  <td>
                    <span
                      className="badge"
                      style={{
                        background: `${tx.house.primaryColor}22`,
                        color: tx.house.primaryColor,
                        border: `1px solid ${tx.house.primaryColor}44`,
                      }}
                    >
                      {tx.house.shortName}
                    </span>
                  </td>
                  <td>
                    <span
                      style={{
                        fontWeight: 900,
                        fontSize: '1rem',
                        color:
                          tx.points < 0
                            ? 'var(--danger)'
                            : tx.status === 'REVERSED'
                            ? 'var(--text-muted)'
                            : tx.house.primaryColor,
                        textDecoration: tx.status === 'REVERSED' ? 'line-through' : 'none',
                      }}
                    >
                      {tx.points > 0 ? `+${tx.points}` : tx.points}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#fff' }}>{tx.reason}</div>
                    {tx.reversalOfId && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>
                        Official Reversal of prior entry
                      </div>
                    )}
                  </td>
                  <td>
                    {tx.student ? (
                      <span style={{ color: 'var(--text-secondary)' }}>
                        {tx.student.firstName} {tx.student.lastName} ({tx.student.className})
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>House Team</span>
                    )}
                  </td>
                  <td>
                    <span style={{ color: tx.category.color, fontWeight: 600, fontSize: '0.85rem' }}>
                      {tx.category.name}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        tx.status === 'APPROVED'
                          ? 'badge-success'
                          : tx.status === 'PENDING'
                          ? 'badge-warning'
                          : tx.status === 'REVERSED'
                          ? 'badge-danger'
                          : 'badge-neutral'
                      }`}
                    >
                      {tx.status}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.825rem' }}>
                    {new Date(tx.earnedAt).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </td>
                  <td>
                    {/* Reversal action available ONLY on approved positive transactions */}
                    {tx.status === 'APPROVED' && tx.points > 0 && (
                      <button
                        onClick={() => {
                          setReversingTx(tx);
                          setReversalReason('');
                          setActionError(null);
                        }}
                        className="btn btn-danger btn-sm"
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                        title="Reverse transaction with auditable counter-entry"
                      >
                        <RotateCcw size={12} />
                        <span>Reverse</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* REVERSAL MODAL (PRD Section 15 & 40) */}
      {reversingTx && (
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)', marginBottom: '0.75rem' }}>
              <AlertTriangle size={22} />
              <h3 style={{ fontSize: '1.35rem', color: '#fff' }}>Execute Score Reversal</h3>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              By architectural design, scores are never silently deleted. Executing this will mark{' '}
              <strong>{reversingTx.transactionCode}</strong> as reversed and create an auditable{' '}
              <strong style={{ color: 'var(--danger)' }}>-{reversingTx.points} pts</strong> reversal entry for{' '}
              <strong>{reversingTx.house.name}</strong>.
            </p>

            <div className="form-group">
              <label className="form-label">Mandatory Reversal Explanation</label>
              <textarea
                required
                value={reversalReason}
                onChange={(e) => setReversalReason(e.target.value)}
                placeholder="e.g. Corrected score entry; participant in 2nd place rather than 1st..."
                className="form-textarea"
                style={{ minHeight: '90px' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => setReversingTx(null)}
                className="btn btn-secondary btn-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReverse}
                disabled={reversalReason.trim().length < 5}
                className="btn btn-danger btn-sm"
              >
                Confirm Score Reversal (-{reversingTx.points})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE POINT MODAL */}
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
          <div className="glass-card" style={{ width: '100%', maxWidth: '540px', padding: '2.5rem' }}>
            <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '0.35rem' }}>Award House Points</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              Submit a verified achievement or competition point transaction.
            </p>

            <form onSubmit={handleCreatePoint}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Target House</label>
                  <select
                    required
                    value={newHouseId}
                    onChange={(e) => {
                      setNewHouseId(e.target.value);
                      setNewStudentId('');
                    }}
                    className="form-select"
                  >
                    {houses.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    required
                    value={newCategoryId}
                    onChange={(e) => setNewCategoryId(e.target.value)}
                    className="form-select"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Points</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="100"
                    value={newPoints}
                    onChange={(e) => setNewPoints(e.target.value)}
                    placeholder="e.g. 40"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Student Recipient</label>
                  <select
                    value={newStudentId}
                    onChange={(e) => {
                      const sid = e.target.value;
                      setNewStudentId(sid);
                      if (sid) {
                        const st = students.find((s) => s.id === sid);
                        if (st?.houseId) {
                          setNewHouseId(st.houseId);
                        }
                      }
                    }}
                    className="form-select"
                  >
                    <option value="">House Squad / Entire House Award</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.fullName} ({s.className} • {houses.find(h => h.id === s.houseId)?.name || 'House'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Reason / Award Title</label>
                <input
                  type="text"
                  required
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  placeholder="e.g. 1st Place — Inter-House Robotics Competition"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description / Internal Notes</label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Documenting evidence or jury evaluation details..."
                  className="form-textarea"
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <input
                  type="checkbox"
                  id="directApprove"
                  checked={directApprove}
                  onChange={(e) => setDirectApprove(e.target.checked)}
                />
                <label htmlFor="directApprove" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  Approve immediately into live leaderboard (Administrator privilege)
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setNewModalOpen(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Record Points
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
