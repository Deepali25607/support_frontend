import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Zap, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import './Auth.css';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const user = await login(email, password);
      const dest = loc.state?.from || (user.role === 'admin' ? '/admin' : '/portal');
      nav(dest, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed');
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
            <span className="eyebrow">// Sign In</span>
          </div>
          <h1 className="auth-card__title">Welcome <span className="gradient-text">back</span></h1>
          <p className="auth-card__sub">Sign in to your portal to manage subscriptions, support tickets and account settings.</p>

          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="auth-error">
              <AlertCircle size={14} /> {error}
            </motion.div>
          )}

          <form onSubmit={submit} className="auth-form">
            <div>
              <label>Work Email</label>
              <div className="auth-field">
                <Mail size={16} />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" autoComplete="email" />
              </div>
            </div>
            <div>
              <label>Password</label>
              <div className="auth-field">
                <Lock size={16} />
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
              </div>
            </div>

            <button className="btn btn--primary btn--lg btn--block" type="submit" disabled={busy}>
              {busy ? 'Signing in…' : <>Sign In <ArrowRight size={16} /></>}
            </button>
          </form>

          <div className="auth-divider"><span>or</span></div>

          <p className="auth-foot">No account yet? <Link to="/signup">Create one →</Link></p>

          <div className="auth-seed">
            <span className="mono">DEMO ACCOUNTS</span>
            <div>
              <strong>Customer:</strong> demo@customer.io / demo1234
            </div>
            <div>
              <strong>Admin:</strong> admin@nexuslab.io / admin123
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
