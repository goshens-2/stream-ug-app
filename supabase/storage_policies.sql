-- Optional Supabase Storage policies for STREAM UG.
--
-- The current admin content form (`AdminContentFormPage`) accepts plain
-- poster/trailer/video URLs, so no bucket is required out of the box. If
-- you'd rather host those assets in Supabase Storage instead of an external
-- URL, create the buckets below (Storage > New bucket in the dashboard, or
-- `supabase storage buckets create <name>`) and apply these policies so
-- catalog media stays publicly readable while only admins (see
-- `public.is_admin()` in `supabase/schema.sql`) can upload/replace/delete it.
--
-- Bucket names used below: "posters", "trailers", "videos". Adjust to match
-- whatever buckets you actually create.

create policy "Public can read poster/trailer/video assets"
  on storage.objects for select
  using (bucket_id in ('posters', 'trailers', 'videos'));

create policy "Admins can upload poster/trailer/video assets"
  on storage.objects for insert
  with check (
    bucket_id in ('posters', 'trailers', 'videos')
    and public.is_admin()
  );

create policy "Admins can update poster/trailer/video assets"
  on storage.objects for update
  using (
    bucket_id in ('posters', 'trailers', 'videos')
    and public.is_admin()
  )
  with check (
    bucket_id in ('posters', 'trailers', 'videos')
    and public.is_admin()
  );

create policy "Admins can delete poster/trailer/video assets"
  on storage.objects for delete
  using (
    bucket_id in ('posters', 'trailers', 'videos')
    and public.is_admin()
  );
