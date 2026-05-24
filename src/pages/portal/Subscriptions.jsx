import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Pause, Play, X, Download, Plus, ArrowRight, Tag, Check, AlertCircle } from 'lucide-react';
import { api } from '../../lib/api.js';
import Reveal from '../../components/Reveal.jsx';

const statusLabel = {
  active: 'Active',
  trialing: 'Trial',
  paused: 'Paused',
  cancelled: 'Cancelled',
};

export default function Subscriptions() {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [upgrading, setUpgrading] = useState(null);

  const load = () => api.get('/api/subscriptions').then(({ data }) => setSubs(data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const update = async (id, body) => {
    setBusyId(id);
    try {
      const { data } = await api.patch(`/api/subscriptions/${id}`, body);
      setSubs((arr) => arr.map((s) => (s.id === id ? data : s)));
      return data;
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="portal-page">
      <Reveal>
        <header className="portal-header">
          <span className="eyebrow">// Subscriptions</span>
          <h1>Your <span className="gradient-text">subscriptions</span></h1>
          <p>Manage plans, apply coupons, pause when you need to, and download invoices.</p>
        </header>
      </Reveal>

      {loading ? <p className="muted">Loading…</p> : subs.length === 0 ? (
        <Reveal>
          <div className="empty-block glass" style={{ padding: '3rem' }}>
            <CreditCard size={32} style={{ color: 'var(--neon-cyan)' }} />
            <h3>No active subscriptions</h3>
            <p>Start a 14-day free trial on any product — no card required.</p>
            <Link to="/products" className="btn btn--primary"><Plus size={14} /> Browse Products</Link>
          </div>
        </Reveal>
      ) : (
        <div className="sub-grid">
          {subs.map((s, i) => (
            <Reveal key={s.id} delay={i * 0.06}>
              <article className="sub-card glass">
                <header>
                  <span className={`status status--${s.status}`}>{statusLabel[s.status] || s.status}</span>
                  <span className="mono">{s.productId.toUpperCase()}</span>
                </header>
                <h3>{s.productName}</h3>
                <p className="sub-card__plan mono">{s.plan} · {typeof s.price === 'number' ? `₹${s.price.toLocaleString()}/${s.period}` : s.price}</p>

                {s.coupon && (
                  <div className="sub-card__coupon">
                    <Tag size={12} />
                    <strong>{s.coupon.code}</strong>
                    <span className="mono">−₹{(s.discount || 0).toLocaleString()} → ₹{(s.finalPrice ?? s.price).toLocaleString()}/{s.period}</span>
                  </div>
                )}

                <dl className="sub-card__meta">
                  <div><dt>Started</dt><dd>{new Date(s.startedAt).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' })}</dd></div>
                  <div><dt>Next renewal</dt><dd>{new Date(s.renewsAt).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' })}</dd></div>
                </dl>
                <footer>
                  {s.status === 'active' && (
                    <button className="btn btn--ghost" disabled={busyId === s.id} onClick={() => update(s.id, { status: 'paused' })}><Pause size={14} /> Pause</button>
                  )}
                  {s.status === 'paused' && (
                    <button className="btn btn--ghost" disabled={busyId === s.id} onClick={() => update(s.id, { status: 'active' })}><Play size={14} /> Resume</button>
                  )}
                  {s.status === 'trialing' && (
                    <button className="btn btn--primary" disabled={busyId === s.id} onClick={() => setUpgrading(s)}>Upgrade <ArrowRight size={14} /></button>
                  )}
                  {s.status !== 'cancelled' && (
                    <button className="btn btn--ghost" disabled={busyId === s.id} onClick={() => update(s.id, { status: 'cancelled' })}><X size={14} /> Cancel</button>
                  )}
                  <Link to={`/portal/invoice/${s.id}`} className="btn btn--ghost"><Download size={14} /> Invoice</Link>
                </footer>
              </article>
            </Reveal>
          ))}
        </div>
      )}

      <AnimatePresence>
        {upgrading && (
          <UpgradeModal
            sub={upgrading}
            onClose={() => setUpgrading(null)}
            onConfirm={async (couponCode) => {
              await update(upgrading.id, { status: 'active', couponCode });
              setUpgrading(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function UpgradeModal({ sub, onClose, onConfirm }) {
  const [code, setCode] = useState('');
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const validate = async (e) => {
    e?.preventDefault?.();
    setError('');
    setPreview(null);
    if (!code.trim()) return;
    setBusy(true);
    try {
      const { data } = await api.post('/api/coupons/validate', { code: code.trim(), price: sub.price });
      setPreview(data);
    } catch (err) {
      setError(err.message || 'Invalid coupon');
    } finally { setBusy(false); }
  };

  const confirm = async () => {
    setConfirming(true);
    try {
      await onConfirm(preview ? preview.code : '');
    } finally { setConfirming(false); }
  };

  const due = preview ? preview.finalPrice : sub.price;

  return (
    <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div
        className="modal glass"
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94 }}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal__head">
          <div>
            <span className="eyebrow">// Upgrade</span>
            <h3 style={{ marginTop: '0.4rem' }}>{sub.productName} · {sub.plan}</h3>
          </div>
          <button type="button" className="modal__close" onClick={onClose}><X size={18} /></button>
        </header>

        <div className="upgrade-summary">
          <div>
            <span className="mono">PLAN</span>
            <strong>{sub.plan}</strong>
          </div>
          <div>
            <span className="mono">BILLING</span>
            <strong>₹{sub.price.toLocaleString()} / {sub.period}</strong>
          </div>
          <div>
            <span className="mono">NEXT RENEWAL</span>
            <strong>{new Date(sub.renewsAt).toLocaleDateString('en', { day: 'numeric', month: 'short' })}</strong>
          </div>
        </div>

        <form className="coupon-input" onSubmit={validate}>
          <label>Have a coupon code?</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <div className="auth-field" style={{ flex: 1 }}>
              <Tag size={14} />
              <input value={code} onChange={(e) => { setCode(e.target.value.toUpperCase()); setPreview(null); setError(''); }} placeholder="LAUNCH20" style={{ textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }} />
            </div>
            <button type="submit" className="btn btn--ghost" disabled={busy || !code.trim()}>{busy ? 'Checking…' : 'Apply'}</button>
          </div>
          {error && <div className="auth-error" style={{ marginTop: '0.6rem' }}><AlertCircle size={14} /> {error}</div>}
          {preview && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="coupon-preview">
              <Check size={14} />
              <div>
                <strong>{preview.code}</strong> applied
                <span className="mono">{preview.label} · saves ₹{preview.discount.toLocaleString()}</span>
              </div>
            </motion.div>
          )}
        </form>

        <div className="upgrade-total">
          <div>
            <span className="mono">DUE TODAY</span>
            <strong className={preview ? 'has-discount' : ''}>
              {preview && <span className="strike">₹{sub.price.toLocaleString()}</span>}
              ₹{due.toLocaleString()} <small>/{sub.period}</small>
            </strong>
          </div>
          <button className="btn btn--primary btn--lg" onClick={confirm} disabled={confirming}>
            {confirming ? 'Activating…' : <>Confirm Upgrade <ArrowRight size={16} /></>}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
