/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  /**
   * Optional bootstrap password for the mock/local-dev admin account
   * (`admin@stream.com`), used only when Supabase isn't configured. See
   * `.env.example` and the "Admin access" section of the README.
   */
  readonly VITE_MOCK_ADMIN_PASSWORD?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
