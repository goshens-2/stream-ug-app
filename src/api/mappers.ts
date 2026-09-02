/**
 * Row <-> app-type mappers for the Supabase schema in `supabase/schema.sql`.
 * Supabase/Postgres rows use snake_case columns; the app's shared types
 * (`src/types/index.ts`) use camelCase, so each fetch/write helper in
 * `src/api/` converts through these functions.
 */
import type {
  Category,
  Content,
  ContentType,
  Favorite,
  MovieRequest,
  Notification,
  Rating,
  SearchLogEntry,
  ViewHistoryEntry,
  WatermarkSettings,
} from '../types';

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
  director: string | null;
  cast: string[] | null;
  genres: string[] | null;
  language: string | null;
  age_rating: string | null;
  embed_url: string | null;
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
  fulfilled_content_id: string | null;
}

export interface RatingRow {
  id: string;
  content_id: string;
  user_id: string;
  score: number;
  created_at: string;
}

export interface FavoriteRow {
  id: string;
  user_id: string;
  content_id: string;
  created_at: string;
}

export interface ViewHistoryRow {
  id: string;
  user_id: string;
  content_id: string;
  progress_seconds: number;
  duration_seconds: number;
  updated_at: string;
}

export interface SearchLogRow {
  id: string;
  user_id: string | null;
  query: string;
  matched_content_id: string | null;
  created_at: string;
}

export interface NotificationRow {
  id: string;
  user_id: string;
  type: Notification['type'];
  message: string;
  content_id: string | null;
  read: boolean;
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
    director: row.director ?? undefined,
    cast: row.cast ?? undefined,
    genres: row.genres ?? undefined,
    language: row.language ?? undefined,
    ageRating: row.age_rating ?? undefined,
    embedUrl: row.embed_url ?? undefined,
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
    director: content.director || null,
    cast: content.cast?.filter(Boolean) ?? [],
    genres: content.genres?.filter(Boolean) ?? [],
    language: content.language || null,
    age_rating: content.ageRating || null,
    embed_url: content.embedUrl || null,
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
    fulfilledContentId: row.fulfilled_content_id ?? undefined,
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

export function mapFavoriteRow(row: FavoriteRow): Favorite {
  return {
    id: row.id,
    userId: row.user_id,
    contentId: row.content_id,
    createdAt: row.created_at,
  };
}

export function mapViewHistoryRow(row: ViewHistoryRow): ViewHistoryEntry {
  return {
    id: row.id,
    userId: row.user_id,
    contentId: row.content_id,
    progressSeconds: row.progress_seconds,
    durationSeconds: row.duration_seconds,
    updatedAt: row.updated_at,
  };
}

export function mapSearchLogRow(row: SearchLogRow): SearchLogEntry {
  return {
    id: row.id,
    userId: row.user_id ?? undefined,
    query: row.query,
    matchedContentId: row.matched_content_id ?? undefined,
    createdAt: row.created_at,
  };
}

export function mapNotificationRow(row: NotificationRow): Notification {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    message: row.message,
    contentId: row.content_id ?? undefined,
    read: row.read,
    createdAt: row.created_at,
  };
}
