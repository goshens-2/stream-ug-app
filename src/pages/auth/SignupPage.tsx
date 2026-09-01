import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAppState } from '../../context/AppStateContext';
import { isSupabaseConfigured } from '../../lib/supabaseClient';
import './AuthPage.css';

/** Signup page: creates a new user + account record and logs them in. */
export function SignupPage() {
  const { isAuthenticated, signup } = useAppState();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/browse" replace />;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    const result = await signup(username, email, password);
    setSubmitting(false);
    if (!result.success) {
      setError(result.error ?? 'Unable to sign up.');
      return;
    }
    setError(null);
    // When Supabase requires email confirmation, there's no session yet, so
    // stay on this page and prompt the user to check their inbox instead of
    // navigating to a route that `ProtectedRoute` would immediately bounce
    // them out of.
    if (isSupabaseConfigured) {
      setConfirmationSent(true);
      return;
    }
    navigate('/browse', { replace: true });
  };

  if (confirmationSent) {
    return (
      <div className="auth-page">
        <h1>Check Your Email</h1>
        <p>We sent a confirmation link to {email}. Confirm your address, then log in.</p>
        <p className="auth-page__switch">
          <Link to="/login">Go to Log In</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <h1>Sign Up</h1>
      <form className="auth-page__form" onSubmit={handleSubmit}>
        <label>
          Username
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Choose a username"
            required
          />
        </label>
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
            placeholder="Choose a password"
            required
          />
        </label>
        <label>
          Confirm Password
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter your password"
            required
          />
        </label>
        {error && <p className="auth-page__error">{error}</p>}
        <button type="submit" disabled={submitting}>
          {submitting ? 'Creating Account…' : 'Create Account'}
        </button>
      </form>
      <p className="auth-page__switch">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}

