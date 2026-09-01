/**
 * Reusable Supabase client for the STREAM UG frontend.
 *
 * The URL and anon/publishable key are read from Vite environment variables
 * (see `.env.example`) so no secrets are ever hardcoded in source control.
 * Copy `.env.example` to `.env` and fill in your project's values to enable
 * the connection locally.
 */
import { createClient } from '@supabase/supabase-js';

const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Normalize a Supabase URL by stripping any API path (e.g. `/rest/v1`) that
 * may have been mistakenly copied along with the project URL. The Supabase
 * client library expects the bare project URL and adds API paths itself.
 */
function normalizeSupabaseUrl(url: string | undefined): string | undefined {
  if (!url) return url;
  const match = url.match(/^https?:\/\/[^/]+/);
  return match ? match[0] : url;
}

const supabaseUrl = normalizeSupabaseUrl(rawSupabaseUrl);

if (rawSupabaseUrl && supabaseUrl && rawSupabaseUrl !== supabaseUrl) {
  // eslint-disable-next-line no-console
  console.warn(
    `VITE_SUPABASE_URL should be the base project URL (e.g. ${supabaseUrl}), ` +
      `not an API path like "${rawSupabaseUrl}". Using "${supabaseUrl}" instead.`,
  );
}

if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.warn(
    'Supabase environment variables are not set. Add VITE_SUPABASE_URL and ' +
      'VITE_SUPABASE_ANON_KEY to a .env file (see .env.example) to enable ' +
      'Supabase-backed features. The app will continue to run on mock data.',
  );
}

/** Whether Supabase is configured for this build (URL + key both present). */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

/**
 * The shared Supabase client instance. Safe to import anywhere in the app.
 * When environment variables are missing, this still creates a client with
 * placeholder values so importing modules don't crash; callers should check
 * `isSupabaseConfigured` before relying on live data.
 */
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
);
