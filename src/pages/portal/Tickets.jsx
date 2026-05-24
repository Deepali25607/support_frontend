import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LifeBuoy, Plus, Send, X } from 'lucide-react';
import { api } from '../../lib/api.js';
import Reveal from '../../components/Reveal.jsx';

const categories = [
  { id: 'technical', label: 'Technical' },
  { id: 'billing', label: 'Billing' },
  { id: 'feature-request', label: 'Feature' },
  { id: 'setup', label: 'Setup' },
  { id: 'bug', label: 'Bug' },
];
const priorities = ['low', 'normal', 'high', 'urgent'];

export default function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [active, setActive] = useState(null);
  const [reply, setReply] = useState('');
  const [form, setForm] = useState({ subject: '', body: '', category: 'technical', priority: 'normal' });

  const load = () => api.get('/api/tickets').then(({ data }) => setTickets(data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const createTicket = async (e) => {
    e.preventDefault();
    const { data } = await api.post('/api/tickets', form);
    setTickets((arr) => [data, ...arr]);
    setShowNew(false);
    setForm({ subject: '', body: '', category: 'technical', priority: 'normal' });
    setActive(data);
  };

  const sendReply = async () => {
    if (!reply.trim() || !active) return;
    const { data } = await api.post(`/api/tickets/${active.id}/reply`, { body: reply.trim() });
    setActive(data);
    setTickets((arr) => arr.map((t) => (t.id === data.id ? data : t)));
    setReply('');
  };

  const closeTicket = async () => {
    if (!active) return;
    const { data } = await api.patch(`/api/tickets/${active.id}`, { status: 'closed' });
    setActive(data);
    setTickets((arr) => arr.map((t) => (t.id === data.id ? data : t)));
  };

  return (
    <div className="portal-page">
      <Reveal>
        <header className="portal-header portal-header--row">
          <div>
            <span className="eyebrow">// Support</span>
            <h1>Support <span className="gradient-text">tickets</span></h1>
            <p>Raise an issue, request a feature, or just say hi. We respond within 24 hours.</p>
          </div>
          <button className="btn btn--primary btn--lg" onClick={() => setShowNew(true)}>
            <Plus size={16} /> New Ticket
          </button>
        </header>
      </Reveal>

      <div className="ticket-shell">
        <aside className="ticket-shell__list glass">
          {loading ? <p className="muted" style={{ padding: '1rem' }}>Loading…</p> : tickets.length === 0 ? (
            <div className="empty-block" style={{ padding: '2rem' }}>
              <LifeBuoy size={28} style={{ color: 'var(--neon-cyan)' }} />
              <p>No tickets yet.</p>
            </div>
          ) : tickets.map((t) => (
            <button key={t.id} className={`ticket-item ${active?.id === t.id ? 'is-on' : ''}`} onClick={() => setActive(t)}>
              <div>
                <strong>{t.subject}</strong>
                <span className="mono">{t.category} · {new Date(t.updatedAt).toLocaleDateString('en', { day: 'numeric', month: 'short' })}</span>
              </div>
              <span className={`status status--${t.status}`}>{t.status}</span>
            </button>
          ))}
        </aside>

        <section className="ticket-shell__main glass">
          {!active ? (
            <div className="empty-block" style={{ padding: '3rem' }}>
              <LifeBuoy size={36} style={{ color: 'var(--neon-cyan)' }} />
              <h3>Pick a ticket to view the conversation</h3>
              <p>Or create a new one to get started.</p>
            </div>
          ) : (
            <>
              <header className="ticket-head">
                <div>
                  <h3>{active.subject}</h3>
                  <span className="mono">{active.category} · {active.priority} priority</span>
                </div>
                <div className="ticket-head__actions">
                  <span className={`status status--${active.status}`}>{active.status}</span>
                  {active.status !== 'closed' && (
                    <button className="btn btn--ghost" onClick={closeTicket}><X size={14} /> Close ticket</button>
                  )}
                </div>
              </header>
              <div className="ticket-conv">
                <div className="ticket-msg ticket-msg--customer">
                  <span className="mono">YOU · {new Date(active.createdAt).toLocaleString('en', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                  <p>{active.body}</p>
                </div>
                {active.replies.map((r, i) => (
                  <div key={i} className={`ticket-msg ticket-msg--${r.author}`}>
                    <span className="mono">{r.author === 'admin' ? 'SUPPORT' : 'YOU'} · {new Date(r.at).toLocaleString('en', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                    <p>{r.body}</p>
                  </div>
                ))}
              </div>
              {active.status !== 'closed' && (
                <form className="ticket-reply" onSubmit={(e) => { e.preventDefault(); sendReply(); }}>
                  <textarea rows={2} value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Type your reply…" />
                  <button type="submit" className="btn btn--primary" disabled={!reply.trim()}><Send size={14} /> Send</button>
                </form>
              )}
            </>
          )}
        </section>
      </div>

      <AnimatePresence>
        {showNew && (
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowNew(false)}
          >
            <motion.form
              className="modal glass"
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              onSubmit={createTicket}
            >
              <header className="modal__head">
                <span className="eyebrow">// New Ticket</span>
                <button type="button" className="modal__close" onClick={() => setShowNew(false)}><X size={18} /></button>
              </header>
              <div><label>Subject</label><input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="What's going on?" /></div>
              <div className="form-row">
                <div>
                  <label>Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label>Priority</label>
                  <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                    {priorities.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div><label>Describe the issue</label><textarea required rows={5} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="Tell us what happened, what you expected, and any error messages…" /></div>
              <button type="submit" className="btn btn--primary btn--block btn--lg"><Send size={14} /> Create Ticket</button>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
