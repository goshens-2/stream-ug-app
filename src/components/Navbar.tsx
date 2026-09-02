import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { useAppState } from '../context/AppStateContext';
import './Navbar.css';

/** Top navigation for the User Panel. */
export function Navbar() {
  const { currentUser, logout, notifications, markNotificationRead, contents } = useAppState();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlQuery = searchParams.get('q') ?? '';
  const [draftSearchQuery, setDraftSearchQuery] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchQuery = draftSearchQuery ?? urlQuery;

  const myNotifications = notifications.filter((notification) => notification.userId === currentUser?.id);
  const unreadCount = myNotifications.filter((notification) => !notification.read).length;

  const searchMatches =
    searchQuery.trim().length > 0
      ? contents
        .filter((content) => {
          const query = searchQuery.trim().toLowerCase();
          return (
            content.title.toLowerCase().includes(query) ||
            content.director?.toLowerCase().includes(query) ||
            content.cast?.some((person) => person.toLowerCase().includes(query)) ||
            content.genres?.some((genre) => genre.toLowerCase().includes(query)) ||
            content.language?.toLowerCase().includes(query)
          );
        })
        .slice(0, 6)
      : [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
        setDraftSearchQuery(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = searchQuery.trim();
    if (!trimmed) return;
    setSearchOpen(false);
    setDraftSearchQuery(null);
    navigate(`/browse/search?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <header className="navbar">
      <NavLink to="/browse" className="navbar__brand">
        STREAM UG
      </NavLink>
      <div className="navbar__search" ref={searchRef}>
        <form onSubmit={handleSearchSubmit}>
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => {
              setDraftSearchQuery(event.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            placeholder="Search titles, actors, directors…"
            aria-label="Search STREAM UG"
          />
        </form>
        {searchOpen && searchMatches.length > 0 && (
          <ul className="navbar__search-results">
            {searchMatches.map((content) => (
              <li key={content.id}>
                <Link
                  to={`/browse/watch/${content.id}`}
                  onClick={() => {
                    setSearchOpen(false);
                    setDraftSearchQuery(null);
                  }}
                >
                  {content.title}
                  <span className="navbar__search-year">{content.releaseYear}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
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
