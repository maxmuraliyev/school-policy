'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  AlertCircle,
  Shield,
  Award,
  ArrowLeft,
} from 'lucide-react';

interface PendingTx {
  id: string;
  transactionCode: string;
  houseId: string;
  house: { name: string; shortName: string; primaryColor: string };
  studentId: string | null;
  student: { firstName: string; lastName: string; className: string } | null;
  categoryId: string;
  category: { name: string; color: string };
  points: number;
  reason: string;
  description: string | null;
  evidenceUrl: string | null;
  internalNotes: string | null;
  createdByName: string;
  earnedAt: string;
}

export default function PendingApprovalsPage() {
  const [pending, setPending] = useState<PendingTx[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Reject modal state
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const fetchPending = () => {
    setLoading(true);
    fetch('/api/points?status=PENDING&limit=50')
      .then((res) => res.json())
      .then((data) => {
        if (data.transactions) setPending(data.transactions);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (id: string) => {
    setActionError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/points/${id}/approve`, {
        method: 'POST',
      });
      const data = await res.json();

      if (!res.ok) {
        setActionError(data.error || 'Failed to approve transaction');
        return;
      }

      setSuccessMsg('Point request successfully approved! Leaderboard recalculated.');
      fetchPending();
    } catch {
      setActionError('Network error while approving.');
    }
  };

  const handleReject = async () => {
    if (!rejectingId) return;
    setActionError(null);

    try {
      const res = await fetch(`/api/points/${rejectingId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectReason }),
      });
      const data = await res.json();

      if (!res.ok) {
        setActionError(data.error || 'Failed to reject transaction');
        return;
      }

      setSuccessMsg('Point request rejected and archived with reason.');
      setRejectingId(null);
      setRejectReason('');
      fetchPending();
    } catch {
      setActionError('Network error while rejecting.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <Link href="/admin/points" className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem' }}>
          <ArrowLeft size={14} />
          <span>All Transactions Ledger</span>
        </Link>
        <span className="badge badge-gold" style={{ marginBottom: '0.5rem', display: 'block', width: 'fit-content' }}>
          VERIFICATION QUEUE
        </span>
        <h1 style={{ fontSize: '2.2rem', color: '#fff' }}>Pending Point Approvals</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Review faculty point submissions. Approving a request commits points to the official house total and public activity feed.
        </p>
      </div>

      {actionError && (
        <div
          style={{
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            color: '#fca5a5',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem',
          }}
        >
          <AlertCircle size={18} />
          <span>{actionError}</span>
        </div>
      )}

      {successMsg && (
        <div
          style={{
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            color: '#6ee7b7',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem',
          }}
        >
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading pending requests...
        </div>
      ) : pending.length === 0 ? (
        <div className="glass-card" style={{ padding: '4rem', textAlign: 'center' }}>
          <CheckCircle2 size={48} color="var(--terra-primary)" style={{ margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.4rem', color: '#fff' }}>No Pending Requests</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            All point requests have been verified. The competition leaderboard is completely up to date.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {pending.map((tx) => (
            <div
              key={tx.id}
              className="glass-card"
              style={{
                padding: '1.75rem',
                borderLeft: `5px solid ${tx.house.primaryColor}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1.5rem',
              }}
            >
              <div style={{ flex: 1, minWidth: '280px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <span
                    className="badge"
                    style={{
                      background: `${tx.house.primaryColor}22`,
                      color: tx.house.primaryColor,
                      border: `1px solid ${tx.house.primaryColor}44`,
                    }}
                  >
                    {tx.house.name}
                  </span>

                  <span style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                    {tx.transactionCode}
                  </span>

                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Category: <strong>{tx.category.name}</strong>
                  </span>
                </div>

                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '0.35rem' }}>
                  {tx.reason}
                </div>

                {tx.description && (
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                    {tx.description}
                  </p>
                )}

                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.825rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                  {tx.student && (
                    <span>
                      Student: <strong style={{ color: '#fff' }}>{tx.student.firstName} {tx.student.lastName}</strong> ({tx.student.className})
                    </span>
                  )}
                  <span>Proposed by: <strong style={{ color: '#fff' }}>{tx.createdByName}</strong></span>
                  {tx.evidenceUrl && (
                    <a
                      href={tx.evidenceUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: 'var(--astra-accent)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                    >
                      <ExternalLink size={13} />
                      <span>Inspect Evidence File</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Point value and action buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                    Requested
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: tx.house.primaryColor, lineHeight: 1 }}>
                    +{tx.points} pts
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleApprove(tx.id)}
                    className="btn btn-primary btn-sm"
                    style={{ background: 'linear-gradient(135deg, #10b981, #047857)', borderColor: 'transparent' }}
                  >
                    <CheckCircle2 size={16} />
                    <span>Approve</span>
                  </button>

                  <button
                    onClick={() => {
                      setRejectingId(tx.id);
                      setRejectReason('');
                    }}
                    className="btn btn-danger btn-sm"
                  >
                    <XCircle size={16} />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {rejectingId && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
            padding: '1rem',
          }}
        >
          <div className="glass-card" style={{ width: '100%', maxWidth: '480px', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.3rem', color: '#fff', marginBottom: '0.5rem' }}>Reject Point Request</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
              Provide an explanation for rejecting this transaction. This will be preserved in the internal record.
            </p>

            <div className="form-group">
              <label className="form-label">Rejection Rationale</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Evidence certificate could not be confirmed, duplicate submission, etc."
                className="form-textarea"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => setRejectingId(null)}
                className="btn btn-secondary btn-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReject}
                className="btn btn-danger btn-sm"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
