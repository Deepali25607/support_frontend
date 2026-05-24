import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, CreditCard, IndianRupee, LifeBuoy, Calendar, UserPlus, Workflow, ArrowRight, TrendingUp } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { api } from '../../lib/api.js';
import Reveal from '../../components/Reveal.jsx';
import Counter from '../../components/Counter.jsx';

const ACCENTS = ['#00f0ff', '#b537ff', '#39ff14', '#ff2bd1', '#3a8dff', '#ffb627', '#00f0ff'];

const tooltipStyle = {
  contentStyle: { background: 'rgba(8, 13, 26, 0.95)', border: '1px solid rgba(0, 240, 255, 0.35)', borderRadius: 8, fontSize: 12, color: '#eaf2ff', fontFamily: "'JetBrains Mono', monospace", boxShadow: '0 8px 24px rgba(0,0,0,0.6)' },
  labelStyle: { color: '#00f0ff', fontWeight: 600, marginBottom: 4 },
  itemStyle: { color: '#eaf2ff' },
};

export default function Overview() {
  const [overview, setOverview] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/api/admin/overview'),
      api.get('/api/admin/analytics?days=14'),
    ])
      .then(([o, a]) => { setOverview(o.data); setAnalytics(a.data); })
      .finally(() => setLoading(false));
  }, []);

  const widgets = overview ? [
    { icon: Users, label: 'Total customers', value: overview.stats.customers },
    { icon: CreditCard, label: 'Active subscriptions', value: overview.stats.activeSubscriptions },
    { icon: IndianRupee, label: 'Monthly revenue', value: overview.stats.monthlyRevenue, prefix: '₹' },
    { icon: LifeBuoy, label: 'Open tickets', value: overview.stats.openTickets },
    { icon: Calendar, label: 'Demos scheduled', value: overview.stats.pendingDemos },
    { icon: UserPlus, label: 'New leads', value: overview.stats.newLeads },
    { icon: Workflow, label: 'Active pipeline', value: overview.stats.pipeline },
  ] : [];

  return (
    <div className="portal-page">
      <Reveal>
        <header className="portal-header">
          <span className="eyebrow">// Admin · Mission Control</span>
          <h1>Operations <span className="gradient-text">overview</span></h1>
          <p>A live snapshot of customers, subscriptions, revenue and inbound demand across the platform.</p>
        </header>
      </Reveal>

      <div className="admin-stats">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="stat-card glass" style={{ height: 120 }} />
          ))
        ) : widgets.map((w, i) => (
          <Reveal key={w.label} delay={i * 0.04}>
            <div className="stat-card stat-card--lg glass" style={{ '--accent': ACCENTS[i % ACCENTS.length] }}>
              <span className="stat-card__icon"><w.icon size={18} /></span>
              <span className="stat-card__label">{w.label}</span>
              <span className="stat-card__value">
                {w.prefix}<Counter to={w.value || 0} />
              </span>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Charts row */}
      <div className="charts-row">
        <Reveal>
          <section className="glass chart-card chart-card--wide">
            <header className="chart-card__head">
              <div>
                <h3>14-day activity</h3>
                <span className="mono">leads · demos · signups · tickets</span>
              </div>
              <span className="mono chart-card__trend"><TrendingUp size={12} /> live</span>
            </header>
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer>
                <AreaChart data={analytics?.timeseries || []} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradLeads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00f0ff" stopOpacity={0.55} />
                      <stop offset="100%" stopColor="#00f0ff" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradDemos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#39ff14" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="#39ff14" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradSignups" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#b537ff" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="#b537ff" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradTickets" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ff2bd1" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#ff2bd1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(125,173,255,0.12)" />
                  <XAxis dataKey="date" tick={{ fill: '#6b7a9b', fontSize: 10, fontFamily: 'JetBrains Mono' }} tickFormatter={(d) => d.slice(5)} interval="preserveStartEnd" />
                  <YAxis tick={{ fill: '#6b7a9b', fontSize: 10, fontFamily: 'JetBrains Mono' }} allowDecimals={false} />
                  <Tooltip {...tooltipStyle} />
                  <Area type="monotone" dataKey="leads" stroke="#00f0ff" strokeWidth={2} fill="url(#gradLeads)" />
                  <Area type="monotone" dataKey="demos" stroke="#39ff14" strokeWidth={2} fill="url(#gradDemos)" />
                  <Area type="monotone" dataKey="signups" stroke="#b537ff" strokeWidth={2} fill="url(#gradSignups)" />
                  <Area type="monotone" dataKey="tickets" stroke="#ff2bd1" strokeWidth={2} fill="url(#gradTickets)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <footer className="chart-card__legend">
              <span><span className="dot" style={{ background: '#00f0ff' }} />Leads</span>
              <span><span className="dot" style={{ background: '#39ff14' }} />Demos</span>
              <span><span className="dot" style={{ background: '#b537ff' }} />Signups</span>
              <span><span className="dot" style={{ background: '#ff2bd1' }} />Tickets</span>
            </footer>
          </section>
        </Reveal>

        <Reveal delay={0.08}>
          <section className="glass chart-card">
            <header className="chart-card__head">
              <div>
                <h3>Top products</h3>
                <span className="mono">by active subscriptions</span>
              </div>
            </header>
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer>
                <BarChart data={analytics?.topProducts || []} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00f0ff" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#b537ff" stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(125,173,255,0.12)" />
                  <XAxis dataKey="name" tick={{ fill: '#6b7a9b', fontSize: 10, fontFamily: 'JetBrains Mono' }} interval={0} angle={-15} textAnchor="end" height={60} />
                  <YAxis tick={{ fill: '#6b7a9b', fontSize: 10, fontFamily: 'JetBrains Mono' }} allowDecimals={false} />
                  <Tooltip {...tooltipStyle} cursor={{ fill: 'rgba(0, 240, 255, 0.06)' }} />
                  <Bar dataKey="count" fill="url(#gradBar)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </Reveal>
      </div>

      <div className="charts-row">
        <Reveal>
          <section className="glass chart-card">
            <header className="chart-card__head">
              <div>
                <h3>Pipeline by stage</h3>
                <span className="mono">custom build requests</span>
              </div>
            </header>
            {(analytics?.pipeline || []).length === 0 ? (
              <div className="empty-block" style={{ padding: '3rem' }}><p>No requests in pipeline yet.</p></div>
            ) : (
              <div style={{ width: '100%', height: 220, display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <ResponsiveContainer width="55%" height="100%">
                  <PieChart>
                    <Pie data={analytics.pipeline} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={4} stroke="rgba(8,13,26,0.85)">
                      {analytics.pipeline.map((_, i) => <Cell key={i} fill={ACCENTS[i % ACCENTS.length]} />)}
                    </Pie>
                    <Tooltip {...tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
                <ul className="pie-legend">
                  {analytics.pipeline.map((s, i) => (
                    <li key={s.name}>
                      <span className="dot" style={{ background: ACCENTS[i % ACCENTS.length] }} />
                      <strong>{s.value}</strong>
                      <span>{s.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        </Reveal>

        <Reveal delay={0.08}>
          <section className="glass chart-card">
            <header className="chart-card__head">
              <div>
                <h3>Lead sources</h3>
                <span className="mono">by inquiry type</span>
              </div>
            </header>
            {(analytics?.leadSources || []).length === 0 ? (
              <div className="empty-block" style={{ padding: '3rem' }}><p>No leads captured yet.</p></div>
            ) : (
              <div style={{ width: '100%', height: 220, display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <ResponsiveContainer width="55%" height="100%">
                  <PieChart>
                    <Pie data={analytics.leadSources} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={4} stroke="rgba(8,13,26,0.85)">
                      {analytics.leadSources.map((_, i) => <Cell key={i} fill={ACCENTS[(i + 2) % ACCENTS.length]} />)}
                    </Pie>
                    <Tooltip {...tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
                <ul className="pie-legend">
                  {analytics.leadSources.map((s, i) => (
                    <li key={s.name}>
                      <span className="dot" style={{ background: ACCENTS[(i + 2) % ACCENTS.length] }} />
                      <strong>{s.value}</strong>
                      <span>{s.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        </Reveal>
      </div>

      <div className="portal-twocol">
        <Reveal>
          <section className="glass portal-block">
            <header className="portal-block__head">
              <h3>Recent leads</h3>
              <Link to="/admin/leads" className="portal-block__link">All leads <ArrowRight size={14} /></Link>
            </header>
            {!overview || overview.recentLeads.length === 0 ? <p className="muted">No leads yet.</p> : (
              <table className="admin-table">
                <thead><tr><th>Name</th><th>Company</th><th>Type</th><th>Received</th></tr></thead>
                <tbody>
                  {overview.recentLeads.map((l) => (
                    <tr key={l.id}>
                      <td><strong>{l.name}</strong><span className="mono">{l.email}</span></td>
                      <td>{l.company || '—'}</td>
                      <td><span className="mono">{l.type || 'general'}</span></td>
                      <td className="mono">{new Date(l.createdAt).toLocaleDateString('en', { day: 'numeric', month: 'short' })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </Reveal>

        <Reveal delay={0.08}>
          <section className="glass portal-block">
            <header className="portal-block__head">
              <h3>Upcoming demos</h3>
              <Link to="/admin/demos" className="portal-block__link">All demos <ArrowRight size={14} /></Link>
            </header>
            {!overview || overview.recentDemos.length === 0 ? <p className="muted">No demos scheduled.</p> : (
              <ul className="ticket-list">
                {overview.recentDemos.map((d) => (
                  <li key={d.id}>
                    <span className={`status status--${d.status}`}>{d.status}</span>
                    <div>
                      <strong>{d.name} · {d.company}</strong>
                      <span className="mono">{d.product || '—'} · {new Date(d.date).toLocaleDateString('en', { day: 'numeric', month: 'short' })} {d.time}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </Reveal>
      </div>
    </div>
  );
}
