import { useEffect, useMemo, useState } from 'react';
import { Search, Mail, Phone, Building2 } from 'lucide-react';
import { api } from '../../lib/api.js';
import Reveal from '../../components/Reveal.jsx';

const STATUSES = ['new', 'contacted', 'qualified', 'won', 'lost'];

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all');

  useEffect(() => {
    api.get('/api/leads').then(({ data }) => setLeads(data)).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => leads.filter((l) => {
    const matchQ = !q.trim() || [l.name, l.email, l.company, l.message].filter(Boolean).join(' ').toLowerCase().includes(q.toLowerCase());
    const matchStatus = status === 'all' || l.status === status;
    return matchQ && matchStatus;
  }), [leads, q, status]);

  const update = async (id, newStatus) => {
    const { data } = await api.patch(`/api/leads/${id}`, { status: newStatus });
    setLeads((arr) => arr.map((l) => (l.id === id ? data : l)));
  };

  return (
    <div className="portal-page">
      <Reveal>
        <header className="portal-header">
          <span className="eyebrow">// Admin · Leads</span>
          <h1>Inbound <span className="gradient-text">leads</span></h1>
          <p>{leads.length} total · {leads.filter((l) => l.status === 'new').length} new</p>
        </header>
      </Reveal>

      <div className="admin-toolbar glass">
        <div className="filters__search">
          <Search size={16} />
          <input placeholder="Search by name, email, company…" value={q} onChange={(e) => setQ(e.target.value)} />
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
          <p>No leads match your filters.</p>
        </div>
      ) : (
        <div className="glass admin-card">
          <table className="admin-table admin-table--wide">
            <thead>
              <tr><th>Contact</th><th>Company</th><th>Type</th><th>Message</th><th>Status</th><th>Received</th></tr>
            </thead>
            <tbody>
              {filtered.map((l) => (
                <tr key={l.id}>
                  <td>
                    <strong>{l.name}</strong>
                    <span className="mono"><Mail size={11} /> {l.email}</span>
                    {l.phone && <span className="mono"><Phone size={11} /> {l.phone}</span>}
                  </td>
                  <td>{l.company ? <><Building2 size={12} /> {l.company}</> : '—'}</td>
                  <td><span className="mono">{l.type || 'general'}</span></td>
                  <td className="admin-table__msg">{l.message}</td>
                  <td>
                    <select className="status-select" value={l.status} onChange={(e) => update(l.id, e.target.value)}>
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="mono">{new Date(l.createdAt).toLocaleDateString('en', { day: 'numeric', month: 'short' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
