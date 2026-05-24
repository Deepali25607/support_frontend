import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Zap, ChevronRight, User, LayoutDashboard, Gauge, LogOut, LogIn, Search } from 'lucide-react';
import { useProducts } from '../context/ProductsContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import './Navbar.css';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/products', label: 'Products', mega: true },
  { to: '/pricing', label: 'Pricing' },
  { to: '/portfolio', label: 'Portfolio' },
  { to: '/docs', label: 'Docs' },
  { to: '/blog', label: 'Journal' },
  { to: '/custom', label: 'Custom Build' },
  { to: '/contact', label: 'Contact' },
];

const isMac = typeof navigator !== 'undefined' && /Mac/i.test(navigator.platform);

function dispatchCmdK() {
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: isMac, ctrlKey: !isMac }));
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const location = useLocation();
  const nav = useNavigate();
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const { products } = useProducts();
  const userMenuRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setMegaOpen(false);
    setUserOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!userOpen) return;
    const onDown = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [userOpen]);

  const initials = user ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2) : '';
  const isAdmin = user?.role === 'admin';

  const onLogout = async () => {
    await logout();
    nav('/');
  };

  return (
    <header className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
      <div className="nav__inner container">
        <Link to="/" className="brand" aria-label="Home">
          <span className="brand__mark">
            <Zap size={18} strokeWidth={2.5} />
          </span>
          <span className="brand__text">
            <span className="brand__name">{theme.brandName}</span>
            <span className="brand__sub mono">{theme.brandTagline}</span>
          </span>
        </Link>

        <nav className="nav__links" aria-label="Primary">
          {navLinks.map((l) => (
            <div
              key={l.to}
              className="nav__item"
              onMouseEnter={() => l.mega && setMegaOpen(true)}
              onMouseLeave={() => l.mega && setMegaOpen(false)}
            >
              <NavLink
                to={l.to}
                end={l.to === '/'}
                className={({ isActive }) => `nav__link ${isActive ? 'is-active' : ''}`}
              >
                <span>{l.label}</span>
                <span className="nav__link-glow" />
              </NavLink>

              {l.mega && (
                <AnimatePresence>
                  {megaOpen && (
                    <motion.div
                      className="mega"
                      initial={{ opacity: 0, y: -8, filter: 'blur(8px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, y: -8, filter: 'blur(8px)' }}
                      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div className="mega__inner glass">
                        <div className="mega__heading">
                          <span className="eyebrow">Product Suite</span>
                          <p className="mono mega__hint">Choose a product to explore</p>
                        </div>
                        <div className="mega__grid">
                          {products.map((p, i) => (
                            <Link
                              to={`/products/${p.id}`}
                              key={p.id}
                              className="mega__card"
                              style={{ '--accent': p.accent, '--delay': `${i * 40}ms` }}
                            >
                              <span className="mega__glyph mono">{p.glyph}</span>
                              <div>
                                <h4>{p.name}</h4>
                                <p>{p.tagline}</p>
                              </div>
                              <ChevronRight size={16} className="mega__arrow" />
                            </Link>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          ))}
        </nav>

        <div className="nav__cta">
          <button
            type="button"
            className="nav__search"
            aria-label="Open search (Cmd+K)"
            onClick={dispatchCmdK}
          >
            <Search size={14} />
            <span>Search</span>
            <kbd className="mono">{isMac ? '⌘K' : 'Ctrl K'}</kbd>
          </button>
          {!user ? (
            <>
              <Link to="/login" className="btn btn--ghost"><LogIn size={14} /> Sign In</Link>
              <Link to="/demo" className="btn btn--primary">
                <span>Book Demo</span>
                <span className="btn__arrow">→</span>
              </Link>
            </>
          ) : (
            <div className="nav__user" ref={userMenuRef}>
              <button
                className="nav__user-btn"
                aria-expanded={userOpen}
                onClick={() => setUserOpen((o) => !o)}
              >
                <span className="nav__user-avatar" style={isAdmin ? { background: 'linear-gradient(135deg, #b537ff, #ff2bd1)' } : undefined}>{initials}</span>
                <span className="nav__user-name">{user.name.split(' ')[0]}</span>
                <ChevronRight size={14} className={`nav__user-chev ${userOpen ? 'is-on' : ''}`} />
              </button>
              <AnimatePresence>
                {userOpen && (
                  <motion.div
                    className="user-menu glass"
                    initial={{ opacity: 0, y: -8, filter: 'blur(6px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0)' }}
                    exit={{ opacity: 0, y: -8, filter: 'blur(6px)' }}
                    transition={{ duration: 0.22 }}
                  >
                    <div className="user-menu__head">
                      <strong>{user.name}</strong>
                      <span className="mono">{user.email}</span>
                    </div>
                    {isAdmin && (
                      <Link to="/admin" className="user-menu__item"><Gauge size={14} /> Admin Dashboard</Link>
                    )}
                    <Link to="/portal" className="user-menu__item"><LayoutDashboard size={14} /> Customer Portal</Link>
                    <Link to="/portal/profile" className="user-menu__item"><User size={14} /> Profile</Link>
                    <button className="user-menu__item user-menu__item--logout" onClick={onLogout}><LogOut size={14} /> Sign Out</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        <button
          className="nav__burger"
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((o) => !o)}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="nav__mobile"
            initial={{ opacity: 0, y: -16, clipPath: 'inset(0 0 100% 0)' }}
            animate={{ opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)' }}
            exit={{ opacity: 0, y: -16, clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="container nav__mobile-inner">
              {navLinks.map((l, i) => (
                <motion.div
                  key={l.to}
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + i * 0.06 }}
                >
                  <NavLink to={l.to} end={l.to === '/'} className="nav__mobile-link">
                    <span className="mono nav__mobile-num">{String(i + 1).padStart(2, '0')}</span>
                    <span>{l.label}</span>
                    <ChevronRight size={18} />
                  </NavLink>
                </motion.div>
              ))}
              {user && (
                <>
                  {isAdmin && (
                    <NavLink to="/admin" className="nav__mobile-link">
                      <span className="mono nav__mobile-num"><Gauge size={14} /></span>
                      <span>Admin</span>
                      <ChevronRight size={18} />
                    </NavLink>
                  )}
                  <NavLink to="/portal" className="nav__mobile-link">
                    <span className="mono nav__mobile-num"><LayoutDashboard size={14} /></span>
                    <span>Portal</span>
                    <ChevronRight size={18} />
                  </NavLink>
                </>
              )}
              <div className="nav__mobile-cta">
                {!user ? (
                  <>
                    <Link to="/login" className="btn btn--ghost">Sign In</Link>
                    <Link to="/demo" className="btn btn--primary">Book Demo</Link>
                  </>
                ) : (
                  <>
                    <button className="btn btn--ghost" onClick={onLogout}>Sign Out</button>
                    <Link to="/portal" className="btn btn--primary">Open Portal</Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
