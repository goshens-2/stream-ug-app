import { NavLink, Outlet, Link } from 'react-router-dom';
import { useAppState } from '../context/AppStateContext';
import './AdminLayout.css';

const navItems = [
  { to: '/admin', label: 'Overview', icon: '▦', end: true },
  { to: '/admin/content', label: 'Movie Library', icon: '▣' },
  { to: '/admin/content/new', label: 'Post a Movie', icon: '+' },
  { to: '/admin/categories', label: 'Categories', icon: '◈' },
  { to: '/admin/content-types', label: 'Content Types', icon: '▤' },
  { to: '/admin/requests', label: 'Movie Requests', icon: '✉' },
  { to: '/admin/analytics', label: 'Analytics', icon: '▥' },
  { to: '/admin/users', label: 'Users', icon: '♙' },
];

/** Dedicated administration workspace, visually separate from the customer experience. */
export function AdminLayout() {
  const { currentUser, logout } = useAppState();

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="admin-brand__mark">S</span>
          <span>STREAM <b>UG</b><small>CONTROL CENTRE</small></span>
        </div>
        <div className="admin-sidebar__label">WORKSPACE</div>
        <nav className="admin-nav" aria-label="Admin navigation">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}>
              <span className="admin-nav__icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.label === 'Post a Movie' && <span className="admin-nav__plus">+</span>}
            </NavLink>
          ))}
        </nav>
        <div className="admin-sidebar__bottom">
          <div className="admin-profile">
            <div className="admin-profile__avatar">{(currentUser?.name || 'A').charAt(0).toUpperCase()}</div>
            <div className="admin-profile__details">
              <strong>{currentUser?.name || 'Administrator'}</strong>
              <small>Administrator</small>
            </div>
            <button type="button" onClick={logout} aria-label="Log out" title="Log out">⇥</button>
          </div>
        </div>
      </aside>
      <div className="admin-workspace">
        <header className="admin-topbar">
          <div><span className="admin-topbar__eyebrow">STREAM UG / ADMIN</span><strong>Management Dashboard</strong></div>
          <Link to="/browse" className="admin-topbar-link"><span aria-hidden="true">↗</span> View streaming site</Link>
        </header>
        <main className="admin-main"><Outlet /></main>
      </div>
    </div>
  );
}
