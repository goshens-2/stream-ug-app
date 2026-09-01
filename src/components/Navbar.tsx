import { NavLink } from 'react-router-dom';
import { useAppState } from '../context/AppStateContext';
import './Navbar.css';

/** Top navigation for the User Panel. */
export function Navbar() {
  const { isSubscribed, currentUser, session, logout } = useAppState();

  return (
    <header className="navbar">
      <NavLink to="/browse" className="navbar__brand">
        STREAM UG
      </NavLink>
      <nav className="navbar__links">
        <NavLink to="/browse" end>
          Browse
        </NavLink>
        <NavLink to="/browse/requests">Request a Movie</NavLink>
        {currentUser?.isAdmin && <NavLink to="/admin">Admin Panel</NavLink>}
      </nav>
      <div className="navbar__account">
        <span className="navbar__status">
          {isSubscribed ? 'Subscribed ✓' : 'Not Subscribed'}
          {session?.isSharedAccess && ' (Shared Access)'}
        </span>
        {currentUser && <span className="navbar__user">{currentUser.name}</span>}
        <button type="button" className="navbar__subscribe" onClick={logout}>
          Log Out
        </button>
      </div>
    </header>
  );
}
