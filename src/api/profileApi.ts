/**
 * Profile data access, used to hydrate the signed-in `User` from Supabase
 * after Supabase Auth reports a session. Only used when Supabase is
 * configured; mock/in-memory auth in `AppStateContext` never calls this
 * module.
 */
import { supabase } from '../lib/supabaseClient';
import type { User } from '../types';

interface ProfileRow {
  id: string;
  name: string;
  email: string;
  is_admin: boolean;
}

function mapProfileRow(profileRow: ProfileRow): User {
  return {
    id: profileRow.id,
    name: profileRow.name,
    email: profileRow.email,
    isAdmin: profileRow.is_admin,
  };
}

/**
 * Loads the `profiles` row for `userId` and returns it as a `User`. Returns
 * `null` if no profile exists yet (e.g. the `handle_new_user` trigger hasn't
 * run, or was never installed).
 */
export async function fetchProfile(userId: string): Promise<User | null> {
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (profileError) throw profileError;
  if (!profile) return null;

  return mapProfileRow(profile as ProfileRow);
}

/**
 * Loads every `profiles` row, for the Admin Panel's "Users" page. Only
 * returns real data for a signed-in admin — the `"Admins can view all
 * profiles"` RLS policy in `supabase/schema.sql` means a non-admin caller
 * simply gets back their own single row.
 */
export async function fetchAllProfiles(): Promise<User[]> {
  const { data, error } = await supabase.from('profiles').select('*').order('name', { ascending: true });
  if (error) throw error;
  return (data as ProfileRow[]).map(mapProfileRow);
}

/**
 * Promotes/demotes another user's admin flag. Only succeeds when the caller
 * is an admin — enforced by the `"Admins can update any profile"` RLS policy
 * and the `protect_profile_privileges` trigger in `supabase/schema.sql`,
 * which together make this a trusted, database-backed permission check
 * rather than a client-side one.
 */
export async function setProfileAdmin(userId: string, isAdmin: boolean): Promise<void> {
  const { error } = await supabase.from('profiles').update({ is_admin: isAdmin }).eq('id', userId);
  if (error) throw error;
}

/** Updates the signed-in user's username (`profiles.name`). */
export async function updateProfileName(userId: string, name: string): Promise<void> {
  const { error } = await supabase.from('profiles').update({ name }).eq('id', userId);
  if (error) throw error;
}

/** Changes the signed-in user's password via Supabase Auth. */
export async function updateAuthPassword(password: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
}

/**
 * Best-effort account deletion for the signed-in user. The anon/publishable
 * key used by the frontend cannot delete `auth.users` rows (that requires a
 * service-role key), so this deletes the user's own `profiles` row (which
 * requires the `"Users can delete their own profile"` RLS policy in
 * `supabase/schema.sql`) and then signs them out. A backend job/admin should
 * periodically purge orphaned `auth.users` rows with no matching profile.
 */
export async function deleteOwnProfile(userId: string): Promise<void> {
  const { error } = await supabase.from('profiles').delete().eq('id', userId);
  if (error) throw error;
}

