'use client';

import React, { useState, useEffect } from 'react';
import { Bell, PlusCircle, CheckCircle2, AlertCircle, Pin, Edit2, Trash2, X } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface AnnItem {
  id: string;
  title: string;
  content: string;
  audienceType: string;
  authorName: string;
  isPinned: boolean;
  publishedAt: string;
  house?: { name: string; primaryColor: string } | null;
}

export default function AdminAnnouncementsPage() {
  const { lang } = useLanguage();
  const [announcements, setAnnouncements] = useState<AnnItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [editingAnn, setEditingAnn] = useState<AnnItem | null>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [audienceType, setAudienceType] = useState('ALL');
  const [houseId, setHouseId] = useState('');
  const [isPinned, setIsPinned] = useState(false);

  // Edit states
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editAudience, setEditAudience] = useState('ALL');
  const [editPinned, setEditPinned] = useState(false);

  const [houses, setHouses] = useState<{ id: string; name: string }[]>([]);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchAnnouncements = () => {
    setLoading(true);
    fetch('/api/announcements?audience=ANY')
      .then((res) => res.json())
      .then((data) => {
        if (data.announcements) setAnnouncements(data.announcements);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAnnouncements();
    fetch('/api/houses')
      .then((res) => res.json())
      .then((data) => {
        if (data.houses) setHouses(data.houses);
      });
  }, []);

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          audienceType,
          houseId: audienceType !== 'ALL' ? houseId : undefined,
          isPinned,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMsg({ type: 'error', text: data.error || 'Failed to create announcement' });
        return;
      }

      setMsg({ type: 'success', text: 'Announcement published successfully.' });
      setNewModalOpen(false);
      setTitle('');
      setContent('');
      setIsPinned(false);
      fetchAnnouncements();
    } catch {
      setMsg({ type: 'error', text: 'Network error publishing announcement.' });
    }
  };

  const handleUpdateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAnn) return;
    setMsg(null);

    try {
      const res = await fetch(`/api/announcements/${editingAnn.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle,
          content: editContent,
          audienceType: editAudience,
          isPinned: editPinned,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMsg({ type: 'error', text: data.error || 'Failed to update announcement' });
        return;
      }

      setMsg({ type: 'success', text: 'Announcement updated successfully.' });
      setEditingAnn(null);
      fetchAnnouncements();
    } catch {
      setMsg({ type: 'error', text: 'Network error updating announcement.' });
    }
  };

  const handleDeleteAnnouncement = async (ann: AnnItem) => {
    if (!confirm(`Are you sure you want to delete announcement "${ann.title}"?`)) return;
    setMsg(null);

    try {
      const res = await fetch(`/api/announcements/${ann.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (!res.ok) {
        setMsg({ type: 'error', text: data.error || 'Failed to delete announcement' });
        return;
      }

      setMsg({ type: 'success', text: 'Announcement deleted.' });
      fetchAnnouncements();
    } catch {
      setMsg({ type: 'error', text: 'Network error deleting announcement.' });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <span className="badge badge-gold" style={{ marginBottom: '0.5rem' }}>
            {lang === 'uz' ? 'XABARNOMALAR VA E’LONLAR' : 'COMMUNICATIONS'}
          </span>
          <h1 style={{ fontSize: '2.25rem', color: '#fff' }}>
            {lang === 'uz' ? 'E‘lonlar Boshqaruvi' : 'Announcements Board'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            {lang === 'uz'
              ? 'Maktab jamoasi va house guruhlari uchun rasmiy bildirishnomalarni chop etish, tahrirlash va o‘chirish.'
              : 'Broadcast official school bulletins, pin critical alerts, edit and manage announcements.'}
          </p>
        </div>

        <button onClick={() => setNewModalOpen(true)} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <PlusCircle size={15} />
          <span>{lang === 'uz' ? 'Yangi E‘lon' : 'New Announcement'}</span>
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {announcements.map((ann) => (
          <div
            key={ann.id}
            className="glass-card"
            style={{
              padding: '1.5rem 2rem',
              borderLeft: ann.house
                ? `4px solid ${ann.house.primaryColor}`
                : '4px solid var(--gold)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span
                  className={`badge ${
                    ann.audienceType === 'ASTRA'
                      ? 'badge-astra'
                      : ann.audienceType === 'TERRA'
                      ? 'badge-terra'
                      : 'badge-gold'
                  }`}
                >
                  {ann.audienceType}
                </span>
                {ann.isPinned && (
                  <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--gold)' }}>
                    <Pin size={12} />
                    <span>PINNED</span>
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {new Date(ann.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <button
                    onClick={() => {
                      setEditingAnn(ann);
                      setEditTitle(ann.title);
                      setEditContent(ann.content);
                      setEditAudience(ann.audienceType);
                      setEditPinned(ann.isPinned);
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', gap: '0.25rem' }}
                    title={lang === 'uz' ? 'Tahrirlash' : 'Edit'}
                  >
                    <Edit2 size={12} />
                    <span>{lang === 'uz' ? 'Tahrir' : 'Edit'}</span>
                  </button>
                  <button
                    onClick={() => handleDeleteAnnouncement(ann)}
                    className="btn btn-danger btn-sm"
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                    title={lang === 'uz' ? "O'chirish" : 'Delete'}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>

            <h3 style={{ fontSize: '1.3rem', color: '#fff', marginBottom: '0.5rem' }}>{ann.title}</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.925rem' }}>{ann.content}</p>

            <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Author: <strong>{ann.authorName}</strong>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE MODAL */}
      {newModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '540px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.35rem', color: '#fff' }}>
                {lang === 'uz' ? 'Yangi E‘lon Chop Etish' : 'Post Announcement'}
              </h3>
              <button onClick={() => setNewModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement}>
              <div className="form-group">
                <label className="form-label">{lang === 'uz' ? 'Sarlavha' : 'Title'}</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Navbatdagi fan olimpiadasi qoidalari"
                  className="form-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">{lang === 'uz' ? 'Auditoriya' : 'Target Audience'}</label>
                  <select
                    value={audienceType}
                    onChange={(e) => setAudienceType(e.target.value)}
                    className="form-select"
                  >
                    <option value="ALL">Everyone (All School)</option>
                    <option value="ASTRA">Astra House Only</option>
                    <option value="TERRA">Terra House Only</option>
                  </select>
                </div>

                <div className="form-group" style={{ display: 'flex', alignItems: 'center', marginTop: '1.8rem', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    id="isPinned"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <label htmlFor="isPinned" style={{ color: '#fff', fontSize: '0.875rem', cursor: 'pointer' }}>
                    {lang === 'uz' ? 'Tepaga qadash (Pin)' : 'Pin to top'}
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{lang === 'uz' ? 'Matn' : 'Content'}</label>
                <textarea
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="E'lon matnini kiriting..."
                  className="form-textarea"
                  style={{ minHeight: '120px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setNewModalOpen(false)} className="btn btn-secondary btn-sm">
                  {lang === 'uz' ? 'Bekor qilish' : 'Cancel'}
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  {lang === 'uz' ? 'Chop Etish' : 'Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingAnn && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '540px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.35rem', color: '#fff' }}>
                {lang === 'uz' ? 'E‘lonni Tahrirlash' : 'Edit Announcement'}
              </h3>
              <button onClick={() => setEditingAnn(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateAnnouncement}>
              <div className="form-group">
                <label className="form-label">{lang === 'uz' ? 'Sarlavha' : 'Title'}</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">{lang === 'uz' ? 'Auditoriya' : 'Target Audience'}</label>
                  <select
                    value={editAudience}
                    onChange={(e) => setEditAudience(e.target.value)}
                    className="form-select"
                  >
                    <option value="ALL">Everyone (All School)</option>
                    <option value="ASTRA">Astra House Only</option>
                    <option value="TERRA">Terra House Only</option>
                  </select>
                </div>

                <div className="form-group" style={{ display: 'flex', alignItems: 'center', marginTop: '1.8rem', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    id="editPinned"
                    checked={editPinned}
                    onChange={(e) => setEditPinned(e.target.checked)}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <label htmlFor="editPinned" style={{ color: '#fff', fontSize: '0.875rem', cursor: 'pointer' }}>
                    {lang === 'uz' ? 'Tepaga qadash (Pin)' : 'Pin to top'}
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{lang === 'uz' ? 'Matn' : 'Content'}</label>
                <textarea
                  required
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="form-textarea"
                  style={{ minHeight: '120px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setEditingAnn(null)} className="btn btn-secondary btn-sm">
                  {lang === 'uz' ? 'Bekor qilish' : 'Cancel'}
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  {lang === 'uz' ? 'Saqlash' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
