import { Link } from 'react-router-dom';
import { ArrowRight, Target, Heart, Globe, Award } from 'lucide-react';
import Reveal from '../components/Reveal.jsx';
import Counter from '../components/Counter.jsx';
import './About.css';

const values = [
  { icon: Target, title: 'Outcomes over output', text: 'We ship software our customers love using — measured by impact, not lines of code.' },
  { icon: Heart, title: 'Customer obsession', text: 'Every roadmap decision starts with a real conversation with a real user. We listen, then build.' },
  { icon: Globe, title: 'Built for the world', text: 'Multi-lingual, multi-currency, multi-timezone. Our products work where your business does.' },
  { icon: Award, title: 'Engineering craft', text: 'Clean code, modern architectures, deep test coverage. Excellence is non-negotiable.' },
];

const milestones = [
  { year: '2019', title: 'Founded', desc: 'Three engineers, one whiteboard, infinite ambition.' },
  { year: '2021', title: 'First ERP launched', desc: 'NovaScholar shipped to 20 schools in 6 months.' },
  { year: '2023', title: 'SaaS platform', desc: 'Unified our products on a multi-tenant SaaS backbone.' },
  { year: '2025', title: 'AI-native rebuild', desc: 'Every product now ships with AI workflows out of the box.' },
  { year: '2026', title: 'Global expansion', desc: 'Singapore and Dubai offices. 120+ enterprise customers.' },
];

export default function About() {
  return (
    <>
      <section className="section">
        <div className="container">
          <Reveal>
            <div className="page-head about-head">
              <span className="eyebrow">// About NEXUS</span>
              <h1>We build the <span className="gradient-text">software</span> that runs tomorrow's businesses.</h1>
              <p className="page-head__lead">NEXUS is a software product studio that designs, engineers and operates next-generation business platforms. Our mission is to make world-class software accessible to every operator — from a single-school principal to a multi-hospital CEO.</p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="about-stats glass">
              {[
                { v: 120, suffix: '+', l: 'Enterprise Clients' },
                { v: 42, suffix: '', l: 'Cities Served' },
                { v: 8, suffix: '', l: 'Flagship Products' },
                { v: 99.9, suffix: '%', l: 'Uptime SLA' },
              ].map((s) => (
                <div key={s.l} className="about-stat">
                  <span className="about-stat__v"><Counter to={s.v} suffix={s.suffix} /></span>
                  <span className="about-stat__l">{s.l}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <Reveal>
            <div className="section__head">
              <span className="eyebrow">// Values</span>
              <h2>How we <span className="gradient-text">work</span></h2>
            </div>
          </Reveal>
          <div className="values-grid">
            {values.map((v, i) => (
              <Reveal key={v.title} delay={i * 0.08}>
                <div className="value-card glass">
                  <span className="value-card__icon"><v.icon size={20} /></span>
                  <h3>{v.title}</h3>
                  <p>{v.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal>
            <div className="section__head">
              <span className="eyebrow">// Journey</span>
              <h2>Built one milestone at a time</h2>
            </div>
          </Reveal>
          <div className="timeline">
            <span className="timeline__line" />
            {milestones.map((m, i) => (
              <Reveal key={m.year} delay={i * 0.08}>
                <div className={`milestone ${i % 2 === 0 ? 'milestone--l' : 'milestone--r'}`}>
                  <div className="milestone__card glass">
                    <span className="mono milestone__year">{m.year}</span>
                    <h3>{m.title}</h3>
                    <p>{m.desc}</p>
                  </div>
                  <span className="milestone__dot" />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal>
            <div className="cta glass">
              <div className="cta__bg" aria-hidden="true" />
              <div className="cta__copy">
                <span className="eyebrow">// Build with us</span>
                <h2>Want to see how we'd solve <span className="gradient-text">your</span> problem?</h2>
                <p>Book a 30-minute discovery call. We'll walk you through the platform, demo the relevant product, and sketch a solution tailored to your business.</p>
              </div>
              <div className="cta__actions">
                <Link to="/demo" className="btn btn--primary btn--lg">Book a Demo <ArrowRight size={18} /></Link>
                <Link to="/contact" className="btn btn--ghost btn--lg">Contact Us</Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
