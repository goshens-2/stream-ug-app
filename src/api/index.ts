/**
 * Barrel export for the STREAM UG data-access layer. Each module reads from
 * Supabase when `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` are configured
 * (see `src/lib/supabaseClient.ts`) and otherwise falls back to the mock data
 * in `src/data/mockData.ts`, so the app keeps working either way.
 */
export * from './contentApi';
export * from './categoriesApi';
export * from './contentTypesApi';
export * from './movieRequestsApi';
export * from './ratingsApi';
export * from './profileApi';
