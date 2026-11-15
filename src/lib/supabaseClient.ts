/**
 * Shared Supabase client for STREAM UG.
 * Only the public publishable key belongs in the browser; never use a
 * service_role or secret key in this frontend.
 */
import { createClient } from '@supabase/supabase-js';

const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

/** Normalize a project URL if an API path was accidentally appended. */
function normalizeSupabaseUrl(url: string | undefined): string | undefined {
  if (!url) return url;
  const match = url.match(/^https?:\/\/[^/]+/);
  return match ? match[0] : url;
}

const supabaseUrl = normalizeSupabaseUrl(rawSupabaseUrl);

if (rawSupabaseUrl && supabaseUrl && rawSupabaseUrl !== supabaseUrl) {
  console.warn(
    `VITE_SUPABASE_URL should be the base project URL. Using "${supabaseUrl}".`,
  );
}

if (!supabaseUrl || !supabasePublishableKey) {
  console.warn(
    'Supabase is not configured. Set VITE_SUPABASE_URL and ' +
      'VITE_SUPABASE_PUBLISHABLE_KEY to enable database-backed features.',
  );
}

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabasePublishableKey || 'placeholder-publishable-key',
);
