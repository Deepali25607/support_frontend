import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Code2, ChevronRight, X } from 'lucide-react';
import { api } from '../../lib/api.js';
import Reveal from '../../components/Reveal.jsx';

const STATUSES = ['New Request', 'Under Review', 'Requirement Discussion', 'Proposal Shared', 'Negotiation', 'Approved', 'Development Started', 'Testing Phase', 'Deployment Completed', 'Closed'];

export default function CustomRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [active, setActive] = useState(null);

  useEffect(() => {
    api.get('/api/custom-requests').then(({ data }) => setRequests(data)).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => requests.filter((r) => {
    if (!q.trim()) return true;
    return [r.company, r.contact, r.email, r.title, r.problem].filter(Boolean).join(' ').toLowerCase().includes(q.toLowerCase());
  }), [requests, q]);

  const update = async (id, status) => {
    const { data } = await api.patch(`/api/custom-requests/${id}`, { status });
    setRequests((arr) => arr.map((r) => (r.id === id ? data : r)));
    if (active?.id === id) setActive(data);
  };

  const statusAccent = (s) => {
    if (s === 'Closed' || s === 'Deployment Completed') return 'var(--text-2)';
    if (['Approved', 'Development Started', 'Testing Phase'].includes(s)) return 'var(--neon-violet)';
    if (s === 'New Request') return 'var(--neon-cyan)';
    return 'var(--neon-amber)';
  };

  return (
    <div className="portal-page">
      <Reveal>
        <header className="portal-header">
          <span className="eyebrow">// Admin · Custom Requests</span>
          <h1>Custom build <span className="gradient-text">pipeline</span></h1>
          <p>{requests.length} total · {requests.filter((r) => !['Closed', 'Deployment Completed'].includes(r.status)).length} active</p>
        </header>
      </Reveal>

      <div className="admin-toolbar glass">
        <div className="filters__search">
          <Search size={16} />
          <input placeholder="Search by company, contact, project…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>

      {loading ? <p className="muted">Loading…</p> : filtered.length === 0 ? (
        <div className="empty-block glass" style={{ padding: '3rem' }}>
          <Code2 size={32} style={{ color: 'var(--neon-cyan)' }} />
          <p>No custom requests yet.</p>
        </div>
      ) : (
        <div className="cr-list">
          {filtered.map((r, i) => (
            <Reveal key={r.id} delay={i * 0.04}>
              <button className="cr-row glass" onClick={() => setActive(r)} style={{ '--accent': statusAccent(r.status) }}>
                <div className="cr-row__main">
                  <strong>{r.title}</strong>
                  <span className="mono">{r.company} · {r.contact}{r.budget ? ` · ${r.budget}` : ''}</span>
                </div>
                <span className="cr-row__status" style={{ color: statusAccent(r.status), borderColor: statusAccent(r.status) }}>{r.status}</span>
                <ChevronRight size={16} />
              </button>
            </Reveal>
          ))}
        </div>
      )}

      <AnimatePresence>
        {active && (
          <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActive(null)}>
            <motion.div className="modal glass" style={{ maxWidth: 720 }} initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }} onClick={(e) => e.stopPropagation()}>
              <header className="modal__head">
                <div>
                  <span className="eyebrow">// Request Detail</span>
                  <h3 style={{ marginTop: '0.4rem' }}>{active.title}</h3>
                </div>
                <button className="modal__close" onClick={() => setActive(null)}><X size={18} /></button>
              </header>
              <div className="cr-detail">
                <dl>
                  <div><dt>Company</dt><dd>{active.company}</dd></div>
                  <div><dt>Contact</dt><dd>{active.contact}</dd></div>
                  <div><dt>Email</dt><dd>{active.email}</dd></div>
                  <div><dt>Phone</dt><dd>{active.phone || '—'}</dd></div>
                  <div><dt>Industry</dt><dd>{active.industry || '—'}</dd></div>
                  <div><dt>Country</dt><dd>{active.country || '—'}</dd></div>
                  <div><dt>Budget</dt><dd>{active.budget || '—'}</dd></div>
                  <div><dt>Timeline</dt><dd>{active.timeline || '—'}</dd></div>
                </dl>
                <div className="cr-detail__field">
                  <span className="mono">PROBLEM</span>
                  <p>{active.problem}</p>
                </div>
                {active.solutions?.length > 0 && (
                  <div className="cr-detail__field">
                    <span className="mono">SOLUTION TYPES</span>
                    <div className="cr-chips" style={{ marginTop: '0.4rem' }}>
                      {active.solutions.map((s) => <span key={s} className="pill">{s}</span>)}
                    </div>
                  </div>
                )}
                {active.attachments?.length > 0 && (
                  <div className="cr-detail__field">
                    <span className="mono">ATTACHMENTS</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.4rem' }}>
                      {active.attachments.map((a) => <span key={a} className="cr-file mono">{a}</span>)}
                    </div>
                  </div>
                )}
                <div className="cr-detail__status">
                  <label>Pipeline status</label>
                  <select className="status-select" value={active.status} onChange={(e) => update(active.id, e.target.value)}>
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
