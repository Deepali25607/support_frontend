import { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight, Sparkles, ChevronDown, Cpu, Shield, Layers, Workflow, Play, ExternalLink } from 'lucide-react';
import Reveal from '../components/Reveal.jsx';
import { faqs as fallbackFaqs } from '../data/products.js';
import { useProducts } from '../context/ProductsContext.jsx';
import { useSiteContent } from '../context/SiteContentContext.jsx';
import './ProductDetail.css';

const tabs = [
  { id: 'features', label: 'Features', icon: Sparkles },
  { id: 'tech', label: 'Tech Stack', icon: Cpu },
  { id: 'workflow', label: 'Workflow', icon: Workflow },
  { id: 'security', label: 'Security', icon: Shield },
];

const workflowSteps = [
  { title: 'Discovery', desc: 'We map your processes and tailor the product config to your operations.' },
  { title: 'Setup', desc: 'White-glove onboarding — data migration, user accounts, integrations.' },
  { title: 'Training', desc: 'Live training sessions for admins and end-users, plus on-demand library.' },
  { title: 'Go Live', desc: 'Soft launch with parallel-run support, then full cutover and 30-day hyper-care.' },
];

export default function ProductDetail() {
  const { id } = useParams();
  const { products, loading } = useProducts();
  const product = products.find((p) => p.id === id);
  const [tab, setTab] = useState('features');
  const { content } = useSiteContent();
  const faqs = content.faqs?.length ? content.faqs : fallbackFaqs;

  if (loading && !product) {
    return <div style={{ display: 'grid', placeItems: 'center', minHeight: '50vh' }}><div className="auth-spinner" /></div>;
  }
  if (!product) return <Navigate to="/products" replace />;

  return (
    <>
      {/* HERO */}
      <section className="pd-hero" style={{ '--accent': product.accent }}>
        <div className="pd-hero__bg" aria-hidden="true">
          <div className="pd-hero__orb" />
          <div className="pd-hero__grid" />
        </div>
        <div className="container pd-hero__inner">
          <div>
            <Reveal>
              <span className="eyebrow">// {product.category}</span>
              <div className="pd-hero__title">
                <span className="pd-hero__glyph mono">{product.glyph}</span>
                <h1>{product.name}</h1>
              </div>
              <p className="pd-hero__tag">{product.tagline}</p>
              <p className="pd-hero__desc">{product.description}</p>
              <div className="pd-hero__cta">
                {product.demoUrl ? (
                  <a href={product.demoUrl} target="_blank" rel="noreferrer" className="btn btn--primary btn--lg pd-hero__demo">
                    <Play size={16} /> <span>Take Online Demo</span> <ExternalLink size={14} />
                  </a>
                ) : (
                  <Link to="/demo" className="btn btn--primary btn--lg">Book Live Demo <ArrowRight size={18} /></Link>
                )}
                {product.demoUrl && (
                  <Link to="/demo" className="btn btn--ghost btn--lg">Book Guided Demo</Link>
                )}
                <Link to="/contact" className="btn btn--ghost btn--lg">Talk to Sales</Link>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.15}>
            <div className="pd-hero__panel glass">
              <div className="pd-hero__panel-head">
                <span className="mono">SYSTEM // STATUS</span>
                <span className="pd-hero__panel-pulse" />
              </div>
              <ul className="pd-hero__features">
                {product.highlights.map((h, i) => (
                  <motion.li
                    key={h}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.08 }}
                  >
                    <Check size={14} /> {h}
                  </motion.li>
                ))}
              </ul>
              <div className="pd-hero__panel-foot">
                <span className="mono">UPTIME 99.98%</span>
                <span className="mono">v2026.5.1</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* TABS */}
      <section className="section pd-tabs-section">
        <div className="container">
          <div className="pd-tabs" role="tablist">
            {tabs.map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={`pd-tab ${tab === t.id ? 'is-on' : ''}`}
              >
                <t.icon size={16} />
                <span>{t.label}</span>
                {tab === t.id && (
                  <motion.span
                    layoutId="pd-tab-bg"
                    className="pd-tab__bg"
                    transition={{ type: 'spring', stiffness: 340, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(6px)' }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="pd-tab__panel"
            >
              {tab === 'features' && (
                <div className="pd-feature-grid">
                  {product.highlights.map((h, i) => (
                    <div key={h} className="pd-feature glass">
                      <span className="pd-feature__num mono">{String(i + 1).padStart(2, '0')}</span>
                      <h3>{h}</h3>
                      <p>Designed end-to-end inside {product.name} — no plugins, no patchwork. Configurable from the admin panel.</p>
                    </div>
                  ))}
                </div>
              )}

              {tab === 'tech' && (
                <div className="pd-tech glass">
                  <h3>Built on a modern, battle-tested stack</h3>
                  <p>We use proven, scalable technologies — chosen for reliability, performance and developer velocity.</p>
                  <div className="pd-tech__grid">
                    {product.tech.map((t) => (
                      <div key={t} className="pd-tech__item">
                        <Layers size={16} />
                        <span>{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tab === 'workflow' && (
                <ol className="pd-workflow">
                  {workflowSteps.map((s, i) => (
                    <li key={s.title}>
                      <span className="pd-workflow__num mono">{String(i + 1).padStart(2, '0')}</span>
                      <div>
                        <h3>{s.title}</h3>
                        <p>{s.desc}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              )}

              {tab === 'security' && (
                <div className="pd-feature-grid">
                  {[
                    ['Encryption', 'TLS 1.3 in transit, AES-256 at rest. Per-tenant encryption keys.'],
                    ['Access Control', 'Role-based permissions, SSO, multi-factor authentication.'],
                    ['Audit Trails', 'Tamper-proof logs of every action across the platform.'],
                    ['Compliance', 'SOC2-ready, GDPR-compliant, DPA available for enterprise.'],
                    ['Backups', 'Continuous backups with point-in-time recovery up to 30 days.'],
                    ['Resilience', 'Multi-AZ deployment, automatic failover, 99.9% uptime SLA.'],
                  ].map(([title, desc]) => (
                    <div key={title} className="pd-feature glass">
                      <Shield size={20} style={{ color: 'var(--accent)' }} />
                      <h3>{title}</h3>
                      <p>{desc}</p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* PRICING */}
      <section className="section">
        <div className="container">
          <Reveal>
            <div className="section__head">
              <span className="eyebrow">// Pricing</span>
              <h2>Simple, <span className="gradient-text">transparent pricing</span></h2>
              <p className="section__lead">Start with a 14-day free trial. Upgrade, downgrade or cancel any time.</p>
            </div>
          </Reveal>
          <div className="pd-pricing">
            {product.plans.map((plan, i) => (
              <Reveal key={plan.name} delay={i * 0.08}>
                <div className={`pd-plan glass ${plan.featured ? 'is-featured' : ''}`}>
                  {plan.featured && <span className="pd-plan__badge">Most Popular</span>}
                  <h3>{plan.name}</h3>
                  <div className="pd-plan__price">
                    {typeof plan.price === 'number' ? <><span className="pd-plan__currency">₹</span>{plan.price.toLocaleString()}</> : plan.price}
                    {plan.period && <span className="pd-plan__period">/{plan.period}</span>}
                  </div>
                  <p className="pd-plan__users">{plan.users}</p>
                  <ul>
                    {product.highlights.slice(0, 4).map((h) => (
                      <li key={h}><Check size={14} /> {h}</li>
                    ))}
                  </ul>
                  <Link to="/demo" className={`btn ${plan.featured ? 'btn--primary' : 'btn--ghost'} btn--block btn--lg`}>
                    {typeof plan.price === 'number' ? 'Get Started' : 'Talk to Sales'}
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section">
        <div className="container faq">
          <Reveal>
            <div className="section__head">
              <span className="eyebrow">// FAQ</span>
              <h2>Frequently asked</h2>
            </div>
          </Reveal>
          <div className="faq__list">
            {faqs.map((f, i) => <FaqItem key={f.q} faq={f} index={i} />)}
          </div>
        </div>
      </section>
    </>
  );
}

function FaqItem({ faq, index }) {
  const [open, setOpen] = useState(index === 0);
  return (
    <Reveal delay={index * 0.05}>
      <div className={`faq__item glass ${open ? 'is-open' : ''}`}>
        <button className="faq__q" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          <span>{faq.q}</span>
          <ChevronDown size={18} className="faq__chev" />
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              key="content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              style={{ overflow: 'hidden' }}
            >
              <p className="faq__a">{faq.a}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Reveal>
  );
}
