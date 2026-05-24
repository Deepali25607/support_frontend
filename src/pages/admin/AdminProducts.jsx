import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, Pencil, Trash2, ExternalLink, Eye, EyeOff, Copy, Check } from 'lucide-react';
import { api } from '../../lib/api.js';
import { useProducts } from '../../context/ProductsContext.jsx';
import Reveal from '../../components/Reveal.jsx';
import './AdminProducts.css';

export default function AdminProducts() {
  const nav = useNavigate();
  const { refresh } = useProducts();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('All');
  const [busyId, setBusyId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const load = () => api.get('/api/products/admin/list').then(({ data }) => setRows(data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const categories = useMemo(() => {
    const set = new Set(rows.map((r) => r.category).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [rows]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const catOk = cat === 'All' || r.category === cat;
      const qOk = !q.trim() || [r.name, r.tagline, r.id, r.demoUrl].join(' ').toLowerCase().includes(q.toLowerCase());
      return catOk && qOk;
    });
  }, [rows, q, cat]);

  const togglePublished = async (row) => {
    setBusyId(row.id);
    try {
      const { data } = await api.patch(`/api/products/${row.id}`, { published: !row.published });
      setRows((arr) => arr.map((r) => (r.id === row.id ? data : r)));
      refresh();
    } finally { setBusyId(null); }
  };

  const remove = async (row) => {
    if (!confirm(`Delete "${row.name}"? This cannot be undone.`)) return;
    setBusyId(row.id);
    try {
      await api.delete(`/api/products/${row.id}`);
      setRows((arr) => arr.filter((r) => r.id !== row.id));
      refresh();
    } finally { setBusyId(null); }
  };

  const copyDemo = async (row) => {
    if (!row.demoUrl) return;
    try {
      await navigator.clipboard.writeText(row.demoUrl);
      setCopiedId(row.id);
      setTimeout(() => setCopiedId((id) => (id === row.id ? null : id)), 1500);
    } catch { /* clipboard blocked */ }
  };

  if (loading) return <div style={{ display: 'grid', placeItems: 'center', minHeight: '40vh' }}><div className="auth-spinner" /></div>;

  return (
    <div className="portal-page">
      <Reveal>
        <header className="portal-header portal-header--row">
          <div>
            <span className="eyebrow">// Admin · Products</span>
            <h1>Manage your <span className="gradient-text">product catalog</span></h1>
            <p>Add, edit and publish products. Set a live demo link so visitors can try the product instantly.</p>
          </div>
          <button className="btn btn--primary" onClick={() => nav('/admin/products/new')}>
            <Plus size={14} /> New product
          </button>
        </header>
      </Reveal>

      <div className="admin-toolbar">
        <div className="filters__search" style={{ flex: 1 }}>
          <Search size={14} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, tagline, slug or demo url…" />
        </div>
        <select className="status-select" value={cat} onChange={(e) => setCat(e.target.value)}>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="prod-grid">
        {filtered.map((row, i) => (
          <motion.article
            key={row.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className={`prod-card glass ${row.published ? '' : 'is-draft'}`}
            style={{ '--accent': row.accent }}
          >
            <header className="prod-card__head">
              <div className="prod-card__id">
                <span className="prod-card__glyph mono" style={{ background: `linear-gradient(135deg, ${row.accent}, color-mix(in srgb, ${row.accent} 30%, #04070f))` }}>
                  {row.glyph}
                </span>
                <div>
                  <h3>{row.name}</h3>
                  <span className="mono">{row.id} · {row.category}</span>
                </div>
              </div>
              <span className={`pd-status ${row.published ? 'is-live' : 'is-draft'}`}>
                {row.published ? <><Eye size={11} /> Live</> : <><EyeOff size={11} /> Draft</>}
              </span>
            </header>

            <p className="prod-card__tag">{row.tagline}</p>

            <div className="prod-card__meta">
              <span><strong>{row.highlights?.length || 0}</strong> highlights</span>
              <span><strong>{row.plans?.length || 0}</strong> plans</span>
              <span><strong>{row.tech?.length || 0}</strong> tech</span>
            </div>

            <div className={`prod-card__demo ${row.demoUrl ? 'has-link' : ''}`}>
              {row.demoUrl ? (
                <>
                  <span className="mono">DEMO</span>
                  <a href={row.demoUrl} target="_blank" rel="noreferrer" title={row.demoUrl}>
                    {row.demoUrl.replace(/^https?:\/\//, '').slice(0, 36)}
                    <ExternalLink size={11} />
                  </a>
                  <button type="button" className="prod-card__copy" onClick={() => copyDemo(row)} aria-label="Copy demo url">
                    {copiedId === row.id ? <Check size={12} /> : <Copy size={12} />}
                  </button>
                </>
              ) : (
                <span className="prod-card__demo-empty">No demo link — add one so visitors can try it live</span>
              )}
            </div>

            <footer className="prod-card__actions">
              <Link to={`/admin/products/${row.id}/edit`} className="btn btn--ghost">
                <Pencil size={13} /> Edit
              </Link>
              <button className="btn btn--ghost" disabled={busyId === row.id} onClick={() => togglePublished(row)}>
                {row.published ? <><EyeOff size={13} /> Unpublish</> : <><Eye size={13} /> Publish</>}
              </button>
              <Link to={`/products/${row.id}`} target="_blank" rel="noreferrer" className="btn btn--ghost">
                <ExternalLink size={13} /> View
              </Link>
              <button className="btn btn--ghost prod-card__danger" disabled={busyId === row.id} onClick={() => remove(row)}>
                <Trash2 size={13} /> Delete
              </button>
            </footer>
          </motion.article>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty glass" style={{ marginTop: '1.5rem' }}>
          <h3>No products match</h3>
          <p>Adjust the search or category filter, or <Link to="/admin/products/new">create a new product</Link>.</p>
        </div>
      )}
    </div>
  );
}
