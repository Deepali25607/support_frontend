import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Clock, ArrowUpRight, Bookmark } from 'lucide-react';
import { api } from '../lib/api.js';
import Reveal from '../components/Reveal.jsx';
import './Blog.css';

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('All');

  useEffect(() => {
    api.get('/api/blog').then(({ data }) => setPosts(data)).finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => ['All', ...Array.from(new Set(posts.map((p) => p.category)))], [posts]);
  const filtered = useMemo(() => posts.filter((p) => {
    const matchCat = cat === 'All' || p.category === cat;
    const matchQ = !q.trim() || [p.title, p.excerpt, p.body, p.category, ...(p.tags || [])].join(' ').toLowerCase().includes(q.toLowerCase());
    return matchCat && matchQ;
  }), [posts, q, cat]);

  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <section className="section">
      <div className="container">
        <Reveal>
          <div className="page-head">
            <span className="eyebrow">// Editorial</span>
            <h1>The <span className="gradient-text">NEXUS</span> journal</h1>
            <p className="page-head__lead">Field notes from building modern ERPs, SaaS platforms and custom software — case studies, opinion pieces and engineering deep-dives.</p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="filters glass">
            <div className="filters__search">
              <Search size={16} />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search posts, tags, technologies…" />
            </div>
            <div className="filters__chips" role="tablist">
              {categories.map((c) => (
                <button
                  key={c}
                  role="tab"
                  aria-selected={cat === c}
                  className={`chip ${cat === c ? 'is-on' : ''}`}
                  onClick={() => setCat(c)}
                >
                  {c}
                  {cat === c && <motion.span layoutId="blog-chip" className="chip__bg" transition={{ type: 'spring', stiffness: 340, damping: 30 }} />}
                </button>
              ))}
            </div>
          </div>
        </Reveal>

        {loading ? <p className="muted" style={{ marginTop: '2rem' }}>Loading posts…</p> : filtered.length === 0 ? (
          <div className="empty-block glass" style={{ padding: '3rem', marginTop: '2rem' }}>
            <Bookmark size={32} style={{ color: 'var(--neon-cyan)' }} />
            <h3>No posts match</h3>
            <p>Try a different keyword or category.</p>
          </div>
        ) : (
          <>
            {featured && (
              <Reveal delay={0.15}>
                <Link to={`/blog/${featured.slug}`} className="blog-featured glass" style={{ '--accent': featured.cover }}>
                  <div className="blog-featured__visual" aria-hidden="true">
                    <span className="blog-featured__glyph">{featured.category[0]}</span>
                    <span className="blog-featured__grid" />
                  </div>
                  <div className="blog-featured__body">
                    <span className="mono blog-featured__cat">{featured.category}</span>
                    <h2>{featured.title}</h2>
                    <p>{featured.excerpt}</p>
                    <footer>
                      <span className="mono">{featured.authorName} · {new Date(featured.publishedAt || featured.createdAt).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <span className="mono"><Clock size={12} /> {featured.readingTime} min read</span>
                      <span className="blog-featured__cta">Read article <ArrowUpRight size={14} /></span>
                    </footer>
                  </div>
                </Link>
              </Reveal>
            )}

            <div className="blog-grid">
              <AnimatePresence mode="popLayout">
                {rest.map((p, i) => (
                  <motion.div
                    key={p.id}
                    layout
                    initial={{ opacity: 0, y: 14, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                  >
                    <Link to={`/blog/${p.slug}`} className="blog-card glass" style={{ '--accent': p.cover }}>
                      <span className="blog-card__cover" aria-hidden="true" />
                      <div className="blog-card__body">
                        <span className="mono blog-card__cat">{p.category}</span>
                        <h3>{p.title}</h3>
                        <p>{p.excerpt}</p>
                        <footer>
                          <span className="mono">{new Date(p.publishedAt || p.createdAt).toLocaleDateString('en', { day: 'numeric', month: 'short' })}</span>
                          <span className="mono"><Clock size={11} /> {p.readingTime} min</span>
                        </footer>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
