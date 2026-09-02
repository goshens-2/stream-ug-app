import { useState } from 'react';
import { useAppState } from '../../context/AppStateContext';

/**
 * Admin view of all signed-up users (backed by the `profiles` table), with
 * the ability to promote/revoke admin access. Writes go through
 * `setUserAdmin`, which is only permitted for admins by the
 * `"Admins can update any profile"` RLS policy in `supabase/schema.sql`.
 */
export function AdminUsersPage() {
  const { users, currentUser, setUserAdmin } = useAppState();
  const [error, setError] = useState<string | null>(null);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);

  const handleToggleAdmin = async (userId: string, nextIsAdmin: boolean) => {
    setError(null);
    setPendingUserId(userId);
    const result = await setUserAdmin(userId, nextIsAdmin);
    setPendingUserId(null);
    if (!result.success) {
      setError(result.error ?? 'Unable to update user.');
    }
  };

  return (
    <div>
      <h1>Users</h1>
      <p>{users.length} registered user(s).</p>
      {error && <p role="alert">{error}</p>}
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.isAdmin ? 'Admin' : 'User'}</td>
              <td>
                <button
                  type="button"
                  disabled={pendingUserId === user.id || user.id === currentUser?.id}
                  onClick={() => void handleToggleAdmin(user.id, !user.isAdmin)}
                >
                  {user.isAdmin ? 'Revoke admin' : 'Make admin'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
