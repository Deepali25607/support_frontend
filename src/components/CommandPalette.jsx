import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowRight, Box, FileText, Briefcase, CornerDownLeft, Command } from 'lucide-react';
import { api } from '../lib/api.js';
import { useProducts } from '../context/ProductsContext.jsx';
import './CommandPalette.css';

const STATIC_PAGES = [
  { kind: 'page', label: 'Home', to: '/', hint: 'Landing page' },
  { kind: 'page', label: 'Products', to: '/products', hint: 'All software products' },
  { kind: 'page', label: 'Pricing', to: '/pricing', hint: 'Plans and tiers' },
  { kind: 'page', label: 'Custom Build', to: '/custom', hint: 'Tailor-made software' },
  { kind: 'page', label: 'Book a Demo', to: '/demo', hint: 'Schedule live demo' },
  { kind: 'page', label: 'Journal', to: '/blog', hint: 'Blog & articles' },
  { kind: 'page', label: 'Portfolio', to: '/portfolio', hint: 'Case studies' },
  { kind: 'page', label: 'About', to: '/about', hint: 'About NEXUS' },
  { kind: 'page', label: 'Contact', to: '/contact', hint: 'Talk to us' },
];

const ICONS = { product: Box, post: FileText, caseStudy: Briefcase };

export default function CommandPalette() {
  const { products } = useProducts();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const [posts, setPosts] = useState([]);
  const [studies, setStudies] = useState([]);
  const nav = useNavigate();
  const inputRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    setActive(0);
    setQ('');
    setTimeout(() => inputRef.current?.focus(), 50);
    if (posts.length === 0) api.get('/api/blog').then(({ data }) => setPosts(data)).catch(() => {});
    if (studies.length === 0) api.get('/api/case-studies').then(({ data }) => setStudies(data)).catch(() => {});
  }, [open]); // eslint-disable-line

  const items = useMemo(() => {
    const term = q.trim().toLowerCase();
    const matches = (haystack) => !term || haystack.some((s) => s && String(s).toLowerCase().includes(term));
    const productItems = products
      .filter((p) => matches([p.name, p.tagline, p.category, p.description]))
      .map((p) => ({ kind: 'product', label: p.name, hint: p.tagline, to: `/products/${p.id}`, accent: p.accent }));
    const postItems = posts
      .filter((p) => matches([p.title, p.excerpt, p.category, ...(p.tags || [])]))
      .map((p) => ({ kind: 'post', label: p.title, hint: `${p.category} · ${p.readingTime} min`, to: `/blog/${p.slug}`, accent: p.cover }));
    const caseItems = studies
      .filter((c) => matches([c.client, c.industry, c.product, c.summary]))
      .map((c) => ({ kind: 'caseStudy', label: c.client, hint: `${c.industry} · ${c.product}`, to: `/portfolio/${c.slug}`, accent: c.accent }));
    const pageItems = STATIC_PAGES.filter((p) => matches([p.label, p.hint]));
    return [...productItems, ...caseItems, ...postItems, ...pageItems];
  }, [q, posts, studies]);

  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${active}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => (items.length === 0 ? 0 : (a + 1) % items.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => (items.length === 0 ? 0 : (a - 1 + items.length) % items.length));
    } else if (e.key === 'Enter' && items[active]) {
      nav(items[active].to);
      setOpen(false);
    }
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="cmdk-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setOpen(false)}
        >
          <motion.div
            className="cmdk glass"
            initial={{ opacity: 0, y: -20, scale: 0.95, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0)' }}
            exit={{ opacity: 0, y: -10, scale: 0.97, filter: 'blur(6px)' }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="cmdk__input">
              <Search size={18} />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => { setQ(e.target.value); setActive(0); }}
                onKeyDown={onKeyDown}
                placeholder="Search products, case studies, articles, pages…"
                aria-label="Search"
              />
              <kbd className="mono">ESC</kbd>
            </div>
            <div className="cmdk__list" ref={listRef}>
              {items.length === 0 ? (
                <div className="cmdk__empty">
                  <p>No results for "<strong>{q}</strong>"</p>
                </div>
              ) : items.map((it, i) => {
                const Icon = ICONS[it.kind] || ArrowRight;
                return (
                  <button
                    key={`${it.kind}-${it.to}`}
                    data-idx={i}
                    className={`cmdk__item ${active === i ? 'is-on' : ''}`}
                    style={{ '--accent': it.accent || 'var(--neon-cyan)' }}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => { nav(it.to); setOpen(false); }}
                  >
                    <span className="cmdk__icon"><Icon size={14} /></span>
                    <div>
                      <strong>{it.label}</strong>
                      {it.hint && <span>{it.hint}</span>}
                    </div>
                    <span className="cmdk__kind mono">{it.kind}</span>
                  </button>
                );
              })}
            </div>
            <footer className="cmdk__foot">
              <span><kbd>↑↓</kbd> navigate</span>
              <span><kbd><CornerDownLeft size={10} /></kbd> open</span>
              <span><kbd><Command size={10} /></kbd> <kbd>K</kbd> toggle</span>
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
