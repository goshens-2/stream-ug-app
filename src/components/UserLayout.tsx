import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import './UserLayout.css';

/** Layout shell for the User Panel. */
export function UserLayout() {
  return (
    <div className="user-layout">
      <Navbar />
      <main className="user-layout__main">
        <Outlet />
      </main>
    </div>
  );
}
