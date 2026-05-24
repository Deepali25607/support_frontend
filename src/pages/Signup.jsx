import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Building2, ArrowRight, Zap, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import './Auth.css';

export default function Signup() {
  const { signup } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', company: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await signup(form);
      nav('/portal', { replace: true });
    } catch (err) {
      setError(err.message || 'Signup failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="auth-shell">
      <div className="auth-bg" aria-hidden="true">
        <div className="auth-orb auth-orb--1" />
        <div className="auth-orb auth-orb--2" />
        <div className="auth-grid" />
      </div>
      <div className="container auth-grid-wrap">
        <motion.div
          className="auth-card glass"
          initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0)' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="auth-card__head">
            <Link to="/" className="auth-brand">
              <span className="auth-brand__mark"><Zap size={18} strokeWidth={2.5} /></span>
              <span>NEXUS</span>
            </Link>
            <span className="eyebrow">// Create Account</span>
          </div>
          <h1 className="auth-card__title">Join the <span className="gradient-text">platform</span></h1>
          <p className="auth-card__sub">Create a free account to access your customer portal, subscriptions, invoices and support.</p>

          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="auth-error">
              <AlertCircle size={14} /> {error}
            </motion.div>
          )}

          <form onSubmit={submit} className="auth-form">
            <div>
              <label>Full Name</label>
              <div className="auth-field">
                <User size={16} />
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" autoComplete="name" />
              </div>
            </div>
            <div>
              <label>Company</label>
              <div className="auth-field">
                <Building2 size={16} />
                <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Your company" autoComplete="organization" />
              </div>
            </div>
            <div>
              <label>Work Email</label>
              <div className="auth-field">
                <Mail size={16} />
                <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@company.com" autoComplete="email" />
              </div>
            </div>
            <div>
              <label>Password (min 8 characters)</label>
              <div className="auth-field">
                <Lock size={16} />
                <input type="password" minLength={8} required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" autoComplete="new-password" />
              </div>
            </div>

            <button className="btn btn--primary btn--lg btn--block" type="submit" disabled={busy}>
              {busy ? 'Creating account…' : <>Create Account <ArrowRight size={16} /></>}
            </button>
          </form>

          <p className="auth-foot">Already have an account? <Link to="/login">Sign in →</Link></p>
        </motion.div>
      </div>
    </section>
  );
}
