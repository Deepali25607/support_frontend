import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, MessageSquare, Send, Check, Headphones, Building2, Code2 } from 'lucide-react';
import Reveal from '../components/Reveal.jsx';
import { useSiteContent } from '../context/SiteContentContext.jsx';
import './Contact.css';

const inquiryTypes = [
  { id: 'sales', label: 'Sales', icon: Building2 },
  { id: 'support', label: 'Support', icon: Headphones },
  { id: 'custom', label: 'Custom Build', icon: Code2 },
  { id: 'other', label: 'Other', icon: MessageSquare },
];

export default function Contact() {
  const { content } = useSiteContent();
  const supportEmail = content['support.email'];
  const supportPhone = content['support.phone'];
  const locations = content['support.locations'];
  const hours = content['support.hours'];
  const statusLine = content['support.statusLine'];
  const uptime = content['support.uptime'];
  const locationLine = Array.isArray(locations) && locations.length ? locations.join(' · ') : '';
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', message: '', type: 'sales' });

  const submit = async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
    } catch { /* offline-friendly */ }
    setDone(true);
  };

  return (
    <section className="section">
      <div className="container">
        <Reveal>
          <div className="page-head">
            <span className="eyebrow">// Contact</span>
            <h1>Let's <span className="gradient-text">talk</span></h1>
            <p className="page-head__lead">A real human will respond within 24 hours — usually much faster. Tell us what you're working on.</p>
          </div>
        </Reveal>

        <div className="contact">
          <Reveal delay={0.1}>
            <aside className="contact__side glass">
              <h3>Get in touch</h3>
              <ul>
                {supportEmail && <li><Mail size={16} /> <a href={`mailto:${supportEmail}`}>{supportEmail}</a></li>}
                {supportPhone && <li><Phone size={16} /> <a href={`tel:${supportPhone.replace(/\s+/g, '')}`}>{supportPhone}</a></li>}
                {locationLine && <li><MapPin size={16} /> {locationLine}</li>}
              </ul>

              {hours && (
                <div className="contact__hours">
                  <span className="mono">SUPPORT HOURS</span>
                  <p>{hours.split('\n').map((line, i, arr) => (
                    <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
                  ))}</p>
                </div>
              )}

              {(statusLine || uptime) && (
                <div className="contact__pulse">
                  <span className="contact__pulse-dot" />
                  <div>
                    {statusLine && <strong>{statusLine}</strong>}
                    {uptime && <span className="mono">{uptime}</span>}
                  </div>
                </div>
              )}
            </aside>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="contact__form-wrap glass">
              {done ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="contact__done">
                  <div className="contact__done-ring"><Check size={36} /></div>
                  <h2>Message sent ✨</h2>
                  <p>Thanks, {form.name.split(' ')[0]}. We'll get back to you at <strong>{form.email}</strong> shortly.</p>
                </motion.div>
              ) : (
                <form className="contact__form" onSubmit={submit}>
                  <div>
                    <label>How can we help?</label>
                    <div className="contact__types">
                      {inquiryTypes.map((t) => (
                        <button
                          type="button"
                          key={t.id}
                          className={`contact__type ${form.type === t.id ? 'is-on' : ''}`}
                          onClick={() => setForm({ ...form, type: t.id })}
                        >
                          <t.icon size={18} /> {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="form-row">
                    <div><label>Name *</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                    <div><label>Email *</label><input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                  </div>
                  <div className="form-row">
                    <div><label>Company</label><input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></div>
                    <div><label>Phone</label><input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                  </div>
                  <div><label>Message *</label><textarea rows={5} required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="What's on your mind?" /></div>
                  <button type="submit" className="btn btn--primary btn--lg btn--block">
                    <Send size={16} /> Send Message
                  </button>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
