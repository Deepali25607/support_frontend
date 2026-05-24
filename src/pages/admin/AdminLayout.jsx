import { NavLink, Outlet, Link } from 'react-router-dom';
import { Gauge, Users2, Calendar, Code2, LifeBuoy, Building2, FileText, Mail, Briefcase, Tag, Layers, BookOpen, LogOut, ArrowUpRight, Palette, Boxes } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import NotificationBell from '../../components/NotificationBell.jsx';
import '../portal/Portal.css';

const links = [
  { to: '/admin', end: true, label: 'Overview', icon: Gauge },
  { to: '/admin/products', label: 'Products', icon: Boxes },
  { to: '/admin/leads', label: 'Leads', icon: Users2 },
  { to: '/admin/demos', label: 'Demos', icon: Calendar },
  { to: '/admin/custom-requests', label: 'Custom Requests', icon: Code2 },
  { to: '/admin/tickets', label: 'Support Tickets', icon: LifeBuoy },
  { to: '/admin/customers', label: 'Customers', icon: Building2 },
  { to: '/admin/case-studies', label: 'Case Studies', icon: Briefcase },
  { to: '/admin/blog', label: 'Blog', icon: FileText },
  { to: '/admin/docs', label: 'Docs', icon: BookOpen },
  { to: '/admin/newsletter', label: 'Newsletter', icon: Mail },
  { to: '/admin/coupons', label: 'Coupons', icon: Tag },
  { to: '/admin/site-content', label: 'Site Content', icon: Layers },
  { to: '/admin/theme', label: 'Theme Options', icon: Palette },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  return (
    <section className="portal">
      <div className="container portal__grid">
        <aside className="portal__side glass">
          <div className="portal__user">
            <div className="portal__avatar" style={{ background: 'linear-gradient(135deg, #b537ff, #ff2bd1)' }}>
              {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <strong>{user?.name}</strong>
              <span className="mono" style={{ color: 'var(--neon-violet)', fontSize: '0.66rem', letterSpacing: '0.16em' }}>ADMIN</span>
            </div>
            <NotificationBell />
          </div>
          <nav className="portal__nav">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => `portal__link ${isActive ? 'is-on' : ''}`}>
                <l.icon size={16} />
                <span>{l.label}</span>
              </NavLink>
            ))}
          </nav>
          <div className="portal__side-foot">
            <Link to="/" className="portal__quick">
              <span>Back to Site</span>
              <ArrowUpRight size={14} />
            </Link>
            <button className="portal__logout" onClick={logout}>
              <LogOut size={14} /> <span>Sign out</span>
            </button>
          </div>
        </aside>
        <main className="portal__main">
          <Outlet />
        </main>
      </div>
    </section>
  );
}
