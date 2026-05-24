import { useEffect, useMemo, useState } from 'react';
import { Search, Send, LifeBuoy } from 'lucide-react';
import { api } from '../../lib/api.js';
import Reveal from '../../components/Reveal.jsx';

const STATUSES = ['open', 'pending', 'resolved', 'closed'];
const PRIORITIES = ['low', 'normal', 'high', 'urgent'];

export default function AdminTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all');
  const [active, setActive] = useState(null);
  const [reply, setReply] = useState('');

  useEffect(() => {
    api.get('/api/tickets').then(({ data }) => setTickets(data)).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => tickets.filter((t) => {
    const matchQ = !q.trim() || [t.subject, t.body, t.category].join(' ').toLowerCase().includes(q.toLowerCase());
    const matchStatus = status === 'all' || t.status === status;
    return matchQ && matchStatus;
  }), [tickets, q, status]);

  const sendReply = async () => {
    if (!reply.trim() || !active) return;
    const { data } = await api.post(`/api/tickets/${active.id}/reply`, { body: reply.trim() });
    setActive(data);
    setTickets((arr) => arr.map((t) => (t.id === data.id ? data : t)));
    setReply('');
  };

  const updateStatus = async (newStatus) => {
    if (!active) return;
    const { data } = await api.patch(`/api/tickets/${active.id}`, { status: newStatus });
    setActive(data);
    setTickets((arr) => arr.map((t) => (t.id === data.id ? data : t)));
  };

  const updatePriority = async (newPriority) => {
    if (!active) return;
    const { data } = await api.patch(`/api/tickets/${active.id}`, { priority: newPriority });
    setActive(data);
    setTickets((arr) => arr.map((t) => (t.id === data.id ? data : t)));
  };

  return (
    <div className="portal-page">
      <Reveal>
        <header className="portal-header">
          <span className="eyebrow">// Admin · Support</span>
          <h1>Support <span className="gradient-text">tickets</span></h1>
          <p>{tickets.length} total · {tickets.filter((t) => ['open', 'pending'].includes(t.status)).length} need attention</p>
        </header>
      </Reveal>

      <div className="admin-toolbar glass">
        <div className="filters__search">
          <Search size={16} />
          <input placeholder="Search tickets…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="admin-toolbar__chips">
          <button className={`chip ${status === 'all' ? 'is-on' : ''}`} onClick={() => setStatus('all')}>All</button>
          {STATUSES.map((s) => (
            <button key={s} className={`chip ${status === s ? 'is-on' : ''}`} onClick={() => setStatus(s)}>{s}</button>
          ))}
        </div>
      </div>

      <div className="ticket-shell">
        <aside className="ticket-shell__list glass">
          {loading ? <p className="muted" style={{ padding: '1rem' }}>Loading…</p> : filtered.length === 0 ? (
            <div className="empty-block" style={{ padding: '2rem' }}>
              <LifeBuoy size={28} style={{ color: 'var(--neon-cyan)' }} />
              <p>No tickets match.</p>
            </div>
          ) : filtered.map((t) => (
            <button key={t.id} className={`ticket-item ${active?.id === t.id ? 'is-on' : ''}`} onClick={() => setActive(t)}>
              <div>
                <strong>{t.subject}</strong>
                <span className="mono">{t.category} · {t.priority}</span>
              </div>
              <span className={`status status--${t.status}`}>{t.status}</span>
            </button>
          ))}
        </aside>

        <section className="ticket-shell__main glass">
          {!active ? (
            <div className="empty-block" style={{ padding: '3rem' }}>
              <LifeBuoy size={36} style={{ color: 'var(--neon-cyan)' }} />
              <h3>Select a ticket to respond</h3>
            </div>
          ) : (
            <>
              <header className="ticket-head">
                <div>
                  <h3>{active.subject}</h3>
                  <span className="mono">customer #{active.userId.slice(0, 8)} · created {new Date(active.createdAt).toLocaleDateString('en', { day: 'numeric', month: 'short' })}</span>
                </div>
                <div className="ticket-head__actions">
                  <select className="status-select" value={active.priority} onChange={(e) => updatePriority(e.target.value)}>
                    {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <select className="status-select" value={active.status} onChange={(e) => updateStatus(e.target.value)}>
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </header>
              <div className="ticket-conv">
                <div className="ticket-msg ticket-msg--admin">
                  <span className="mono">CUSTOMER · {new Date(active.createdAt).toLocaleString('en', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                  <p>{active.body}</p>
                </div>
                {active.replies.map((r, i) => (
                  <div key={i} className={`ticket-msg ticket-msg--${r.author === 'admin' ? 'customer' : 'admin'}`}>
                    <span className="mono">{r.author === 'admin' ? 'YOU (SUPPORT)' : 'CUSTOMER'} · {new Date(r.at).toLocaleString('en', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                    <p>{r.body}</p>
                  </div>
                ))}
              </div>
              {active.status !== 'closed' && (
                <form className="ticket-reply" onSubmit={(e) => { e.preventDefault(); sendReply(); }}>
                  <textarea rows={2} value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Reply as support…" />
                  <button type="submit" className="btn btn--primary" disabled={!reply.trim()}><Send size={14} /> Send</button>
                </form>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
