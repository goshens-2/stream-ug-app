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

  const profileRow = profile as ProfileRow;

  return {
    id: profileRow.id,
    name: profileRow.name,
    email: profileRow.email,
    isAdmin: profileRow.is_admin,
  };
}
