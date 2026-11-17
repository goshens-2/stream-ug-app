import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAppState } from '../../context/AppStateContext';
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
    // Supabase must have "Confirm email" disabled for this direct-login flow.
    // With confirmation disabled, signup returns a session and the user enters
    // the app immediately without an email step.
    navigate('/browse', { replace: true });
  };

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

