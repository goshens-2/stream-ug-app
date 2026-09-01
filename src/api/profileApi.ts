/**
 * Profile/subscription data access, used to hydrate the signed-in `User`
 * (including subscription and shared-access state) from Supabase after
 * Supabase Auth reports a session. Only used when Supabase is configured;
 * mock/in-memory auth in `AppStateContext` never calls this module.
 */
import { supabase } from '../lib/supabaseClient';
import type { Subscription, User } from '../types';

interface ProfileRow {
  id: string;
  name: string;
  email: string;
  is_subscribed: boolean;
  is_admin: boolean;
}

interface SubscriptionRow {
  id: string;
  user_id: string;
  plan: Subscription['plan'];
  is_active: boolean;
  shared_with_user_ids: string[];
  max_shared_users: number;
  renews_at: string | null;
}

function mapSubscriptionRow(row: SubscriptionRow): Subscription {
  return {
    id: row.id,
    plan: row.plan,
    isActive: row.is_active,
    sharedWithUserIds: row.shared_with_user_ids ?? [],
    maxSharedUsers: row.max_shared_users,
    renewsAt: row.renews_at ?? '',
  };
}

/**
 * Loads the `profiles` row (and, if present, the matching `subscriptions`
 * row) for `userId` and returns it as a `User`. Returns `null` if no profile
 * exists yet (e.g. the `handle_new_user` trigger hasn't run, or was never
 * installed).
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

  const { data: subscription, error: subscriptionError } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (subscriptionError) throw subscriptionError;

  return {
    id: profileRow.id,
    name: profileRow.name,
    email: profileRow.email,
    isSubscribed: profileRow.is_subscribed,
    isAdmin: profileRow.is_admin,
    subscription: subscription ? mapSubscriptionRow(subscription as SubscriptionRow) : undefined,
  };
}

/**
 * Determines whether `userId` currently has "shared access" through someone
 * else's active subscription (family-share), by looking for a subscription
 * row whose `shared_with_user_ids` includes them. Returns the sharing
 * subscriber's user id, or `null` if none is found. Relies on the
 * "Users can view subscriptions that share access with them" RLS policy.
 */
export async function fetchSharedAccessGrantor(userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('user_id, is_active, shared_with_user_ids')
    .eq('is_active', true)
    .contains('shared_with_user_ids', [userId])
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return (data as { user_id: string } | null)?.user_id ?? null;
}
