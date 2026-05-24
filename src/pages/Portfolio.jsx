import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, Search, Briefcase } from 'lucide-react';
import { api } from '../lib/api.js';
import Reveal from '../components/Reveal.jsx';
import './Portfolio.css';

export default function Portfolio() {
  const [studies, setStudies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [ind, setInd] = useState('All');

  useEffect(() => {
    api.get('/api/case-studies').then(({ data }) => setStudies(data)).finally(() => setLoading(false));
  }, []);

  const industries = useMemo(() => ['All', ...Array.from(new Set(studies.map((s) => s.industry)))], [studies]);
  const filtered = useMemo(() => studies.filter((s) => {
    const matchInd = ind === 'All' || s.industry === ind;
    const matchQ = !q.trim() || [s.client, s.industry, s.product, s.summary, ...(s.tech || [])].join(' ').toLowerCase().includes(q.toLowerCase());
    return matchInd && matchQ;
  }), [studies, q, ind]);

  return (
    <section className="section">
      <div className="container">
        <Reveal>
          <div className="page-head">
            <span className="eyebrow">// Portfolio</span>
            <h1>Real outcomes for <span className="gradient-text">real operators</span></h1>
            <p className="page-head__lead">Case studies from schools, hospitals, retailers and residential communities running on NEXUS — what we built, what changed, and the numbers behind it.</p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="filters glass">
            <div className="filters__search">
              <Search size={16} />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by client, industry, tech…" />
            </div>
            <div className="filters__chips" role="tablist">
              {industries.map((c) => (
                <button
                  key={c}
                  className={`chip ${ind === c ? 'is-on' : ''}`}
                  onClick={() => setInd(c)}
                >
                  {c}
                  {ind === c && <motion.span layoutId="port-chip" className="chip__bg" transition={{ type: 'spring', stiffness: 340, damping: 30 }} />}
                </button>
              ))}
            </div>
          </div>
        </Reveal>

        {loading ? <p className="muted" style={{ marginTop: '2rem' }}>Loading…</p> : filtered.length === 0 ? (
          <div className="empty-block glass" style={{ padding: '3rem', marginTop: '2rem' }}>
            <Briefcase size={32} style={{ color: 'var(--neon-cyan)' }} />
            <h3>No case studies match</h3>
          </div>
        ) : (
          <div className="port-grid">
            <AnimatePresence mode="popLayout">
              {filtered.map((s, i) => (
                <motion.div
                  key={s.id}
                  layout
                  initial={{ opacity: 0, y: 14, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.4, delay: i * 0.04 }}
                >
                  <Link to={`/portfolio/${s.slug}`} className="port-card glass" style={{ '--accent': s.accent }}>
                    <header className="port-card__head">
                      <span className="port-card__logo">{s.logo || s.client.split(' ').map((w) => w[0]).join('').slice(0, 2)}</span>
                      <div>
                        <strong>{s.client}</strong>
                        <span className="mono">{s.industry}</span>
                      </div>
                    </header>
                    <div className="port-card__visual" aria-hidden="true">
                      {(s.gallery || []).slice(0, 3).map((c, j) => (
                        <span key={j} style={{ background: `radial-gradient(circle at 30% 30%, ${c}, color-mix(in srgb, ${c} 20%, #04070f))` }} />
                      ))}
                      <span className="port-card__grid" />
                    </div>
                    <div className="port-card__body">
                      <span className="mono port-card__product">{s.product}</span>
                      <p>{s.summary}</p>
                      <div className="port-card__stats">
                        {(s.stats || []).slice(0, 4).map((st) => (
                          <div key={st.label}>
                            <strong>{st.value}</strong>
                            <span>{st.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <footer className="port-card__foot">
                      <span>Read case study</span>
                      <ArrowUpRight size={14} />
                    </footer>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  );
}
