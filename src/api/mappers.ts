/**
 * Row <-> app-type mappers for the Supabase schema in `supabase/schema.sql`.
 * Supabase/Postgres rows use snake_case columns; the app's shared types
 * (`src/types/index.ts`) use camelCase, so each fetch/write helper in
 * `src/api/` converts through these functions.
 */
import type { Category, Content, ContentType, MovieRequest, Rating, WatermarkSettings } from '../types';

export interface ContentTypeRow {
  id: string;
  name: string;
  description: string | null;
}

export interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

export interface ContentRow {
  id: string;
  title: string;
  description: string;
  content_type_id: string | null;
  category_id: string | null;
  poster_url: string | null;
  trailer_url: string | null;
  video_url: string | null;
  watermark_enabled: boolean;
  watermark_text: string;
  watermark_opacity: number;
  watermark_position: WatermarkSettings['position'];
  duration_minutes: number;
  release_year: number | null;
  created_at: string;
  updated_at: string;
}

export interface MovieRequestRow {
  id: string;
  title: string;
  note: string | null;
  requested_by: string | null;
  status: MovieRequest['status'];
  created_at: string;
}

export interface RatingRow {
  id: string;
  content_id: string;
  user_id: string;
  score: number;
  created_at: string;
}

export function mapContentTypeRow(row: ContentTypeRow): ContentType {
  return { id: row.id, name: row.name, description: row.description ?? undefined };
}

export function mapCategoryRow(row: CategoryRow): Category {
  return { id: row.id, name: row.name, slug: row.slug, description: row.description ?? undefined };
}

export function mapContentRow(row: ContentRow): Content {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    contentTypeId: row.content_type_id ?? '',
    categoryId: row.category_id ?? '',
    posterUrl: row.poster_url ?? '',
    trailerUrl: row.trailer_url ?? '',
    videoUrl: row.video_url ?? '',
    watermark: {
      enabled: row.watermark_enabled,
      text: row.watermark_text,
      opacity: row.watermark_opacity,
      position: row.watermark_position,
    },
    durationMinutes: row.duration_minutes,
    releaseYear: row.release_year ?? new Date().getFullYear(),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapContentToRow(content: Content): Omit<ContentRow, 'created_at' | 'updated_at'> {
  return {
    id: content.id,
    title: content.title,
    description: content.description,
    content_type_id: content.contentTypeId || null,
    category_id: content.categoryId || null,
    poster_url: content.posterUrl || null,
    trailer_url: content.trailerUrl || null,
    video_url: content.videoUrl || null,
    watermark_enabled: content.watermark.enabled,
    watermark_text: content.watermark.text,
    watermark_opacity: content.watermark.opacity,
    watermark_position: content.watermark.position,
    duration_minutes: content.durationMinutes,
    release_year: content.releaseYear,
  };
}

export function mapMovieRequestRow(row: MovieRequestRow): MovieRequest {
  return {
    id: row.id,
    title: row.title,
    note: row.note ?? undefined,
    requestedBy: row.requested_by ?? 'unknown',
    status: row.status,
    createdAt: row.created_at,
  };
}

export function mapRatingRow(row: RatingRow): Rating {
  return {
    id: row.id,
    contentId: row.content_id,
    userId: row.user_id,
    score: row.score,
    createdAt: row.created_at,
  };
}
