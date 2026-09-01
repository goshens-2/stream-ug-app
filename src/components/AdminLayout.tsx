import { NavLink, Outlet } from 'react-router-dom';
import './AdminLayout.css';

/** Sidebar layout shell for the Admin Panel. */
export function AdminLayout() {
  return (
    <div className="admin-layout">
      <aside className="admin-layout__sidebar">
        <div className="admin-layout__brand">STREAM UG Admin</div>
        <nav className="admin-layout__nav">
          <NavLink to="/admin" end>
            Dashboard
          </NavLink>
          <NavLink to="/admin/content">Content</NavLink>
          <NavLink to="/admin/content/new">Upload Content</NavLink>
          <NavLink to="/admin/content-types">Content Types</NavLink>
          <NavLink to="/admin/categories">Categories</NavLink>
          <NavLink to="/admin/requests">Movie Requests</NavLink>
          <NavLink to="/">Back to User Panel</NavLink>
        </nav>
      </aside>
      <main className="admin-layout__main">
        <Outlet />
      </main>
    </div>
  );
}
