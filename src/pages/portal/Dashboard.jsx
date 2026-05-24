import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, LifeBuoy, Calendar, Rocket, ArrowRight, Sparkles, X, Check, Box, Tag, BookOpen } from 'lucide-react';
import { api } from '../../lib/api.js';
import Reveal from '../../components/Reveal.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const ONBOARDING_KEY = 'nexus.onboarding.dismissed';

export default function Dashboard() {
  const { user } = useAuth();
  const [subs, setSubs] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(() => typeof window !== 'undefined' && localStorage.getItem(ONBOARDING_KEY) === 'true');

  useEffect(() => {
    Promise.all([api.get('/api/subscriptions'), api.get('/api/tickets')])
      .then(([s, t]) => { setSubs(s.data); setTickets(t.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const activeSubs = subs.filter((s) => ['active', 'trialing'].includes(s.status));
  const openTickets = tickets.filter((t) => ['open', 'pending'].includes(t.status));
  const nextRenewal = activeSubs
    .map((s) => new Date(s.renewsAt))
    .sort((a, b) => a - b)[0];

  const showOnboarding = !loading && !dismissed && activeSubs.length === 0 && tickets.length === 0;

  const steps = useMemo(() => [
    { id: 'profile', label: 'Complete your profile', done: Boolean(user?.company), to: '/portal/profile', icon: Check },
    { id: 'subscribe', label: 'Start a 14-day free trial', done: activeSubs.length > 0, to: '/products', icon: Box },
    { id: 'coupon', label: 'Have a coupon? Apply it on upgrade', done: false, to: '/portal/subscriptions', icon: Tag },
    { id: 'docs', label: 'Read the journal for tips', done: false, to: '/blog', icon: BookOpen },
  ], [user, activeSubs.length]);

  const dismiss = () => { localStorage.setItem(ONBOARDING_KEY, 'true'); setDismissed(true); };

  return (
    <div className="portal-page">
      <Reveal>
        <header className="portal-header">
          <span className="eyebrow">// Customer Portal</span>
          <h1>Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span></h1>
          <p>Here's what's happening across your subscriptions and support tickets today.</p>
        </header>
      </Reveal>

      {showOnboarding && (
        <motion.section
          className="onboarding glass"
          initial={{ opacity: 0, y: 14, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0)' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="onboarding__head">
            <div>
              <span className="eyebrow">// Get started</span>
              <h2>Welcome to NEXUS, {user?.name?.split(' ')[0]} <Sparkles size={20} style={{ color: 'var(--neon-cyan)' }} /></h2>
              <p>Four quick steps to set up your account. We'll keep this here until you're done.</p>
            </div>
            <button className="onboarding__dismiss" onClick={dismiss} aria-label="Dismiss"><X size={16} /></button>
          </div>
          <ol className="onboarding__steps">
            {steps.map((s, i) => (
              <motion.li
                key={s.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.08 }}
                className={s.done ? 'is-done' : ''}
              >
                <span className="onboarding__num"><s.icon size={14} /></span>
                <div>
                  <strong>{s.label}</strong>
                  <span className="mono">{s.done ? 'Completed' : 'Pending'}</span>
                </div>
                <Link to={s.to} className="btn btn--ghost">{s.done ? 'Review' : 'Open'} <ArrowRight size={12} /></Link>
              </motion.li>
            ))}
          </ol>
        </motion.section>
      )}

      <div className="portal-stats">
        {[
          { icon: CreditCard, label: 'Active subscriptions', value: activeSubs.length, accent: '#00f0ff' },
          { icon: LifeBuoy, label: 'Open tickets', value: openTickets.length, accent: '#ff2bd1' },
          { icon: Calendar, label: 'Next renewal', value: nextRenewal ? nextRenewal.toLocaleDateString('en', { day: 'numeric', month: 'short' }) : '—', accent: '#b537ff' },
          { icon: Rocket, label: 'Account tier', value: activeSubs.length > 1 ? 'Pro' : 'Starter', accent: '#39ff14' },
        ].map((s, i) => (
          <Reveal key={s.label} delay={i * 0.06}>
            <div className="stat-card glass" style={{ '--accent': s.accent }}>
              <span className="stat-card__icon"><s.icon size={16} /></span>
              <span className="stat-card__label">{s.label}</span>
              <span className="stat-card__value">{loading ? '…' : s.value}</span>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="portal-twocol">
        <Reveal>
          <section className="glass portal-block">
            <header className="portal-block__head">
              <h3>Your subscriptions</h3>
              <Link to="/portal/subscriptions" className="portal-block__link">Manage <ArrowRight size={14} /></Link>
            </header>
            {loading ? <p className="muted">Loading…</p> : activeSubs.length === 0 ? (
              <div className="empty-block">
                <p>You don't have any active subscriptions yet.</p>
                <Link to="/products" className="btn btn--primary">Explore Products <ArrowRight size={14} /></Link>
              </div>
            ) : (
              <ul className="sub-list">
                {activeSubs.map((s) => (
                  <li key={s.id}>
                    <div>
                      <strong>{s.productName}</strong>
                      <span className="mono">{s.plan} · {s.status}{s.coupon ? ` · ${s.coupon.code}` : ''}</span>
                    </div>
                    <span className="mono">renews {new Date(s.renewsAt).toLocaleDateString('en', { day: 'numeric', month: 'short' })}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </Reveal>

        <Reveal delay={0.08}>
          <section className="glass portal-block">
            <header className="portal-block__head">
              <h3>Recent tickets</h3>
              <Link to="/portal/tickets" className="portal-block__link">View all <ArrowRight size={14} /></Link>
            </header>
            {loading ? <p className="muted">Loading…</p> : tickets.length === 0 ? (
              <div className="empty-block">
                <p>No support tickets — yet. We're here when you need us.</p>
                <Link to="/portal/tickets" className="btn btn--ghost">Raise a ticket</Link>
              </div>
            ) : (
              <ul className="ticket-list">
                {tickets.slice(0, 4).map((t) => (
                  <li key={t.id}>
                    <span className={`status status--${t.status}`}>{t.status}</span>
                    <div>
                      <strong>{t.subject}</strong>
                      <span className="mono">{t.category} · updated {new Date(t.updatedAt).toLocaleDateString('en', { day: 'numeric', month: 'short' })}</span>
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
