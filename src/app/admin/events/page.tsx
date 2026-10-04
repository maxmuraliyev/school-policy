'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, PlusCircle, CheckCircle2, AlertCircle, MapPin, Clock, Edit2, Trash2, X } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface EventItem {
  id: string;
  title: string;
  description: string;
  eventType: string;
  venue: string;
  startsAt: string;
  endsAt: string;
  house?: { name: string; primaryColor: string } | null;
}

export default function AdminEventsPage() {
  const { lang } = useLanguage();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [venue, setVenue] = useState('');
  const [eventType, setEventType] = useState('COMPETITION');
  const [houseId, setHouseId] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');

  // Edit states
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editVenue, setEditVenue] = useState('');
  const [editEventType, setEditEventType] = useState('COMPETITION');
  const [editStartsAt, setEditStartsAt] = useState('');
  const [editEndsAt, setEditEndsAt] = useState('');

  const [houses, setHouses] = useState<{ id: string; name: string }[]>([]);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchEvents = () => {
    setLoading(true);
    fetch('/api/events')
      .then((res) => res.json())
      .then((data) => {
        if (data.events) setEvents(data.events);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchEvents();
    fetch('/api/houses')
      .then((res) => res.json())
      .then((data) => {
        if (data.houses) setHouses(data.houses);
      });
  }, []);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          venue,
          eventType,
          houseId: houseId || null,
          startsAt: startsAt || new Date().toISOString(),
          endsAt: endsAt || new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMsg({ type: 'error', text: data.error || 'Failed to create event' });
        return;
      }

      setMsg({ type: 'success', text: `Event "${data.event.title}" scheduled successfully.` });
      setNewModalOpen(false);
      setTitle('');
      setDescription('');
      setVenue('');
      fetchEvents();
    } catch {
      setMsg({ type: 'error', text: 'Network error creating event.' });
    }
  };

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;
    setMsg(null);

    try {
      const res = await fetch(`/api/events/${editingEvent.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
          venue: editVenue,
          eventType: editEventType,
          startsAt: editStartsAt ? new Date(editStartsAt).toISOString() : undefined,
          endsAt: editEndsAt ? new Date(editEndsAt).toISOString() : undefined,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMsg({ type: 'error', text: data.error || 'Failed to update event' });
        return;
      }

      setMsg({ type: 'success', text: `Event "${data.event.title}" updated successfully.` });
      setEditingEvent(null);
      fetchEvents();
    } catch {
      setMsg({ type: 'error', text: 'Network error updating event.' });
    }
  };

  const handleDeleteEvent = async (event: EventItem) => {
    if (!confirm(`Are you sure you want to delete event "${event.title}"?`)) return;
    setMsg(null);

    try {
      const res = await fetch(`/api/events/${event.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (!res.ok) {
        setMsg({ type: 'error', text: data.error || 'Failed to delete event' });
        return;
      }

      setMsg({ type: 'success', text: 'Event removed.' });
      fetchEvents();
    } catch {
      setMsg({ type: 'error', text: 'Network error deleting event.' });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <span className="badge badge-gold" style={{ marginBottom: '0.5rem' }}>
            {lang === 'uz' ? 'TADBIRLAR AMALIYOTI' : 'EVENT OPERATIONS'}
          </span>
          <h1 style={{ fontSize: '2.25rem', color: '#fff' }}>
            {lang === 'uz' ? 'Tadbirlar va Taqvimi' : 'Events & Calendar Management'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            {lang === 'uz'
              ? 'Maktab house tadbirlarini rejalashtirish, vaqti va joyini boshqarish, tahrirlash va o‘chirish.'
              : 'Schedule inter-house matches, academic derbies, ceremony deadlines, edit and delete events.'}
          </p>
        </div>

        <button onClick={() => setNewModalOpen(true)} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <PlusCircle size={15} />
          <span>{lang === 'uz' ? 'Yangi Tadbir' : 'Schedule Event'}</span>
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
        {events.map((ev) => (
          <div
            key={ev.id}
            className="glass-card"
            style={{
              padding: '1.5rem 2rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              borderLeft: ev.house
                ? `4px solid ${ev.house.primaryColor}`
                : '4px solid var(--school-blue-light)',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
                <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>
                  {ev.eventType}
                </span>
                {ev.house && (
                  <span
                    className="badge"
                    style={{
                      background: `${ev.house.primaryColor}22`,
                      color: ev.house.primaryColor,
                      border: `1px solid ${ev.house.primaryColor}44`,
                    }}
                  >
                    {ev.house.name}
                  </span>
                )}
              </div>

              <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '0.35rem' }}>{ev.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '600px', marginBottom: '0.75rem' }}>
                {ev.description}
              </p>

              <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Clock size={14} color="var(--school-blue-accent)" />
                  <span>
                    {new Date(ev.startsAt).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MapPin size={14} color="var(--gold)" />
                  <span>{ev.venue}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button
                onClick={() => {
                  setEditingEvent(ev);
                  setEditTitle(ev.title);
                  setEditDescription(ev.description);
                  setEditVenue(ev.venue);
                  setEditEventType(ev.eventType);
                  setEditStartsAt(ev.startsAt ? new Date(ev.startsAt).toISOString().slice(0, 16) : '');
                  setEditEndsAt(ev.endsAt ? new Date(ev.endsAt).toISOString().slice(0, 16) : '');
                }}
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.35rem 0.6rem', fontSize: '0.775rem', gap: '0.25rem' }}
                title={lang === 'uz' ? 'Tahrirlash' : 'Edit'}
              >
                <Edit2 size={12} />
                <span>{lang === 'uz' ? 'Tahrir' : 'Edit'}</span>
              </button>
              <button
                onClick={() => handleDeleteEvent(ev)}
                className="btn btn-danger btn-sm"
                style={{ padding: '0.35rem 0.6rem', fontSize: '0.775rem' }}
                title={lang === 'uz' ? "O'chirish" : 'Delete'}
              >
                <Trash2 size={12} />
              </button>
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
                {lang === 'uz' ? 'Yangi Tadbir Rejalashtirish' : 'Schedule New Event'}
              </h3>
              <button onClick={() => setNewModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateEvent}>
              <div className="form-group">
                <label className="form-label">{lang === 'uz' ? 'Sarlavha' : 'Event Title'}</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Astra vs Terra Shaxmat Musobaqasi"
                  className="form-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">{lang === 'uz' ? 'Turi' : 'Event Type'}</label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    className="form-select"
                  >
                    <option value="COMPETITION">Competition</option>
                    <option value="CEREMONY">Ceremony</option>
                    <option value="MEETING">Meeting</option>
                    <option value="HOUSE_ACTIVITY">House Activity</option>
                    <option value="DEADLINE">Deadline</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">{lang === 'uz' ? 'O‘tkazilish Joyi' : 'Venue'}</label>
                  <input
                    type="text"
                    required
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    placeholder="e.g. Faollar zali"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{lang === 'uz' ? 'Tavsif' : 'Description'}</label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-textarea"
                  style={{ minHeight: '80px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setNewModalOpen(false)} className="btn btn-secondary btn-sm">
                  {lang === 'uz' ? 'Bekor qilish' : 'Cancel'}
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  {lang === 'uz' ? 'Rejalashtirish' : 'Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingEvent && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '540px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.35rem', color: '#fff' }}>
                {lang === 'uz' ? 'Tadbirni Tahrirlash' : 'Edit Event'}
              </h3>
              <button onClick={() => setEditingEvent(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateEvent}>
              <div className="form-group">
                <label className="form-label">{lang === 'uz' ? 'Sarlavha' : 'Event Title'}</label>
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
                  <label className="form-label">{lang === 'uz' ? 'Turi' : 'Event Type'}</label>
                  <select
                    value={editEventType}
                    onChange={(e) => setEditEventType(e.target.value)}
                    className="form-select"
                  >
                    <option value="COMPETITION">Competition</option>
                    <option value="CEREMONY">Ceremony</option>
                    <option value="MEETING">Meeting</option>
                    <option value="HOUSE_ACTIVITY">House Activity</option>
                    <option value="DEADLINE">Deadline</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">{lang === 'uz' ? 'O‘tkazilish Joyi' : 'Venue'}</label>
                  <input
                    type="text"
                    required
                    value={editVenue}
                    onChange={(e) => setEditVenue(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{lang === 'uz' ? 'Tavsif' : 'Description'}</label>
                <textarea
                  required
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="form-textarea"
                  style={{ minHeight: '80px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setEditingEvent(null)} className="btn btn-secondary btn-sm">
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
