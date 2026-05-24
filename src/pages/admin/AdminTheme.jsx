import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Save, Check, RotateCcw, Type, Zap, Eye, Sparkles, ArrowRight } from 'lucide-react';
import { api } from '../../lib/api.js';
import { useTheme, applyTheme, DEFAULT_THEME } from '../../context/ThemeContext.jsx';
import Reveal from '../../components/Reveal.jsx';
import './AdminTheme.css';

const COLOR_FIELDS = [
  { key: 'accentCyan', label: 'Primary accent', hint: 'Hero, links, focus states' },
  { key: 'accentViolet', label: 'Secondary accent', hint: 'Gradients, admin chrome' },
  { key: 'accentMagenta', label: 'Tertiary accent', hint: 'Warm highlights' },
  { key: 'accentBlue', label: 'Cool accent', hint: 'Cool gradient pair' },
  { key: 'accentGreen', label: 'Success accent', hint: 'Confirmations' },
  { key: 'accentAmber', label: 'Warning accent', hint: 'Alerts, urgent states' },
];

const BG_FIELDS = [
  { key: 'bg0', label: 'Background base' },
  { key: 'bg1', label: 'Background layer 1' },
  { key: 'bg2', label: 'Background layer 2' },
];

const TEXT_FIELDS = [
  { key: 'text0', label: 'Primary text' },
  { key: 'text1', label: 'Secondary text' },
  { key: 'text2', label: 'Muted text' },
];

const GRAD_FIELDS = [
  { key: 'gradPrimaryFrom', label: 'Primary gradient — from' },
  { key: 'gradPrimaryTo', label: 'Primary gradient — to' },
];

const EFFECT_FIELDS = [
  { key: 'showGridOverlay', label: 'Grid overlay', hint: 'Faint dotted grid behind content' },
  { key: 'showScanLines', label: 'Scan lines', hint: 'Subtle CRT-style horizontal lines' },
  { key: 'showOrbs', label: 'Background orbs', hint: 'Radial color glows in the background' },
  { key: 'showGlow', label: 'Glow & shadow', hint: 'Neon glow on glass cards and hover states' },
];

export default function AdminTheme() {
  const { theme: liveTheme, refresh } = useTheme();
  const [draft, setDraft] = useState(liveTheme);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api.get('/api/theme/admin')
      .then(({ data }) => { if (!cancelled) setDraft({ ...DEFAULT_THEME, ...data }); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // Live preview as you tweak
  useEffect(() => { if (!loading) applyTheme(draft); }, [draft, loading]);

  const dirty = useMemo(() => {
    if (!liveTheme) return false;
    return Object.keys(draft).some((k) => draft[k] !== liveTheme[k]);
  }, [draft, liveTheme]);

  const set = (key, value) => setDraft((d) => ({ ...d, [key]: value }));

  const save = async () => {
    setSaving(true);
    try {
      const { data } = await api.put('/api/theme', draft);
      setDraft({ ...DEFAULT_THEME, ...data });
      await refresh();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally { setSaving(false); }
  };

  const reset = async () => {
    setResetting(true);
    try {
      const { data } = await api.post('/api/theme/reset', {});
      setDraft({ ...DEFAULT_THEME, ...data });
      await refresh();
    } finally { setResetting(false); }
  };

  const discard = () => {
    setDraft(liveTheme);
    applyTheme(liveTheme);
  };

  if (loading) {
    return <div style={{ display: 'grid', placeItems: 'center', minHeight: '40vh' }}><div className="auth-spinner" /></div>;
  }

  return (
    <div className="portal-page theme-page">
      <Reveal>
        <header className="portal-header portal-header--row">
          <div>
            <span className="eyebrow">// Admin · Theme Options</span>
            <h1>Tune the <span className="gradient-text">visual identity</span></h1>
            <p>Edit accent colors, brand text and visual effects. Changes preview live — save to publish.</p>
          </div>
          <div className="theme-actions">
            {dirty && (
              <button className="btn btn--ghost" onClick={discard}><RotateCcw size={13} /> Discard</button>
            )}
            <button className="btn btn--ghost" onClick={reset} disabled={resetting || saving}>
              {resetting ? 'Resetting…' : <><Sparkles size={13} /> Reset to defaults</>}
            </button>
            <button className="btn btn--primary" onClick={save} disabled={!dirty || saving}>
              {saved ? <><Check size={14} /> Saved</> : saving ? 'Saving…' : <><Save size={14} /> Save theme</>}
            </button>
          </div>
        </header>
      </Reveal>

      <div className="theme-grid">
        <div className="theme-main">
          <Reveal delay={0.04}>
            <section className="theme-block glass">
              <header><Type size={14} /> <h3>Brand</h3></header>
              <div className="form-row">
                <div>
                  <label>Brand name</label>
                  <input value={draft.brandName} onChange={(e) => set('brandName', e.target.value)} maxLength={40} />
                </div>
                <div>
                  <label>Brand tagline</label>
                  <input value={draft.brandTagline} onChange={(e) => set('brandTagline', e.target.value)} maxLength={60} />
                </div>
              </div>
              <div className="form-row">
                <div>
                  <label>Display font</label>
                  <input value={draft.fontDisplay} onChange={(e) => set('fontDisplay', e.target.value)} list="font-display-options" />
                  <datalist id="font-display-options">
                    <option value="Space Grotesk" />
                    <option value="Inter" />
                    <option value="Manrope" />
                    <option value="Sora" />
                    <option value="Outfit" />
                  </datalist>
                </div>
                <div>
                  <label>Mono font</label>
                  <input value={draft.fontMono} onChange={(e) => set('fontMono', e.target.value)} list="font-mono-options" />
                  <datalist id="font-mono-options">
                    <option value="JetBrains Mono" />
                    <option value="Fira Code" />
                    <option value="IBM Plex Mono" />
                  </datalist>
                </div>
              </div>
            </section>
          </Reveal>

          <Reveal delay={0.08}>
            <section className="theme-block glass">
              <header><Palette size={14} /> <h3>Accent palette</h3></header>
              <p className="muted theme-block__lead">These six colors drive every gradient, glow and highlight across the site.</p>
              <div className="color-grid">
                {COLOR_FIELDS.map((f) => (
                  <ColorPicker key={f.key} field={f} value={draft[f.key]} onChange={(v) => set(f.key, v)} />
                ))}
              </div>
            </section>
          </Reveal>

          <Reveal delay={0.12}>
            <section className="theme-block glass">
              <header><Palette size={14} /> <h3>Backgrounds &amp; text</h3></header>
              <div className="color-grid color-grid--compact">
                {BG_FIELDS.map((f) => (
                  <ColorPicker key={f.key} field={f} value={draft[f.key]} onChange={(v) => set(f.key, v)} />
                ))}
                {TEXT_FIELDS.map((f) => (
                  <ColorPicker key={f.key} field={f} value={draft[f.key]} onChange={(v) => set(f.key, v)} />
                ))}
              </div>
            </section>
          </Reveal>

          <Reveal delay={0.16}>
            <section className="theme-block glass">
              <header><Sparkles size={14} /> <h3>Primary gradient</h3></header>
              <p className="muted theme-block__lead">Used on hero headlines, primary buttons, and brand mark.</p>
              <div className="color-grid color-grid--compact">
                {GRAD_FIELDS.map((f) => (
                  <ColorPicker key={f.key} field={f} value={draft[f.key]} onChange={(v) => set(f.key, v)} />
                ))}
              </div>
              <div className="grad-preview" style={{ background: `linear-gradient(135deg, ${draft.gradPrimaryFrom} 0%, ${draft.gradPrimaryTo} 100%)` }}>
                <span className="mono">grad-primary</span>
              </div>
            </section>
          </Reveal>

          <Reveal delay={0.2}>
            <section className="theme-block glass">
              <header><Zap size={14} /> <h3>Visual effects</h3></header>
              <div className="toggle-grid">
                {EFFECT_FIELDS.map((f) => (
                  <label key={f.key} className={`toggle-card ${draft[f.key] ? 'is-on' : ''}`}>
                    <div>
                      <strong>{f.label}</strong>
                      <span>{f.hint}</span>
                    </div>
                    <input type="checkbox" checked={!!draft[f.key]} onChange={(e) => set(f.key, e.target.checked)} />
                    <span className="toggle-card__sw" />
                  </label>
                ))}
              </div>
            </section>
          </Reveal>
        </div>

        <aside className="theme-side">
          <div className="theme-preview glass">
            <header><Eye size={14} /> <span>Live preview</span></header>
            <div className="preview-brand">
              <span className="preview-brand__mark" style={{ background: `linear-gradient(135deg, ${draft.gradPrimaryFrom}, ${draft.gradPrimaryTo})` }}>
                <Zap size={16} strokeWidth={2.5} />
              </span>
              <div>
                <strong>{draft.brandName}</strong>
                <span className="mono">{draft.brandTagline}</span>
              </div>
            </div>
            <h2 className="preview-heading">
              <span style={{ backgroundImage: `linear-gradient(135deg, ${draft.text0} 0%, ${draft.accentCyan} 50%, ${draft.accentViolet} 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Future-ready</span><br />
              <span style={{ color: draft.text0 }}>software products.</span>
            </h2>
            <div className="preview-pills">
              {['ERP', 'SaaS', 'CRM'].map((p) => (
                <span key={p} className="pill">{p}</span>
              ))}
            </div>
            <div className="preview-buttons">
              <button type="button" className="btn btn--primary" style={{ background: `linear-gradient(135deg, ${draft.gradPrimaryFrom}, ${draft.gradPrimaryTo})` }}>
                <span>Explore</span> <ArrowRight size={14} />
              </button>
              <button type="button" className="btn btn--ghost">Book Demo</button>
            </div>
            <div className="preview-swatches">
              <span style={{ background: draft.accentCyan }} />
              <span style={{ background: draft.accentViolet }} />
              <span style={{ background: draft.accentMagenta }} />
              <span style={{ background: draft.accentBlue }} />
              <span style={{ background: draft.accentGreen }} />
              <span style={{ background: draft.accentAmber }} />
            </div>
            <AnimatePresence>
              {dirty && (
                <motion.p
                  className="mono preview-dirty"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                >
                  unsaved changes — previewing draft
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </aside>
      </div>
    </div>
  );
}

function ColorPicker({ field, value, onChange }) {
  const safeHex = /^#[0-9a-fA-F]{6}$/.test(value) ? value : '#000000';
  return (
    <div className="color-field">
      <label>
        <span className="color-field__label">{field.label}</span>
        {field.hint && <span className="color-field__hint">{field.hint}</span>}
      </label>
      <div className="color-field__row">
        <span className="color-field__chip" style={{ background: safeHex }}>
          <input type="color" value={safeHex} onChange={(e) => onChange(e.target.value.toLowerCase())} />
        </span>
        <input
          className="color-field__hex mono"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          maxLength={7}
          spellCheck={false}
        />
      </div>
    </div>
  );
}
