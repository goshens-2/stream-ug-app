import { NavLink, Outlet } from 'react-router-dom';
import { useAppState } from '../context/AppStateContext';
import './AdminLayout.css';

/** Sidebar layout shell for the Admin Panel. */
export function AdminLayout() {
  const { currentUser, logout } = useAppState();

  return (
    <div className="admin-layout">
      <aside className="admin-layout__sidebar">
        <div className="admin-layout__brand">STREAM UG Admin</div>
        {currentUser && <div className="admin-layout__user">{currentUser.name}</div>}
        <nav className="admin-layout__nav">
          <NavLink to="/admin" end>
            Dashboard
          </NavLink>
          <NavLink to="/admin/content">Content</NavLink>
          <NavLink to="/admin/content/new">Upload Content</NavLink>
          <NavLink to="/admin/content-types">Content Types</NavLink>
          <NavLink to="/admin/categories">Categories</NavLink>
          <NavLink to="/admin/requests">Movie Requests</NavLink>
          <NavLink to="/admin/analytics">Analytics</NavLink>
          <NavLink to="/browse">Back to User Panel</NavLink>
          <button type="button" className="admin-layout__logout" onClick={logout}>
            Log Out
          </button>
        </nav>
      </aside>
      <main className="admin-layout__main">
        <Outlet />
      </main>
    </div>
  );
}
