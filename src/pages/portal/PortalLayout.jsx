import { NavLink, Outlet, Link } from 'react-router-dom';
import { LayoutDashboard, CreditCard, LifeBuoy, UserCog, LogOut, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import './Portal.css';

const links = [
  { to: '/portal', end: true, label: 'Overview', icon: LayoutDashboard },
  { to: '/portal/subscriptions', label: 'Subscriptions', icon: CreditCard },
  { to: '/portal/tickets', label: 'Support Tickets', icon: LifeBuoy },
  { to: '/portal/profile', label: 'Profile', icon: UserCog },
];

export default function PortalLayout() {
  const { user, logout } = useAuth();
  return (
    <section className="portal">
      <div className="container portal__grid">
        <aside className="portal__side glass">
          <div className="portal__user">
            <div className="portal__avatar">{user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
            <div>
              <strong>{user?.name}</strong>
              <span>{user?.email}</span>
            </div>
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
            <Link to="/products" className="portal__quick">
              <span>Explore Products</span>
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
