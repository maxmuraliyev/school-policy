'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  PlusCircle,
  FileSpreadsheet,
  Download,
  ArrowRightLeft,
  Archive,
  RotateCcw,
  Award,
  AlertCircle,
  CheckCircle2,
  X,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface StudentRow {
  id: string;
  studentCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  grade: number;
  className: string;
  houseId: string;
  houseName: string;
  houseSlug: string;
  houseColor: string;
  totalPoints: number;
  status: string;
}

export default function AdminStudentsPage() {
  const { lang } = useLanguage();
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [houseFilter, setHouseFilter] = useState('ALL');
  const [gradeFilter, setGradeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ACTIVE');

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);

  // Transfer modal
  const [transferringStudent, setTransferringStudent] = useState<StudentRow | null>(null);
  const [targetHouseId, setTargetHouseId] = useState('');
  const [transferReason, setTransferReason] = useState('');

  // Award Points Modal (Issue 6: Give points to student)
  const [awardingStudent, setAwardingStudent] = useState<StudentRow | null>(null);
  const [awardPoints, setAwardPoints] = useState('20');
  const [awardCategoryId, setAwardCategoryId] = useState('');
  const [awardReason, setAwardReason] = useState('');
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  // Add student modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newGrade, setNewGrade] = useState('10');
  const [newClass, setNewClass] = useState('10A');
  const [newHouseId, setNewHouseId] = useState('');
  const [newBio, setNewBio] = useState('');

  const [houses, setHouses] = useState<{ id: string; name: string }[]>([]);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '20',
        status: statusFilter,
        houseId: houseFilter,
        grade: gradeFilter,
      });
      if (search.trim()) params.set('search', search.trim());

      const res = await fetch(`/api/students?${params.toString()}`);
      const data = await res.json();

      if (data.students) {
        setStudents(data.students);
        setTotalPages(data.pagination.totalPages);
        setTotalStudents(data.pagination.total);
      }
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [page, statusFilter, houseFilter, gradeFilter, search]);

  useEffect(() => {
    fetch('/api/houses')
      .then((res) => res.json())
      .then((data) => {
        if (data.houses) {
          setHouses(data.houses);
          if (data.houses.length > 0) {
            setNewHouseId(data.houses[0].id);
          }
        }
      });

    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) {
          setCategories(data.categories);
          if (data.categories.length > 0) {
            setAwardCategoryId(data.categories[0].id);
          }
        }
      });
  }, []);

  // Open transfer modal with destination house pre-selected to the opposite house
  const openTransferModal = (student: StudentRow) => {
    setTransferringStudent(student);
    const destination = houses.find((h) => h.id !== student.houseId);
    setTargetHouseId(destination?.id || '');
    setTransferReason('');
  };

  const handleTransfer = async () => {
    if (!transferringStudent) return;
    if (!targetHouseId || targetHouseId === transferringStudent.houseId) {
      setMsg({ type: 'error', text: 'Please select a different destination house.' });
      return;
    }
    setMsg(null);

    try {
      const res = await fetch(`/api/students/${transferringStudent.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          houseId: targetHouseId,
          transferReason,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMsg({ type: 'error', text: data.error || 'Failed to transfer student' });
        return;
      }

      setMsg({
        type: 'success',
        text: `Student ${transferringStudent.fullName} successfully transferred. Previous house points remain permanently credited to historical house.`,
      });
      setTransferringStudent(null);
      setTransferReason('');
      fetchStudents();
    } catch {
      setMsg({ type: 'error', text: 'Network error during transfer.' });
    }
  };

  const handleArchive = async (student: StudentRow) => {
    if (!confirm(`Are you sure you want to archive student ${student.fullName}?`)) return;
    setMsg(null);

    try {
      const res = await fetch(`/api/students/${student.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (!res.ok) {
        setMsg({ type: 'error', text: data.error || 'Failed to archive student' });
        return;
      }

      setMsg({ type: 'success', text: `Student ${student.fullName} archived successfully.` });
      fetchStudents();
    } catch {
      setMsg({ type: 'error', text: 'Network error during archiving.' });
    }
  };

  const handleRestore = async (student: StudentRow) => {
    if (!confirm(`Restore student ${student.fullName} back to active status?`)) return;
    setMsg(null);

    try {
      const res = await fetch(`/api/students/${student.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ACTIVE' }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMsg({ type: 'error', text: data.error || 'Failed to restore student' });
        return;
      }

      setMsg({ type: 'success', text: `Student ${student.fullName} restored to active roster.` });
      fetchStudents();
    } catch {
      setMsg({ type: 'error', text: 'Network error during student restore.' });
    }
  };

  // Award Points directly to student
  const handleAwardStudentPoints = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!awardingStudent) return;
    setMsg(null);

    try {
      const res = await fetch('/api/points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: awardingStudent.id,
          houseId: awardingStudent.houseId,
          categoryId: awardCategoryId,
          points: parseInt(awardPoints, 10),
          reason: awardReason,
          directApprove: true,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMsg({ type: 'error', text: data.error || 'Failed to award points' });
        return;
      }

      setMsg({
        type: 'success',
        text: `Successfully awarded ${awardPoints} points to ${awardingStudent.fullName}!`,
      });
      setAwardingStudent(null);
      setAwardReason('');
      fetchStudents();
    } catch {
      setMsg({ type: 'error', text: 'Network error while awarding points.' });
    }
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: newFirstName,
          lastName: newLastName,
          grade: parseInt(newGrade, 10),
          className: newClass,
          houseId: newHouseId,
          bio: newBio,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMsg({ type: 'error', text: data.error || 'Failed to create student' });
        return;
      }

      setMsg({ type: 'success', text: `Student created with student code ${data.student.studentCode}.` });
      setAddModalOpen(false);
      setNewFirstName('');
      setNewLastName('');
      setNewBio('');
      fetchStudents();
    } catch {
      setMsg({ type: 'error', text: 'Network error creating student.' });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <span className="badge badge-gold" style={{ marginBottom: '0.5rem' }}>
            {lang === 'uz' ? 'O‘QUVCHILAR BAZASI' : 'STUDENT REGISTRY'}
          </span>
          <h1 style={{ fontSize: '2.25rem', color: '#fff' }}>
            {lang === 'uz' ? 'O‘quvchilar Ro‘yxati' : 'Students Roster & Houses'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            {lang === 'uz'
              ? 'O‘quvchilar yozuvlarini boshqarish, house guruhlariga biriktirish, ko‘chirish va shaxsiy ballarni taqsimlash.'
              : 'Manage student records, perform audited house transfers, award points, and manage rosters.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link
            href="/admin/students/import"
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <FileSpreadsheet size={15} />
            <span>{lang === 'uz' ? 'CSV Import' : 'Bulk CSV Import'}</span>
          </Link>

          <button
            onClick={() => setAddModalOpen(true)}
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <PlusCircle size={15} />
            <span>{lang === 'uz' ? 'Yangi O‘quvchi' : 'Add Student'}</span>
          </button>
        </div>
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

      {/* Filter and Search Bar */}
      <div
        className="glass-card"
        style={{
          padding: '1.25rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', flex: 1, minWidth: '240px', position: 'relative' }}>
          <Search
            size={16}
            color="var(--text-muted)"
            style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={lang === 'uz' ? 'Ism, familiya yoki student kodi bo‘yicha qidirish...' : 'Search student by name, surname, or STU code...'}
            className="form-input"
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <select
            value={houseFilter}
            onChange={(e) => {
              setHouseFilter(e.target.value);
              setPage(1);
            }}
            className="form-select"
            style={{ width: 'auto' }}
          >
            <option value="ALL">{lang === 'uz' ? 'Barcha Guruhlar' : 'All Houses'}</option>
            {houses.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>

          <select
            value={gradeFilter}
            onChange={(e) => {
              setGradeFilter(e.target.value);
              setPage(1);
            }}
            className="form-select"
            style={{ width: 'auto' }}
          >
            <option value="ALL">{lang === 'uz' ? 'Barcha Sinflar' : 'All Grades'}</option>
            <option value="9">Grade 9</option>
            <option value="10">Grade 10</option>
            <option value="11">Grade 11</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="form-select"
            style={{ width: 'auto' }}
          >
            <option value="ACTIVE">{lang === 'uz' ? 'Faol O‘quvchilar' : 'Active Only'}</option>
            <option value="ARCHIVED">{lang === 'uz' ? 'Arxivlangan' : 'Archived'}</option>
            <option value="ALL">{lang === 'uz' ? 'Barcha Holatlar' : 'All Statuses'}</option>
          </select>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>{lang === 'uz' ? 'Kodi' : 'Code'}</th>
              <th>{lang === 'uz' ? 'F.I.SH' : 'Full Name'}</th>
              <th>{lang === 'uz' ? 'Guruh' : 'House'}</th>
              <th>{lang === 'uz' ? 'Sinf' : 'Grade'}</th>
              <th>{lang === 'uz' ? 'Guruhcha' : 'Class'}</th>
              <th>{lang === 'uz' ? 'Ballar' : 'Points'}</th>
              <th>{lang === 'uz' ? 'Holat' : 'Status'}</th>
              <th>{lang === 'uz' ? 'Amallar' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  {lang === 'uz' ? 'O‘quvchilar ro‘yxati yuklanmoqda...' : 'Loading students database...'}
                </td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  {lang === 'uz' ? 'Mos keluvchi o‘quvchilar topilmadi.' : 'No students matching criteria found.'}
                </td>
              </tr>
            ) : (
              students.map((s) => (
                <tr key={s.id}>
                  <td>
                    <span className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {s.studentCode}
                    </span>
                  </td>
                  <td>
                    <Link
                      href={`/students/${s.id}`}
                      style={{ color: '#fff', fontWeight: 600, textDecoration: 'none' }}
                    >
                      {s.fullName}
                    </Link>
                  </td>
                  <td>
                    <span
                      className="badge"
                      style={{
                        background: `${s.houseColor}18`,
                        color: s.houseColor,
                        border: `1px solid ${s.houseColor}33`,
                      }}
                    >
                      {s.houseName}
                    </span>
                  </td>
                  <td>Grade {s.grade}</td>
                  <td>{s.className}</td>
                  <td>
                    <strong style={{ color: s.houseColor }}>+{s.totalPoints}</strong>
                  </td>
                  <td>
                    <span className={`badge ${s.status === 'ACTIVE' ? 'badge-success' : 'badge-neutral'}`}>
                      {s.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {/* Give Points Quick Button (Issue 6) */}
                      {s.status === 'ACTIVE' && (
                        <button
                          onClick={() => {
                            setAwardingStudent(s);
                            setAwardPoints('20');
                            setAwardReason('');
                          }}
                          className="btn btn-primary btn-sm"
                          style={{ padding: '0.3rem 0.55rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                          title={lang === 'uz' ? "O'quvchiga ball berish" : 'Award points to this student'}
                        >
                          <Award size={12} />
                          <span>+ Pts</span>
                        </button>
                      )}

                      {/* Transfer Button */}
                      {s.status === 'ACTIVE' && (
                        <button
                          onClick={() => openTransferModal(s)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.3rem 0.55rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                          title={lang === 'uz' ? "Boshqa housega ko'chirish" : 'Transfer to different house (audited)'}
                        >
                          <ArrowRightLeft size={12} />
                          <span>{lang === 'uz' ? "Ko'chirish" : 'Transfer'}</span>
                        </button>
                      )}

                      {/* Archive Button */}
                      {s.status === 'ACTIVE' ? (
                        <button
                          onClick={() => handleArchive(s)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.3rem 0.55rem', fontSize: '0.75rem' }}
                          title={lang === 'uz' ? 'Arxivlash' : 'Archive student'}
                        >
                          <Archive size={12} />
                        </button>
                      ) : (
                        /* Restore Button (Issue 7) */
                        <button
                          onClick={() => handleRestore(s)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.3rem 0.55rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#6ee7b7' }}
                          title={lang === 'uz' ? 'Faol holatga tiklash' : 'Restore student to active'}
                        >
                          <RotateCcw size={12} />
                          <span>{lang === 'uz' ? 'Tiklash' : 'Restore'}</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Showing page {page} of {totalPages} ({totalStudents} total records)
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn btn-secondary btn-sm"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="btn btn-secondary btn-sm"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* HOUSE TRANSFER MODAL (Issue 7: Fixed & verified) */}
      {transferringStudent && (
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.35rem', color: '#fff' }}>
                {lang === 'uz' ? 'Auditorlik House Transferi' : 'Audited House Transfer'}
              </h3>
              <button onClick={() => setTransferringStudent(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              Transferring <strong>{transferringStudent.fullName}</strong> from <strong>{transferringStudent.houseName}</strong>.
              <br />
              <em style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Note (PRD Section 36): Historical score transactions remain permanently connected to the house they belonged to when earned.
              </em>
            </p>

            <div className="form-group">
              <label className="form-label">{lang === 'uz' ? 'Yangi Guruh (Destination House)' : 'Destination House'}</label>
              <select
                value={targetHouseId}
                onChange={(e) => setTargetHouseId(e.target.value)}
                className="form-select"
              >
                {/* Exclude the student's current house from destination options */}
                {houses
                  .filter((h) => h.id !== transferringStudent.houseId)
                  .map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">{lang === 'uz' ? 'Transfer Sababi (Kamida 5 ta belgi)' : 'Mandatory Administrative Reason'}</label>
              <textarea
                required
                value={transferReason}
                onChange={(e) => setTransferReason(e.target.value)}
                placeholder={lang === 'uz' ? 'e.g. Pedagogik kengash qarori asosida guruhlar balansini to‘g‘rilash...' : 'e.g. Balanced roster reallocation approved by Academic Council...'}
                className="form-textarea"
                style={{ minHeight: '90px' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => setTransferringStudent(null)}
                className="btn btn-secondary btn-sm"
              >
                {lang === 'uz' ? 'Bekor qilish' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleTransfer}
                disabled={transferReason.trim().length < 5 || !targetHouseId || targetHouseId === transferringStudent.houseId}
                className="btn btn-primary btn-sm"
              >
                {lang === 'uz' ? 'Ko‘chirishni Tasdiqlash' : 'Confirm Transfer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AWARD POINTS TO STUDENT MODAL (Issue 6) */}
      {awardingStudent && (
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
          <div className="glass-card" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '1.35rem', color: '#fff' }}>
                {lang === 'uz' ? 'O‘quvchiga Ball Berish' : 'Award Student Points'}
              </h3>
              <button onClick={() => setAwardingStudent(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              Recipient: <strong>{awardingStudent.fullName}</strong> ({awardingStudent.houseName} • {awardingStudent.className})
            </p>

            <form onSubmit={handleAwardStudentPoints}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">{lang === 'uz' ? 'Ball Miqdori' : 'Points'}</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="100"
                    value={awardPoints}
                    onChange={(e) => setAwardPoints(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{lang === 'uz' ? 'Kategoriya' : 'Category'}</label>
                  <select
                    value={awardCategoryId}
                    onChange={(e) => setAwardCategoryId(e.target.value)}
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

              <div className="form-group">
                <label className="form-label">{lang === 'uz' ? 'Berilish Sababi' : 'Reason / Activity'}</label>
                <textarea
                  required
                  value={awardReason}
                  onChange={(e) => setAwardReason(e.target.value)}
                  placeholder={lang === 'uz' ? 'e.g. Matematika olimpiadasida 1-o‘rinni egalladi' : 'e.g. 1st place in mathematics tournament'}
                  className="form-textarea"
                  style={{ minHeight: '80px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setAwardingStudent(null)}
                  className="btn btn-secondary btn-sm"
                >
                  {lang === 'uz' ? 'Bekor qilish' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={awardReason.trim().length < 3}
                  className="btn btn-primary btn-sm"
                >
                  {lang === 'uz' ? 'Ballni Yozish' : 'Award Points'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD STUDENT MODAL */}
      {addModalOpen && (
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.35rem', color: '#fff' }}>
                {lang === 'uz' ? 'Yangi O‘quvchi Qo‘shish' : 'Add New Student'}
              </h3>
              <button onClick={() => setAddModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateStudent}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">{lang === 'uz' ? 'Ismi' : 'First Name'}</label>
                  <input
                    type="text"
                    required
                    value={newFirstName}
                    onChange={(e) => setNewFirstName(e.target.value)}
                    placeholder="e.g. Jasur"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{lang === 'uz' ? 'Familiyasi' : 'Last Name'}</label>
                  <input
                    type="text"
                    required
                    value={newLastName}
                    onChange={(e) => setNewLastName(e.target.value)}
                    placeholder="e.g. Rustamov"
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">{lang === 'uz' ? 'Sinf Bosqichi' : 'Grade'}</label>
                  <select
                    value={newGrade}
                    onChange={(e) => setNewGrade(e.target.value)}
                    className="form-select"
                  >
                    <option value="9">Grade 9</option>
                    <option value="10">Grade 10</option>
                    <option value="11">Grade 11</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">{lang === 'uz' ? 'Sinf Guruhchasi' : 'Class Code'}</label>
                  <input
                    type="text"
                    required
                    value={newClass}
                    onChange={(e) => setNewClass(e.target.value)}
                    placeholder="e.g. 10A"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{lang === 'uz' ? 'House Guruhi' : 'Assigned House'}</label>
                <select
                  value={newHouseId}
                  onChange={(e) => setNewHouseId(e.target.value)}
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
                <label className="form-label">{lang === 'uz' ? 'Qisqa Bio' : 'Student Bio / Interests'}</label>
                <textarea
                  value={newBio}
                  onChange={(e) => setNewBio(e.target.value)}
                  placeholder="e.g. Matematika va fizika fanlariga qiziqadi..."
                  className="form-textarea"
                  style={{ minHeight: '70px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="btn btn-secondary btn-sm"
                >
                  {lang === 'uz' ? 'Bekor qilish' : 'Cancel'}
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  {lang === 'uz' ? 'Saqlash' : 'Save Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
