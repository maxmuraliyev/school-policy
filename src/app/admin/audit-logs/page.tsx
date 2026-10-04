'use client';

import React, { useState, useEffect } from 'react';
import { ShieldAlert, Search, Filter, Eye, Clock, User, Globe } from 'lucide-react';

interface AuditLogItem {
  id: string;
  userName: string;
  action: string;
  entityType: string;
  entityId: string | null;
  oldData: string | null;
  newData: string | null;
  reason: string | null;
  ipAddress: string | null;
  createdAt: string;
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('ALL');
  const [entityFilter, setEntityFilter] = useState('ALL');
  const [inspectLog, setInspectLog] = useState<AuditLogItem | null>(null);

  useEffect(() => {
    setLoading(true);
    let url = '/api/admin/audit-logs?limit=50';
    if (actionFilter !== 'ALL') url += `&action=${actionFilter}`;
    if (entityFilter !== 'ALL') url += `&entityType=${entityFilter}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.auditLogs) setLogs(data.auditLogs);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [actionFilter, entityFilter]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <span className="badge badge-gold" style={{ marginBottom: '0.5rem' }}>
          IMMUTABLE INTEGRITY
        </span>
        <h1 style={{ fontSize: '2.25rem', color: '#fff' }}>Tamper-Evident Audit Trail</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Comprehensive forensic log of all administrative score changes, student house transfers, competition results, and logins.
        </p>
      </div>

      {/* FILTER BAR */}
      <div
        className="glass-card"
        style={{
          padding: '1.25rem',
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="form-select"
          style={{ width: '220px' }}
        >
          <option value="ALL">All Actions</option>
          <option value="POINT_CREATE">Point Created</option>
          <option value="POINT_APPROVE">Point Approved</option>
          <option value="POINT_REVERSE">Point Reversed</option>
          <option value="STUDENT_TRANSFER">Student House Transfer</option>
          <option value="COMPETITION_RESULTS_PUBLISH">Competition Results</option>
          <option value="LOGIN">User Login</option>
          <option value="FAILED_LOGIN">Failed Login Attempt</option>
        </select>

        <select
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
          className="form-select"
          style={{ width: '180px' }}
        >
          <option value="ALL">All Entity Types</option>
          <option value="PointTransaction">Point Transactions</option>
          <option value="Student">Students</option>
          <option value="Competition">Competitions</option>
          <option value="User">Users</option>
          <option value="Season">Seasons</option>
        </select>
      </div>

      {/* AUDIT LOG TABLE */}
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Action</th>
              <th>Staff User</th>
              <th>Target Entity</th>
              <th>Reason / Narrative</th>
              <th>IP Address</th>
              <th>Payload Diff</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  Loading forensic audit logs...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No audit logs matching selected filters.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id}>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.825rem', whiteSpace: 'nowrap' }}>
                    {new Date(log.createdAt).toLocaleString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        log.action.includes('REVERSE') || log.action.includes('FAILED')
                          ? 'badge-danger'
                          : log.action.includes('APPROVE') || log.action.includes('PUBLISH')
                          ? 'badge-success'
                          : 'badge-astra'
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600, color: '#fff' }}>{log.userName}</td>
                  <td>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {log.entityType} {log.entityId ? `#${log.entityId.slice(-6)}` : ''}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {log.reason || 'Standard verified operation'}
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {log.ipAddress || '127.0.0.1'}
                  </td>
                  <td>
                    <button
                      onClick={() => setInspectLog(log)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                    >
                      <Eye size={12} />
                      <span>Inspect</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* INSPECT LOG MODAL */}
      {inspectLog && (
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
          <div className="glass-card" style={{ width: '100%', maxWidth: '680px', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.35rem', color: '#fff', marginBottom: '0.35rem' }}>
              Audit Log Record Inspector
            </h3>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Action: <strong style={{ color: '#fff' }}>{inspectLog.action}</strong> &bull; User:{' '}
              <strong style={{ color: '#fff' }}>{inspectLog.userName}</strong> &bull; Time:{' '}
              {new Date(inspectLog.createdAt).toLocaleString()}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  Previous State (Old Data)
                </div>
                <pre
                  style={{
                    background: 'rgba(0, 0, 0, 0.4)',
                    padding: '0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.75rem',
                    color: '#fca5a5',
                    maxHeight: '220px',
                    overflowY: 'auto',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {inspectLog.oldData
                    ? JSON.stringify(JSON.parse(inspectLog.oldData), null, 2)
                    : 'None (Initial Creation)'}
                </pre>
              </div>

              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  Applied Mutation (New Data)
                </div>
                <pre
                  style={{
                    background: 'rgba(0, 0, 0, 0.4)',
                    padding: '0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.75rem',
                    color: '#6ee7b7',
                    maxHeight: '220px',
                    overflowY: 'auto',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {inspectLog.newData
                    ? JSON.stringify(JSON.parse(inspectLog.newData), null, 2)
                    : 'None (Deletion)'}
                </pre>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setInspectLog(null)}
                className="btn btn-secondary btn-sm"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
