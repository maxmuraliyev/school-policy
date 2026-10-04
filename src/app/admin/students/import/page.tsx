'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Eye,
  FileCheck,
} from 'lucide-react';

const SAMPLE_CSV = `first_name,last_name,grade,class,house
Timur,Ibragimov,10,10A,Astra
Layla,Kamilova,10,10A,Terra
Jasur,Mirzaev,11,11B,Astra
Nilufar,Alimova,9,9A,Terra
Farrukh,Yuldashev,9,9B,Astra`;

export default function StudentCSVImportPage() {
  const [csvText, setCsvText] = useState(SAMPLE_CSV);
  const [loading, setLoading] = useState(false);
  const [previewResult, setPreviewResult] = useState<{
    validCount: number;
    errorCount: number;
    errors: { row: number; reason: string }[];
    preview: { firstName: string; lastName: string; grade: number; className: string; houseId: string }[];
  } | null>(null);

  const [importResult, setImportResult] = useState<{
    success: boolean;
    importedCount: number;
    errorCount: number;
  } | null>(null);

  const [generalError, setGeneralError] = useState<string | null>(null);

  // Validate preview without committing
  const handleValidate = async () => {
    setLoading(true);
    setGeneralError(null);
    setImportResult(null);

    try {
      const res = await fetch('/api/students/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvContent: csvText, dryRun: true }),
      });
      const data = await res.json();

      if (!res.ok) {
        setGeneralError(data.error || 'Validation failed');
        setLoading(false);
        return;
      }

      setPreviewResult(data);
      setLoading(false);
    } catch {
      setGeneralError('Network error during CSV validation.');
      setLoading(false);
    }
  };

  // Commit actual import
  const handleCommitImport = async () => {
    setLoading(true);
    setGeneralError(null);

    try {
      const res = await fetch('/api/students/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvContent: csvText, dryRun: false }),
      });
      const data = await res.json();

      if (!res.ok) {
        setGeneralError(data.error || 'Import failed');
        setLoading(false);
        return;
      }

      setImportResult(data);
      setPreviewResult(null);
      setLoading(false);
    } catch {
      setGeneralError('Network error during bulk import.');
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <Link href="/admin/students" className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem' }}>
          <ArrowLeft size={14} />
          <span>Back to Students Roster</span>
        </Link>
        <span className="badge badge-gold" style={{ marginBottom: '0.5rem', display: 'block', width: 'fit-content' }}>
          BULK IMPORT
        </span>
        <h1 style={{ fontSize: '2.25rem', color: '#fff' }}>CSV Student Roster Import</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Upload or paste student records for automatic house assignment and code generation. Dry-run validation checks all rows before final confirmation.
        </p>
      </div>

      {generalError && (
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
          {generalError}
        </div>
      )}

      {importResult && (
        <div
          className="glass-card"
          style={{
            padding: '2rem',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            background: 'rgba(16, 185, 129, 0.1)',
            textAlign: 'center',
          }}
        >
          <CheckCircle2 size={42} color="var(--terra-primary)" style={{ margin: '0 auto 0.75rem auto' }} />
          <h2 style={{ fontSize: '1.5rem', color: '#fff' }}>Bulk Import Completed!</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '1rem' }}>
            Successfully added <strong>{importResult.importedCount}</strong> new students to the school roster.
          </p>
          <div style={{ marginTop: '1.5rem' }}>
            <Link href="/admin/students" className="btn btn-primary">
              View Updated Student Roster
            </Link>
          </div>
        </div>
      )}

      {/* CSV Input Panel */}
      <div className="glass-card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', color: '#fff' }}>CSV Data Input</h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Required headers: <code>first_name,last_name,grade,class,house</code>
          </span>
        </div>

        <textarea
          value={csvText}
          onChange={(e) => {
            setCsvText(e.target.value);
            setPreviewResult(null);
            setImportResult(null);
          }}
          className="form-textarea"
          style={{
            minHeight: '200px',
            fontFamily: 'monospace',
            fontSize: '0.9rem',
            lineHeight: 1.5,
            padding: '1rem',
          }}
          placeholder="Paste CSV rows here..."
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
          <button
            type="button"
            onClick={handleValidate}
            disabled={loading || !csvText.trim()}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Eye size={16} />
            <span>Validate & Preview Rows</span>
          </button>
        </div>
      </div>

      {/* PREVIEW & VALIDATION RESULTS */}
      {previewResult && (
        <div className="glass-card" style={{ padding: '2rem', border: '1px solid var(--border-medium)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', color: '#fff' }}>Validation Report</h2>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem', marginTop: '0.35rem' }}>
                <span style={{ color: 'var(--terra-primary)', fontWeight: 700 }}>
                  &bull; {previewResult.validCount} valid rows ready
                </span>
                {previewResult.errorCount > 0 && (
                  <span style={{ color: 'var(--danger)', fontWeight: 700 }}>
                    &bull; {previewResult.errorCount} row errors detected
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={handleCommitImport}
              disabled={loading || previewResult.validCount === 0}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <FileCheck size={16} />
              <span>Confirm & Import {previewResult.validCount} Students</span>
            </button>
          </div>

          {/* Error messages if any */}
          {previewResult.errors.length > 0 && (
            <div
              style={{
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                marginBottom: '1.5rem',
              }}
            >
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fca5a5', marginBottom: '0.5rem' }}>
                Errors must be resolved before those rows can be added:
              </div>
              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.825rem', color: '#fca5a5' }}>
                {previewResult.errors.map((err, i) => (
                  <li key={i}>
                    Line {err.row}: {err.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Preview sample table */}
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Grade</th>
                  <th>Class</th>
                  <th>House Assigned</th>
                </tr>
              </thead>
              <tbody>
                {previewResult.preview.map((row, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600, color: '#fff' }}>{row.firstName}</td>
                    <td>{row.lastName}</td>
                    <td>Grade {row.grade}</td>
                    <td>{row.className}</td>
                    <td>
                      <span className="badge badge-astra">Assigned</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
