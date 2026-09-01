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

-- Profiles: one row per authenticated user, linked 1:1 to Supabase Auth users.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  email text not null unique,
  is_subscribed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Subscriptions: plan + password-sharing state for a profile.
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  plan text not null check (plan in ('free', 'basic', 'family-share', 'premium')),
  is_active boolean not null default true,
  shared_with_user_ids uuid[] not null default '{}',
  max_shared_users integer not null default 0,
  renews_at timestamptz,
  created_at timestamptz not null default now()
);

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
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Movie/content requests submitted by users, reviewed by admins.
create table if not exists public.movie_requests (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  note text,
  requested_by uuid references public.profiles (id) on delete set null,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'fulfilled')),
  created_at timestamptz not null default now()
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

-- Row Level Security: enable and add sane starter policies.
alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.content_types enable row level security;
alter table public.categories enable row level security;
alter table public.content enable row level security;
alter table public.movie_requests enable row level security;
alter table public.ratings enable row level security;

-- Anyone signed in can read published catalog data.
create policy "Content types are readable by authenticated users"
  on public.content_types for select to authenticated using (true);
create policy "Categories are readable by authenticated users"
  on public.categories for select to authenticated using (true);
create policy "Content is readable by authenticated users"
  on public.content for select to authenticated using (true);

-- Users can only see/manage their own profile, requests, ratings, subscription.
create policy "Users can view their own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can view their own subscription"
  on public.subscriptions for select using (auth.uid() = user_id);

create policy "Users can view their own requests"
  on public.movie_requests for select using (auth.uid() = requested_by);
create policy "Users can create their own requests"
  on public.movie_requests for insert with check (auth.uid() = requested_by);

create policy "Users can view their own ratings"
  on public.ratings for select using (auth.uid() = user_id);
create policy "Users can upsert their own ratings"
  on public.ratings for insert with check (auth.uid() = user_id);
create policy "Users can update their own ratings"
  on public.ratings for update using (auth.uid() = user_id);

-- Admin write access to catalog tables should be granted via a separate
-- `service_role`-backed admin API/dashboard, or by adding an `is_admin`
-- column/claim and matching policies once the admin flow is finalized.
