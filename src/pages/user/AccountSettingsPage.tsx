import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../../context/AppStateContext';
import './AccountSettingsPage.css';

/**
 * Account settings: change username, change password, and delete account —
 * the actions available from the Navbar's profile menu.
 */
export function AccountSettingsPage() {
  const { currentUser, changeUsername, changePassword, deleteAccount, logout } = useAppState();
  const navigate = useNavigate();

  const [username, setUsername] = useState(currentUser?.name ?? '');
  const [usernameStatus, setUsernameStatus] = useState<{ ok: boolean; message: string } | null>(null);
  const [usernameSubmitting, setUsernameSubmitting] = useState(false);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<{ ok: boolean; message: string } | null>(null);
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);

  const [deleteStatus, setDeleteStatus] = useState<{ ok: boolean; message: string } | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const handleUsernameSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setUsernameSubmitting(true);
    const result = await changeUsername(username);
    setUsernameSubmitting(false);
    setUsernameStatus(
      result.success
        ? { ok: true, message: 'Username updated.' }
        : { ok: false, message: result.error ?? 'Unable to update username.' },
    );
  };

  const handlePasswordSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setPasswordStatus({ ok: false, message: 'Passwords do not match.' });
      return;
    }
    setPasswordSubmitting(true);
    const result = await changePassword(password);
    setPasswordSubmitting(false);
    if (result.success) {
      setPassword('');
      setConfirmPassword('');
    }
    setPasswordStatus(
      result.success
        ? { ok: true, message: 'Password changed.' }
        : { ok: false, message: result.error ?? 'Unable to change password.' },
    );
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to permanently delete your account? This cannot be undone.',
    );
    if (!confirmed) return;
    setDeleteSubmitting(true);
    const result = await deleteAccount();
    setDeleteSubmitting(false);
    if (result.success) {
      navigate('/', { replace: true });
      return;
    }
    setDeleteStatus({ ok: false, message: result.error ?? 'Unable to delete account.' });
  };

  return (
    <div className="account-settings-page">
      <h1>Account Settings</h1>

      <section id="change-username">
        <h2>Change Username</h2>
        <form onSubmit={handleUsernameSubmit}>
          <label>
            Username
            <input value={username} onChange={(e) => setUsername(e.target.value)} required />
          </label>
          {usernameStatus && (
            <p className={usernameStatus.ok ? 'account-settings-page__success' : 'account-settings-page__error'}>
              {usernameStatus.message}
            </p>
          )}
          <button type="submit" disabled={usernameSubmitting}>
            {usernameSubmitting ? 'Saving…' : 'Save Username'}
          </button>
        </form>
      </section>

      <section id="change-password">
        <h2>Change Password</h2>
        <form onSubmit={handlePasswordSubmit}>
          <label>
            New Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Choose a new password"
              required
            />
          </label>
          <label>
            Confirm New Password
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your new password"
              required
            />
          </label>
          {passwordStatus && (
            <p className={passwordStatus.ok ? 'account-settings-page__success' : 'account-settings-page__error'}>
              {passwordStatus.message}
            </p>
          )}
          <button type="submit" disabled={passwordSubmitting}>
            {passwordSubmitting ? 'Saving…' : 'Change Password'}
          </button>
        </form>
      </section>

      <section id="delete-account" className="account-settings-page__danger">
        <h2>Delete Account</h2>
        <p>Permanently delete your account and all associated data. This cannot be undone.</p>
        {deleteStatus && <p className="account-settings-page__error">{deleteStatus.message}</p>}
        <button
          type="button"
          className="account-settings-page__danger-button"
          onClick={handleDelete}
          disabled={deleteSubmitting}
        >
          {deleteSubmitting ? 'Deleting…' : 'Delete My Account'}
        </button>
      </section>

      <p>
        <button type="button" className="account-settings-page__danger-button" onClick={logout}>
          Log Out
        </button>
      </p>
    </div>
  );
}
