import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAppState } from '../../context/AppStateContext';
import './AuthPage.css';

/**
 * Login page. Supports logging in with a user's own password, or with a
 * shared password from a subscriber who has granted access (family-share).
 */
export function LoginPage() {
  const { isAuthenticated, login } = useAppState();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (isAuthenticated) {
    const from = (location.state as { from?: { pathname?: string } } | null)?.from;
    return <Navigate to={from?.pathname ?? '/browse'} replace />;
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const result = login(email, password);
    if (!result.success) {
      setError(result.error ?? 'Unable to log in.');
      return;
    }
    setError(null);
    navigate('/browse', { replace: true });
  };

  return (
    <div className="auth-page">
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
            placeholder="Your password or a shared password"
            required
          />
        </label>
        {error && <p className="auth-page__error">{error}</p>}
        <button type="submit">Log In</button>
      </form>
      <p className="auth-page__hint">
        Tip: you can log in with your own password, or with a shared password from a
        subscriber who has added you to their family-share plan.
      </p>
      <p className="auth-page__switch">
        Don't have an account? <Link to="/signup">Sign up</Link>
      </p>
    </div>
  );
}
