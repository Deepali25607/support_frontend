import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import HolographicCard from '../components/HolographicCard.jsx';
import Reveal from '../components/Reveal.jsx';
import { useProducts } from '../context/ProductsContext.jsx';
import './Products.css';

export default function Products() {
  const { products, categories } = useProducts();
  const [cat, setCat] = useState('All');
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesCat = cat === 'All' || p.category === cat;
      const matchesQ =
        !q.trim() ||
        [p.name, p.tagline, p.description, p.category].join(' ').toLowerCase().includes(q.toLowerCase());
      return matchesCat && matchesQ;
    });
  }, [products, cat, q]);

  return (
    <section className="section">
      <div className="container">
        <Reveal>
          <div className="page-head">
            <span className="eyebrow">// Product Catalog</span>
            <h1>The <span className="gradient-text">complete suite</span></h1>
            <p className="page-head__lead">Eight production-grade products — and one engineering pod that can build anything else you need.</p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="filters glass">
            <div className="filters__search">
              <Search size={16} />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search products, features, technologies…"
                aria-label="Search products"
              />
            </div>
            <div className="filters__chips" role="tablist" aria-label="Categories">
              {categories.map((c) => (
                <button
                  key={c}
                  role="tab"
                  aria-selected={cat === c}
                  className={`chip ${cat === c ? 'is-on' : ''}`}
                  onClick={() => setCat(c)}
                >
                  {c}
                  {cat === c && (
                    <motion.span
                      layoutId="chip-bg"
                      className="chip__bg"
                      transition={{ type: 'spring', stiffness: 360, damping: 32 }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </Reveal>

        <div className="cards-grid" style={{ marginTop: '2rem' }}>
          <AnimatePresence mode="popLayout">
            {filtered.map((p, i) => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, scale: 0.95, y: 14 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: i * 0.04 }}
              >
                <HolographicCard product={p} index={0} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filtered.length === 0 && (
          <Reveal>
            <div className="empty glass">
              <h3>No matches</h3>
              <p>Try a different keyword or pick another category — or <a href="/custom">request something custom</a>.</p>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
