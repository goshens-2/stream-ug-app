import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAppState } from '../../context/AppStateContext';
import './AuthPage.css';

/** Signup page: creates a new user + account record and logs them in. */
export function SignupPage() {
  const { isAuthenticated, signup } = useAppState();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (isAuthenticated) {
    return <Navigate to="/browse" replace />;
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    const result = signup(name, email, password);
    if (!result.success) {
      setError(result.error ?? 'Unable to sign up.');
      return;
    }
    setError(null);
    navigate('/browse', { replace: true });
  };

  return (
    <div className="auth-page">
      <h1>Sign Up</h1>
      <form className="auth-page__form" onSubmit={handleSubmit}>
        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required />
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
        <button type="submit">Create Account</button>
      </form>
      <p className="auth-page__switch">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}
