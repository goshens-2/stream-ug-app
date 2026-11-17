import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";

const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || "https://bwzbtwclfvdgezyqvswr.supabase.co").trim().replace(/\/$/, "");
const key = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_fb8HkxyfjD0HGwthYXxYNA_riP2qpp1").trim();

let browserClient: SupabaseClient | undefined;

export function createClient(): SupabaseClient {
  if (!url || !key) {
    throw new Error("STREAM UG is not connected to its authentication service. Please contact support.");
  }
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
