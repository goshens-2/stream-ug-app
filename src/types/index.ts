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
}

/** Subscription plan a user may be enrolled in (supports password sharing). */
export interface Subscription {
  id: string;
  plan: 'free' | 'basic' | 'family-share' | 'premium';
  isActive: boolean;
  sharedWithUserIds: string[];
  maxSharedUsers: number;
  renewsAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  isSubscribed: boolean;
  subscription?: Subscription;
}

/** A recommendation produced for a user by the recommendation engine scaffold. */
export interface Recommendation {
  contentId: string;
  score: number;
  reason: string;
}

/** An ad slot placeholder shown to non-subscribed users. */
export interface Ad {
  id: string;
  title: string;
  imageUrl: string;
  targetUrl: string;
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
 * The currently authenticated session. `isSharedAccess` is true when the user logged
 * in using another account's shared password (e.g. a family-share subscription)
 * rather than their own credentials. `grantedByUserId` identifies the subscriber
 * whose shared password was used, so the app can attribute/limit shared access.
 */
export interface AuthSession {
  user: User;
  isSharedAccess: boolean;
  grantedByUserId?: string;
}

/** Result of an auth operation (login/signup), used to surface validation errors. */
export interface AuthResult {
  success: boolean;
  error?: string;
}
