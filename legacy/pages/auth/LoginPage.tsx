import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAppState } from '../../context/AppStateContext';
import { ADMIN_EMAIL } from '../../data/mockData';
import './AuthPage.css';

/**
 * Login page.
 */
export function LoginPage() {
  const { isAuthenticated, login } = useAppState();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    const from = (location.state as { from?: { pathname?: string } } | null)?.from;
    return <Navigate to={from?.pathname ?? '/browse'} replace />;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);
    if (!result.success) {
      setError(result.error ?? 'Unable to log in.');
      return;
    }
    setError(null);
    const destination = email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() ? '/admin' : '/browse';
    navigate(destination, { replace: true });
  };

  return (
    <div className="auth-page-shell">
      <main className="auth-page">
        <h1>Log In</h1>
        <form className="auth-page__form" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              required
            />
          </label>
          {error && <p className="auth-page__error">{error}</p>}
          <button type="submit" disabled={submitting}>
            {submitting ? 'Logging In…' : 'Log In'}
          </button>
        </form>
        <p className="auth-page__switch">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </main>

      <footer className="auth-page__footer">
        <p>STREAM UG — Engineered by <span style={{ color: '#3b82f6', fontSize: '1.8em', fontWeight: 900, lineHeight: 1, verticalAlign: 'baseline' }}>V</span><span style={{ color: '#7dd3fc', fontWeight: 600 }}>ision</span>.</p><a href="https://visiongrow.vercel.app" target="_blank" rel="noreferrer" style={{ color: '#38bdf8', fontSize: '0.85em', display: 'inline-block', marginTop: '4px' }}>visiongrow.vercel.app</a>
      </footer>
    </div>
  );
}
