import { useEffect, useMemo, useState } from 'react';
import { Search, Calendar, Mail } from 'lucide-react';
import { api } from '../../lib/api.js';
import Reveal from '../../components/Reveal.jsx';

const STATUSES = ['scheduled', 'completed', 'no-show', 'cancelled'];

export default function Demos() {
  const [demos, setDemos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all');

  useEffect(() => {
    api.get('/api/demos').then(({ data }) => setDemos(data)).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => demos.filter((d) => {
    const matchQ = !q.trim() || [d.name, d.email, d.company, d.product].filter(Boolean).join(' ').toLowerCase().includes(q.toLowerCase());
    const matchStatus = status === 'all' || d.status === status;
    return matchQ && matchStatus;
  }), [demos, q, status]);

  const update = async (id, newStatus) => {
    const { data } = await api.patch(`/api/demos/${id}`, { status: newStatus });
    setDemos((arr) => arr.map((d) => (d.id === id ? data : d)));
  };

  return (
    <div className="portal-page">
      <Reveal>
        <header className="portal-header">
          <span className="eyebrow">// Admin · Demos</span>
          <h1>Scheduled <span className="gradient-text">demos</span></h1>
          <p>{demos.length} total · {demos.filter((d) => d.status === 'scheduled').length} upcoming</p>
        </header>
      </Reveal>

      <div className="admin-toolbar glass">
        <div className="filters__search">
          <Search size={16} />
          <input placeholder="Search demos…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="admin-toolbar__chips">
          <button className={`chip ${status === 'all' ? 'is-on' : ''}`} onClick={() => setStatus('all')}>All</button>
          {STATUSES.map((s) => (
            <button key={s} className={`chip ${status === s ? 'is-on' : ''}`} onClick={() => setStatus(s)}>{s}</button>
          ))}
        </div>
      </div>

      {loading ? <p className="muted">Loading…</p> : filtered.length === 0 ? (
        <div className="empty-block glass" style={{ padding: '3rem' }}>
          <Calendar size={32} style={{ color: 'var(--neon-cyan)' }} />
          <p>No demos match your filters.</p>
        </div>
      ) : (
        <div className="glass admin-card">
          <table className="admin-table admin-table--wide">
            <thead>
              <tr><th>Contact</th><th>Company</th><th>Product</th><th>Scheduled</th><th>Notes</th><th>Status</th></tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.id}>
                  <td>
                    <strong>{d.name}</strong>
                    <span className="mono"><Mail size={11} /> {d.email}</span>
                    {d.phone && <span className="mono">{d.phone}</span>}
                  </td>
                  <td>{d.company}</td>
                  <td><span className="mono">{d.product || '—'}</span></td>
                  <td className="mono">{new Date(d.date).toLocaleDateString('en', { day: 'numeric', month: 'short' })} · {d.time}</td>
                  <td className="admin-table__msg">{d.notes || '—'}</td>
                  <td>
                    <select className="status-select" value={d.status} onChange={(e) => update(d.id, e.target.value)}>
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
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
