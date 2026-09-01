import { NavLink } from 'react-router-dom';
import { useAppState } from '../context/AppStateContext';
import './Navbar.css';

/** Top navigation for the User Panel. */
export function Navbar() {
  const { isSubscribed, toggleSubscription } = useAppState();

  return (
    <header className="navbar">
      <NavLink to="/" className="navbar__brand">
        STREAM UG
      </NavLink>
      <nav className="navbar__links">
        <NavLink to="/" end>
          Home
        </NavLink>
        <NavLink to="/requests">Request a Movie</NavLink>
        <NavLink to="/admin">Admin Panel</NavLink>
      </nav>
      <button type="button" className="navbar__subscribe" onClick={toggleSubscription}>
        {isSubscribed ? 'Subscribed ✓' : 'Subscribe'}
      </button>
    </header>
  );
}
