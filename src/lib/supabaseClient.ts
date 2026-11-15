/**
 * Shared Supabase client for STREAM UG.
 * Only the public publishable key belongs in the browser; never use a
 * service_role or secret key in this frontend.
 */
import { createClient } from '@supabase/supabase-js';

// STREAM UG's public project configuration. These values are safe for browser use.
// Environment variables can override them for preview/staging deployments.
const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bwzbtwclfvdgezyqvswr.supabase.co';
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_fb8HkxyfjD0HGwthYXxYNA_riP2qpp1';

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
