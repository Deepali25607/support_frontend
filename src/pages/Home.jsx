import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Cpu, Sparkles, Shield, Layers, Rocket, Quote, Play } from 'lucide-react';
import HolographicCard from '../components/HolographicCard.jsx';
import Reveal from '../components/Reveal.jsx';
import Counter from '../components/Counter.jsx';
import { stats, testimonials as fallbackTestimonials, clientLogos as fallbackLogos } from '../data/products.js';
import { useProducts } from '../context/ProductsContext.jsx';
import { useSiteContent } from '../context/SiteContentContext.jsx';
import './Home.css';

export default function Home() {
  const { products } = useProducts();
  const { content } = useSiteContent();
  const heroEyebrow = content['hero.eyebrow'];
  const heroTitleLead = content['hero.title.lead'];
  const heroTitleTail = content['hero.title.tail'];
  const heroSubtitle = content['hero.subtitle'];
  const heroPills = content['hero.pills'] || [];
  const clientLogos = content['clients.logos']?.length ? content['clients.logos'] : fallbackLogos;
  const testimonials = content.testimonials?.length ? content.testimonials : fallbackTestimonials;

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="hero__bg" aria-hidden="true">
          <div className="hero__orb hero__orb--1" />
          <div className="hero__orb hero__orb--2" />
          <div className="hero__orb hero__orb--3" />
          <div className="hero__scan" />
        </div>

        <div className="container hero__inner">
          <motion.div
            className="hero__copy"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="eyebrow">{heroEyebrow}</span>
            <h1 className="hero__title">
              <span className="gradient-text">{heroTitleLead}</span><br />
              <span className="hero__title-mark">{heroTitleTail}</span>
            </h1>
            <p className="hero__sub">{heroSubtitle}</p>
            <div className="hero__cta">
              <Link to="/products" className="btn btn--primary btn--lg">
                <span>Explore Products</span>
                <ArrowRight size={18} />
              </Link>
              <Link to="/demo" className="btn btn--ghost btn--lg">
                <Play size={16} /> <span>Book a Live Demo</span>
              </Link>
            </div>

            <div className="hero__pills">
              {heroPills.map((p, i) => (
                <motion.span
                  key={p}
                  className="pill"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.08 }}
                >{p}</motion.span>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="hero__visual"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          >
            <div className="orbit">
              <div className="orbit__core">
                <span className="mono">NEXUS</span>
                <span className="orbit__core-sub">control&nbsp;plane</span>
              </div>
              <div className="orbit__ring orbit__ring--1" />
              <div className="orbit__ring orbit__ring--2" />
              <div className="orbit__ring orbit__ring--3" />
              {[
                { label: 'School ERP', a: 0 },
                { label: 'Hospital', a: 60 },
                { label: 'CRM', a: 120 },
                { label: 'Commerce', a: 180 },
                { label: 'POS', a: 240 },
                { label: 'Apartment', a: 300 },
              ].map((s, i) => (
                <div
                  key={s.label}
                  className="orbit__node"
                  style={{ '--angle': `${s.a}deg`, '--i': i }}
                >
                  <span>{s.label}</span>
                </div>
              ))}
              <svg className="orbit__lines" viewBox="0 0 400 400" aria-hidden="true">
                <defs>
                  <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="#b537ff" stopOpacity="0.7" />
                  </linearGradient>
                </defs>
                {[40, 90, 140, 180].map((r, i) => (
                  <circle key={r} cx="200" cy="200" r={r} fill="none" stroke="url(#lg)" strokeOpacity={0.25 - i * 0.04} />
                ))}
              </svg>
            </div>
          </motion.div>
        </div>

        {/* Stats strip */}
        <div className="container">
          <div className="stats glass">
            {stats.map((s) => (
              <div key={s.label} className="stats__item">
                <div className="stats__value mono">
                  <Counter to={s.value} suffix={s.suffix} />
                </div>
                <div className="stats__label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CLIENTS MARQUEE */}
      <section className="clients">
        <div className="container">
          <Reveal>
            <p className="clients__title mono">Trusted by forward-thinking teams across industries</p>
          </Reveal>
          <div className="marquee">
            <div className="marquee__track">
              {[...clientLogos, ...clientLogos].map((c, i) => (
                <span key={i} className="marquee__logo mono">{c}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="section">
        <div className="container">
          <Reveal>
            <div className="section__head">
              <span className="eyebrow">// Product Suite</span>
              <h2>One platform. <span className="gradient-text">Eight flagship products.</span></h2>
              <p className="section__lead">From classrooms to clinics, communities to commerce — we ship production-grade software that businesses run on every day.</p>
            </div>
          </Reveal>

          <div className="cards-grid">
            {products.map((p, i) => <HolographicCard key={p.id} product={p} index={i} />)}
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="section section--alt">
        <div className="container why">
          <Reveal>
            <span className="eyebrow">// Why NEXUS</span>
            <h2>Built different. <span className="gradient-text">Engineered to last.</span></h2>
          </Reveal>
          <div className="why__grid">
            {[
              { icon: Cpu, title: 'AI-Native', text: 'Every product ships with AI workflows — smart suggestions, anomaly detection, automation — baked into the core.' },
              { icon: Shield, title: 'Enterprise Security', text: 'TLS in transit, AES-256 at rest, role-based access, MFA, audit logs and SOC2-ready controls on every plan.' },
              { icon: Layers, title: 'Modular Architecture', text: 'Cleanly separated modules and APIs — extend, integrate or replace any layer without breaking the system.' },
              { icon: Rocket, title: 'Cloud-Native', text: 'Containerized, autoscaling, multi-region. Deploy in our cloud or yours — same code, same speed.' },
              { icon: Sparkles, title: 'Beautiful by Default', text: 'Interfaces your team will actually love using. Dark, accessible, responsive, lightning-fast.' },
              { icon: Cpu, title: 'World-Class Support', text: 'Real engineers on call, a customer success manager from day one, and a public roadmap you can shape.' },
            ].map((w, i) => (
              <Reveal key={w.title} delay={i * 0.08}>
                <div className="why__card glass">
                  <span className="why__icon"><w.icon size={20} /></span>
                  <h3>{w.title}</h3>
                  <p>{w.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section">
        <div className="container">
          <Reveal>
            <div className="section__head">
              <span className="eyebrow">// Customer Stories</span>
              <h2>Loved by operators. <span className="gradient-text">Trusted by leaders.</span></h2>
            </div>
          </Reveal>
          <div className="testimonials">
            {testimonials.map((t, i) => (
              <Reveal key={`${t.name || 'testimonial'}-${i}`} delay={i * 0.08}>
                <article className="t-card glass" style={{ '--accent': t.accent }}>
                  <Quote size={22} className="t-card__quote" />
                  <p>{t.quote}</p>
                  <footer>
                    <div className="t-card__avatar">{(t.name || '?').split(' ').map(n => n[0]).join('')}</div>
                    <div>
                      <strong>{t.name}</strong>
                      <span>{t.role}</span>
                    </div>
                  </footer>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="container">
          <Reveal>
            <div className="cta glass">
              <div className="cta__bg" aria-hidden="true" />
              <div className="cta__copy">
                <span className="eyebrow">// Ready when you are</span>
                <h2>Let's build the next decade of your business — together.</h2>
                <p>Pick a flagship product, design something custom, or simply explore the platform with a guided walkthrough.</p>
              </div>
              <div className="cta__actions">
                <Link to="/demo" className="btn btn--primary btn--lg">Book a Live Demo <ArrowRight size={18} /></Link>
                <Link to="/custom" className="btn btn--ghost btn--lg">Request Custom Build</Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
