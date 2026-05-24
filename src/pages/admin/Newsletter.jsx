import { useEffect, useMemo, useState } from 'react';
import { Search, Mail, Trash2, Download } from 'lucide-react';
import { api } from '../../lib/api.js';
import Reveal from '../../components/Reveal.jsx';

export default function Newsletter() {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = () => api.get('/api/newsletter').then(({ data }) => setSubs(data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => subs.filter((s) => {
    if (!q.trim()) return true;
    return [s.email, s.source].join(' ').toLowerCase().includes(q.toLowerCase());
  }), [subs, q]);

  const remove = async (s) => {
    if (!window.confirm(`Remove ${s.email}?`)) return;
    setBusyId(s.id);
    try {
      await api.delete(`/api/newsletter/${s.id}`);
      setSubs((arr) => arr.filter((x) => x.id !== s.id));
    } finally {
      setBusyId(null);
    }
  };

  const exportCsv = () => {
    const header = 'email,source,status,subscribed_at\n';
    const rows = filtered.map((s) => `${s.email},${s.source || ''},${s.status || 'active'},${s.createdAt}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexus-newsletter-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const sources = subs.reduce((acc, s) => {
    acc[s.source || 'unknown'] = (acc[s.source || 'unknown'] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="portal-page">
      <Reveal>
        <header className="portal-header portal-header--row">
          <div>
            <span className="eyebrow">// Admin · Newsletter</span>
            <h1>Newsletter <span className="gradient-text">subscribers</span></h1>
            <p>{subs.length} total · {Object.entries(sources).map(([s, n]) => `${n} from ${s}`).join(' · ') || 'no sources yet'}</p>
          </div>
          <button className="btn btn--primary" disabled={subs.length === 0} onClick={exportCsv}><Download size={14} /> Export CSV</button>
        </header>
      </Reveal>

      <div className="admin-toolbar glass">
        <div className="filters__search">
          <Search size={16} />
          <input placeholder="Search by email or source…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>

      {loading ? <p className="muted">Loading…</p> : filtered.length === 0 ? (
        <div className="empty-block glass" style={{ padding: '3rem' }}>
          <Mail size={32} style={{ color: 'var(--neon-cyan)' }} />
          <h3>No subscribers yet</h3>
          <p>Newsletter signups from the footer and blog will appear here.</p>
        </div>
      ) : (
        <div className="glass admin-card">
          <table className="admin-table admin-table--wide">
            <thead>
              <tr><th>Email</th><th>Source</th><th>Status</th><th>Subscribed</th><th style={{ textAlign: 'right' }}>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id}>
                  <td>
                    <strong>{s.email}</strong>
                  </td>
                  <td><span className="mono">{s.source || '—'}</span></td>
                  <td><span className="status status--active">{s.status || 'active'}</span></td>
                  <td className="mono">{new Date(s.createdAt).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn btn--ghost" disabled={busyId === s.id} onClick={() => remove(s)} style={{ color: '#ff7ad8' }}>
                      <Trash2 size={14} /> Remove
                    </button>
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
