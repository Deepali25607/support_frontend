import { useEffect, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, ArrowLeft, ArrowRight, Share2, Bookmark } from 'lucide-react';
import { api } from '../lib/api.js';
import Reveal from '../components/Reveal.jsx';
import './Blog.css';

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/api/blog/${slug}`)
      .then(({ data }) => setPost(data))
      .catch((err) => { if (err.status === 404) setNotFound(true); })
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!post) return;
    api.get('/api/blog')
      .then(({ data }) => setRelated(data.filter((p) => p.id !== post.id && p.category === post.category).slice(0, 3)));
  }, [post]);

  if (notFound) return <Navigate to="/blog" replace />;
  if (loading || !post) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: '50vh' }}>
        <div className="auth-spinner" />
      </div>
    );
  }

  const paragraphs = post.body.split(/\n{2,}/);

  return (
    <article className="bp">
      <header className="bp__hero" style={{ '--accent': post.cover }}>
        <div className="bp__hero-bg" aria-hidden="true">
          <div className="bp__hero-orb" />
          <div className="bp__hero-grid" />
        </div>
        <div className="container bp__hero-inner">
          <Reveal>
            <Link to="/blog" className="bp__back"><ArrowLeft size={14} /> Back to journal</Link>
            <span className="mono bp__cat">{post.category}</span>
            <h1 className="bp__title">{post.title}</h1>
            <p className="bp__lead">{post.excerpt}</p>
            <div className="bp__meta">
              <div className="bp__author">
                <span className="bp__author-avatar">{post.authorName.split(' ').map((n) => n[0]).join('').slice(0, 2)}</span>
                <div>
                  <strong>{post.authorName}</strong>
                  <span className="mono">{new Date(post.publishedAt || post.createdAt).toLocaleDateString('en', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
              </div>
              <span className="mono bp__reading"><Clock size={14} /> {post.readingTime} min read</span>
              <button
                className="btn btn--ghost"
                onClick={() => navigator.share ? navigator.share({ title: post.title, url: window.location.href }) : navigator.clipboard?.writeText(window.location.href)}
              >
                <Share2 size={14} /> Share
              </button>
            </div>
          </Reveal>
        </div>
      </header>

      <div className="container bp__body-wrap">
        <Reveal>
          <div className="bp__body">
            {paragraphs.map((para, i) => {
              if (/^\d\.\s/.test(para.split('\n')[0]) || /^—\s/.test(para.split('\n')[0])) {
                const items = para.split('\n').filter(Boolean);
                const ordered = /^\d\./.test(items[0]);
                const ListTag = ordered ? 'ol' : 'ul';
                return (
                  <ListTag key={i} className="bp__list">
                    {items.map((it, j) => <li key={j}>{it.replace(/^(\d\.\s|—\s)/, '')}</li>)}
                  </ListTag>
                );
              }
              return <p key={i}>{para}</p>;
            })}
          </div>
        </Reveal>

        {post.tags?.length > 0 && (
          <Reveal delay={0.1}>
            <div className="bp__tags">
              {post.tags.map((t) => <span key={t} className="pill">{t}</span>)}
            </div>
          </Reveal>
        )}

        <Reveal delay={0.15}>
          <aside className="bp__cta glass">
            <div>
              <span className="eyebrow">// Liked this?</span>
              <h3>Subscribe to the journal.</h3>
              <p>One thoughtful post per week — case studies, engineering deep-dives, no spam.</p>
            </div>
            <NewsletterInline />
          </aside>
        </Reveal>

        {related.length > 0 && (
          <Reveal>
            <section className="bp__related">
              <h3>Related reads</h3>
              <div className="bp__related-grid">
                {related.map((r) => (
                  <Link to={`/blog/${r.slug}`} key={r.id} className="bp__related-card glass" style={{ '--accent': r.cover }}>
                    <span className="bp__related-cover" />
                    <div>
                      <span className="mono">{r.category}</span>
                      <h4>{r.title}</h4>
                      <span className="bp__related-cta">Read <ArrowRight size={12} /></span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </Reveal>
        )}
      </div>
    </article>
  );
}

function NewsletterInline() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState('idle');
  const submit = async (e) => {
    e.preventDefault();
    setState('busy');
    try {
      await api.post('/api/newsletter/subscribe', { email, source: 'blog-post' });
      setState('done');
      setEmail('');
    } catch {
      setState('error');
    }
  };
  return (
    <form onSubmit={submit} className="bp__cta-form">
      <input type="email" required placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
      <button className="btn btn--primary" type="submit" disabled={state === 'busy'}>
        {state === 'done' ? <><Bookmark size={14} /> Subscribed</> : state === 'busy' ? 'Subscribing…' : 'Subscribe'}
      </button>
    </form>
  );
}
