-- STREAM UG starter Supabase schema.
--
-- This is guidance for the tables the app is likely to need, matching the
-- client-side types in `src/types/index.ts`. It is NOT auto-applied; run it
-- in the Supabase SQL editor (or via the Supabase CLI/migrations) once you
-- are ready to move off mock data. Adjust names/types/constraints as your
-- product requirements evolve.
--
-- Tables intentionally use snake_case columns (Postgres/Supabase convention);
-- the frontend API layer in `src/api/` maps between snake_case rows and the
-- camelCase types used throughout the app.

-- Enable UUID generation.
create extension if not exists "pgcrypto";

-- Keep the SECURITY DEFINER admin helper outside the exposed Data API schema.
create schema if not exists private;

-- Profiles: one row per authenticated user, linked 1:1 to Supabase Auth users.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  email text not null unique,
  -- Trusted, database-backed admin flag. Only grant this via the Supabase
  -- dashboard/SQL editor (service_role) — never let the frontend set it.
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Automatically create a `profiles` row whenever a new Supabase Auth user
-- signs up, using the `name` passed in `options.data` on `supabase.auth.signUp`.
-- This keeps profile creation server-side/trusted instead of relying on the
-- client to insert its own profile row after signup.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Helper used by RLS policies below to check the caller's admin flag without
-- recursively re-evaluating the `profiles` RLS policy for that lookup.
create or replace function private.is_admin()
returns boolean
language sql
security definer set search_path = ''
stable
as $$
  select coalesce((select p.is_admin from public.profiles p where p.id = (select auth.uid())), false);
$$;

-- Prevents a non-admin user from granting themselves admin access through
-- the "update their own profile" policy below — `is_admin` can only change
-- via a service_role/admin update.
create or replace function public.protect_profile_privileges()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  if not private.is_admin() then
    new.is_admin := old.is_admin;
  end if;
  return new;
end;
$$;

drop trigger if exists before_profile_update on public.profiles;
create trigger before_profile_update
  before update on public.profiles
  for each row execute procedure public.protect_profile_privileges();

-- Content types: Movie, Series, Music Video, Documentary, TV Show, ...
create table if not exists public.content_types (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text
);

-- Categories used to group content in the User Panel.
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text
);

-- Content: the core streamable items (movies, episodes, videos, etc).
create table if not exists public.content (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  content_type_id uuid references public.content_types (id) on delete set null,
  category_id uuid references public.categories (id) on delete set null,
  poster_url text,
  trailer_url text,
  video_url text,
  watermark_enabled boolean not null default true,
  watermark_text text not null default 'STREAM UG',
  watermark_opacity numeric not null default 0.5,
  watermark_position text not null default 'bottom-right'
    check (watermark_position in ('top-left', 'top-right', 'bottom-left', 'bottom-right', 'center')),
  duration_minutes integer not null default 0,
  release_year integer,
  director text,
  "cast" text[] not null default '{}',
  genres text[] not null default '{}',
  language text,
  age_rating text,
  embed_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Kept separate so projects that ran an earlier version of this starter
-- schema receive the richer catalog metadata too.
alter table public.content add column if not exists director text;
alter table public.content add column if not exists cast text[] not null default '{}';
alter table public.content add column if not exists genres text[] not null default '{}';
alter table public.content add column if not exists language text;
alter table public.content add column if not exists age_rating text;
alter table public.content add column if not exists embed_url text;

-- Movie/content requests submitted by users, reviewed by admins.
create table if not exists public.movie_requests (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  note text,
  requested_by uuid references public.profiles (id) on delete set null,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'fulfilled')),
  created_at timestamptz not null default now(),
  -- Set by an admin when fulfilling a request, linking it to the uploaded
  -- content so the requester can find it and be notified.
  fulfilled_content_id uuid references public.content (id) on delete set null
);

-- Ratings submitted by users for content, used for recommendations.
create table if not exists public.ratings (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references public.content (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  score smallint not null check (score between 1 and 5),
  created_at timestamptz not null default now(),
  unique (content_id, user_id)
);

-- A user's saved/favorited content ("My Watchlist").
create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  content_id uuid not null references public.content (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, content_id)
);

-- Per-(user, content) watch progress, powering "Continue Watching" and
-- "Recently Viewed" and the "most watched movie" admin analytic.
create table if not exists public.view_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  content_id uuid not null references public.content (id) on delete cascade,
  progress_seconds integer not null default 0,
  duration_seconds integer not null default 0,
  updated_at timestamptz not null default now(),
  unique (user_id, content_id)
);

-- Logs of user searches, powering the "most searched movie" admin analytic.
create table if not exists public.search_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  query text not null,
  matched_content_id uuid references public.content (id) on delete set null,
  created_at timestamptz not null default now()
);

-- In-app notifications, e.g. alerting a user their requested content is
-- now available to watch.
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null default 'system'
    check (type in ('request_fulfilled', 'recommendation', 'system')),
  message text not null,
  content_id uuid references public.content (id) on delete set null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- Row Level Security: enable and add sane starter policies.
alter table public.profiles enable row level security;
alter table public.content_types enable row level security;
alter table public.categories enable row level security;
alter table public.content enable row level security;
alter table public.movie_requests enable row level security;
alter table public.ratings enable row level security;
alter table public.favorites enable row level security;
alter table public.view_history enable row level security;
alter table public.search_logs enable row level security;
alter table public.notifications enable row level security;

-- Anyone signed in can read published catalog data.
create policy "Content types are readable by authenticated users"
  on public.content_types for select to authenticated using (true);
create policy "Categories are readable by authenticated users"
  on public.categories for select to authenticated using (true);
create policy "Content is readable by authenticated users"
  on public.content for select to authenticated using (true);

-- Users can only see/manage their own profile, requests, and ratings.
create policy "Users can view their own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);
-- Lets an admin manage other users from the Admin Panel (e.g. promote a
-- user to admin, or revoke admin access). `protect_profile_privileges()`
-- above already guarantees a *non*-admin caller can never flip `is_admin`
-- via this or any other update policy, so this is safe to combine with the
-- "own profile" policy.
create policy "Admins can update any profile"
  on public.profiles for update using (private.is_admin()) with check (private.is_admin());
-- Lets a signed-in user delete their own `profiles` row from "Delete
-- Account" in Account Settings. Note: the anon/publishable key used by the
-- frontend cannot delete the underlying `auth.users` row (that requires a
-- service-role key) — pair this with a periodic backend job that purges
-- `auth.users` rows with no matching `profiles` row.
create policy "Users can delete their own profile"
  on public.profiles for delete using (auth.uid() = id);
create policy "Admins can view all profiles"
  on public.profiles for select using (private.is_admin());

create policy "Users can view their own requests"
  on public.movie_requests for select using (auth.uid() = requested_by);
create policy "Users can create their own requests"
  on public.movie_requests for insert with check (auth.uid() = requested_by);
create policy "Admins can view all requests"
  on public.movie_requests for select using (private.is_admin());
create policy "Admins can update requests"
  on public.movie_requests for update using (private.is_admin());

create policy "Users can view their own ratings"
  on public.ratings for select using (auth.uid() = user_id);
create policy "Users can upsert their own ratings"
  on public.ratings for insert with check (auth.uid() = user_id);
create policy "Users can update their own ratings"
  on public.ratings for update using (auth.uid() = user_id);

create policy "Users can manage their own favorites"
  on public.favorites for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage their own view history"
  on public.view_history for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Admins can view all view history"
  on public.view_history for select using (private.is_admin());

create policy "Users can create their own search logs"
  on public.search_logs for insert with check (auth.uid() = user_id or user_id is null);
create policy "Users can view their own search logs"
  on public.search_logs for select using (auth.uid() = user_id);
create policy "Admins can view all search logs"
  on public.search_logs for select using (private.is_admin());

create policy "Users can view their own notifications"
  on public.notifications for select using (auth.uid() = user_id);
create policy "Users can update their own notifications"
  on public.notifications for update using (auth.uid() = user_id);
create policy "Admins can manage all notifications"
  on public.notifications for all using (private.is_admin()) with check (private.is_admin());

-- Admins (rows in `profiles` with `is_admin = true`) can manage the catalog.
-- The `is_admin` flag itself is only ever set from the Supabase
-- dashboard/SQL editor (service_role), never by the frontend, so this is a
-- trusted, database-backed permission check rather than a client-side one.
create policy "Admins can manage content types"
  on public.content_types for all using (private.is_admin()) with check (private.is_admin());
create policy "Admins can manage categories"
  on public.categories for all using (private.is_admin()) with check (private.is_admin());
create policy "Admins can manage content"
  on public.content for all using (private.is_admin()) with check (private.is_admin());


-- Explicit Data API grants for the authenticated frontend role.
grant usage on schema public to authenticated;
grant select, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.content_types, public.categories, public.content to authenticated;
grant select, insert, update on public.movie_requests, public.ratings to authenticated;
grant select, insert, update, delete on public.favorites, public.view_history to authenticated;
grant select, insert on public.search_logs to authenticated;
grant select, insert, update, delete on public.notifications to authenticated;

-- The admin helper is used only by RLS and lives in a non-exposed schema.
grant usage on schema private to authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.protect_profile_privileges() from public, anon, authenticated;
revoke execute on function private.is_admin() from public, anon;
grant execute on function private.is_admin() to authenticated;
