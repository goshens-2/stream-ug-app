/**
 * Core data models shared by the Admin Panel and User Panel.
 * These are placeholder client-side types intended to line up with a
 * future backend/API contract.
 */

/** A content "type" the admin can create/manage, e.g. Movie, Series, Music Video. */
export interface ContentType {
  id: string;
  name: string;
  description?: string;
}

/** A category used to group content for the user panel, e.g. "Anime", "News". */
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

/** Watermark configuration applied to a piece of content. */
export interface WatermarkSettings {
  enabled: boolean;
  text: string;
  opacity: number; // 0 - 1
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
}

/** A single piece of streamable content (movie, episode, video, etc). */
export interface Content {
  id: string;
  title: string;
  description: string;
  contentTypeId: string;
  categoryId: string;
  posterUrl: string;
  trailerUrl: string;
  videoUrl: string;
  watermark: WatermarkSettings;
  durationMinutes: number;
  releaseYear: number;
  createdAt: string;
  updatedAt: string;
}

/** A rating submitted by a user for a piece of content, used for recommendations. */
export interface Rating {
  id: string;
  contentId: string;
  userId: string;
  score: number; // 1 - 5
  createdAt: string;
}

/** A movie/content request submitted by a user, visible to admins. */
export type MovieRequestStatus = 'pending' | 'approved' | 'rejected' | 'fulfilled';

export interface MovieRequest {
  id: string;
  title: string;
  note?: string;
  requestedBy: string;
  status: MovieRequestStatus;
  createdAt: string;
  /**
   * When an admin fulfills a request by uploading matching content, this
   * links the request to that `Content` so the requester can find it from
   * "My Watchlist" and receives a notification.
   */
  fulfilledContentId?: string;
}

/** A user's saved/favorited content, shown on the "My Watchlist" page. */
export interface Favorite {
  id: string;
  userId: string;
  contentId: string;
  createdAt: string;
}

/**
 * Tracks that a user viewed a piece of content, powering "Continue Watching"
 * and "Recently Viewed". `progressSeconds`/`durationSeconds` are best-effort
 * (from the HTML5 video element) and used to compute a completion ratio.
 */
export interface ViewHistoryEntry {
  id: string;
  userId: string;
  contentId: string;
  progressSeconds: number;
  durationSeconds: number;
  updatedAt: string;
}

/** A search query a user ran, used to power "most searched movie" analytics. */
export interface SearchLogEntry {
  id: string;
  userId?: string;
  query: string;
  /** The content the search best matched, if any, for analytics grouping. */
  matchedContentId?: string;
  createdAt: string;
}

/** An in-app notification for a user, e.g. a requested movie becoming available. */
export type NotificationType = 'request_fulfilled' | 'recommendation' | 'system';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  message: string;
  contentId?: string;
  read: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  /** The user's chosen username (collected at signup instead of a "full name"). */
  name: string;
  email: string;
  /**
   * Whether this user has Admin Panel access. Backed by the `is_admin`
   * column on `public.profiles` (see `supabase/schema.sql`); enforced both
   * client-side (hiding nav/routes) and via Supabase RLS policies.
   */
  isAdmin?: boolean;
}

/** A recommendation produced for a user by the recommendation engine scaffold. */
export interface Recommendation {
  contentId: string;
  score: number;
  reason: string;
}

/**
 * A login credential linked to a `User`. This is a mock/in-memory stand-in for a
 * future backend auth table and is intentionally simple (plaintext password) since
 * the app is still frontend-only.
 */
export interface Account {
  id: string;
  userId: string;
  email: string;
  password: string;
}

/**
 * The currently authenticated session, holding the signed-in `User`.
 */
export interface AuthSession {
  user: User;
}

/** Result of an auth operation (login/signup), used to surface validation errors. */
export interface AuthResult {
  success: boolean;
  error?: string;
}
