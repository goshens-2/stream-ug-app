<<<<<<< HEAD
import type { Content, Rating, ViewHistoryEntry } from '../types';
import { getAverageRating, getRecommendationsForUser } from './recommendations';
import { getWatchCounts } from './analytics';

/** Keys identifying a curated "rail"/collection surfaced on the Home page, each with its own "Explore more" listing. */
export type CollectionKey =
  | 'trending'
  | 'popular'
  | 'recently-added'
  | 'recommended'
  | 'continue-watching'
  | 'recently-viewed';

export const COLLECTION_TITLES: Record<CollectionKey, string> = {
  trending: 'Trending Now',
  popular: 'Popular on STREAM UG',
  'recently-added': 'Recently Added',
  recommended: 'Recommended For You',
  'continue-watching': 'Continue Watching',
  'recently-viewed': 'Recently Viewed',
};

/** Ranks content by a blend of watch count and average rating, highest first. */
export function getTrending(contents: Content[], ratings: Rating[], viewHistory: ViewHistoryEntry[]): Content[] {
  const watchCounts = getWatchCounts(viewHistory);
=======
import type { Category, Content, Rating, ViewHistoryEntry } from '../types';
import { getMostWatched } from './analytics';
import { getAverageRating, getRecommendationsForUser } from './recommendations';

/** Well-known synthetic "collection" ids used for rows/pages that aren't a real Category. */
export const FEATURED_COLLECTION_ID = 'featured';
export const CONTINUE_WATCHING_COLLECTION_ID = 'continue-watching';
export const RECOMMENDED_COLLECTION_ID = 'recommended';
export const RECENTLY_VIEWED_COLLECTION_ID = 'recently-viewed';

/** A lightweight, human-facing description of a homepage row/collection. */
export interface Collection {
  id: string;
  name: string;
}

export const SYNTHETIC_COLLECTIONS: Record<string, Collection> = {
  [FEATURED_COLLECTION_ID]: { id: FEATURED_COLLECTION_ID, name: 'Featured & Trending' },
  [CONTINUE_WATCHING_COLLECTION_ID]: { id: CONTINUE_WATCHING_COLLECTION_ID, name: 'Continue Watching' },
  [RECOMMENDED_COLLECTION_ID]: { id: RECOMMENDED_COLLECTION_ID, name: 'Recommended For You' },
  [RECENTLY_VIEWED_COLLECTION_ID]: { id: RECENTLY_VIEWED_COLLECTION_ID, name: 'Recently Viewed' },
};

/** Builds a `contentId -> watch count` lookup from view history, for display on cards. */
export function buildWatchCountMap(viewHistory: ViewHistoryEntry[]): Map<string, number> {
  return new Map(getMostWatched(viewHistory).map((c) => [c.contentId, c.count]));
}

/** Content ranked by a blend of watch count and average rating, most popular first. */
export function getFeaturedAndTrending(contents: Content[], viewHistory: ViewHistoryEntry[], ratings: Rating[]): Content[] {
  const watchCounts = buildWatchCountMap(viewHistory);
>>>>>>> origin/copilot/goshens-2stream-ug-app
  return contents
    .slice()
    .sort((a, b) => {
      const score = (id: string) => (watchCounts.get(id) ?? 0) * 2 + getAverageRating(id, ratings);
      return score(b.id) - score(a.id);
    });
}

<<<<<<< HEAD
/** Ranks content purely by how many people have watched it, most-watched first. */
export function getPopular(contents: Content[], viewHistory: ViewHistoryEntry[]): Content[] {
  const watchCounts = getWatchCounts(viewHistory);
  return contents
    .slice()
    .sort((a, b) => (watchCounts.get(b.id) ?? 0) - (watchCounts.get(a.id) ?? 0));
}

/** Orders content by upload/creation date, newest first. */
export function getRecentlyAdded(contents: Content[]): Content[] {
  return contents
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/** Content recommended for a specific user, ordered by recommendation score. */
export function getRecommended(userId: string | undefined, contents: Content[], ratings: Rating[]): Content[] {
  if (!userId) return [];
  return getRecommendationsForUser(userId, contents, ratings, contents.length)
    .map((rec) => contents.find((c) => c.id === rec.contentId))
    .filter((c): c is Content => Boolean(c));
}

/** A user's in-progress titles (not yet finished), most recently updated first. */
export function getContinueWatching(
  userId: string | undefined,
  contents: Content[],
  viewHistory: ViewHistoryEntry[],
): Content[] {
  if (!userId) return [];
=======
/** Titles a signed-in user has started but not finished watching, most recent first. */
export function getContinueWatching(contents: Content[], viewHistory: ViewHistoryEntry[], userId: string | undefined): Content[] {
>>>>>>> origin/copilot/goshens-2stream-ug-app
  return viewHistory
    .filter((v) => v.userId === userId)
    .slice()
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .filter((v) => v.durationSeconds > 0 && v.progressSeconds > 0 && v.progressSeconds < v.durationSeconds * 0.95)
    .map((v) => contents.find((c) => c.id === v.contentId))
    .filter((c): c is Content => Boolean(c));
}

<<<<<<< HEAD
/** Everything a user has viewed, most recently updated first (regardless of completion). */
export function getRecentlyViewed(
  userId: string | undefined,
  contents: Content[],
  viewHistory: ViewHistoryEntry[],
): Content[] {
  if (!userId) return [];
=======
/** Titles a signed-in user has viewed recently, most recent first. */
export function getRecentlyViewed(contents: Content[], viewHistory: ViewHistoryEntry[], userId: string | undefined): Content[] {
>>>>>>> origin/copilot/goshens-2stream-ug-app
  return viewHistory
    .filter((v) => v.userId === userId)
    .slice()
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .map((v) => contents.find((c) => c.id === v.contentId))
    .filter((c): c is Content => Boolean(c));
}
<<<<<<< HEAD
=======

/** Recommended titles for a signed-in user, resolved to full `Content` records. */
export function getRecommendedContent(
  contents: Content[],
  ratings: Rating[],
  userId: string | undefined,
  limit = 12,
): Content[] {
  if (!userId) return [];
  return getRecommendationsForUser(userId, contents, ratings, limit)
    .map((rec) => contents.find((c) => c.id === rec.contentId))
    .filter((c): c is Content => Boolean(c));
}

/** Resolves a homepage row/collection id (real category or synthetic collection) to a display name. */
export function resolveCollectionName(collectionId: string, categories: Category[]): string {
  return SYNTHETIC_COLLECTIONS[collectionId]?.name ?? categories.find((c) => c.id === collectionId)?.name ?? 'Titles';
}
>>>>>>> origin/copilot/goshens-2stream-ug-app
