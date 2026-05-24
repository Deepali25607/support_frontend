import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Check, Plus, X, RotateCcw, Type, MessageSquare, HelpCircle, Tag, Headphones } from 'lucide-react';
import { api } from '../../lib/api.js';
import Reveal from '../../components/Reveal.jsx';
import { useSiteContent } from '../../context/SiteContentContext.jsx';

const GROUPS = [
  { id: 'hero', label: 'Hero & Pills', icon: Type, keys: ['hero.eyebrow', 'hero.title.lead', 'hero.title.tail', 'hero.subtitle', 'hero.pills'] },
  { id: 'contact', label: 'Support Contact', icon: Headphones, keys: ['support.email', 'support.phone', 'support.locations', 'support.hours', 'support.statusLine', 'support.uptime', 'support.billingEmail', 'support.billingPhone'] },
  { id: 'logos', label: 'Client Logos', icon: Tag, keys: ['clients.logos'] },
  { id: 'testimonials', label: 'Testimonials', icon: MessageSquare, keys: ['testimonials'] },
  { id: 'faqs', label: 'FAQs', icon: HelpCircle, keys: ['faqs'] },
];

export default function AdminSiteContent() {
  const { refresh: refreshPublicContent } = useSiteContent();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('hero');
  const [dirty, setDirty] = useState({});
  const [busyKey, setBusyKey] = useState(null);
  const [savedKey, setSavedKey] = useState(null);

  const load = () => api.get('/api/site-content/admin').then(({ data }) => setItems(data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const byKey = (key) => items.find((i) => i.key === key);
  const setValue = (key, value) => setDirty((d) => ({ ...d, [key]: value }));
  const valueOf = (key) => (key in dirty ? dirty[key] : byKey(key)?.value);

  const save = async (key) => {
    setBusyKey(key);
    try {
      const { data } = await api.put(`/api/site-content/${encodeURIComponent(key)}`, { value: valueOf(key) });
      setItems((arr) => arr.map((i) => (i.key === key ? data : i)));
      setDirty((d) => { const { [key]: _, ...rest } = d; return rest; });
      setSavedKey(key);
      setTimeout(() => setSavedKey((k) => (k === key ? null : k)), 2000);
      refreshPublicContent();
    } finally { setBusyKey(null); }
  };

  const reset = (key) => setDirty((d) => { const { [key]: _, ...rest } = d; return rest; });

  if (loading) return <div style={{ display: 'grid', placeItems: 'center', minHeight: '40vh' }}><div className="auth-spinner" /></div>;

  const groupKeys = GROUPS.find((g) => g.id === tab)?.keys || [];
  const dirtyCount = Object.keys(dirty).length;

  return (
    <div className="portal-page">
      <Reveal>
        <header className="portal-header portal-header--row">
          <div>
            <span className="eyebrow">// Admin · Site Content</span>
            <h1>Edit the <span className="gradient-text">public site</span></h1>
            <p>Manage hero copy, testimonials, FAQs and client logos that render on the public site.</p>
          </div>
          <span className="mono" style={{ color: dirtyCount > 0 ? 'var(--neon-amber)' : 'var(--text-2)', fontSize: '0.78rem' }}>
            {dirtyCount > 0 ? `${dirtyCount} unsaved change(s)` : 'all saved'}
          </span>
        </header>
      </Reveal>

      <div className="pd-tabs" role="tablist">
        {GROUPS.map((g) => (
          <button key={g.id} className={`pd-tab ${tab === g.id ? 'is-on' : ''}`} onClick={() => setTab(g.id)}>
            <g.icon size={14} />
            <span>{g.label}</span>
            {tab === g.id && <motion.span layoutId="sc-tab-bg" className="pd-tab__bg" transition={{ type: 'spring', stiffness: 340, damping: 30 }} />}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="sc-list"
        >
          {groupKeys.map((key) => {
            const item = byKey(key);
            if (!item) return null;
            const isDirty = key in dirty;
            const isSaved = savedKey === key;
            return (
              <section key={key} className="sc-block glass">
                <header className="sc-block__head">
                  <div>
                    <h3>{item.label}</h3>
                    <span className="mono">{key} · {item.kind}</span>
                  </div>
                  <div className="sc-block__actions">
                    {isDirty && (
                      <button className="btn btn--ghost" onClick={() => reset(key)}><RotateCcw size={13} /> Reset</button>
                    )}
                    <button className="btn btn--primary" disabled={!isDirty || busyKey === key} onClick={() => save(key)}>
                      {isSaved ? <><Check size={13} /> Saved</> : busyKey === key ? 'Saving…' : <><Save size={13} /> Save</>}
                    </button>
                  </div>
                </header>
                <FieldEditor item={item} value={valueOf(key)} onChange={(v) => setValue(key, v)} />
              </section>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function FieldEditor({ item, value, onChange }) {
  if (item.kind === 'text') {
    return <input value={value || ''} onChange={(e) => onChange(e.target.value)} />;
  }
  if (item.kind === 'textarea') {
    return <textarea rows={4} value={value || ''} onChange={(e) => onChange(e.target.value)} />;
  }
  if (item.kind === 'list') {
    return <StringList value={value || []} onChange={onChange} placeholder="Add a value…" />;
  }
  if (item.kind === 'collection' && item.key === 'testimonials') {
    return <TestimonialList value={value || []} onChange={onChange} />;
  }
  if (item.kind === 'collection' && item.key === 'faqs') {
    return <FaqList value={value || []} onChange={onChange} />;
  }
  return <pre className="mono" style={{ fontSize: '0.8rem', color: 'var(--text-2)' }}>{JSON.stringify(value, null, 2)}</pre>;
}

function StringList({ value, onChange, placeholder }) {
  const [draft, setDraft] = useState('');
  return (
    <div className="sl">
      <div className="sl__chips">
        {value.map((v, i) => (
          <span key={i} className="pill sl__chip">
            {v}
            <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label="Remove"><X size={11} /></button>
          </span>
        ))}
      </div>
      <div className="sl__add">
        <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={placeholder} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (draft.trim()) { onChange([...value, draft.trim()]); setDraft(''); } } }} />
        <button type="button" className="btn btn--ghost" onClick={() => { if (draft.trim()) { onChange([...value, draft.trim()]); setDraft(''); } }}><Plus size={14} /> Add</button>
      </div>
    </div>
  );
}

const ACCENTS = ['#00f0ff', '#b537ff', '#39ff14', '#ff2bd1', '#3a8dff', '#ffb627'];

function TestimonialList({ value, onChange }) {
  const update = (i, patch) => onChange(value.map((v, j) => (j === i ? { ...v, ...patch } : v)));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      {value.map((t, i) => (
        <div key={i} className="sc-card">
          <div className="form-row">
            <div><label>Name</label><input value={t.name} onChange={(e) => update(i, { name: e.target.value })} /></div>
            <div><label>Role</label><input value={t.role} onChange={(e) => update(i, { role: e.target.value })} /></div>
          </div>
          <div><label>Quote</label><textarea rows={3} value={t.quote} onChange={(e) => update(i, { quote: e.target.value })} /></div>
          <div className="sc-card__foot">
            <div>
              <label>Accent</label>
              <div className="editor-covers">
                {ACCENTS.map((c) => (
                  <button type="button" key={c} className={`editor-cover ${t.accent === c ? 'is-on' : ''}`} onClick={() => update(i, { accent: c })} style={{ background: `radial-gradient(circle at 30% 30%, ${c}, color-mix(in srgb, ${c} 30%, #04070f))` }} />
                ))}
              </div>
            </div>
            <button type="button" className="btn btn--ghost" onClick={() => onChange(value.filter((_, j) => j !== i))} style={{ color: '#ff7ad8', alignSelf: 'flex-end' }}><X size={14} /> Remove</button>
          </div>
        </div>
      ))}
      <button type="button" className="btn btn--ghost" onClick={() => onChange([...value, { name: '', role: '', quote: '', accent: ACCENTS[0] }])}>
        <Plus size={14} /> Add testimonial
      </button>
    </div>
  );
}

function FaqList({ value, onChange }) {
  const update = (i, patch) => onChange(value.map((v, j) => (j === i ? { ...v, ...patch } : v)));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      {value.map((f, i) => (
        <div key={i} className="sc-card">
          <div><label>Question</label><input value={f.q} onChange={(e) => update(i, { q: e.target.value })} /></div>
          <div><label>Answer</label><textarea rows={3} value={f.a} onChange={(e) => update(i, { a: e.target.value })} /></div>
          <button type="button" className="btn btn--ghost" onClick={() => onChange(value.filter((_, j) => j !== i))} style={{ color: '#ff7ad8', alignSelf: 'flex-end' }}><X size={14} /> Remove</button>
        </div>
      ))}
      <button type="button" className="btn btn--ghost" onClick={() => onChange([...value, { q: '', a: '' }])}>
        <Plus size={14} /> Add FAQ
      </button>
    </div>
  );
}
