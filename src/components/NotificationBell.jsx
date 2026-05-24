import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, UserPlus, Calendar, LifeBuoy, Code2, Check, Radio } from 'lucide-react';
import { api } from '../lib/api.js';
import './NotificationBell.css';

const ICONS = {
  lead: UserPlus,
  demo: Calendar,
  ticket: LifeBuoy,
  'custom-request': Code2,
};

const ACCENTS = {
  lead: '#00f0ff',
  demo: '#39ff14',
  ticket: '#ff2bd1',
  'custom-request': '#b537ff',
};

export default function NotificationBell() {
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [live, setLive] = useState(false);
  const ref = useRef(null);
  const esRef = useRef(null);
  const pulseTimeoutRef = useRef(null);
  const [pulse, setPulse] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data, unread } = await api.get('/api/notifications');
      setItems(data);
      setUnread(unread);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    load();
    let es;
    try {
      es = new EventSource('/api/notifications/stream', { withCredentials: true });
      es.onopen = () => setLive(true);
      es.onerror = () => setLive(false);
      es.onmessage = (evt) => {
        try {
          const note = JSON.parse(evt.data);
          setItems((arr) => [note, ...arr.filter((n) => n.id !== note.id)].slice(0, 50));
          if (!note.read) setUnread((u) => u + 1);
          setPulse(true);
          if (pulseTimeoutRef.current) clearTimeout(pulseTimeoutRef.current);
          pulseTimeoutRef.current = setTimeout(() => setPulse(false), 1600);
        } catch { /* malformed */ }
      };
      esRef.current = es;
    } catch {
      setLive(false);
    }
    return () => {
      try { es?.close(); } catch { /* ignore */ }
      if (pulseTimeoutRef.current) clearTimeout(pulseTimeoutRef.current);
    };
  }, [load]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const markAllRead = async () => {
    try {
      await api.post('/api/notifications/read-all');
      setItems((arr) => arr.map((n) => ({ ...n, read: true })));
      setUnread(0);
    } catch { /* ignore */ }
  };

  const markOne = async (id) => {
    try {
      await api.post(`/api/notifications/${id}/read`);
      setItems((arr) => arr.map((n) => (n.id === id ? { ...n, read: true } : n)));
      setUnread((u) => Math.max(0, u - 1));
    } catch { /* ignore */ }
  };

  return (
    <div className={`nbell ${pulse ? 'is-pulsing' : ''}`} ref={ref}>
      <button className="nbell__btn" aria-label="Notifications" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <Bell size={16} />
        {unread > 0 && (
          <motion.span
            className="nbell__badge"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            key={unread}
          >{unread > 9 ? '9+' : unread}</motion.span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            className="nbell__menu glass"
            initial={{ opacity: 0, y: -8, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0)' }}
            exit={{ opacity: 0, y: -8, filter: 'blur(6px)' }}
            transition={{ duration: 0.22 }}
          >
            <header className="nbell__head">
              <div>
                <strong>Notifications</strong>
                <span className="mono">{unread} unread {live && <span className="nbell__live"><Radio size={9} /> live</span>}</span>
              </div>
              {items.length > 0 && (
                <button className="nbell__mark" onClick={markAllRead}><Check size={12} /> Mark all read</button>
              )}
            </header>
            <div className="nbell__list">
              {items.length === 0 ? (
                <div className="nbell__empty">
                  <Bell size={22} style={{ color: 'var(--text-2)' }} />
                  <p>You're all caught up.</p>
                </div>
              ) : items.map((n) => {
                const Icon = ICONS[n.kind] || Bell;
                const accent = ACCENTS[n.kind] || 'var(--neon-cyan)';
                const Body = n.link ? Link : 'div';
                const props = n.link ? { to: n.link, onClick: () => { markOne(n.id); setOpen(false); } } : { onClick: () => markOne(n.id) };
                return (
                  <Body key={n.id} className={`nbell__item ${n.read ? '' : 'is-unread'}`} {...props}>
                    <span className="nbell__icon" style={{ '--accent': accent }}><Icon size={14} /></span>
                    <div>
                      <strong>{n.title}</strong>
                      {n.body && <span>{n.body}</span>}
                      <span className="mono">{relativeTime(n.createdAt)}</span>
                    </div>
                    {!n.read && <span className="nbell__dot" />}
                  </Body>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function relativeTime(iso) {
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString('en', { day: 'numeric', month: 'short' });
}
