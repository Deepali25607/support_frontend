import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Save, Trash2, X, Plus, ArrowLeft, ExternalLink, Star, AlertCircle, Play, Eye, EyeOff } from 'lucide-react';
import { api } from '../../lib/api.js';
import { useProducts } from '../../context/ProductsContext.jsx';
import Reveal from '../../components/Reveal.jsx';
import './AdminProducts.css';

const BLANK = {
  id: '',
  name: '',
  tagline: '',
  category: 'ERP Solutions',
  description: '',
  accent: '#00f0ff',
  glyph: '01',
  order: 99,
  published: true,
  demoUrl: '',
  highlights: [],
  tech: [],
  plans: [{ name: 'Starter', price: 999, period: 'mo', users: '1 user', featured: false }],
};

const ACCENTS = ['#00f0ff', '#b537ff', '#39ff14', '#ff2bd1', '#3a8dff', '#ffb627'];
const PRESET_CATEGORIES = ['ERP Solutions', 'E-commerce Solutions', 'CRM Software', 'POS & Billing Systems', 'Custom Software Solutions', 'Healthcare', 'Education'];

const slugify = (s) => (s || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);

export default function ProductEditor() {
  const { id } = useParams();
  const nav = useNavigate();
  const { refresh: refreshContext } = useProducts();
  const isNew = !id;

  const [draft, setDraft] = useState(BLANK);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [slugTouched, setSlugTouched] = useState(!isNew);

  useEffect(() => {
    if (isNew) return;
    api.get(`/api/products/admin/list`).then(({ data }) => {
      const found = data.find((p) => p.id === id);
      if (found) setDraft({ ...BLANK, ...found });
      else setError('Product not found');
    }).finally(() => setLoading(false));
  }, [id, isNew]);

  // Auto-derive slug from name while creating, until user edits it manually
  useEffect(() => {
    if (!isNew || slugTouched) return;
    setDraft((d) => ({ ...d, id: slugify(d.name) }));
  }, [draft.name, isNew, slugTouched]);

  const set = (key, value) => setDraft((d) => ({ ...d, [key]: value }));
  const setPlan = (i, patch) => setDraft((d) => ({ ...d, plans: d.plans.map((p, j) => j === i ? { ...p, ...patch } : p) }));
  const addPlan = () => setDraft((d) => ({ ...d, plans: [...d.plans, { name: 'New plan', price: 0, period: 'mo', users: '', featured: false }] }));
  const removePlan = (i) => setDraft((d) => ({ ...d, plans: d.plans.filter((_, j) => j !== i) }));

  const demoUrlValid = useMemo(() => {
    if (!draft.demoUrl) return true;
    try { new URL(draft.demoUrl); return true; } catch { return false; }
  }, [draft.demoUrl]);

  const save = async () => {
    setError('');
    if (!draft.name?.trim()) return setError('Name is required');
    if (!draft.tagline?.trim()) return setError('Tagline is required');
    if (!draft.category?.trim()) return setError('Category is required');
    if (!draft.description?.trim()) return setError('Description is required');
    if (!demoUrlValid) return setError('Demo URL must be a valid http(s) URL or empty');
    setSaving(true);
    try {
      const payload = {
        ...draft,
        price: undefined,
        plans: draft.plans.map((p) => ({
          name: p.name,
          price: typeof p.price === 'string' && /^\d+(?:\.\d+)?$/.test(p.price) ? Number(p.price) : p.price,
          period: p.period || '',
          users: p.users || '',
          featured: !!p.featured,
        })),
        order: Number(draft.order) || 99,
      };
      if (isNew) {
        const { data } = await api.post('/api/products', payload);
        refreshContext();
        nav(`/admin/products/${data.id}/edit`, { replace: true });
      } else {
        const { data } = await api.patch(`/api/products/${id}`, payload);
        setDraft({ ...BLANK, ...data });
        refreshContext();
      }
    } catch (err) {
      setError(err.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const remove = async () => {
    if (!confirm(`Delete "${draft.name}"? This cannot be undone.`)) return;
    await api.delete(`/api/products/${id}`);
    refreshContext();
    nav('/admin/products');
  };

  if (loading) return <div style={{ display: 'grid', placeItems: 'center', minHeight: '40vh' }}><div className="auth-spinner" /></div>;
  if (error && !draft.name && !isNew) {
    return <div className="empty glass"><h3>{error}</h3><Link to="/admin/products" className="btn btn--ghost">Back to products</Link></div>;
  }

  return (
    <div className="portal-page">
      <Reveal>
        <header className="portal-header portal-header--row">
          <div>
            <Link to="/admin/products" className="prod-back"><ArrowLeft size={14} /> All products</Link>
            <h1 style={{ marginTop: '0.4rem' }}>{isNew ? 'Create' : 'Edit'} <span className="gradient-text">{draft.name || 'product'}</span></h1>
            <p>{isNew ? 'Add a new product to your catalog.' : 'Update product details, plans and demo link.'}</p>
          </div>
          <div className="theme-actions">
            {!isNew && (
              <button className="btn btn--ghost prod-card__danger" onClick={remove}><Trash2 size={13} /> Delete</button>
            )}
            <button className="btn btn--primary" onClick={save} disabled={saving}>
              {saving ? 'Saving…' : <><Save size={14} /> {isNew ? 'Create product' : 'Save changes'}</>}
            </button>
          </div>
        </header>
      </Reveal>

      {error && (
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="auth-error" style={{ marginBottom: '0.8rem' }}>
          <AlertCircle size={14} /> {error}
        </motion.div>
      )}

      <div className="editor-grid">
        <div className="editor-main">
          <section className="theme-block glass">
            <header><h3>Basics</h3></header>
            <div className="form-row">
              <div>
                <label>Product name</label>
                <input value={draft.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. NovaScholar ERP" />
              </div>
              <div>
                <label>Slug / ID <span className="muted">(used in URLs)</span></label>
                <input
                  value={draft.id}
                  onChange={(e) => { setSlugTouched(true); set('id', slugify(e.target.value)); }}
                  placeholder="novascholar-erp"
                  disabled={!isNew}
                />
              </div>
            </div>
            <div>
              <label>Tagline</label>
              <input value={draft.tagline} onChange={(e) => set('tagline', e.target.value)} placeholder="A short one-line pitch" />
            </div>
            <div className="form-row">
              <div>
                <label>Category</label>
                <input value={draft.category} onChange={(e) => set('category', e.target.value)} list="cat-options" />
                <datalist id="cat-options">
                  {PRESET_CATEGORIES.map((c) => <option key={c} value={c} />)}
                </datalist>
              </div>
              <div>
                <label>Display order</label>
                <input type="number" min="0" value={draft.order} onChange={(e) => set('order', e.target.value)} />
              </div>
            </div>
            <div>
              <label>Description</label>
              <textarea rows={5} value={draft.description} onChange={(e) => set('description', e.target.value)} placeholder="A 2–3 sentence overview that appears on the product page." />
            </div>
          </section>

          <section className="theme-block glass">
            <header><Play size={14} /> <h3>Online demo</h3></header>
            <p className="muted theme-block__lead">Paste the link to a live demo of this product. Visitors will see a prominent "Take Online Demo" button on the product page that opens this URL in a new tab.</p>
            <div>
              <label>Demo URL</label>
              <input
                type="url"
                value={draft.demoUrl}
                onChange={(e) => set('demoUrl', e.target.value.trim())}
                placeholder="https://demo.example.com"
                className={!demoUrlValid ? 'is-error' : ''}
              />
              {!demoUrlValid && <span className="field-error">Must be a valid http(s) URL.</span>}
              {draft.demoUrl && demoUrlValid && (
                <a href={draft.demoUrl} target="_blank" rel="noreferrer" className="muted" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.4rem', fontSize: '0.8rem' }}>
                  Open demo <ExternalLink size={11} />
                </a>
              )}
            </div>
          </section>

          <section className="theme-block glass">
            <header><h3>Highlights</h3></header>
            <p className="muted theme-block__lead">Bullet points that appear in the System / Status panel and the Features tab.</p>
            <StringList value={draft.highlights} onChange={(v) => set('highlights', v)} placeholder="e.g. Real-time attendance via biometric & RFID" />
          </section>

          <section className="theme-block glass">
            <header><h3>Tech stack</h3></header>
            <StringList value={draft.tech} onChange={(v) => set('tech', v)} placeholder="e.g. React, Node.js" />
          </section>

          <section className="theme-block glass">
            <header><h3>Plans</h3></header>
            <p className="muted theme-block__lead">These appear on the product page and on the Pricing page. Use a number for price (e.g. 4999) or text for custom plans (e.g. "Custom").</p>
            <div className="plan-list">
              {draft.plans.map((p, i) => (
                <div key={i} className="plan-row">
                  <div className="form-row">
                    <div>
                      <label>Plan name</label>
                      <input value={p.name} onChange={(e) => setPlan(i, { name: e.target.value })} />
                    </div>
                    <div>
                      <label>Price <span className="muted">(number or text)</span></label>
                      <input value={p.price} onChange={(e) => setPlan(i, { price: e.target.value })} />
                    </div>
                  </div>
                  <div className="form-row">
                    <div>
                      <label>Period</label>
                      <input value={p.period} onChange={(e) => setPlan(i, { period: e.target.value })} placeholder="mo, yr, user/mo" />
                    </div>
                    <div>
                      <label>Users / scope</label>
                      <input value={p.users} onChange={(e) => setPlan(i, { users: e.target.value })} placeholder="Up to 500 students" />
                    </div>
                  </div>
                  <div className="plan-row__foot">
                    <label className="plan-featured">
                      <input type="checkbox" checked={!!p.featured} onChange={(e) => setPlan(i, { featured: e.target.checked })} />
                      <Star size={12} /> Featured plan
                    </label>
                    <button type="button" className="btn btn--ghost prod-card__danger" onClick={() => removePlan(i)}>
                      <X size={12} /> Remove
                    </button>
                  </div>
                </div>
              ))}
              <button type="button" className="btn btn--ghost" onClick={addPlan}>
                <Plus size={14} /> Add a plan
              </button>
            </div>
          </section>
        </div>

        <aside className="editor-side">
          <div className="theme-block glass" style={{ position: 'sticky', top: 96 }}>
            <header><h3>Display</h3></header>
            <div>
              <label>Status</label>
              <button type="button" className="btn btn--ghost" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => set('published', !draft.published)}>
                {draft.published ? <><Eye size={13} /> Published</> : <><EyeOff size={13} /> Draft</>}
              </button>
            </div>
            <div>
              <label>Glyph <span className="muted">(2 chars)</span></label>
              <input maxLength={4} value={draft.glyph} onChange={(e) => set('glyph', e.target.value)} placeholder="01" />
            </div>
            <div>
              <label>Accent color</label>
              <div className="editor-covers">
                {ACCENTS.map((c) => (
                  <button
                    type="button"
                    key={c}
                    className={`editor-cover ${draft.accent === c ? 'is-on' : ''}`}
                    onClick={() => set('accent', c)}
                    style={{ background: `radial-gradient(circle at 30% 30%, ${c}, color-mix(in srgb, ${c} 30%, #04070f))` }}
                  />
                ))}
              </div>
              <input value={draft.accent} onChange={(e) => set('accent', e.target.value)} placeholder="#00f0ff" style={{ marginTop: '0.4rem' }} />
            </div>
            <div className="prod-preview" style={{ '--accent': draft.accent }}>
              <span className="prod-preview__glyph mono" style={{ background: `linear-gradient(135deg, ${draft.accent}, color-mix(in srgb, ${draft.accent} 30%, #04070f))` }}>{draft.glyph}</span>
              <strong>{draft.name || 'Product name'}</strong>
              <span>{draft.tagline || 'Product tagline'}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
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
        <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={placeholder} onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            if (draft.trim()) { onChange([...value, draft.trim()]); setDraft(''); }
          }
        }} />
        <button type="button" className="btn btn--ghost" onClick={() => { if (draft.trim()) { onChange([...value, draft.trim()]); setDraft(''); } }}>
          <Plus size={14} /> Add
        </button>
      </div>
    </div>
  );
}
