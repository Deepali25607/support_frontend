import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api.js';

const FALLBACK = {
  'hero.eyebrow': '// Software Engineered for Tomorrow',
  'hero.title.lead': 'Future-ready',
  'hero.title.tail': 'software products that scale your business.',
  'hero.subtitle': 'We design, build and operate next-generation ERPs, SaaS platforms and bespoke applications for schools, hospitals, retailers, communities and enterprises.',
  'hero.pills': ['ERP', 'SaaS', 'E-commerce', 'CRM', 'POS', 'Custom Builds'],
  'clients.logos': ['EDUNEXT', 'SKYLINE', 'LUMEN', 'MEDFIRST', 'ORION', 'NEBULA', 'HELIX', 'VECTOR'],
  'support.email': 'hello@nexuslab.io',
  'support.phone': '+91 90000 00000',
  'support.locations': ['Bengaluru', 'Singapore', 'Dubai'],
  'support.hours': 'Monday – Friday · 9:00 AM – 9:00 PM IST\nSaturday · 10:00 AM – 4:00 PM IST',
  'support.statusLine': 'All systems operational',
  'support.uptime': '99.98% uptime · last 30 days',
  'support.billingEmail': 'billing@nexuslab.io',
  'support.billingPhone': '+91 90000 00000',
  testimonials: [],
  faqs: [],
};

const Ctx = createContext({ content: FALLBACK, loading: true, refresh: () => {} });

export function SiteContentProvider({ children }) {
  const [content, setContent] = useState(FALLBACK);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const { data } = await api.get('/api/site-content');
      setContent({ ...FALLBACK, ...data });
    } catch {
      setContent(FALLBACK);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  return <Ctx.Provider value={{ content, loading, refresh }}>{children}</Ctx.Provider>;
}

export function useSiteContent() {
  return useContext(Ctx);
}

export function useContentValue(key, fallback) {
  const { content } = useSiteContent();
  return content[key] ?? fallback ?? FALLBACK[key];
}
