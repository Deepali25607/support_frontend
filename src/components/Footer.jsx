import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Mail, Phone, MapPin, Code2, Briefcase, Send, Check } from 'lucide-react';
import { api } from '../lib/api.js';
import { useTheme } from '../context/ThemeContext.jsx';
import { useSiteContent } from '../context/SiteContentContext.jsx';
import './Footer.css';

function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState('idle');
  const submit = async (e) => {
    e.preventDefault();
    setState('busy');
    try {
      await api.post('/api/newsletter/subscribe', { email, source: 'footer' });
      setState('done');
      setEmail('');
      setTimeout(() => setState('idle'), 3500);
    } catch {
      setState('error');
    }
  };
  return (
    <form className="footer__newsletter" onSubmit={submit}>
      <input type="email" placeholder="you@company.com" required aria-label="Email for newsletter" value={email} onChange={(e) => setEmail(e.target.value)} />
      <button className="btn btn--primary" type="submit" disabled={state === 'busy'}>
        {state === 'done' ? <><Check size={14} /> Subscribed</> : state === 'busy' ? 'Subscribing…' : 'Subscribe'}
      </button>
    </form>
  );
}

export default function Footer() {
  const { theme } = useTheme();
  const { content } = useSiteContent();
  const supportEmail = content['support.email'];
  const supportPhone = content['support.phone'];
  const locations = content['support.locations'];
  const locationLine = Array.isArray(locations) && locations.length ? locations.join(' · ') : '';
  return (
    <footer className="footer">
      <div className="footer__grid container">
        <div className="footer__brand">
          <div className="footer__mark">
            <span><Zap size={18} strokeWidth={2.5} /></span>
            <div>
              <strong>{theme.brandName}</strong>
              <span className="mono">{theme.brandTagline}</span>
            </div>
          </div>
          <p>Building the next generation of business software — ERPs, SaaS platforms and bespoke applications, designed for the future.</p>
          <NewsletterForm />
        </div>

        <div>
          <h4 className="footer__title">Products</h4>
          <ul>
            <li><Link to="/products/school-erp">NovaScholar ERP</Link></li>
            <li><Link to="/products/apartment-erp">Habitat ERP</Link></li>
            <li><Link to="/products/ecommerce">Pulse Commerce</Link></li>
            <li><Link to="/products/crm">Orbit CRM</Link></li>
            <li><Link to="/products/billing-pos">Flux POS</Link></li>
            <li><Link to="/products/hospital">CareGrid HMS</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="footer__title">Company</h4>
          <ul>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/pricing">Pricing</Link></li>
            <li><Link to="/portfolio">Portfolio</Link></li>
            <li><Link to="/docs">Docs</Link></li>
            <li><Link to="/blog">Journal</Link></li>
            <li><Link to="/custom">Custom Build</Link></li>
            <li><Link to="/demo">Book Demo</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="footer__title">Connect</h4>
          <ul className="footer__contact">
            <li><Mail size={14} /> <a href={`mailto:${supportEmail}`}>{supportEmail}</a></li>
            <li><Phone size={14} /> <a href={`tel:${(supportPhone || '').replace(/\s+/g, '')}`}>{supportPhone}</a></li>
            {locationLine && <li><MapPin size={14} /> {locationLine}</li>}
          </ul>
          <div className="footer__social">
            <a href="#" aria-label="GitHub"><Code2 size={16} /></a>
            <a href="#" aria-label="LinkedIn"><Briefcase size={16} /></a>
            <a href="#" aria-label="Twitter"><Send size={16} /></a>
          </div>
        </div>
      </div>

      <div className="footer__bottom container">
        <span className="mono">© {new Date().getFullYear()} NEXUS Software Lab · All rights reserved</span>
        <span className="footer__legal">
          <a href="#">Privacy</a> · <a href="#">Terms</a> · <a href="#">Security</a>
        </span>
      </div>
    </footer>
  );
}
