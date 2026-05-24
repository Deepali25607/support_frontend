import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import { api } from '../../lib/api.js';
import Reveal from '../../components/Reveal.jsx';

export default function AdminCaseStudies() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all');
  const [busyId, setBusyId] = useState(null);

  const load = () => api.get('/api/case-studies').then(({ data }) => setItems(data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => items.filter((c) => {
    const matchQ = !q.trim() || [c.client, c.industry, c.product, c.summary].filter(Boolean).join(' ').toLowerCase().includes(q.toLowerCase());
    const matchStatus = filter === 'all' || (filter === 'published' ? c.published : !c.published);
    return matchQ && matchStatus;
  }), [items, q, filter]);

  const togglePublish = async (c) => {
    setBusyId(c.id);
    try {
      const { data } = await api.patch(`/api/case-studies/${c.id}`, { published: !c.published });
      setItems((arr) => arr.map((x) => (x.id === c.id ? data : x)));
    } finally { setBusyId(null); }
  };

  const remove = async (c) => {
    if (!window.confirm(`Delete "${c.client}" case study?`)) return;
    setBusyId(c.id);
    try {
      await api.delete(`/api/case-studies/${c.id}`);
      setItems((arr) => arr.filter((x) => x.id !== c.id));
    } finally { setBusyId(null); }
  };

  return (
    <div className="portal-page">
      <Reveal>
        <header className="portal-header portal-header--row">
          <div>
            <span className="eyebrow">// Admin · Portfolio</span>
            <h1>Case <span className="gradient-text">studies</span></h1>
            <p>{items.length} total · {items.filter((c) => c.published).length} published · {items.filter((c) => !c.published).length} draft</p>
          </div>
          <Link to="/admin/case-studies/new" className="btn btn--primary btn--lg"><Plus size={16} /> New Case Study</Link>
        </header>
      </Reveal>

      <div className="admin-toolbar glass">
        <div className="filters__search">
          <Search size={16} />
          <input placeholder="Search case studies…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="admin-toolbar__chips">
          {['all', 'published', 'draft'].map((s) => (
            <button key={s} className={`chip ${filter === s ? 'is-on' : ''}`} onClick={() => setFilter(s)}>{s}</button>
          ))}
        </div>
      </div>

      {loading ? <p className="muted">Loading…</p> : filtered.length === 0 ? (
        <div className="empty-block glass" style={{ padding: '3rem' }}>
          <p>No case studies match.</p>
          <Link to="/admin/case-studies/new" className="btn btn--primary"><Plus size={14} /> Write your first one</Link>
        </div>
      ) : (
        <div className="glass admin-card">
          <table className="admin-table admin-table--wide">
            <thead>
              <tr><th>Client</th><th>Industry</th><th>Product</th><th>Status</th><th>Updated</th><th style={{ textAlign: 'right' }}>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td>
                    <strong>{c.client}</strong>
                    <span className="mono">/{c.slug}</span>
                  </td>
                  <td><span className="mono">{c.industry}</span></td>
                  <td><span className="mono" style={{ color: c.accent }}>{c.product}</span></td>
                  <td>
                    <span className="status" style={{
                      background: c.published ? 'rgba(57, 255, 20, 0.12)' : 'rgba(125, 137, 158, 0.12)',
                      color: c.published ? 'var(--neon-green)' : 'var(--text-2)',
                      borderColor: c.published ? 'rgba(57, 255, 20, 0.35)' : 'rgba(125, 137, 158, 0.35)',
                    }}>{c.published ? 'Published' : 'Draft'}</span>
                  </td>
                  <td className="mono">{new Date(c.updatedAt).toLocaleDateString('en', { day: 'numeric', month: 'short' })}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                      <button className="btn btn--ghost" disabled={busyId === c.id} onClick={() => togglePublish(c)} title={c.published ? 'Unpublish' : 'Publish'}>
                        {c.published ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      <Link to={`/admin/case-studies/${c.id}/edit`} className="btn btn--ghost" title="Edit"><Pencil size={14} /></Link>
                      <button className="btn btn--ghost" disabled={busyId === c.id} onClick={() => remove(c)} title="Delete" style={{ color: '#ff7ad8' }}><Trash2 size={14} /></button>
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
