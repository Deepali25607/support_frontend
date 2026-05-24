import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Send, Sparkles, Check } from 'lucide-react';
import Reveal from '../components/Reveal.jsx';
import './CustomRequest.css';

const solutionTypes = ['Web Application', 'Mobile App', 'ERP / SaaS', 'API / Integration', 'AI / ML Product', 'Other'];
const budgets = ['< ₹5 Lakh', '₹5–15 Lakh', '₹15–50 Lakh', '₹50 Lakh – 1 Crore', '> ₹1 Crore'];
const timelines = ['< 1 month', '1–3 months', '3–6 months', '6–12 months', '12+ months'];

export default function CustomRequest() {
  const [done, setDone] = useState(false);
  const [files, setFiles] = useState([]);
  const [solutions, setSolutions] = useState([]);
  const [form, setForm] = useState({
    company: '', contact: '', email: '', phone: '', country: 'India', industry: '',
    title: '', problem: '', preferredTech: '', budget: budgets[1], timeline: timelines[1],
    users: '', integrations: '',
  });

  const toggleSolution = (s) => setSolutions((arr) => arr.includes(s) ? arr.filter(x => x !== s) : [...arr, s]);

  const submit = async (e) => {
    e.preventDefault();
    const payload = { ...form, solutions, attachments: files.map(f => f.name) };
    try {
      await fetch('/api/custom-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch { /* offline-friendly */ }
    setDone(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (done) {
    return (
      <section className="section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="custom-done glass"
          >
            <div className="custom-done__ring"><Check size={36} /></div>
            <h2>Request received 🛰</h2>
            <p>Thanks, {form.contact.split(' ')[0] || form.company}. Our solutions team is reviewing your brief and will email you within 24 hours with next steps — typically a discovery call, followed by a tailored proposal.</p>
            <p className="mono custom-done__id">REQ-{Math.random().toString(36).slice(2, 8).toUpperCase()}</p>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="container">
        <Reveal>
          <div className="page-head">
            <span className="eyebrow">// Custom Build</span>
            <h1>Have a unique idea? <span className="gradient-text">Let's build it.</span></h1>
            <p className="page-head__lead">Tell us about your business problem. Our solutions team will design a tailor-made web, mobile, ERP or AI product — from discovery through deployment.</p>
          </div>
        </Reveal>

        <form className="cr-form glass" onSubmit={submit}>
          <div className="cr-section">
            <h3><span className="mono">01</span> Client Information</h3>
            <div className="cr-grid">
              <div><label>Company Name *</label><input required value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></div>
              <div><label>Contact Person *</label><input required value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} /></div>
              <div><label>Email *</label><input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div><label>Phone</label><input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              <div><label>Country / Location</label><input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} /></div>
              <div><label>Industry</label><input value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} placeholder="e.g. Education, Healthcare, Retail" /></div>
            </div>
          </div>

          <div className="cr-section">
            <h3><span className="mono">02</span> Project Brief</h3>
            <div><label>Project Title *</label><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Multi-branch school operations platform" /></div>
            <div style={{ marginTop: '1rem' }}><label>Business Problem *</label><textarea required rows={4} value={form.problem} onChange={(e) => setForm({ ...form, problem: e.target.value })} placeholder="What are you trying to solve? What does success look like?" /></div>
            <div style={{ marginTop: '1rem' }}>
              <label>Solution Type (pick all that apply)</label>
              <div className="cr-chips">
                {solutionTypes.map((s) => (
                  <button
                    type="button"
                    key={s}
                    className={`cr-chip ${solutions.includes(s) ? 'is-on' : ''}`}
                    onClick={() => toggleSolution(s)}
                  >
                    {solutions.includes(s) && <Check size={12} />} {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="cr-grid" style={{ marginTop: '1rem' }}>
              <div><label>Expected Users</label><input value={form.users} onChange={(e) => setForm({ ...form, users: e.target.value })} placeholder="e.g. 500 internal users + 10,000 customers" /></div>
              <div><label>Preferred Tech (optional)</label><input value={form.preferredTech} onChange={(e) => setForm({ ...form, preferredTech: e.target.value })} placeholder="e.g. React, Node, AWS" /></div>
              <div><label>3rd-party Integrations</label><input value={form.integrations} onChange={(e) => setForm({ ...form, integrations: e.target.value })} placeholder="e.g. Tally, Razorpay, WhatsApp" /></div>
            </div>
          </div>

          <div className="cr-section">
            <h3><span className="mono">03</span> Budget & Timeline</h3>
            <div className="cr-grid">
              <div>
                <label>Budget Range</label>
                <div className="cr-radios">
                  {budgets.map((b) => (
                    <label key={b} className={`cr-radio ${form.budget === b ? 'is-on' : ''}`}>
                      <input type="radio" name="budget" checked={form.budget === b} onChange={() => setForm({ ...form, budget: b })} />
                      <span>{b}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label>Timeline</label>
                <div className="cr-radios">
                  {timelines.map((t) => (
                    <label key={t} className={`cr-radio ${form.timeline === t ? 'is-on' : ''}`}>
                      <input type="radio" name="timeline" checked={form.timeline === t} onChange={() => setForm({ ...form, timeline: t })} />
                      <span>{t}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="cr-section">
            <h3><span className="mono">04</span> Attachments</h3>
            <label className="cr-upload">
              <Upload size={24} />
              <span>Drop files here or click to upload</span>
              <small>BRDs, wireframes, screenshots, Excel/PDF — up to 25MB</small>
              <input type="file" multiple onChange={(e) => setFiles(Array.from(e.target.files))} hidden />
            </label>
            {files.length > 0 && (
              <div className="cr-files">
                {files.map((f, i) => (
                  <span key={i} className="cr-file mono">{f.name}</span>
                ))}
              </div>
            )}
          </div>

          <div className="cr-submit">
            <p className="mono">Your information is encrypted in transit. We'll respond within 24 hours.</p>
            <button type="submit" className="btn btn--primary btn--lg">
              <Send size={16} /> Submit Request <Sparkles size={14} />
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
