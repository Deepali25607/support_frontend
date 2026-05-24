import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, BookOpen, ArrowRight, Clock } from 'lucide-react';
import { api } from '../lib/api.js';
import Reveal from '../components/Reveal.jsx';
import './Docs.css';

export default function Docs() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [product, setProduct] = useState('All');

  useEffect(() => {
    api.get('/api/docs').then(({ data }) => setDocs(data)).finally(() => setLoading(false));
  }, []);

  const products = useMemo(() => {
    const map = new Map();
    docs.forEach((d) => map.set(d.product, d.productLabel));
    return ['All', ...Array.from(map.entries()).map(([id, label]) => ({ id, label }))];
  }, [docs]);

  const filtered = useMemo(() => docs.filter((d) => {
    const matchProduct = product === 'All' || d.product === product;
    const matchQ = !q.trim() || [d.title, d.section, d.body, d.productLabel].join(' ').toLowerCase().includes(q.toLowerCase());
    return matchProduct && matchQ;
  }), [docs, q, product]);

  const grouped = useMemo(() => {
    const byProduct = {};
    for (const d of filtered) {
      if (!byProduct[d.product]) byProduct[d.product] = { label: d.productLabel, accent: d.accent, sections: {} };
      if (!byProduct[d.product].sections[d.section]) byProduct[d.product].sections[d.section] = [];
      byProduct[d.product].sections[d.section].push(d);
    }
    return byProduct;
  }, [filtered]);

  return (
    <section className="section">
      <div className="container">
        <Reveal>
          <div className="page-head">
            <span className="eyebrow">// Knowledge Base</span>
            <h1>Docs & <span className="gradient-text">guides</span></h1>
            <p className="page-head__lead">Everything you need to set up, run and master NEXUS products — quick starts, module deep-dives, billing, and support.</p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="filters glass">
            <div className="filters__search">
              <Search size={16} />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search docs, modules, how-to…" />
            </div>
            <div className="filters__chips" role="tablist">
              {products.map((p) => {
                const id = typeof p === 'string' ? p : p.id;
                const label = typeof p === 'string' ? p : p.label;
                return (
                  <button
                    key={id}
                    className={`chip ${product === id ? 'is-on' : ''}`}
                    onClick={() => setProduct(id)}
                  >
                    {label}
                    {product === id && <motion.span layoutId="docs-chip" className="chip__bg" transition={{ type: 'spring', stiffness: 340, damping: 30 }} />}
                  </button>
                );
              })}
            </div>
          </div>
        </Reveal>

        {loading ? <p className="muted" style={{ marginTop: '2rem' }}>Loading…</p> : Object.keys(grouped).length === 0 ? (
          <div className="empty-block glass" style={{ padding: '3rem', marginTop: '2rem' }}>
            <BookOpen size={32} style={{ color: 'var(--neon-cyan)' }} />
            <h3>No articles match</h3>
          </div>
        ) : (
          <div className="docs-list">
            <AnimatePresence mode="popLayout">
              {Object.entries(grouped).map(([productId, group], gi) => (
                <motion.section
                  key={productId}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: gi * 0.05 }}
                  className="docs-product glass"
                  style={{ '--accent': group.accent }}
                >
                  <header>
                    <span className="docs-product__glyph">{group.label.slice(0, 2).toUpperCase()}</span>
                    <div>
                      <h2>{group.label}</h2>
                      <span className="mono">{Object.values(group.sections).flat().length} articles · {Object.keys(group.sections).length} sections</span>
                    </div>
                  </header>
                  <div className="docs-product__sections">
                    {Object.entries(group.sections).map(([section, articles]) => (
                      <div key={section} className="docs-section">
                        <h3>{section}</h3>
                        <ul>
                          {articles.map((a) => (
                            <li key={a.id}>
                              <Link to={`/docs/${a.slug}`}>
                                <strong>{a.title}</strong>
                                <span className="mono"><Clock size={11} /> {a.readingTime} min</span>
                                <ArrowRight size={14} className="docs-section__arrow" />
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </motion.section>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  );
}
