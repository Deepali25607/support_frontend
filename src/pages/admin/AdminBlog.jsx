import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import { api } from '../../lib/api.js';
import Reveal from '../../components/Reveal.jsx';

export default function AdminBlog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [busyId, setBusyId] = useState(null);

  const load = () => api.get('/api/blog').then(({ data }) => setPosts(data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => posts.filter((p) => {
    const matchQ = !q.trim() || [p.title, p.category, ...(p.tags || [])].join(' ').toLowerCase().includes(q.toLowerCase());
    const matchStatus = statusFilter === 'all' || (statusFilter === 'published' ? p.published : !p.published);
    return matchQ && matchStatus;
  }), [posts, q, statusFilter]);

  const togglePublish = async (p) => {
    setBusyId(p.id);
    try {
      const { data } = await api.patch(`/api/blog/${p.id}`, { published: !p.published });
      setPosts((arr) => arr.map((x) => (x.id === p.id ? data : x)));
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.title}"? This cannot be undone.`)) return;
    setBusyId(p.id);
    try {
      await api.delete(`/api/blog/${p.id}`);
      setPosts((arr) => arr.filter((x) => x.id !== p.id));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="portal-page">
      <Reveal>
        <header className="portal-header portal-header--row">
          <div>
            <span className="eyebrow">// Admin · Blog</span>
            <h1>Blog <span className="gradient-text">posts</span></h1>
            <p>{posts.length} total · {posts.filter((p) => p.published).length} published · {posts.filter((p) => !p.published).length} draft</p>
          </div>
          <Link to="/admin/blog/new" className="btn btn--primary btn--lg"><Plus size={16} /> New Post</Link>
        </header>
      </Reveal>

      <div className="admin-toolbar glass">
        <div className="filters__search">
          <Search size={16} />
          <input placeholder="Search posts…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="admin-toolbar__chips">
          {['all', 'published', 'draft'].map((s) => (
            <button key={s} className={`chip ${statusFilter === s ? 'is-on' : ''}`} onClick={() => setStatusFilter(s)}>{s}</button>
          ))}
        </div>
      </div>

      {loading ? <p className="muted">Loading…</p> : filtered.length === 0 ? (
        <div className="empty-block glass" style={{ padding: '3rem' }}>
          <p>No posts match your filters.</p>
          <Link to="/admin/blog/new" className="btn btn--primary"><Plus size={14} /> Write your first post</Link>
        </div>
      ) : (
        <div className="glass admin-card">
          <table className="admin-table admin-table--wide">
            <thead>
              <tr><th>Title</th><th>Category</th><th>Status</th><th>Reading</th><th>Updated</th><th style={{ textAlign: 'right' }}>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td>
                    <strong>{p.title}</strong>
                    <span className="mono">/{p.slug}</span>
                  </td>
                  <td><span className="mono" style={{ color: p.cover }}>{p.category}</span></td>
                  <td>
                    <span className="status" style={{
                      background: p.published ? 'rgba(57, 255, 20, 0.12)' : 'rgba(125, 137, 158, 0.12)',
                      color: p.published ? 'var(--neon-green)' : 'var(--text-2)',
                      borderColor: p.published ? 'rgba(57, 255, 20, 0.35)' : 'rgba(125, 137, 158, 0.35)',
                    }}>{p.published ? 'Published' : 'Draft'}</span>
                  </td>
                  <td className="mono">{p.readingTime} min</td>
                  <td className="mono">{new Date(p.updatedAt).toLocaleDateString('en', { day: 'numeric', month: 'short' })}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                      <button className="btn btn--ghost" disabled={busyId === p.id} onClick={() => togglePublish(p)} title={p.published ? 'Unpublish' : 'Publish'}>
                        {p.published ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      <Link to={`/admin/blog/${p.id}/edit`} className="btn btn--ghost" title="Edit"><Pencil size={14} /></Link>
                      <button className="btn btn--ghost" disabled={busyId === p.id} onClick={() => remove(p)} title="Delete" style={{ color: '#ff7ad8' }}><Trash2 size={14} /></button>
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
