import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Eye, EyeOff, ArrowLeft, AlertCircle, Check, Plus, X } from 'lucide-react';
import { api } from '../../lib/api.js';
import Reveal from '../../components/Reveal.jsx';
import { useProducts } from '../../context/ProductsContext.jsx';

const slugify = (s) => String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);

const ACCENTS = ['#00f0ff', '#b537ff', '#39ff14', '#ff2bd1', '#3a8dff', '#ffb627'];

export default function CaseStudyEditor() {
  const { id } = useParams();
  const nav = useNavigate();
  const editing = Boolean(id);
  const { products } = useProducts();
  const [loading, setLoading] = useState(editing);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);
  const [form, setForm] = useState({
    client: '', slug: '', industry: '', logo: '',
    product: products[0]?.name || '', productId: products[0]?.id || '',
    accent: ACCENTS[0],
    summary: '', challenge: '', solution: '',
    outcomes: [''], tech: '', stats: [{ label: '', value: '' }],
    gallery: [ACCENTS[0], ACCENTS[1], ACCENTS[2]],
    published: false,
  });

  useEffect(() => {
    if (!editing) return;
    api.get('/api/case-studies').then(({ data }) => {
      const cs = data.find((c) => c.id === id);
      if (!cs) { nav('/admin/case-studies'); return; }
      setForm({
        client: cs.client, slug: cs.slug, industry: cs.industry, logo: cs.logo || '',
        product: cs.product, productId: cs.productId || '', accent: cs.accent || ACCENTS[0],
        summary: cs.summary, challenge: cs.challenge, solution: cs.solution,
        outcomes: cs.outcomes?.length ? cs.outcomes : [''],
        tech: (cs.tech || []).join(', '),
        stats: cs.stats?.length ? cs.stats : [{ label: '', value: '' }],
        gallery: cs.gallery?.length ? cs.gallery : [ACCENTS[0]],
        published: cs.published,
      });
      setSlugTouched(true);
    }).finally(() => setLoading(false));
  }, [id, editing, nav]);

  const setField = (k, v) => setForm((f) => {
    const next = { ...f, [k]: v };
    if (k === 'client' && !slugTouched && !editing) next.slug = slugify(v);
    if (k === 'productId') {
      const p = products.find((x) => x.id === v);
      if (p) next.product = p.name;
    }
    return next;
  });

  const submit = async (e, publishNow = null) => {
    e?.preventDefault?.();
    setError('');
    setBusy(true);
    try {
      const payload = {
        client: form.client.trim(),
        slug: form.slug.trim() || slugify(form.client),
        industry: form.industry.trim(),
        logo: form.logo.trim().slice(0, 4),
        product: form.product,
        productId: form.productId,
        accent: form.accent,
        summary: form.summary.trim(),
        challenge: form.challenge.trim(),
        solution: form.solution.trim(),
        outcomes: form.outcomes.map((o) => o.trim()).filter(Boolean),
        tech: form.tech.split(',').map((t) => t.trim()).filter(Boolean),
        stats: form.stats.filter((s) => s.label && s.value),
        gallery: form.gallery.filter(Boolean),
        published: publishNow !== null ? publishNow : form.published,
      };
      const { data } = editing
        ? await api.patch(`/api/case-studies/${id}`, payload)
        : await api.post('/api/case-studies', payload);
      setSaved(true);
      setTimeout(() => setSaved(false), 2400);
      if (!editing) nav(`/admin/case-studies/${data.id}/edit`, { replace: true });
      else setForm((f) => ({ ...f, published: data.published }));
    } catch (err) {
      setError(err.message || 'Save failed');
    } finally { setBusy(false); }
  };

  if (loading) return <div style={{ display: 'grid', placeItems: 'center', minHeight: '40vh' }}><div className="auth-spinner" /></div>;

  return (
    <div className="portal-page">
      <Reveal>
        <header className="portal-header portal-header--row">
          <div>
            <Link to="/admin/case-studies" className="mono" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-1)', fontSize: '0.82rem', marginBottom: '0.6rem' }}>
              <ArrowLeft size={12} /> All case studies
            </Link>
            <span className="eyebrow">// {editing ? 'Edit' : 'New'} Case Study</span>
            <h1>{editing ? 'Edit' : 'Add a'} <span className="gradient-text">case study</span></h1>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
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
          <div className="form-row">
            <div><label>Client Name</label><input value={form.client} onChange={(e) => setField('client', e.target.value)} placeholder="Sunrise International School" /></div>
            <div><label>Industry</label><input value={form.industry} onChange={(e) => setField('industry', e.target.value)} placeholder="K-12 Education" /></div>
          </div>
          <div className="form-row">
            <div><label>Slug</label><input value={form.slug} onChange={(e) => { setSlugTouched(true); setField('slug', e.target.value.toLowerCase()); }} placeholder="sunrise-international" /></div>
            <div><label>Logo Initials (max 4)</label><input value={form.logo} onChange={(e) => setField('logo', e.target.value.toUpperCase())} maxLength={4} placeholder="SI" /></div>
          </div>
          <div>
            <label>Linked Product</label>
            <select value={form.productId} onChange={(e) => setField('productId', e.target.value)}>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name} — {p.category}</option>)}
            </select>
          </div>
          <div><label>Summary</label><textarea rows={2} value={form.summary} onChange={(e) => setField('summary', e.target.value)} placeholder="One-line outcome statement that opens the case study." /></div>
          <div><label>The Challenge</label><textarea rows={5} value={form.challenge} onChange={(e) => setField('challenge', e.target.value)} placeholder="What problem was the client facing?" /></div>
          <div><label>The Solution</label><textarea rows={5} value={form.solution} onChange={(e) => setField('solution', e.target.value)} placeholder="What did NEXUS build / deploy / configure?" /></div>

          <div>
            <label>Outcomes</label>
            {form.outcomes.map((o, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input value={o} onChange={(e) => setField('outcomes', form.outcomes.map((x, j) => j === i ? e.target.value : x))} placeholder={`Outcome #${i + 1}`} />
                <button type="button" className="btn btn--ghost" onClick={() => setField('outcomes', form.outcomes.filter((_, j) => j !== i))}><X size={14} /></button>
              </div>
            ))}
            <button type="button" className="btn btn--ghost" onClick={() => setField('outcomes', [...form.outcomes, ''])}><Plus size={14} /> Add outcome</button>
          </div>

          <div>
            <label>Stats (label · value pairs)</label>
            {form.stats.map((s, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input value={s.label} onChange={(e) => setField('stats', form.stats.map((x, j) => j === i ? { ...x, label: e.target.value } : x))} placeholder="Students migrated" />
                <input value={s.value} onChange={(e) => setField('stats', form.stats.map((x, j) => j === i ? { ...x, value: e.target.value } : x))} placeholder="2,800" />
                <button type="button" className="btn btn--ghost" onClick={() => setField('stats', form.stats.filter((_, j) => j !== i))}><X size={14} /></button>
              </div>
            ))}
            <button type="button" className="btn btn--ghost" onClick={() => setField('stats', [...form.stats, { label: '', value: '' }])}><Plus size={14} /> Add stat</button>
          </div>
        </section>

        <aside className="editor-side glass">
          <h3>Visual settings</h3>
          <div>
            <label>Tech stack (comma separated)</label>
            <input value={form.tech} onChange={(e) => setField('tech', e.target.value)} placeholder="React, Node.js, PostgreSQL" />
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
            <label>Gallery accents (3)</label>
            <div className="editor-covers">
              {form.gallery.map((c, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                  <div className="editor-cover" style={{ background: `radial-gradient(circle at 30% 30%, ${c}, color-mix(in srgb, ${c} 30%, #04070f))` }} />
                  <select
                    value={c}
                    onChange={(e) => setField('gallery', form.gallery.map((x, j) => j === i ? e.target.value : x))}
                    style={{ padding: '0.25rem 0.4rem', fontSize: '0.7rem', width: 60 }}
                  >
                    {ACCENTS.map((a) => <option key={a} value={a}>{a.slice(1, 4)}</option>)}
                  </select>
                </div>
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
            <strong style={{ color: 'var(--accent)' }}>{form.logo || form.client.slice(0, 2).toUpperCase()}</strong>
            <h4>{form.client || 'Client name'}</h4>
            <p>{form.summary || 'Summary appears here.'}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
