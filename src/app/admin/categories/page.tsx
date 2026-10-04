'use client';

import React, { useState, useEffect } from 'react';
import {
  Sliders,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Award,
  Edit2,
  Trash2,
  X,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
  displayOrder: number;
  _count?: { transactions: number; competitions: number };
}

interface RuleItem {
  id: string;
  name: string;
  level: string;
  defaultPoints: number;
  description: string | null;
  category?: { name: string } | null;
}

export default function AdminCategoriesPage() {
  const { lang } = useLanguage();
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [rules, setRules] = useState<RuleItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Add category modal
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatColor, setNewCatColor] = useState('#6366F1');

  // Edit category modal
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [editCatName, setEditCatName] = useState('');
  const [editCatDesc, setEditCatDesc] = useState('');
  const [editCatColor, setEditCatColor] = useState('#6366F1');

  // Add rule modal
  const [ruleModalOpen, setRuleModalOpen] = useState(false);
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleLevel, setNewRuleLevel] = useState('SCHOOL');
  const [newRulePoints, setNewRulePoints] = useState('30');
  const [newRuleDesc, setNewRuleDesc] = useState('');

  // Edit rule modal
  const [editingRule, setEditingRule] = useState<RuleItem | null>(null);
  const [editRuleName, setEditRuleName] = useState('');
  const [editRuleLevel, setEditRuleLevel] = useState('SCHOOL');
  const [editRulePoints, setEditRulePoints] = useState('30');
  const [editRuleDesc, setEditRuleDesc] = useState('');

  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/categories').then((r) => r.json()),
      fetch('/api/scoring-rules').then((r) => r.json()),
    ])
      .then(([catsData, rulesData]) => {
        if (catsData.categories) setCategories(catsData.categories);
        if (rulesData.scoringRules) setRules(rulesData.scoringRules);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Category Actions
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCatName,
          description: newCatDesc,
          color: newCatColor,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMsg({ type: 'error', text: data.error || 'Failed to create category' });
        return;
      }

      setMsg({ type: 'success', text: `Category "${data.category.name}" added.` });
      setCatModalOpen(false);
      setNewCatName('');
      setNewCatDesc('');
      fetchData();
    } catch {
      setMsg({ type: 'error', text: 'Network error creating category.' });
    }
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    setMsg(null);

    try {
      const res = await fetch(`/api/categories/${editingCategory.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editCatName,
          description: editCatDesc,
          color: editCatColor,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMsg({ type: 'error', text: data.error || 'Failed to update category' });
        return;
      }

      setMsg({ type: 'success', text: `Category "${data.category.name}" updated successfully.` });
      setEditingCategory(null);
      fetchData();
    } catch {
      setMsg({ type: 'error', text: 'Network error updating category.' });
    }
  };

  const handleDeleteCategory = async (category: CategoryItem) => {
    if (!confirm(`Are you sure you want to delete category "${category.name}"?`)) return;
    setMsg(null);

    try {
      const res = await fetch(`/api/categories/${category.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (!res.ok) {
        setMsg({ type: 'error', text: data.error || 'Failed to delete category' });
        return;
      }

      setMsg({ type: 'success', text: `Category "${category.name}" removed.` });
      fetchData();
    } catch {
      setMsg({ type: 'error', text: 'Network error deleting category.' });
    }
  };

  // Rule Actions
  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    try {
      const res = await fetch('/api/scoring-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newRuleName,
          level: newRuleLevel,
          defaultPoints: parseInt(newRulePoints, 10),
          description: newRuleDesc,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMsg({ type: 'error', text: data.error || 'Failed to create rule' });
        return;
      }

      setMsg({ type: 'success', text: `Scoring rule "${data.scoringRule.name}" added.` });
      setRuleModalOpen(false);
      setNewRuleName('');
      setNewRuleDesc('');
      fetchData();
    } catch {
      setMsg({ type: 'error', text: 'Network error creating rule.' });
    }
  };

  const handleUpdateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRule) return;
    setMsg(null);

    try {
      const res = await fetch(`/api/scoring-rules/${editingRule.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editRuleName,
          level: editRuleLevel,
          defaultPoints: parseInt(editRulePoints, 10),
          description: editRuleDesc,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMsg({ type: 'error', text: data.error || 'Failed to update rule' });
        return;
      }

      setMsg({ type: 'success', text: `Scoring rule "${data.scoringRule.name}" updated successfully.` });
      setEditingRule(null);
      fetchData();
    } catch {
      setMsg({ type: 'error', text: 'Network error updating rule.' });
    }
  };

  const handleDeleteRule = async (rule: RuleItem) => {
    if (!confirm(`Are you sure you want to delete scoring rule "${rule.name}"?`)) return;
    setMsg(null);

    try {
      const res = await fetch(`/api/scoring-rules/${rule.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (!res.ok) {
        setMsg({ type: 'error', text: data.error || 'Failed to delete rule' });
        return;
      }

      setMsg({ type: 'success', text: `Scoring rule "${rule.name}" removed.` });
      fetchData();
    } catch {
      setMsg({ type: 'error', text: 'Network error deleting rule.' });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <span className="badge badge-gold" style={{ marginBottom: '0.5rem' }}>
            {lang === 'uz' ? 'QOIDALAR VA KATEGORIYALAR' : 'RULES & CATEGORIES'}
          </span>
          <h1 style={{ fontSize: '2.25rem', color: '#fff' }}>
            {lang === 'uz' ? 'Kategoriyalar va Ball Qoidalari' : 'Categories & Scoring Rules'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            {lang === 'uz'
              ? 'Maktab House tizimi ball shkalasini sozlash, kategoriyalarni boshqarish, tahrirlash va o‘chirish.'
              : 'Manage the institutional scoring taxonomy, configure templates, edit or delete rules and categories.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => setCatModalOpen(true)} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <PlusCircle size={15} />
            <span>{lang === 'uz' ? 'Yangi Kategoriya' : 'Add Category'}</span>
          </button>
          <button onClick={() => setRuleModalOpen(true)} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <PlusCircle size={15} />
            <span>{lang === 'uz' ? 'Yangi Qoida' : 'New Scoring Rule'}</span>
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

      {/* CATEGORIES GRID */}
      <div>
        <h2 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '1rem' }}>
          {lang === 'uz' ? 'Faol Musobaqa Kategoriyalari' : 'Active Competition Categories'}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1.25rem' }}>
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="glass-card"
              style={{
                padding: '1.5rem',
                borderLeft: `4px solid ${cat.color}`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.15rem', color: '#fff' }}>{cat.name}</h3>
                  <span
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: cat.color,
                    }}
                  />
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
                  {cat.description}
                </p>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
                  {cat._count?.transactions || 0} {lang === 'uz' ? 'ball amallari' : 'transactions'} &bull; {cat._count?.competitions || 0} {lang === 'uz' ? 'tadbir' : 'events'}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
                  <button
                    onClick={() => {
                      setEditingCategory(cat);
                      setEditCatName(cat.name);
                      setEditCatDesc(cat.description);
                      setEditCatColor(cat.color);
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1, padding: '0.35rem 0.5rem', fontSize: '0.775rem', gap: '0.3rem' }}
                  >
                    <Edit2 size={12} />
                    <span>{lang === 'uz' ? 'Tahrirlash' : 'Edit'}</span>
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(cat)}
                    className="btn btn-danger btn-sm"
                    style={{ padding: '0.35rem 0.6rem', fontSize: '0.775rem' }}
                    title={lang === 'uz' ? "O'chirish" : 'Delete'}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SCORING RULES TABLE */}
      <div>
        <h2 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '1rem' }}>
          {lang === 'uz' ? 'Standart Ball Qoidalari Shabloni' : 'Standard Point Templates'}
        </h2>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>{lang === 'uz' ? 'Qoida Nomi' : 'Rule Name'}</th>
                <th>{lang === 'uz' ? 'Daraja' : 'Level'}</th>
                <th>{lang === 'uz' ? 'Standart Ball' : 'Standard Points'}</th>
                <th>{lang === 'uz' ? 'Tavsif' : 'Description'}</th>
                <th style={{ textAlign: 'right' }}>{lang === 'uz' ? 'Amallar' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((rule) => (
                <tr key={rule.id}>
                  <td style={{ fontWeight: 700, color: '#fff' }}>{rule.name}</td>
                  <td>
                    <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>
                      {rule.level}
                    </span>
                  </td>
                  <td>
                    <strong style={{ color: 'var(--gold)', fontSize: '1.05rem' }}>
                      +{rule.defaultPoints} pts
                    </strong>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    {rule.description || 'Standard scale'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                      <button
                        onClick={() => {
                          setEditingRule(rule);
                          setEditRuleName(rule.name);
                          setEditRuleLevel(rule.level);
                          setEditRulePoints(String(rule.defaultPoints));
                          setEditRuleDesc(rule.description || '');
                        }}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem', gap: '0.25rem' }}
                        title={lang === 'uz' ? 'Tahrirlash' : 'Edit'}
                      >
                        <Edit2 size={12} />
                        <span>{lang === 'uz' ? 'Tahrirlash' : 'Edit'}</span>
                      </button>
                      <button
                        onClick={() => handleDeleteRule(rule)}
                        className="btn btn-danger btn-sm"
                        style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem' }}
                        title={lang === 'uz' ? "O'chirish" : 'Delete'}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD CATEGORY MODAL */}
      {catModalOpen && (
        <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '480px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.35rem', color: '#fff' }}>
                {lang === 'uz' ? 'Yangi Kategoriya Qo‘shish' : 'Create New Category'}
              </h3>
              <button onClick={() => setCatModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCategory}>
              <div className="form-group">
                <label className="form-label">{lang === 'uz' ? 'Nomi' : 'Name'}</label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. Robototexnika yoki Chet tillari"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">{lang === 'uz' ? 'Rang' : 'Accent Color'}</label>
                <input
                  type="color"
                  value={newCatColor}
                  onChange={(e) => setNewCatColor(e.target.value)}
                  style={{ width: '100%', height: '42px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', background: 'transparent', cursor: 'pointer' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{lang === 'uz' ? 'Tavsif' : 'Description'}</label>
                <textarea
                  required
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  className="form-textarea"
                  style={{ minHeight: '80px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setCatModalOpen(false)} className="btn btn-secondary btn-sm">
                  {lang === 'uz' ? 'Bekor qilish' : 'Cancel'}
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  {lang === 'uz' ? 'Qo‘shish' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT CATEGORY MODAL */}
      {editingCategory && (
        <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '480px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.35rem', color: '#fff' }}>
                {lang === 'uz' ? 'Kategoriyani Tahrirlash' : 'Edit Category'}
              </h3>
              <button onClick={() => setEditingCategory(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateCategory}>
              <div className="form-group">
                <label className="form-label">{lang === 'uz' ? 'Nomi' : 'Name'}</label>
                <input
                  type="text"
                  required
                  value={editCatName}
                  onChange={(e) => setEditCatName(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">{lang === 'uz' ? 'Rang' : 'Accent Color'}</label>
                <input
                  type="color"
                  value={editCatColor}
                  onChange={(e) => setEditCatColor(e.target.value)}
                  style={{ width: '100%', height: '42px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', background: 'transparent', cursor: 'pointer' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{lang === 'uz' ? 'Tavsif' : 'Description'}</label>
                <textarea
                  required
                  value={editCatDesc}
                  onChange={(e) => setEditCatDesc(e.target.value)}
                  className="form-textarea"
                  style={{ minHeight: '80px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setEditingCategory(null)} className="btn btn-secondary btn-sm">
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

      {/* ADD RULE MODAL */}
      {ruleModalOpen && (
        <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '480px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.35rem', color: '#fff' }}>
                {lang === 'uz' ? 'Yangi Ball Qoidasi' : 'Create Scoring Rule'}
              </h3>
              <button onClick={() => setRuleModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateRule}>
              <div className="form-group">
                <label className="form-label">{lang === 'uz' ? 'Qoida Nomi' : 'Rule Name'}</label>
                <input
                  type="text"
                  required
                  value={newRuleName}
                  onChange={(e) => setNewRuleName(e.target.value)}
                  placeholder="e.g. 1-o‘rin (Respublika olimpiadasi)"
                  className="form-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">{lang === 'uz' ? 'Daraja' : 'Level'}</label>
                  <select
                    value={newRuleLevel}
                    onChange={(e) => setNewRuleLevel(e.target.value)}
                    className="form-select"
                  >
                    <option value="SCHOOL">School</option>
                    <option value="CITY">City</option>
                    <option value="REGIONAL">Regional</option>
                    <option value="NATIONAL">National</option>
                    <option value="INTERNATIONAL">International</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">{lang === 'uz' ? 'Standart Ball' : 'Default Points'}</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="200"
                    value={newRulePoints}
                    onChange={(e) => setNewRulePoints(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{lang === 'uz' ? 'Tavsif' : 'Description'}</label>
                <textarea
                  value={newRuleDesc}
                  onChange={(e) => setNewRuleDesc(e.target.value)}
                  className="form-textarea"
                  style={{ minHeight: '80px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setRuleModalOpen(false)} className="btn btn-secondary btn-sm">
                  {lang === 'uz' ? 'Bekor qilish' : 'Cancel'}
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  {lang === 'uz' ? 'Qo‘shish' : 'Create Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT RULE MODAL */}
      {editingRule && (
        <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '480px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.35rem', color: '#fff' }}>
                {lang === 'uz' ? 'Ball Qoidasini Tahrirlash' : 'Edit Scoring Rule'}
              </h3>
              <button onClick={() => setEditingRule(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateRule}>
              <div className="form-group">
                <label className="form-label">{lang === 'uz' ? 'Qoida Nomi' : 'Rule Name'}</label>
                <input
                  type="text"
                  required
                  value={editRuleName}
                  onChange={(e) => setEditRuleName(e.target.value)}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">{lang === 'uz' ? 'Daraja' : 'Level'}</label>
                  <select
                    value={editRuleLevel}
                    onChange={(e) => setEditRuleLevel(e.target.value)}
                    className="form-select"
                  >
                    <option value="SCHOOL">School</option>
                    <option value="CITY">City</option>
                    <option value="REGIONAL">Regional</option>
                    <option value="NATIONAL">National</option>
                    <option value="INTERNATIONAL">International</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">{lang === 'uz' ? 'Standart Ball' : 'Default Points'}</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="200"
                    value={editRulePoints}
                    onChange={(e) => setEditRulePoints(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{lang === 'uz' ? 'Tavsif' : 'Description'}</label>
                <textarea
                  value={editRuleDesc}
                  onChange={(e) => setEditRuleDesc(e.target.value)}
                  className="form-textarea"
                  style={{ minHeight: '80px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setEditingRule(null)} className="btn btn-secondary btn-sm">
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
