/**
 * Reusable Supabase client for the STREAM UG frontend.
 *
 * The URL and anon/publishable key are read from Vite environment variables
 * (see `.env.example`) so no secrets are ever hardcoded in source control.
 * Copy `.env.example` to `.env` and fill in your project's values to enable
 * the connection locally.
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

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
