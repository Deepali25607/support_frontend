import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';
import Reveal from '../components/Reveal.jsx';
import { useProducts } from '../context/ProductsContext.jsx';
import './Pricing.css';

export default function Pricing() {
  const { products } = useProducts();
  const [billing, setBilling] = useState('monthly');

  return (
    <>
      <section className="section">
        <div className="container">
          <Reveal>
            <div className="page-head">
              <span className="eyebrow">// Pricing</span>
              <h1>Pricing that <span className="gradient-text">scales with you</span></h1>
              <p className="page-head__lead">Start with a 14-day free trial, no credit card required. Yearly plans get 20% off — switch any time.</p>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="billing-toggle glass" role="tablist">
              <button
                role="tab"
                aria-selected={billing === 'monthly'}
                className={billing === 'monthly' ? 'is-on' : ''}
                onClick={() => setBilling('monthly')}
              >
                Monthly
                {billing === 'monthly' && <motion.span layoutId="billing-bg" className="billing-toggle__bg" transition={{ type: 'spring', stiffness: 340, damping: 30 }} />}
              </button>
              <button
                role="tab"
                aria-selected={billing === 'yearly'}
                className={billing === 'yearly' ? 'is-on' : ''}
                onClick={() => setBilling('yearly')}
              >
                Yearly <span className="billing-toggle__save">save 20%</span>
                {billing === 'yearly' && <motion.span layoutId="billing-bg" className="billing-toggle__bg" transition={{ type: 'spring', stiffness: 340, damping: 30 }} />}
              </button>
            </div>
          </Reveal>

          <div className="pricing-list">
            {products.filter((p) => p.id !== 'custom').map((p, i) => {
              const plans = p.plans;
              return (
                <Reveal key={p.id} delay={i * 0.05}>
                  <div className="pricing-block glass" style={{ '--accent': p.accent }}>
                    <div className="pricing-block__head">
                      <div>
                        <span className="mono pricing-block__cat">{p.category}</span>
                        <h2>{p.name}</h2>
                        <p>{p.tagline}</p>
                      </div>
                      <Link to={`/products/${p.id}`} className="btn btn--ghost">View Product <ArrowRight size={14} /></Link>
                    </div>
                    <div className="pricing-block__plans">
                      {plans.map((plan) => {
                        const numeric = typeof plan.price === 'number';
                        const value = numeric && billing === 'yearly' ? Math.round(plan.price * 12 * 0.8) : plan.price;
                        const periodLabel = numeric ? (billing === 'yearly' ? '/yr' : `/${plan.period}`) : '';
                        return (
                          <div key={plan.name} className={`mini-plan ${plan.featured ? 'is-featured' : ''}`}>
                            {plan.featured && <span className="mini-plan__badge">Popular</span>}
                            <span className="mini-plan__name">{plan.name}</span>
                            <span className="mini-plan__price">
                              {numeric ? <><span className="mini-plan__currency">₹</span>{value.toLocaleString()}</> : value}
                              <small>{periodLabel}</small>
                            </span>
                            <span className="mini-plan__users">{plan.users}</span>
                            <ul>
                              {p.highlights.slice(0, 3).map((h) => <li key={h}><Check size={12} /> {h}</li>)}
                            </ul>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>

          <Reveal>
            <div className="enterprise glass">
              <div>
                <span className="eyebrow">// Enterprise</span>
                <h2>Need something <span className="gradient-text">tailor-made?</span></h2>
                <p>Custom contracts, dedicated infrastructure, on-premise deployments, white-label options and enterprise SLAs. Let's build a plan that fits your scale.</p>
              </div>
              <div className="enterprise__actions">
                <Link to="/contact" className="btn btn--primary btn--lg">Talk to Sales <ArrowRight size={18} /></Link>
                <Link to="/custom" className="btn btn--ghost btn--lg">Request Custom Build</Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
