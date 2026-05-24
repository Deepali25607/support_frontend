import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Eye, EyeOff, ArrowLeft, AlertCircle, Check, Hash } from 'lucide-react';
import { api } from '../../lib/api.js';
import Reveal from '../../components/Reveal.jsx';

const slugify = (s) => String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);

const COVERS = ['#00f0ff', '#b537ff', '#39ff14', '#ff2bd1', '#3a8dff', '#ffb627'];
const CATEGORIES = ['ERP Solutions', 'School software', 'Apartment management', 'E-commerce trends', 'Technology updates', 'SaaS business', 'Case Study', 'Opinion'];

export default function BlogEditor() {
  const { id } = useParams();
  const nav = useNavigate();
  const editing = Boolean(id);
  const [loading, setLoading] = useState(editing);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    title: '', slug: '', excerpt: '', body: '', category: CATEGORIES[0],
    tags: '', cover: COVERS[0], published: false,
  });
  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    if (!editing) return;
    api.get('/api/blog').then(({ data }) => {
      const post = data.find((p) => p.id === id);
      if (!post) { nav('/admin/blog'); return; }
      setForm({
        title: post.title, slug: post.slug, excerpt: post.excerpt || '', body: post.body,
        category: post.category, tags: (post.tags || []).join(', '), cover: post.cover, published: post.published,
      });
      setSlugTouched(true);
    }).finally(() => setLoading(false));
  }, [id, editing, nav]);

  const setField = (k, v) => {
    setForm((f) => {
      const next = { ...f, [k]: v };
      if (k === 'title' && !slugTouched && !editing) next.slug = slugify(v);
      return next;
    });
  };

  const submit = async (e, publishNow = null) => {
    e?.preventDefault?.();
    setError('');
    setBusy(true);
    try {
      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim() || slugify(form.title),
        excerpt: form.excerpt.trim(),
        body: form.body.trim(),
        category: form.category,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        cover: form.cover,
        published: publishNow !== null ? publishNow : form.published,
      };
      const { data } = editing
        ? await api.patch(`/api/blog/${id}`, payload)
        : await api.post('/api/blog', payload);
      setSaved(true);
      setTimeout(() => setSaved(false), 2400);
      if (!editing) nav(`/admin/blog/${data.id}/edit`, { replace: true });
      else setForm((f) => ({ ...f, published: data.published }));
    } catch (err) {
      setError(err.message || 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div style={{ display: 'grid', placeItems: 'center', minHeight: '40vh' }}><div className="auth-spinner" /></div>;

  const readingTime = Math.max(1, Math.round(form.body.split(/\s+/).filter(Boolean).length / 220));

  return (
    <div className="portal-page">
      <Reveal>
        <header className="portal-header portal-header--row">
          <div>
            <Link to="/admin/blog" className="mono" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-1)', fontSize: '0.82rem', marginBottom: '0.6rem' }}>
              <ArrowLeft size={12} /> All posts
            </Link>
            <span className="eyebrow">// {editing ? 'Edit Post' : 'New Post'}</span>
            <h1>{editing ? 'Edit' : 'Write a'} <span className="gradient-text">post</span></h1>
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
          <div><label>Title</label><input value={form.title} onChange={(e) => setField('title', e.target.value)} placeholder="A catchy headline…" /></div>
          <div>
            <label>Slug (URL)</label>
            <div className="auth-field"><Hash size={14} /><input value={form.slug} onChange={(e) => { setSlugTouched(true); setField('slug', e.target.value.toLowerCase()); }} placeholder="my-post-slug" /></div>
          </div>
          <div><label>Excerpt</label><textarea rows={2} value={form.excerpt} onChange={(e) => setField('excerpt', e.target.value)} placeholder="One sentence that makes a reader click." /></div>
          <div>
            <label>Body</label>
            <textarea
              rows={22}
              value={form.body}
              onChange={(e) => setField('body', e.target.value)}
              placeholder={`Write your post here.\n\nDouble line breaks make new paragraphs.\nLines starting with "1." become numbered lists.\nLines starting with "— " become bullet lists.`}
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.92rem', lineHeight: 1.6 }}
            />
          </div>
        </section>

        <aside className="editor-side glass">
          <h3>Post settings</h3>
          <div>
            <label>Category</label>
            <select value={form.category} onChange={(e) => setField('category', e.target.value)}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div><label>Tags (comma separated)</label><input value={form.tags} onChange={(e) => setField('tags', e.target.value)} placeholder="ERP, AI, Case Study" /></div>
          <div>
            <label>Cover accent</label>
            <div className="editor-covers">
              {COVERS.map((c) => (
                <button
                  type="button"
                  key={c}
                  className={`editor-cover ${form.cover === c ? 'is-on' : ''}`}
                  onClick={() => setField('cover', c)}
                  style={{ background: `radial-gradient(circle at 30% 30%, ${c}, color-mix(in srgb, ${c} 30%, #04070f))` }}
                  aria-label={`Use ${c} cover`}
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
          <div className="editor-preview" style={{ '--accent': form.cover }}>
            <span className="mono">PREVIEW</span>
            <div className="blog-card__cover" style={{ height: 80, borderRadius: 8 }} />
            <h4>{form.title || 'Your title here'}</h4>
            <p>{form.excerpt || 'Your excerpt will appear here.'}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
