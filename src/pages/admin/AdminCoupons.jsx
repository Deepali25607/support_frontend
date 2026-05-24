import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, Search, Tag, Power, AlertCircle, X, Save, Check, Copy } from 'lucide-react';
import { api } from '../../lib/api.js';
import Reveal from '../../components/Reveal.jsx';

const blank = { code: '', label: '', type: 'percent', amount: 10, maxUses: 200, expiresAt: '', active: true };

export default function AdminCoupons() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all');
  const [busyId, setBusyId] = useState(null);
  const [editing, setEditing] = useState(null);

  const load = () => api.get('/api/coupons').then(({ data }) => setItems(data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => items.filter((c) => {
    const matchQ = !q.trim() || [c.code, c.label].join(' ').toLowerCase().includes(q.toLowerCase());
    if (filter === 'active') return matchQ && c.active && (!c.expiresAt || new Date(c.expiresAt) > new Date());
    if (filter === 'inactive') return matchQ && (!c.active || (c.expiresAt && new Date(c.expiresAt) < new Date()));
    return matchQ;
  }), [items, q, filter]);

  const toggle = async (c) => {
    setBusyId(c.id);
    try {
      const { data } = await api.patch(`/api/coupons/${c.id}`, { active: !c.active });
      setItems((arr) => arr.map((x) => (x.id === c.id ? data : x)));
    } finally { setBusyId(null); }
  };

  const remove = async (c) => {
    if (!window.confirm(`Delete coupon ${c.code}?`)) return;
    setBusyId(c.id);
    try {
      await api.delete(`/api/coupons/${c.id}`);
      setItems((arr) => arr.filter((x) => x.id !== c.id));
    } finally { setBusyId(null); }
  };

  return (
    <div className="portal-page">
      <Reveal>
        <header className="portal-header portal-header--row">
          <div>
            <span className="eyebrow">// Admin · Promotions</span>
            <h1>Coupon <span className="gradient-text">codes</span></h1>
            <p>{items.length} total · {items.filter((c) => c.active).length} active</p>
          </div>
          <button className="btn btn--primary btn--lg" onClick={() => setEditing({ ...blank })}><Plus size={16} /> New Coupon</button>
        </header>
      </Reveal>

      <div className="admin-toolbar glass">
        <div className="filters__search">
          <Search size={16} />
          <input placeholder="Search by code or label…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="admin-toolbar__chips">
          {['all', 'active', 'inactive'].map((s) => (
            <button key={s} className={`chip ${filter === s ? 'is-on' : ''}`} onClick={() => setFilter(s)}>{s}</button>
          ))}
        </div>
      </div>

      {loading ? <p className="muted">Loading…</p> : filtered.length === 0 ? (
        <div className="empty-block glass" style={{ padding: '3rem' }}>
          <Tag size={32} style={{ color: 'var(--neon-cyan)' }} />
          <p>No coupons match.</p>
          <button className="btn btn--primary" onClick={() => setEditing({ ...blank })}><Plus size={14} /> Create your first</button>
        </div>
      ) : (
        <div className="coupon-grid">
          {filtered.map((c, i) => {
            const expired = c.expiresAt && new Date(c.expiresAt) < new Date();
            const exhausted = c.maxUses && c.uses >= c.maxUses;
            const usePct = c.maxUses ? Math.min(100, Math.round((c.uses / c.maxUses) * 100)) : 0;
            return (
              <Reveal key={c.id} delay={i * 0.04}>
                <article className={`coupon-card glass ${c.active ? '' : 'is-inactive'}`}>
                  <header>
                    <span className="coupon-card__code mono">{c.code}</span>
                    <span className={`status ${c.active && !expired && !exhausted ? 'status--active' : 'status--cancelled'}`}>
                      {!c.active ? 'paused' : expired ? 'expired' : exhausted ? 'exhausted' : 'active'}
                    </span>
                  </header>
                  <h3>{c.label}</h3>
                  <div className="coupon-card__amount">
                    {c.type === 'percent' ? `${c.amount}% off` : `₹${c.amount.toLocaleString()} off`}
                  </div>
                  <div className="coupon-card__usage">
                    <div className="coupon-card__bar"><span style={{ width: `${usePct}%` }} /></div>
                    <span className="mono">{c.uses} / {c.maxUses} used</span>
                  </div>
                  {c.expiresAt && (
                    <span className="coupon-card__expiry mono">
                      {expired ? 'expired' : 'expires'} {new Date(c.expiresAt).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  )}
                  <footer>
                    <button className="btn btn--ghost" onClick={() => navigator.clipboard?.writeText(c.code)} title="Copy code"><Copy size={14} /></button>
                    <button className="btn btn--ghost" onClick={() => toggle(c)} disabled={busyId === c.id} title={c.active ? 'Deactivate' : 'Activate'}>
                      <Power size={14} />
                    </button>
                    <button className="btn btn--ghost" onClick={() => setEditing({ ...c, expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : '' })}><Pencil size={14} /></button>
                    <button className="btn btn--ghost" onClick={() => remove(c)} disabled={busyId === c.id} style={{ color: '#ff7ad8' }}><Trash2 size={14} /></button>
                  </footer>
                </article>
              </Reveal>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {editing && (
          <CouponEditor
            initial={editing}
            onClose={() => setEditing(null)}
            onSave={(saved) => {
              setItems((arr) => {
                const idx = arr.findIndex((x) => x.id === saved.id);
                if (idx === -1) return [saved, ...arr];
                const next = [...arr]; next[idx] = saved; return next;
              });
              setEditing(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function CouponEditor({ initial, onClose, onSave }) {
  const editing = Boolean(initial.id);
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const payload = {
        code: form.code.trim().toUpperCase(),
        label: form.label.trim(),
        type: form.type,
        amount: Number(form.amount),
        maxUses: Number(form.maxUses),
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : undefined,
        active: !!form.active,
      };
      const { data } = editing
        ? await api.patch(`/api/coupons/${initial.id}`, payload)
        : await api.post('/api/coupons', payload);
      onSave(data);
    } catch (err) {
      setError(err.message || 'Save failed');
    } finally { setBusy(false); }
  };

  return (
    <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.form
        className="modal glass"
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94 }}
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
      >
        <header className="modal__head">
          <div>
            <span className="eyebrow">// {editing ? 'Edit' : 'New'} Coupon</span>
            <h3 style={{ marginTop: '0.4rem' }}>{editing ? form.code : 'Create coupon'}</h3>
          </div>
          <button type="button" className="modal__close" onClick={onClose}><X size={18} /></button>
        </header>
        {error && <div className="auth-error"><AlertCircle size={14} /> {error}</div>}
        <div className="form-row">
          <div>
            <label>Code</label>
            <input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} disabled={editing} placeholder="LAUNCH20" style={{ textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }} />
          </div>
          <div>
            <label>Label</label>
            <input required value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Launch Special" />
          </div>
        </div>
        <div className="form-row">
          <div>
            <label>Discount type</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="percent">Percent off</option>
              <option value="flat">Flat ₹ off</option>
            </select>
          </div>
          <div>
            <label>Amount {form.type === 'percent' ? '(%)' : '(₹)'}</label>
            <input type="number" min={1} required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          </div>
        </div>
        <div className="form-row">
          <div>
            <label>Max uses</label>
            <input type="number" min={1} required value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} />
          </div>
          <div>
            <label>Expires on</label>
            <input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
          </div>
        </div>
        <label className={`cr-radio ${form.active ? 'is-on' : ''}`} style={{ alignSelf: 'flex-start' }}>
          <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
          <span>Active</span>
        </label>
        <button type="submit" className="btn btn--primary btn--block btn--lg" disabled={busy}>
          {busy ? 'Saving…' : editing ? <><Save size={14} /> Save changes</> : <><Check size={14} /> Create coupon</>}
        </button>
      </motion.form>
    </motion.div>
  );
}
