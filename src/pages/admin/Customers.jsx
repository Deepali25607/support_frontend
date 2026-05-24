import { useEffect, useMemo, useState } from 'react';
import { Search, Building2, Mail } from 'lucide-react';
import { api } from '../../lib/api.js';
import Reveal from '../../components/Reveal.jsx';

export default function Customers() {
  const [users, setUsers] = useState([]);
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  useEffect(() => {
    Promise.all([api.get('/api/admin/users'), api.get('/api/admin/subscriptions')])
      .then(([u, s]) => { setUsers(u.data); setSubs(s.data); })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => users.filter((u) => {
    if (!q.trim()) return true;
    return [u.name, u.email, u.company].filter(Boolean).join(' ').toLowerCase().includes(q.toLowerCase());
  }), [users, q]);

  const subsByUser = useMemo(() => {
    const map = new Map();
    subs.forEach((s) => {
      if (!map.has(s.userId)) map.set(s.userId, []);
      map.get(s.userId).push(s);
    });
    return map;
  }, [subs]);

  return (
    <div className="portal-page">
      <Reveal>
        <header className="portal-header">
          <span className="eyebrow">// Admin · Customers</span>
          <h1>Customer <span className="gradient-text">accounts</span></h1>
          <p>{users.length} total accounts · {users.filter((u) => u.role === 'customer').length} customers · {users.filter((u) => u.role === 'admin').length} admins</p>
        </header>
      </Reveal>

      <div className="admin-toolbar glass">
        <div className="filters__search">
          <Search size={16} />
          <input placeholder="Search customers…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>

      {loading ? <p className="muted">Loading…</p> : (
        <div className="glass admin-card">
          <table className="admin-table admin-table--wide">
            <thead>
              <tr><th>Customer</th><th>Company</th><th>Role</th><th>Subscriptions</th><th>Joined</th></tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const userSubs = subsByUser.get(u.id) || [];
                const active = userSubs.filter((s) => ['active', 'trialing'].includes(s.status));
                return (
                  <tr key={u.id}>
                    <td>
                      <strong>{u.name}</strong>
                      <span className="mono"><Mail size={11} /> {u.email}</span>
                    </td>
                    <td>{u.company ? <><Building2 size={12} /> {u.company}</> : '—'}</td>
                    <td>
                      <span className="status" style={{
                        background: u.role === 'admin' ? 'rgba(181, 55, 255, 0.12)' : 'rgba(0, 240, 255, 0.12)',
                        color: u.role === 'admin' ? 'var(--neon-violet)' : 'var(--neon-cyan)',
                        borderColor: u.role === 'admin' ? 'rgba(181, 55, 255, 0.35)' : 'rgba(0, 240, 255, 0.35)',
                      }}>{u.role}</span>
                    </td>
                    <td>
                      {active.length === 0 ? <span className="mono" style={{ color: 'var(--text-2)' }}>none</span> : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          {active.map((s) => (
                            <span key={s.id} className="mono" style={{ fontSize: '0.78rem' }}>
                              {s.productName} · {s.plan} · <span style={{ color: 'var(--neon-cyan)' }}>{s.status}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="mono">{new Date(u.createdAt).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
