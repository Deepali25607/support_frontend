import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Check, Sparkles, ArrowLeft, ArrowRight } from 'lucide-react';
import Reveal from '../components/Reveal.jsx';
import { useProducts } from '../context/ProductsContext.jsx';
import './Demo.css';

const slots = ['10:00', '11:30', '14:00', '15:30', '17:00', '18:30'];

function getNextDays(n = 14) {
  const today = new Date();
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i + 1);
    return d;
  });
}

export default function Demo() {
  const { products } = useProducts();
  const [step, setStep] = useState(1);
  const [date, setDate] = useState(null);
  const [time, setTime] = useState(null);
  const [product, setProduct] = useState(products[0]?.id || '');
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', notes: '' });
  const [submitted, setSubmitted] = useState(false);
  const days = useMemo(() => getNextDays(14), []);

  const canStep2 = !!date && !!time;
  const canSubmit = form.name && form.email && form.company;

  const submit = async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/demos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, product, date: date?.toISOString(), time }),
      });
    } catch { /* offline-friendly */ }
    setSubmitted(true);
  };

  return (
    <section className="section">
      <div className="container">
        <Reveal>
          <div className="page-head">
            <span className="eyebrow">// Book a Live Demo</span>
            <h1>See it <span className="gradient-text">live</span>. Built for your team.</h1>
            <p className="page-head__lead">Pick a date, choose a time, tell us a little about your business. A product specialist will walk you through a tailored demo within 24 hours.</p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="stepper">
            {['Schedule', 'Details', 'Confirmed'].map((s, i) => (
              <div key={s} className={`stepper__step ${step > i ? 'is-done' : ''} ${step === i + 1 ? 'is-on' : ''}`}>
                <span className="stepper__num">{step > i ? <Check size={14} /> : i + 1}</span>
                <span>{s}</span>
                {i < 2 && <span className="stepper__line" />}
              </div>
            ))}
          </div>
        </Reveal>

        <div className="demo-wrap glass">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20, filter: 'blur(8px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0)' }}
                exit={{ opacity: 0, x: -20, filter: 'blur(8px)' }}
                transition={{ duration: 0.4 }}
                className="demo-step"
              >
                <div className="demo-step__col">
                  <h3><Calendar size={18} /> Pick a date</h3>
                  <div className="cal">
                    {days.map((d) => {
                      const active = date && d.toDateString() === date.toDateString();
                      return (
                        <button
                          key={d.toISOString()}
                          className={`cal__day ${active ? 'is-on' : ''}`}
                          onClick={() => setDate(d)}
                        >
                          <span className="cal__dow mono">{d.toLocaleDateString('en', { weekday: 'short' })}</span>
                          <span className="cal__dom">{d.getDate()}</span>
                          <span className="cal__mon mono">{d.toLocaleDateString('en', { month: 'short' })}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="demo-step__col">
                  <h3><Clock size={18} /> Pick a time</h3>
                  <div className="slots">
                    {slots.map((s) => (
                      <button
                        key={s}
                        className={`slot ${time === s ? 'is-on' : ''} ${!date ? 'is-disabled' : ''}`}
                        disabled={!date}
                        onClick={() => setTime(s)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  <p className="demo-step__hint mono">All times in IST · 30-minute session · video call link delivered by email</p>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.form
                key="step2"
                onSubmit={submit}
                initial={{ opacity: 0, x: 20, filter: 'blur(8px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0)' }}
                exit={{ opacity: 0, x: -20, filter: 'blur(8px)' }}
                transition={{ duration: 0.4 }}
                className="demo-form"
              >
                <div className="form-row">
                  <div>
                    <label>Full Name *</label>
                    <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                  </div>
                  <div>
                    <label>Company *</label>
                    <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} required />
                  </div>
                </div>
                <div className="form-row">
                  <div>
                    <label>Work Email *</label>
                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                  </div>
                  <div>
                    <label>Phone</label>
                    <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label>Product of Interest</label>
                  <select value={product} onChange={(e) => setProduct(e.target.value)}>
                    {products.map((p) => <option key={p.id} value={p.id}>{p.name} — {p.category}</option>)}
                  </select>
                </div>
                <div>
                  <label>Tell us about your use case</label>
                  <textarea rows={4} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="What are you trying to solve? How many users? Anything else we should know…" />
                </div>
                <div className="demo-summary">
                  <span className="mono">SCHEDULED</span>
                  <strong>{date?.toLocaleDateString('en', { weekday: 'long', day: 'numeric', month: 'long' })} · {time} IST</strong>
                </div>
              </motion.form>
            )}

            {step === 3 && submitted && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="demo-success"
              >
                <div className="demo-success__ring">
                  <Check size={36} />
                </div>
                <h2>You're booked, {form.name.split(' ')[0]} 🚀</h2>
                <p>We've sent a calendar invite and meeting link to <strong>{form.email}</strong>. A product specialist will contact you within 24 hours.</p>
                <div className="demo-success__card">
                  <span className="mono">DEMO // CONFIRMED</span>
                  <div>
                    <strong>{products.find(p => p.id === product)?.name}</strong>
                    <span>{date?.toLocaleDateString('en', { weekday: 'long', day: 'numeric', month: 'long' })} · {time} IST</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {step < 3 && (
            <div className="demo-nav">
              {step > 1 ? (
                <button className="btn btn--ghost" onClick={() => setStep((s) => s - 1)}>
                  <ArrowLeft size={16} /> Back
                </button>
              ) : <span />}
              {step === 1 && (
                <button
                  className="btn btn--primary btn--lg"
                  disabled={!canStep2}
                  onClick={() => canStep2 && setStep(2)}
                >
                  Continue <ArrowRight size={16} />
                </button>
              )}
              {step === 2 && (
                <button
                  className="btn btn--primary btn--lg"
                  disabled={!canSubmit}
                  onClick={(e) => { if (canSubmit) { submit(e); setStep(3); } }}
                >
                  Confirm Booking <Sparkles size={16} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
