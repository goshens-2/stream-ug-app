import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";

// Pin the production browser client to this project's public Supabase endpoint.
// This avoids a stale/misconfigured Vercel NEXT_PUBLIC_* override silently
// sending browser requests to a different or invalid Supabase project.
const url = "https://bwzbtwclfvdgezyqvswr.supabase.co";
const key = "sb_publishable_fb8HkxyfjD0HGwthYXxYNA_riP2qpp1";

let browserClient: SupabaseClient | undefined;

export function createClient(): SupabaseClient {
  if (!browserClient) {
    browserClient = createSupabaseClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: typeof window !== "undefined" ? window.localStorage : undefined,
      },
    });
  }
  return browserClient;
}
