import { useEffect, useState } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Sparkles, Target, Wrench, TrendingUp } from 'lucide-react';
import { api } from '../lib/api.js';
import Reveal from '../components/Reveal.jsx';
import './Portfolio.css';

export default function CaseStudy() {
  const { slug } = useParams();
  const [cs, setCs] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/api/case-studies/${slug}`)
      .then(({ data }) => setCs(data))
      .catch((err) => { if (err.status === 404) setNotFound(true); })
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!cs) return;
    api.get('/api/case-studies').then(({ data }) => {
      setRelated(data.filter((c) => c.id !== cs.id).slice(0, 3));
    });
  }, [cs]);

  if (notFound) return <Navigate to="/portfolio" replace />;
  if (loading || !cs) return <div style={{ display: 'grid', placeItems: 'center', minHeight: '50vh' }}><div className="auth-spinner" /></div>;

  return (
    <article className="cs">
      <header className="cs__hero" style={{ '--accent': cs.accent }}>
        <div className="cs__hero-bg" aria-hidden="true">
          <div className="cs__hero-orb" />
          <div className="cs__hero-grid" />
        </div>
        <div className="container cs__hero-inner">
          <Reveal>
            <Link to="/portfolio" className="bp__back"><ArrowLeft size={14} /> Back to portfolio</Link>
            <div className="cs__hero-head">
              <span className="cs__hero-logo">{cs.logo || cs.client.split(' ').map((w) => w[0]).join('').slice(0, 2)}</span>
              <div>
                <span className="mono cs__hero-industry">{cs.industry}</span>
                <h1>{cs.client}</h1>
              </div>
            </div>
            <p className="cs__hero-summary">{cs.summary}</p>
            <div className="cs__hero-meta">
              <Link to={`/products/${cs.productId}`} className="btn btn--ghost">
                Powered by {cs.product} <ArrowRight size={14} />
              </Link>
              <Link to="/demo" className="btn btn--primary">
                Get the same outcome <ArrowRight size={14} />
              </Link>
            </div>
          </Reveal>
        </div>
      </header>

      <div className="container cs__body-wrap">
        {cs.stats?.length > 0 && (
          <Reveal>
            <div className="cs__stats glass">
              {cs.stats.map((st, i) => (
                <motion.div
                  key={st.label}
                  className="cs__stat"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <strong>{st.value}</strong>
                  <span>{st.label}</span>
                </motion.div>
              ))}
            </div>
          </Reveal>
        )}

        <div className="cs__sections">
          {[
            { icon: Target, title: 'The Challenge', body: cs.challenge },
            { icon: Wrench, title: 'The Solution', body: cs.solution },
          ].map((sec, i) => (
            <Reveal key={sec.title} delay={i * 0.08}>
              <section className="cs__section glass">
                <span className="cs__section-icon"><sec.icon size={18} /></span>
                <h2>{sec.title}</h2>
                <p>{sec.body}</p>
              </section>
            </Reveal>
          ))}

          {cs.outcomes?.length > 0 && (
            <Reveal>
              <section className="cs__section cs__section--outcomes glass">
                <span className="cs__section-icon"><TrendingUp size={18} /></span>
                <h2>The Outcomes</h2>
                <ul>
                  {cs.outcomes.map((o, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.06 }}
                    >
                      <Sparkles size={14} /> {o}
                    </motion.li>
                  ))}
                </ul>
              </section>
            </Reveal>
          )}

          {cs.tech?.length > 0 && (
            <Reveal>
              <section className="cs__section glass">
                <h2>Technology stack</h2>
                <div className="cs__tech">
                  {cs.tech.map((t) => <span key={t} className="pill">{t}</span>)}
                </div>
              </section>
            </Reveal>
          )}
        </div>

        {related.length > 0 && (
          <Reveal>
            <section className="bp__related">
              <h3>More case studies</h3>
              <div className="bp__related-grid">
                {related.map((r) => (
                  <Link to={`/portfolio/${r.slug}`} key={r.id} className="bp__related-card glass" style={{ '--accent': r.accent }}>
                    <span className="bp__related-cover" />
                    <div>
                      <span className="mono">{r.industry}</span>
                      <h4>{r.client}</h4>
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
