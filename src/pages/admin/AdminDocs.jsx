import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Pencil, Trash2, Eye, EyeOff, BookOpen } from 'lucide-react';
import { api } from '../../lib/api.js';
import Reveal from '../../components/Reveal.jsx';

export default function AdminDocs() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all');
  const [product, setProduct] = useState('all');
  const [busyId, setBusyId] = useState(null);

  const load = () => api.get('/api/docs').then(({ data }) => setItems(data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const products = useMemo(() => ['all', ...Array.from(new Set(items.map((i) => i.product)))], [items]);

  const filtered = useMemo(() => items.filter((d) => {
    const matchQ = !q.trim() || [d.title, d.section, d.productLabel].join(' ').toLowerCase().includes(q.toLowerCase());
    const matchStatus = filter === 'all' || (filter === 'published' ? d.published : !d.published);
    const matchProduct = product === 'all' || d.product === product;
    return matchQ && matchStatus && matchProduct;
  }), [items, q, filter, product]);

  const togglePublish = async (d) => {
    setBusyId(d.id);
    try {
      const { data } = await api.patch(`/api/docs/${d.id}`, { published: !d.published });
      setItems((arr) => arr.map((x) => (x.id === d.id ? data : x)));
    } finally { setBusyId(null); }
  };

  const remove = async (d) => {
    if (!window.confirm(`Delete "${d.title}"?`)) return;
    setBusyId(d.id);
    try {
      await api.delete(`/api/docs/${d.id}`);
      setItems((arr) => arr.filter((x) => x.id !== d.id));
    } finally { setBusyId(null); }
  };

  return (
    <div className="portal-page">
      <Reveal>
        <header className="portal-header portal-header--row">
          <div>
            <span className="eyebrow">// Admin · Knowledge Base</span>
            <h1>Docs & <span className="gradient-text">guides</span></h1>
            <p>{items.length} total · {items.filter((d) => d.published).length} published · {items.filter((d) => !d.published).length} draft</p>
          </div>
          <Link to="/admin/docs/new" className="btn btn--primary btn--lg"><Plus size={16} /> New Article</Link>
        </header>
      </Reveal>

      <div className="admin-toolbar glass">
        <div className="filters__search">
          <Search size={16} />
          <input placeholder="Search articles…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="admin-toolbar__chips">
          {['all', 'published', 'draft'].map((s) => (
            <button key={s} className={`chip ${filter === s ? 'is-on' : ''}`} onClick={() => setFilter(s)}>{s}</button>
          ))}
          <span style={{ width: 1, alignSelf: 'stretch', background: 'var(--line)' }} />
          {products.map((p) => (
            <button key={p} className={`chip ${product === p ? 'is-on' : ''}`} onClick={() => setProduct(p)}>
              {p === 'all' ? 'all products' : (items.find((i) => i.product === p)?.productLabel || p)}
            </button>
          ))}
        </div>
      </div>

      {loading ? <p className="muted">Loading…</p> : filtered.length === 0 ? (
        <div className="empty-block glass" style={{ padding: '3rem' }}>
          <BookOpen size={32} style={{ color: 'var(--neon-cyan)' }} />
          <p>No articles match.</p>
          <Link to="/admin/docs/new" className="btn btn--primary"><Plus size={14} /> Write your first</Link>
        </div>
      ) : (
        <div className="glass admin-card">
          <table className="admin-table admin-table--wide">
            <thead>
              <tr><th>Title</th><th>Product</th><th>Section</th><th>Status</th><th>Updated</th><th style={{ textAlign: 'right' }}>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.id}>
                  <td>
                    <strong>{d.title}</strong>
                    <span className="mono">/{d.slug}</span>
                  </td>
                  <td><span className="mono" style={{ color: d.accent }}>{d.productLabel}</span></td>
                  <td><span className="mono">{d.section}</span></td>
                  <td>
                    <span className="status" style={{
                      background: d.published ? 'rgba(57, 255, 20, 0.12)' : 'rgba(125, 137, 158, 0.12)',
                      color: d.published ? 'var(--neon-green)' : 'var(--text-2)',
                      borderColor: d.published ? 'rgba(57, 255, 20, 0.35)' : 'rgba(125, 137, 158, 0.35)',
                    }}>{d.published ? 'Published' : 'Draft'}</span>
                  </td>
                  <td className="mono">{new Date(d.updatedAt).toLocaleDateString('en', { day: 'numeric', month: 'short' })}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                      <button className="btn btn--ghost" disabled={busyId === d.id} onClick={() => togglePublish(d)} title={d.published ? 'Unpublish' : 'Publish'}>
                        {d.published ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      <Link to={`/admin/docs/${d.id}/edit`} className="btn btn--ghost" title="Edit"><Pencil size={14} /></Link>
                      <button className="btn btn--ghost" disabled={busyId === d.id} onClick={() => remove(d)} title="Delete" style={{ color: '#ff7ad8' }}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
