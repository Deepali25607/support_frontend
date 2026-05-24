import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Eye, EyeOff, ArrowLeft, AlertCircle, Check, Hash } from 'lucide-react';
import { api } from '../../lib/api.js';
import Reveal from '../../components/Reveal.jsx';
import { useProducts } from '../../context/ProductsContext.jsx';

const slugify = (s) => String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);

const ACCENTS = ['#00f0ff', '#b537ff', '#39ff14', '#ff2bd1', '#3a8dff', '#ffb627'];
const DEFAULT_SECTIONS = ['Getting Started', 'Quick Start', 'Modules', 'Billing', 'Support', 'AI Insights', 'Marketing', 'Automation', 'Integrations'];

export default function DocsEditor() {
  const { id } = useParams();
  const nav = useNavigate();
  const editing = Boolean(id);
  const { products } = useProducts();
  const platformOptions = [{ id: 'platform', label: 'Platform' }, ...products.map((p) => ({ id: p.id, label: p.name }))];
  const [loading, setLoading] = useState(editing);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);
  const [form, setForm] = useState({
    title: '', slug: '',
    product: 'platform', productLabel: 'Platform',
    section: DEFAULT_SECTIONS[0],
    accent: ACCENTS[0],
    body: '',
    published: false,
  });

  useEffect(() => {
    if (!editing) return;
    api.get('/api/docs').then(({ data }) => {
      const doc = data.find((d) => d.id === id);
      if (!doc) { nav('/admin/docs'); return; }
      setForm({
        title: doc.title, slug: doc.slug,
        product: doc.product, productLabel: doc.productLabel,
        section: doc.section, accent: doc.accent || ACCENTS[0],
        body: doc.body, published: doc.published,
      });
      setSlugTouched(true);
    }).finally(() => setLoading(false));
  }, [id, editing, nav]);

  const setField = (k, v) => setForm((f) => {
    const next = { ...f, [k]: v };
    if (k === 'title' && !slugTouched && !editing) next.slug = slugify(v);
    if (k === 'product') {
      const found = platformOptions.find((p) => p.id === v);
      if (found) next.productLabel = found.label;
    }
    return next;
  });

  const submit = async (e, publishNow = null) => {
    e?.preventDefault?.();
    setError('');
    setBusy(true);
    try {
      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim() || slugify(form.title),
        product: form.product,
        productLabel: form.productLabel,
        section: form.section.trim(),
        accent: form.accent,
        body: form.body.trim(),
        published: publishNow !== null ? publishNow : form.published,
      };
      const { data } = editing
        ? await api.patch(`/api/docs/${id}`, payload)
        : await api.post('/api/docs', payload);
      setSaved(true);
      setTimeout(() => setSaved(false), 2400);
      if (!editing) nav(`/admin/docs/${data.id}/edit`, { replace: true });
      else setForm((f) => ({ ...f, published: data.published }));
    } catch (err) {
      setError(err.message || 'Save failed');
    } finally { setBusy(false); }
  };

  if (loading) return <div style={{ display: 'grid', placeItems: 'center', minHeight: '40vh' }}><div className="auth-spinner" /></div>;

  const readingTime = Math.max(1, Math.round(form.body.split(/\s+/).filter(Boolean).length / 220));

  return (
    <div className="portal-page">
      <Reveal>
        <header className="portal-header portal-header--row">
          <div>
            <Link to="/admin/docs" className="mono" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-1)', fontSize: '0.82rem', marginBottom: '0.6rem' }}>
              <ArrowLeft size={12} /> All docs
            </Link>
            <span className="eyebrow">// {editing ? 'Edit' : 'New'} Article</span>
            <h1>{editing ? 'Edit' : 'Write an'} <span className="gradient-text">article</span></h1>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span className="mono" style={{ color: 'var(--text-2)', fontSize: '0.78rem' }}>{readingTime} min read</span>
            <button className="btn btn--ghost" disabled={busy} onClick={(e) => submit(e, !form.published)}>
              {form.published ? <><EyeOff size={14} /> Unpublish</> : <><Eye size={14} /> Publish</>}
            </button>
            <button className="btn btn--primary" disabled={busy} onClick={submit}>
              {saved ? <><Check size={14} /> Saved</> : busy ? 'Saving…' : <><Save size={14} /> Save</>}
            </button>
          </div>
        </header>
      </Reveal>

      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="auth-error">
            <AlertCircle size={14} /> {error}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="editor-grid">
        <section className="glass editor-main">
          <div><label>Title</label><input value={form.title} onChange={(e) => setField('title', e.target.value)} placeholder="How to set up multi-campus reporting" /></div>
          <div>
            <label>Slug</label>
            <div className="auth-field"><Hash size={14} /><input value={form.slug} onChange={(e) => { setSlugTouched(true); setField('slug', e.target.value.toLowerCase()); }} placeholder="multi-campus-reporting" /></div>
          </div>
          <div>
            <label>Body</label>
            <textarea
              rows={24}
              value={form.body}
              onChange={(e) => setField('body', e.target.value)}
              placeholder={`Write your article.\n\nDouble line breaks make new paragraphs.\nLines starting with "1." render as numbered lists.\nLines starting with "— " render as bullet lists.`}
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.92rem', lineHeight: 1.6 }}
            />
          </div>
        </section>

        <aside className="editor-side glass">
          <h3>Article settings</h3>
          <div>
            <label>Product</label>
            <select value={form.product} onChange={(e) => setField('product', e.target.value)}>
              {platformOptions.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
          </div>
          <div>
            <label>Section</label>
            <input value={form.section} onChange={(e) => setField('section', e.target.value)} list="docs-section-list" />
            <datalist id="docs-section-list">
              {DEFAULT_SECTIONS.map((s) => <option key={s} value={s} />)}
            </datalist>
          </div>
          <div>
            <label>Accent color</label>
            <div className="editor-covers">
              {ACCENTS.map((c) => (
                <button
                  type="button"
                  key={c}
                  className={`editor-cover ${form.accent === c ? 'is-on' : ''}`}
                  onClick={() => setField('accent', c)}
                  style={{ background: `radial-gradient(circle at 30% 30%, ${c}, color-mix(in srgb, ${c} 30%, #04070f))` }}
                />
              ))}
            </div>
          </div>
          <div>
            <label>Status</label>
            <div className="cr-radios">
              <label className={`cr-radio ${!form.published ? 'is-on' : ''}`}>
                <input type="radio" checked={!form.published} onChange={() => setField('published', false)} />
                <span>Draft</span>
              </label>
              <label className={`cr-radio ${form.published ? 'is-on' : ''}`}>
                <input type="radio" checked={form.published} onChange={() => setField('published', true)} />
                <span>Published</span>
              </label>
            </div>
          </div>
          <div className="editor-preview" style={{ '--accent': form.accent }}>
            <span className="mono">PREVIEW</span>
            <strong style={{ color: 'var(--accent)' }}>{form.productLabel} · {form.section}</strong>
            <h4>{form.title || 'Article title'}</h4>
            <p>{form.body.slice(0, 140) || 'First paragraph will appear here.'}…</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
