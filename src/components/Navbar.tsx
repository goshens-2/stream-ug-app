import { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAppState } from '../context/AppStateContext';
import './Navbar.css';

/** Top navigation for the User Panel. */
export function Navbar() {
  const { currentUser, logout, notifications, markNotificationRead } = useAppState();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const myNotifications = notifications.filter((n) => n.userId === currentUser?.id);
  const unreadCount = myNotifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="navbar">
      <NavLink to="/browse" className="navbar__brand">
        STREAM UG
      </NavLink>
      <nav className="navbar__links">
        <NavLink to="/browse" end>
          Browse
        </NavLink>
        <NavLink to="/browse/trailers">Trailers</NavLink>
        <NavLink to="/browse/watchlist">My Watchlist</NavLink>
        <NavLink to="/browse/requests">Request a Movie</NavLink>
        {currentUser?.isAdmin && <NavLink to="/admin">Admin Panel</NavLink>}
      </nav>
      <div className="navbar__account">
        <div className="navbar__notif" ref={notifRef}>
          <button
            type="button"
            className="navbar__icon-btn"
            aria-label="Notifications"
            onClick={() => setNotifOpen((open) => !open)}
          >
            🔔
            {unreadCount > 0 && <span className="navbar__badge">{unreadCount}</span>}
          </button>
          {notifOpen && (
            <div className="navbar__dropdown navbar__dropdown--notif">
              <h3>Notifications</h3>
              {myNotifications.length === 0 && <p className="navbar__dropdown-empty">You're all caught up.</p>}
              <ul>
                {myNotifications.slice(0, 8).map((notification) => (
                  <li
                    key={notification.id}
                    className={notification.read ? '' : 'navbar__notif-item--unread'}
                    onClick={() => markNotificationRead(notification.id)}
                  >
                    {notification.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="navbar__profile" ref={profileRef}>
          <button type="button" className="navbar__icon-btn navbar__user" onClick={() => setProfileOpen((open) => !open)}>
            {currentUser?.name ?? 'Account'} ▾
          </button>
          {profileOpen && (
            <div className="navbar__dropdown navbar__dropdown--profile">
              <button type="button" onClick={() => { setProfileOpen(false); navigate('/browse/account'); }}>
                Account Settings
              </button>
              <button type="button" onClick={() => { setProfileOpen(false); navigate('/browse/account#change-password'); }}>
                Change Password
              </button>
              <button type="button" onClick={() => { setProfileOpen(false); navigate('/browse/account#change-username'); }}>
                Change Username
              </button>
              <button type="button" onClick={() => { setProfileOpen(false); navigate('/browse/account#delete-account'); }}>
                Delete Account
              </button>
              <button type="button" className="navbar__logout" onClick={logout}>
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
